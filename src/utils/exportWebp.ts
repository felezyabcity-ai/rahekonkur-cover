/**
 * High-Fidelity WebP Exporter and Canvas Rasterizer for WordPress Cover Generator
 * Accurately captures full DOM styling, Persian RTL typography, gradients, custom highlights & images.
 */

import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { CoverConfig } from '../types';

let cachedFontCss: string | null = null;

/** Builds @font-face CSS with fonts inlined as data URLs, so the snapshot uses the real Persian fonts. */
async function getEmbeddedFontCss(node: HTMLElement): Promise<string> {
  if (cachedFontCss !== null) return cachedFontCss;
  try {
    cachedFontCss = await htmlToImage.getFontEmbedCSS(node);
  } catch (err) {
    console.warn('Font embedding failed, export will use fallback fonts:', err);
    cachedFontCss = '';
  }
  return cachedFontCss;
}

export interface ExportResult {
  blob: Blob;
  dataUrl: string;
  fileSizeKb: number;
  width: number;
  height: number;
}

/**
 * Converts an HTML element (the cover artboard) to a WebP image with pixel-perfect accuracy
 */
export async function exportCoverToWebP(
  element: HTMLElement,
  config: CoverConfig,
  format: 'image/webp' | 'image/png' = 'image/webp'
): Promise<ExportResult> {
  const targetWidth = config.width || 1200;
  const targetHeight = config.height || 675;
  const quality = Math.max(0.1, Math.min(1.0, config.webpQuality || 0.82));
  // Render at 2x then downsample: smoother photo scaling, crisper Persian text edges
  const SUPERSAMPLE = 2;

  // Ensure fonts are ready before capturing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts.ready not supported
    }
  }

  // Filter function to skip editor-only bounding boxes, resize handles and snap guides
  const filterFn = (domNode: HTMLElement) => {
    if (domNode.getAttribute && domNode.getAttribute('data-export-ignore') === 'true') {
      return false;
    }
    return true;
  };

  // Create an isolated, unscaled sandbox container on document.body
  // This completely eliminates any distortion or clipping caused by zoom transforms on parent containers!
  const exportSandbox = document.createElement('div');
  exportSandbox.style.position = 'fixed';
  exportSandbox.style.left = '-99999px';
  exportSandbox.style.top = '0';
  exportSandbox.style.width = `${targetWidth}px`;
  exportSandbox.style.height = `${targetHeight}px`;
  exportSandbox.style.transform = 'none';
  exportSandbox.style.margin = '0';
  exportSandbox.style.padding = '0';
  exportSandbox.style.zIndex = '-999999';
  exportSandbox.style.overflow = 'hidden';
  exportSandbox.style.backgroundColor = config.colors.paper || '#090D16';

  // Deep clone the artboard
  const clonedArtboard = element.cloneNode(true) as HTMLElement;
  clonedArtboard.style.transform = 'none';
  clonedArtboard.style.transformOrigin = 'top right';
  clonedArtboard.style.width = `${targetWidth}px`;
  clonedArtboard.style.height = `${targetHeight}px`;
  clonedArtboard.style.margin = '0';

  // Remove any editor overlays from clone
  const ignoreElements = clonedArtboard.querySelectorAll('[data-export-ignore="true"]');
  ignoreElements.forEach((el) => el.remove());

  exportSandbox.appendChild(clonedArtboard);
  document.body.appendChild(exportSandbox);

  let canvas: HTMLCanvasElement | null = null;

  try {
    // Make sure every <img> in the clone is fully decoded (otherwise html-to-image may draw blanks)
    const imgs = Array.from(clonedArtboard.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (im) => {
        im.loading = 'eager';
        try {
          if (!im.complete) {
            await new Promise<void>((res) => {
              im.addEventListener('load', () => res(), { once: true });
              im.addEventListener('error', () => res(), { once: true });
              setTimeout(res, 4000);
            });
          }
          await im.decode();
        } catch {
          /* ignore broken images */
        }
      })
    );
    // Wait a brief tick for computed styles to settle
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Primary Method: html-to-image on unscaled isolated clone
    const fontEmbedCSS = await getEmbeddedFontCss(clonedArtboard);
    try {
      canvas = await htmlToImage.toCanvas(clonedArtboard, {
        width: targetWidth,
        height: targetHeight,
        pixelRatio: SUPERSAMPLE,
        filter: filterFn as any,
        cacheBust: false,
        skipFonts: !fontEmbedCSS,
        fontEmbedCSS,
        style: {
          transform: 'none',
          transformOrigin: 'top right',
          margin: '0',
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
        },
      });
    } catch (primaryErr) {
      console.warn('html-to-image capture on clone failed, trying html2canvas fallback:', primaryErr);

      // Fallback Method: html2canvas
      canvas = await html2canvas(clonedArtboard, {
        width: targetWidth,
        height: targetHeight,
        scale: SUPERSAMPLE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.colors.paper || '#090D16',
        logging: false,
      });
    }
  } finally {
    // Always clean up sandbox container
    if (document.body.contains(exportSandbox)) {
      document.body.removeChild(exportSandbox);
    }
  }

  if (!canvas) {
    throw new Error('خطا در تبدیل گرافیک کاور به تصویر.');
  }

  // Downsample the 2x render to the exact target size with high-quality smoothing
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    let src: HTMLCanvasElement = canvas;
    while (src.width / 2 >= targetWidth * 1.01 && src.height / 2 >= targetHeight * 1.01) {
      const half = document.createElement('canvas');
      half.width = Math.round(src.width / 2);
      half.height = Math.round(src.height / 2);
      const hctx = half.getContext('2d')!;
      hctx.imageSmoothingEnabled = true;
      hctx.imageSmoothingQuality = 'high';
      hctx.drawImage(src, 0, 0, half.width, half.height);
      src = half;
    }
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const fctx = finalCanvas.getContext('2d')!;
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(src, 0, 0, targetWidth, targetHeight);
    canvas = finalCanvas;
  }

  // Convert canvas to WebP Blob with user-selected quality
  return new Promise((resolve, reject) => {
    canvas!.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = URL.createObjectURL(blob);
          const sizeKb = Math.round((blob.size / 1024) * 10) / 10;
          resolve({
            blob,
            dataUrl,
            fileSizeKb: sizeKb,
            width: targetWidth,
            height: targetHeight,
          });
        } else {
          // In case toBlob fails, use dataURL fallback
          try {
            const dataUrl = canvas!.toDataURL(format, quality);
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const fallbackBlob = new Blob([ab], { type: mimeString });
            const sizeKb = Math.round((fallbackBlob.size / 1024) * 10) / 10;
            resolve({
              blob: fallbackBlob,
              dataUrl,
              fileSizeKb: sizeKb,
              width: targetWidth,
              height: targetHeight,
            });
          } catch (e) {
            reject(new Error('خطا در استخراج فرمت WebP'));
          }
        }
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });
}

/**
 * Downloads a Blob as a file
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = /\.(webp|png|jpe?g)$/i.test(filename) ? filename : `${filename}.webp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies an image Blob to the system clipboard
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      if (blob.type === 'image/png') {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return true;
      }

      // Convert WebP blob to PNG for seamless pasting in Slack, Telegram, WordPress, Photoshop
      const imgBitmap = await createImageBitmap(blob);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgBitmap.width;
      tempCanvas.height = imgBitmap.height;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imgBitmap, 0, 0);
        return new Promise((resolve) => {
          tempCanvas.toBlob(async (pngBlob) => {
            if (pngBlob) {
              try {
                const item = new ClipboardItem({ 'image/png': pngBlob });
                await navigator.clipboard.write([item]);
                resolve(true);
              } catch {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          }, 'image/png');
        });
      }
    }
    return false;
  } catch (err) {
    console.warn('Clipboard write error:', err);
    return false;
  }
}
