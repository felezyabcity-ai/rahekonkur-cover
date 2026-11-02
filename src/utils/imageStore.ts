/**
 * Keeps heavy image data URLs out of localStorage (5MB limit) by storing them in IndexedDB.
 * In localStorage the config holds lightweight references like "idb:img_ab12cd34".
 */

const DB_NAME = 'wp_cover_images';
const STORE = 'images';
const REF_PREFIX = 'idb:';
const MIN_INLINE_LEN = 2048; // tiny data URLs stay inline

let dbPromise: Promise<IDBDatabase> | null = null;
const knownSaved = new Set<string>();

/** Hydrated config JSON prepared before React mounts (see main.tsx). */
export let hydratedConfigJson: string | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function hashString(s: string): string {
  // FNV-1a 32-bit + length → stable key per image content
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return 'img_' + (h >>> 0).toString(16) + '_' + s.length.toString(36);
}

function walk(value: any, fn: (s: string) => string): any {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) return value.map((v) => walk(v, fn));
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = walk(value[k], fn);
    return out;
  }
  return value;
}

/** Replaces data URLs with idb refs and stores the images. Returns the light config. */
export async function dehydrateAndStore<T>(config: T): Promise<T> {
  const toSave = new Map<string, string>();
  const referenced = new Set<string>();

  const light = walk(config, (s) => {
    if (s.startsWith(REF_PREFIX)) {
      referenced.add(s.slice(REF_PREFIX.length));
      return s;
    }
    if (s.startsWith('data:image/') && s.length > MIN_INLINE_LEN) {
      const key = hashString(s);
      referenced.add(key);
      if (!knownSaved.has(key)) toSave.set(key, s);
      return REF_PREFIX + key;
    }
    return s;
  });

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    toSave.forEach((data, key) => store.put(data, key));
    // prune images no longer used by the config
    const keysReq = store.getAllKeys();
    keysReq.onsuccess = () => {
      (keysReq.result as string[]).forEach((k) => {
        if (!referenced.has(k)) {
          store.delete(k);
          knownSaved.delete(k);
        }
      });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  toSave.forEach((_, key) => knownSaved.add(key));
  return light as T;
}

/** Resolves idb refs back to data URLs. Missing images become ''. */
export async function hydrate<T>(config: T): Promise<T> {
  const refs = new Set<string>();
  walk(config, (s) => {
    if (s.startsWith(REF_PREFIX)) refs.add(s.slice(REF_PREFIX.length));
    return s;
  });
  if (refs.size === 0) return config;

  const db = await openDb();
  const found = new Map<string, string>();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    refs.forEach((key) => {
      const r = store.get(key);
      r.onsuccess = () => {
        if (typeof r.result === 'string') {
          found.set(key, r.result);
          knownSaved.add(key);
        }
      };
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return walk(config, (s) =>
    s.startsWith(REF_PREFIX) ? found.get(s.slice(REF_PREFIX.length)) || '' : s
  ) as T;
}

/** Called once before React mounts. */
export async function bootstrapHydration(storageKey: string): Promise<void> {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved || !saved.includes('"' + REF_PREFIX)) return;
    const hydrated = await hydrate(JSON.parse(saved));
    hydratedConfigJson = JSON.stringify(hydrated);
  } catch (err) {
    console.warn('Image hydration failed:', err);
  }
}
