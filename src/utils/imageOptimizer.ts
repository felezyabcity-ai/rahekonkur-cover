
/**
 * Optimizes uploaded images before saving into application state.
 * - Caps the LONG side (not just width) so portraits keep enough resolution.
 * - Downscales in halving steps for sharp, alias-free results.
 * - Keeps transparency (WebP/PNG). quality = 1 gives lossless WebP in Chrome (good for logos).
 */

export const IMAGE_PRESETS = {
  photo: { maxSide: 1800, quality: 0.92 },      // teacher portraits, background photos
  background: { maxSide: 2400, quality: 0.9 },  // full-bleed cover images (cover is 1200px, export renders at 2x)
  logo: { maxSide: 1000, quality: 1 },          // lossless, crisp edges
} as const;

function stepDownscale(img: HTMLImageElement, targetW: number, targetH: number): HTMLCanvasElement {
  let srcW = img.naturalWidth || img.width;
  let srcH = img.naturalHeight || img.height;
  let source: CanvasImageSource = img;

  // Halve repeatedly while more than 2x larger than target
  while (srcW / 2 >= targetW && srcH / 2 >= targetH) {
    const w = Math.round(srcW / 2);
    const h = Math.round(srcH / 2);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(source, 0, 0, w, h);
    source = c;
    srcW = w;
    srcH = h;
  }

  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas 2D rendering context');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetW, targetH);
  return out;
}

export async function optimizeImageUpload(
  input: File | Blob | string,
  maxSide: number = IMAGE_PRESETS.photo.maxSide,
  quality: number = IMAGE_PRESETS.photo.quality
): Promise<string> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    let src = '';

    if (typeof input === 'string') {
      src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      src = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'sync';

    img.onload = () => {
      try {
        const natW = img.naturalWidth || img.width || 800;
        const natH = img.naturalHeight || img.height || 600;
        const scale = Math.min(1, maxSide / Math.max(natW, natH));
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const canvas = stepDownscale(img, targetW, targetH);

        let data = canvas.toDataURL('image/webp', quality);
        // Fallback for browsers without WebP canvas export (older Safari): PNG keeps transparency
        if (!data.startsWith('data:image/webp')) {
          data = canvas.toDataURL('image/png');
        }

        cleanup();
        resolve(data);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = src;
  });
}
