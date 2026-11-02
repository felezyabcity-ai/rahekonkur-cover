import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Download,
  Copy,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  FileImage,
  RefreshCw,
  Eye,
  ShieldCheck,
  Zap,
  Layers,
  Move,
  Trash2,
  Plus,
  ArrowRightLeft,
  Check,
  Globe,
  Palette,
  Layout,
  Type,
  Tag,
} from 'lucide-react';
import { downloadFile, copyImageToClipboard } from '../utils/exportWebp';

interface QuickImageConverterProps {
  onNotify: (text: string, type?: 'success' | 'info') => void;
  onSwitchToCoverMode?: () => void;
  currentImage?: string | null;
  onImageChange?: (imageUrl: string) => void;
  brandText?: string;
  domainText?: string;
}

type ResizePreset = 'original' | '1200x675' | '1920x1080' | '1200x630' | '1080x1080' | '800x600' | 'custom';
type LogoPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center' | 'custom';
type FooterStyle = 'bar' | 'pill' | 'minimal';
type FooterIconType = 'wordpress' | 'globe' | 'sparkle' | 'dot' | 'badge' | 'none';

function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(15, 23, 42, ${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(15, 23, 42, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const QuickImageConverter: React.FC<QuickImageConverterProps> = ({
  onNotify,
  onSwitchToCoverMode,
  currentImage,
  onImageChange,
  brandText,
  domainText,
}) => {
  // Main Source Image State - initialize directly with currentImage if present
  const [sourceImage, setSourceImage] = useState<string | null>(() => currentImage || null);
  const [originalName, setOriginalName] = useState<string>('image');
  const [originalSizeKb, setOriginalSizeKb] = useState<number>(0);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Resize & Quality Settings - Default scale: 55%, Default WebP quality: 37%
  const [preset, setPreset] = useState<ResizePreset>('original');
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(675);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [scalePercent, setScalePercent] = useState<number>(() => {
    const saved = localStorage.getItem('converter_scale_v3');
    return saved ? parseInt(saved, 10) : 55;
  });
  const [quality, setQuality] = useState<number>(() => {
    const saved = localStorage.getItem('converter_quality_v3');
    return saved ? parseInt(saved, 10) : 37;
  });

  useEffect(() => {
    localStorage.setItem('converter_scale_v3', scalePercent.toString());
  }, [scalePercent]);

  useEffect(() => {
    localStorage.setItem('converter_quality_v3', quality.toString());
  }, [quality]);

  // Watermark / Logo State
  const [enableLogo, setEnableLogo] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-left');
  const [customLogoPos, setCustomLogoPos] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [logoSizePercent, setLogoSizePercent] = useState<number>(15); // % of image width
  const [logoOpacity, setLogoOpacity] = useState<number>(90); // 10 to 100
  const [logoPadding, setLogoPadding] = useState<number>(24); // px margin from edges
  const [logoHasShadow, setLogoHasShadow] = useState<boolean>(true);

  // Footer / Branding Bar State
  const [enableFooter, setEnableFooter] = useState<boolean>(true);
  const [footerStyle, setFooterStyle] = useState<FooterStyle>('bar');
  const [footerBrandText, setFooterBrandText] = useState<string>(brandText || 'موسسه راه کنکور');
  const [footerDomainText, setFooterDomainText] = useState<string>(domainText || 'rahekonkur.ir');
  const [footerIconType, setFooterIconType] = useState<FooterIconType>('globe');
  const [footerCustomBadgeText, setFooterCustomBadgeText] = useState<string>('رسمی');
  const [footerBgColor, setFooterBgColor] = useState<string>('#090d16');
  const [footerTextColor, setFooterTextColor] = useState<string>('#f8fafc');
  const [footerAccentColor, setFooterAccentColor] = useState<string>('#f43f5e');
  const [footerOpacity, setFooterOpacity] = useState<number>(92);
  const [footerHeight, setFooterHeight] = useState<number>(56);
  const [footerFontSize, setFooterFontSize] = useState<number>(17);
  const [footerShowBorderTop, setFooterShowBorderTop] = useState<boolean>(true);

  // Result & Preview State
  const [outputWebpUrl, setOutputWebpUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [outputDims, setOutputDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'processed' | 'original' | 'split'>('processed');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatically take image whenever Part 1 (Cover Designer) has or updates image
  useEffect(() => {
    if (currentImage && currentImage !== sourceImage) {
      setSourceImage(currentImage);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.naturalWidth || 1200;
        const h = img.naturalHeight || 800;
        setOriginalDims({ width: w, height: h });
        setCustomWidth(w);
        setCustomHeight(h);
        if (currentImage.startsWith('data:')) {
          setOriginalSizeKb(Math.round((currentImage.length * 0.75) / 1024));
        }
      };
      img.src = currentImage;
    }
  }, [currentImage]);

  // Initial load of image
  useEffect(() => {
    const targetUrl = currentImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop';
    if (!sourceImage) {
      setSourceImage(targetUrl);
    }
    setOriginalName('cover-photo');
    setOriginalSizeKb(480);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDims({ width: img.naturalWidth || 1200, height: img.naturalHeight || 800 });
      setCustomWidth(img.naturalWidth || 1200);
      setCustomHeight(img.naturalHeight || 800);
    };
    img.src = targetUrl;
  }, []);

  // Update brand and domain text if props change
  useEffect(() => {
    if (brandText) setFooterBrandText(brandText);
  }, [brandText]);

  useEffect(() => {
    if (domainText) setFooterDomainText(domainText);
  }, [domainText]);

  // Handle Main Image Upload
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify('لطفاً یک فایل تصویری معتبر انتخاب کنید', 'info');
      return;
    }

    setOriginalName(file.name.replace(/\.[^/.]+$/, ''));
    setOriginalSizeKb(Math.round((file.size / 1024) * 10) / 10);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSourceImage(dataUrl);
      // Automatically send to Part 1 (Cover Designer) as well
      onImageChange?.(dataUrl);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setOriginalDims({ width: w, height: h });
        setCustomWidth(w);
        setCustomHeight(h);
        onNotify(`تصویر با موفقیت دریافت و در هر دو بخش طراح و مبدل ست شد`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo Upload
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotify('لطفاً یک فایل تصویری (PNG یا SVG با پس‌زمینه شفاف) برای لوگو انتخاب کنید', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoImage(e.target?.result as string);
      setEnableLogo(true);
      onNotify('لوگو اضافه شد');
    };
    reader.readAsDataURL(file);
  };

  // Compute Target Dimensions based on preset & scale
  const computeTargetDimensions = useCallback(() => {
    let w = originalDims.width || 1200;
    let h = originalDims.height || 800;

    switch (preset) {
      case '1200x675':
        w = 1200;
        h = 675;
        break;
      case '1920x1080':
        w = 1920;
        h = 1080;
        break;
      case '1200x630':
        w = 1200;
        h = 630;
        break;
      case '1080x1080':
        w = 1080;
        h = 1080;
        break;
      case '800x600':
        w = 800;
        h = 600;
        break;
      case 'custom':
        w = customWidth;
        h = customHeight;
        break;
      case 'original':
      default:
        w = originalDims.width || 1200;
        h = originalDims.height || 800;
        break;
    }

    // Apply scale multiplier
    if (scalePercent !== 100) {
      w = Math.round((w * scalePercent) / 100);
      h = Math.round((h * scalePercent) / 100);
    }

    return { width: Math.max(10, w), height: Math.max(10, h) };
  }, [originalDims, preset, customWidth, customHeight, scalePercent]);

  // Render & Process Image to Canvas and WebP
  const processImageToWebP = useCallback(async () => {
    if (!sourceImage) return;

    setIsProcessing(true);

    try {
      const { width: targetW, height: targetH } = computeTargetDimensions();
      setOutputDims({ width: targetW, height: targetH });

      // Create offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Load main image
      const mainImg = new Image();
      mainImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        mainImg.onload = () => resolve();
        mainImg.onerror = () => reject(new Error('خطا در بارگذاری تصویر اصلی'));
        mainImg.src = sourceImage;
      });

      // Draw Main Image (Scaled to fill exactly)
      ctx.drawImage(mainImg, 0, 0, targetW, targetH);

      // Draw Logo / Watermark if enabled
      if (enableLogo && logoImage) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';

        try {
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject(new Error('خطا در بارگذاری لوگو'));
            logoImg.src = logoImage;
          });

          // Calculate logo sizing
          const logoAspect = (logoImg.naturalWidth || 1) / (logoImg.naturalHeight || 1);
          const logoW = Math.round(targetW * (logoSizePercent / 100));
          const logoH = Math.round(logoW / logoAspect);

          let logoX = logoPadding;
          let logoY = logoPadding;

          // Position calculation
          switch (logoPosition) {
            case 'top-right':
              logoX = targetW - logoW - logoPadding;
              logoY = logoPadding;
              break;
            case 'top-left':
              logoX = logoPadding;
              logoY = logoPadding;
              break;
            case 'top-center':
              logoX = (targetW - logoW) / 2;
              logoY = logoPadding;
              break;
            case 'bottom-right':
              logoX = targetW - logoW - logoPadding;
              logoY = targetH - logoH - logoPadding - (enableFooter ? 60 : 0);
              break;
            case 'bottom-left':
              logoX = logoPadding;
              logoY = targetH - logoH - logoPadding - (enableFooter ? 60 : 0);
              break;
            case 'bottom-center':
              logoX = (targetW - logoW) / 2;
              logoY = targetH - logoH - logoPadding - (enableFooter ? 60 : 0);
              break;
            case 'center':
              logoX = (targetW - logoW) / 2;
              logoY = (targetH - logoH) / 2;
              break;
            case 'custom':
              logoX = Math.min(targetW - logoW, Math.max(0, customLogoPos.x));
              logoY = Math.min(targetH - logoH, Math.max(0, customLogoPos.y));
              break;
          }

          // Apply opacity and shadow
          ctx.save();
          ctx.globalAlpha = Math.max(0.05, Math.min(1.0, logoOpacity / 100));

          if (logoHasShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;
          }

          ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
          ctx.restore();
        } catch (e) {
          console.warn('Failed to draw watermark logo:', e);
        }
      }

      // Draw Footer / Branding Bar if enabled
      if (enableFooter) {
        const scale = targetW / 1200;
        const fHeight = Math.max(34, Math.round(footerHeight * scale));
        const fFontSize = Math.max(11, Math.round(footerFontSize * scale));
        const fPadX = Math.max(14, Math.round(30 * scale));

        ctx.save();

        let centerY = targetH - fHeight / 2;
        let rightBound = targetW - fPadX;
        let leftBound = fPadX;

        if (footerStyle === 'bar') {
          const barY = targetH - fHeight;
          centerY = barY + fHeight / 2;

          // Fill Background
          ctx.fillStyle = hexToRgba(footerBgColor, footerOpacity / 100);
          ctx.fillRect(0, barY, targetW, fHeight);

          // Top Accent Border Line
          if (footerShowBorderTop) {
            ctx.strokeStyle = footerAccentColor;
            ctx.lineWidth = Math.max(2, Math.round(3 * scale));
            ctx.beginPath();
            ctx.moveTo(0, barY);
            ctx.lineTo(targetW, barY);
            ctx.stroke();
          }
        } else if (footerStyle === 'pill') {
          const pillMarginBottom = Math.max(12, Math.round(18 * scale));
          const pillW = Math.min(targetW - Math.round(40 * scale), Math.round(targetW * 0.9));
          const pillH = fHeight;
          const pillX = (targetW - pillW) / 2;
          const pillY = targetH - pillH - pillMarginBottom;
          centerY = pillY + pillH / 2;

          rightBound = pillX + pillW - Math.max(14, Math.round(24 * scale));
          leftBound = pillX + Math.max(14, Math.round(24 * scale));

          // Shadow for Floating Pill
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = Math.round(16 * scale);
          ctx.shadowOffsetY = Math.round(6 * scale);

          // Background Fill
          ctx.fillStyle = hexToRgba(footerBgColor, footerOpacity / 100);
          drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
          ctx.fill();

          // Pill Border
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = footerAccentColor ? hexToRgba(footerAccentColor, 0.4) : 'rgba(255,255,255,0.18)';
          ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
          drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
          ctx.stroke();
        } else if (footerStyle === 'minimal') {
          // Subtle gradient scrim
          const gradHeight = Math.round(fHeight * 1.8);
          const grad = ctx.createLinearGradient(0, targetH - gradHeight, 0, targetH);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, targetH - gradHeight, targetW, gradHeight);
          centerY = targetH - fHeight / 2;
        }

        // Draw Right Side (Icon + Brand Name)
        let currentRightX = rightBound;

        // Draw Icon if enabled
        if (footerIconType !== 'none') {
          const iconSize = Math.max(16, Math.round(24 * scale));
          const iconRadius = iconSize / 2;
          const iconCenter = currentRightX - iconRadius;

          if (footerIconType === 'wordpress') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.beginPath();
            ctx.arc(iconCenter, centerY, iconRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(iconSize * 0.65)}px monospace, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('W', iconCenter, centerY);
          } else if (footerIconType === 'dot') {
            const dotR = Math.max(3, Math.round(5 * scale));
            ctx.fillStyle = footerAccentColor;
            ctx.beginPath();
            ctx.arc(iconCenter, centerY, dotR, 0, Math.PI * 2);
            ctx.fill();
          } else if (footerIconType === 'globe') {
            ctx.font = `${Math.round(iconSize * 0.8)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌐', iconCenter, centerY);
          } else if (footerIconType === 'sparkle') {
            ctx.font = `${Math.round(iconSize * 0.8)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', iconCenter, centerY);
          } else if (footerIconType === 'badge' && footerCustomBadgeText) {
            ctx.font = `bold ${Math.round(fFontSize * 0.75)}px Vazirmatn, sans-serif`;
            const badgeMetrics = ctx.measureText(footerCustomBadgeText);
            const badgeW = badgeMetrics.width + Math.round(14 * scale);
            const badgeH = Math.round(iconSize * 0.9);
            const badgeX = currentRightX - badgeW;
            const badgeY = centerY - badgeH / 2;

            ctx.fillStyle = footerAccentColor;
            drawRoundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(footerCustomBadgeText, badgeX + badgeW / 2, centerY);
            currentRightX -= badgeW + Math.round(8 * scale);
          }

          if (footerIconType !== 'badge') {
            currentRightX -= iconSize + Math.round(8 * scale);
          }
        }

        // Draw Brand Name Text
        if (footerBrandText) {
          ctx.fillStyle = footerTextColor;
          ctx.font = `bold ${fFontSize}px Vazirmatn, system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(footerBrandText, currentRightX, centerY);
        }

        // Draw Left Side (Domain / URL)
        if (footerDomainText) {
          ctx.fillStyle = footerTextColor;
          ctx.font = `bold ${Math.round(fFontSize * 0.95)}px monospace, "Courier New", sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.letterSpacing = '0.5px';
          ctx.fillText(footerDomainText, leftBound, centerY);
        }

        ctx.restore();
      }

      // Convert to WebP Blob
      const q = Math.max(0.1, Math.min(1.0, quality / 100));

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (outputWebpUrl) {
              URL.revokeObjectURL(outputWebpUrl);
            }
            const newUrl = URL.createObjectURL(blob);
            setOutputBlob(blob);
            setOutputWebpUrl(newUrl);
            setOutputSizeKb(Math.round((blob.size / 1024) * 10) / 10);
          }
          setIsProcessing(false);
        },
        'image/webp',
        q
      );
    } catch (err) {
      console.error('Processing error:', err);
      setIsProcessing(false);
    }
  }, [
    sourceImage,
    computeTargetDimensions,
    enableLogo,
    logoImage,
    logoPosition,
    customLogoPos,
    logoSizePercent,
    logoOpacity,
    logoPadding,
    logoHasShadow,
    enableFooter,
    footerStyle,
    footerBrandText,
    footerDomainText,
    footerIconType,
    footerCustomBadgeText,
    footerBgColor,
    footerTextColor,
    footerAccentColor,
    footerOpacity,
    footerHeight,
    footerFontSize,
    footerShowBorderTop,
    quality,
  ]);

  // Debounced auto-reprocess on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processImageToWebP();
    }, 150);
    return () => clearTimeout(timer);
  }, [processImageToWebP]);

  // Handle Download WebP
  const handleDownload = () => {
    if (!outputBlob) return;
    const cleanName = (originalName || 'image')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const filename = `${cleanName}-${outputDims.width}x${outputDims.height}.webp`;
    downloadFile(outputBlob, filename);
    onNotify(`فایل WebP با حجم ${outputSizeKb} KB با موفقیت دانلود شد`);
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    if (!outputBlob) return;
    const success = await copyImageToClipboard(outputBlob);
    if (success) {
      onNotify('تصویر با کیفیت به کلیپ‌بورد کپی شد (آماده Paste در وردپرس)');
    } else {
      handleDownload();
      onNotify('فایل دانلود شد (مرورگر اجازه کپی مستقیم نداد)', 'info');
    }
  };

  // Handle Custom Width change with Aspect Ratio preservation
  const handleWidthChange = (newW: number) => {
    setCustomWidth(newW);
    if (lockAspectRatio && originalDims.width > 0 && originalDims.height > 0) {
      const ratio = originalDims.height / originalDims.width;
      setCustomHeight(Math.round(newW * ratio));
    }
  };

  // Handle Custom Height change with Aspect Ratio preservation
  const handleHeightChange = (newH: number) => {
    setCustomHeight(newH);
    if (lockAspectRatio && originalDims.width > 0 && originalDims.height > 0) {
      const ratio = originalDims.width / originalDims.height;
      setCustomWidth(Math.round(newH * ratio));
    }
  };

  // Preset Footer Themes
  const applyFooterTheme = (theme: {
    bg: string;
    text: string;
    accent: string;
    style?: FooterStyle;
    icon?: FooterIconType;
  }) => {
    setFooterBgColor(theme.bg);
    setFooterTextColor(theme.text);
    setFooterAccentColor(theme.accent);
    if (theme.style) setFooterStyle(theme.style);
    if (theme.icon) setFooterIconType(theme.icon);
    onNotify('تم رنگی فوتر اعمال شد');
  };

  // Compression ratio calculation
  const savingsPercent =
    originalSizeKb > 0 && outputSizeKb > 0
      ? Math.max(0, Math.round(((originalSizeKb - outputSizeKb) / originalSizeKb) * 100))
      : 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* LEFT/MAIN STAGE: Clean Image Preview & Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-auto border-b lg:border-b-0 lg:border-l border-slate-800 min-h-[480px]"
      >
        {/* Background Subtle Tech Grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Floating Controls Bar */}
        <div className="z-20 flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl mb-4 px-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('processed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'processed'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>خروجی بهینه‌شده WebP</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'original'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>تصویر اولیه</span>
            </button>
          </div>

          {/* Switch to Full Cover Designer */}
          {onSwitchToCoverMode && (
            <button
              type="button"
              onClick={onSwitchToCoverMode}
              className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>رفتن به طراح کاور با تیتر و قالب اختصاصی</span>
            </button>
          )}
        </div>

        {/* The Clean Image Display Box */}
        <div className="relative z-10 max-w-full max-h-[68vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800 bg-slate-900/50">
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 text-white">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <span className="text-xs font-semibold">در حال تبدیل به WebP و ساخت فوتر...</span>
            </div>
          )}

          {viewMode === 'processed' && outputWebpUrl ? (
            <img
              src={outputWebpUrl}
              alt="خروجی WebP همراه فوتر"
              className="max-w-full max-h-[65vh] object-contain block rounded-lg select-none shadow-xl"
            />
          ) : sourceImage ? (
            <img
              src={sourceImage}
              alt="تصویر اصلی"
              className="max-w-full max-h-[65vh] object-contain block rounded-lg select-none"
            />
          ) : (
            <div className="w-[500px] h-[320px] flex flex-col items-center justify-center gap-3 text-slate-500">
              <ImageIcon className="w-12 h-12 stroke-[1.2]" />
              <span className="text-sm">هیچ تصویری انتخاب نشده است</span>
            </div>
          )}
        </div>

        {/* Bottom Metrics Pill: Size, Dimensions & Savings */}
        <div className="mt-4 z-10 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-800 shadow-xl">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>ابعاد خروجی:</span>
            <span className="text-white font-bold">{outputDims.width} × {outputDims.height} px</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">حجم اولیه:</span>
            <span className="text-slate-300 font-mono">{originalSizeKb} KB</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-emerald-400">حجم نهایی WebP:</span>
            <span className="text-white font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {outputSizeKb} KB
            </span>
          </div>

          {savingsPercent > 0 && (
            <>
              <span className="text-slate-700">|</span>
              <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md text-[11px] font-black border border-rose-500/30">
                {savingsPercent}% کاهش حجم
              </span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Controls & Settings */}
      <aside className="w-full lg:w-[460px] xl:w-[490px] bg-slate-900 flex flex-col flex-shrink-0 border-slate-800 overflow-y-auto p-5 md:p-6 space-y-6">
        {/* Title and Summary Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">تبدیل مستقیم عکس به WebP و فوتر برندینگ</h2>
              <p className="text-xs text-slate-400">افزودن نوار فوتر، تغییر سایز، لوگو و بهینه‌سازی حجم برای وردپرس</p>
            </div>
          </div>
        </div>

        {/* 1. UPLOAD IMAGE SECTION */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>انتخاب یا تغییر عکس اصلی</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              هماهنگ خودکار با طراح کاور
            </span>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>تصویر وارد شده در بخش اول (طراح کاور) خودکار اینجا بارگذاری می‌شود و بالعکس.</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-slate-700 hover:border-rose-500/80 bg-slate-900/50 hover:bg-rose-500/5 p-4 rounded-xl cursor-pointer text-center transition-all group"
          >
            <Upload className="w-6 h-6 text-slate-400 group-hover:text-rose-400 mx-auto mb-2 transition-transform group-hover:scale-110" />
            <p className="text-xs font-semibold text-slate-300">
              کلیک برای انتخاب فایل یا کشیدن و رها کردن عکس (Drag & Drop)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">پشتیبانی از JPG, PNG, WebP, GIF</p>
          </div>
        </div>

        {/* 2. FOOTER & BRANDING BAR (NEW FEATURE) */}
        <div className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-rose-500/30 shadow-lg shadow-rose-950/20">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-100 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableFooter}
                onChange={(e) => setEnableFooter(e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 bg-slate-950 border-slate-700"
              />
              <Globe className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-black text-white">افزودن نوار فوتر و برند به عکس</span>
            </label>
            {enableFooter ? (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                فعال
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">غیرفعال</span>
            )}
          </div>

          {enableFooter && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
              {/* Footer Style (Bar vs Pill vs Minimal) */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold block">طرح و استایل فوتر:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bar', label: 'نوار سرتاسری', sub: 'استاندارد' },
                    { id: 'pill', label: 'کپسولی شناور', sub: 'مدرن' },
                    { id: 'minimal', label: 'متن مینیمال', sub: 'سایه ملایم' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFooterStyle(st.id as FooterStyle)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        footerStyle === st.id
                          ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs">{st.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{st.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    نام برند / سایت (سمت راست فوتر):
                  </label>
                  <input
                    type="text"
                    value={footerBrandText}
                    onChange={(e) => setFooterBrandText(e.target.value)}
                    placeholder="مثال: موسسه راه کنکور"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    آدرس دامنه / شبکه‌های اجتماعی (سمت چپ فوتر):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={footerDomainText}
                    onChange={(e) => setFooterDomainText(e.target.value)}
                    placeholder="rahekonkur.ir"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-left placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Footer Icon Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">نوع آیکون در کنار برند:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { id: 'globe', label: 'کره 🌐' },
                    { id: 'wordpress', label: 'وردپرس W' },
                    { id: 'sparkle', label: 'ستاره ✨' },
                    { id: 'dot', label: 'نقطه رنگی' },
                    { id: 'badge', label: 'بج VIP' },
                    { id: 'none', label: 'بدون آیکون' },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setFooterIconType(ic.id as FooterIconType)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold text-center transition-all ${
                        footerIconType === ic.id
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Badge input if selected */}
              {footerIconType === 'badge' && (
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1">متن نشان (Badge):</label>
                  <input
                    type="text"
                    value={footerCustomBadgeText}
                    onChange={(e) => setFooterCustomBadgeText(e.target.value)}
                    placeholder="VIP / رسمی / راهنما"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              )}

              {/* Quick Color Palette Presets */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">پالت رنگ‌های آماده برای فوتر:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'قرمز / نئون', bg: '#090d16', text: '#f8fafc', accent: '#f43f5e' },
                    { name: 'مشکی / طلایی', bg: '#09090b', text: '#ffffff', accent: '#eab308' },
                    { name: 'آبی / فیروزه', bg: '#0b132b', text: '#e0f2fe', accent: '#0ea5e9' },
                    { name: 'زمردی / سبز', bg: '#022c22', text: '#ecfdf5', accent: '#10b981' },
                    { name: 'بنفش / شیشه‌ای', bg: '#0f0728', text: '#faf5ff', accent: '#a855f7' },
                    { name: 'سفید / کلاسیک', bg: '#ffffff', text: '#0f172a', accent: '#2563eb' },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyFooterTheme(p)}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-600 bg-slate-900 flex items-center justify-between text-[11px] text-slate-300 transition-colors"
                    >
                      <span>{p.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.bg }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization Inputs */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">رنگ پس‌زمینه</label>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="color"
                      value={footerBgColor}
                      onChange={(e) => setFooterBgColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{footerBgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">رنگ متن</label>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="color"
                      value={footerTextColor}
                      onChange={(e) => setFooterTextColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{footerTextColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">رنگ اکسنت / خط</label>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="color"
                      value={footerAccentColor}
                      onChange={(e) => setFooterAccentColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{footerAccentColor}</span>
                  </div>
                </div>
              </div>

              {/* Footer Height & Opacity Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">ارتفاع نوار:</span>
                    <span className="text-white font-mono">{footerHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="90"
                    step="2"
                    value={footerHeight}
                    onChange={(e) => setFooterHeight(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">شفافیت نوار:</span>
                    <span className="text-white font-mono">{footerOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={footerOpacity}
                    onChange={(e) => setFooterOpacity(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Top Accent Border Toggle */}
              {footerStyle === 'bar' && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={footerShowBorderTop}
                    onChange={(e) => setFooterShowBorderTop(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                  />
                  <span>نمایش خط بالایی براق و رنگی (Accent Line)</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* 3. RESIZE & DIMENSIONS */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>تغییر ابعاد و رزولوشن (Resize)</span>
            </label>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'original', label: 'اندازه اصلی', sub: `${originalDims.width}×${originalDims.height}` },
              { id: '1200x675', label: 'وبلاگ ۱۶:۹', sub: '1200 × 675' },
              { id: '1920x1080', label: 'Full HD', sub: '1920 × 1080' },
              { id: '1200x630', label: 'اشتراک‌گذاری', sub: '1200 × 630' },
              { id: '1080x1080', label: 'مربع ۱:۱', sub: '1080 × 1080' },
              { id: 'custom', label: 'سفارشی...', sub: 'دستی' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id as ResizePreset)}
                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  preset === item.id
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>

          {/* Custom Width & Height Inputs */}
          {preset === 'custom' && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">عرض (Width - px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-left"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ارتفاع (Height - px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono text-left"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={lockAspectRatio}
                  onChange={(e) => setLockAspectRatio(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                />
                <span>حفظ نسبت ابعاد تصویر (Lock Aspect Ratio)</span>
              </label>
            </div>
          )}

          {/* Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">مقیاس کلی تصویر:</span>
              <span className="text-white font-mono font-bold">{scalePercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={scalePercent}
              onChange={(e) => setScalePercent(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>کوچک‌نمایی (۱۰٪)</span>
              <span className="text-rose-400 font-semibold">پیش‌فرض: ۵۵٪</span>
              <span>اندازه کامل (۱۰۰٪)</span>
            </div>
          </div>
        </div>

        {/* 4. WEBP COMPRESSION & QUALITY */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>کیفیت فشرده‌سازی WebP (حجم تصویر)</span>
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">{quality}%</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>کمترین حجم (فوق‌العاده سبک)</span>
            <span className="text-emerald-400 font-semibold">پیش‌فرض: ۳۷٪</span>
            <span>بیشترین وضوح (۱۰۰٪)</span>
          </div>
        </div>

        {/* 5. WATERMARK & LOGO ADDITION */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableLogo}
                onChange={(e) => setEnableLogo(e.target.checked)}
                className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 bg-slate-950 border-slate-700"
              />
              <span className="text-white">افزودن دستی لوگو / واترمارک به عکس</span>
            </label>
            {enableLogo && (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                فعال
              </span>
            )}
          </div>

          {enableLogo && (
            <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in">
              {/* Upload Logo File */}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                  }}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>{logoImage ? 'تغییر فایل لوگو' : 'آپلود لوگوی شفاف (PNG / SVG)'}</span>
                  </button>

                  {logoImage && (
                    <button
                      type="button"
                      onClick={() => setLogoImage(null)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-colors"
                      title="حذف لوگو"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Position Grid (9 Positions) */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">موقعیت لوگو در تصویر:</label>
                <div className="grid grid-cols-3 gap-1.5 max-w-[280px] mx-auto bg-slate-900 p-2 rounded-xl border border-slate-800">
                  {[
                    { id: 'top-right', label: 'بالا راست' },
                    { id: 'top-center', label: 'بالا وسط' },
                    { id: 'top-left', label: 'بالا چپ' },
                    { id: 'center-right', label: 'وسط راست', pos: 'center' },
                    { id: 'center', label: 'مرکز' },
                    { id: 'center-left', label: 'وسط چپ', pos: 'center' },
                    { id: 'bottom-right', label: 'پایین راست' },
                    { id: 'bottom-center', label: 'پایین وسط' },
                    { id: 'bottom-left', label: 'پایین چپ' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setLogoPosition(pos.id as LogoPosition)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center transition-all ${
                        logoPosition === pos.id
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">اندازه لوگو:</span>
                  <span className="text-white font-mono">{logoSizePercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={logoSizePercent}
                  onChange={(e) => setLogoSizePercent(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Logo Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">شفافیت لوگو (Opacity):</span>
                  <span className="text-white font-mono">{logoOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={logoOpacity}
                  onChange={(e) => setLogoOpacity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Logo Padding Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">فاصله از حاشیه (Margin):</span>
                  <span className="text-white font-mono">{logoPadding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="4"
                  value={logoPadding}
                  onChange={(e) => setLogoPadding(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Shadow toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={logoHasShadow}
                  onChange={(e) => setLogoHasShadow(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                />
                <span>افزودن سایه نرم برای خوانایی بهتر لوگو روی پس‌زمینه‌های روشن</span>
              </label>
            </div>
          )}
        </div>

        {/* 6. DOWNLOAD & EXPORT ACTION BUTTONS */}
        <div className="pt-2 space-y-3 sticky bottom-0 bg-slate-900 py-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!outputBlob || isProcessing}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-rose-500/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>دانلود عکس WebP ({outputSizeKb} KB)</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!outputBlob || isProcessing}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>کپی مستقیم تصویر در کلیپ‌بورد</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

