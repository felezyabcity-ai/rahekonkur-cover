import React, { useState, useRef, useEffect } from 'react';
import { CoverConfig, LayerPosition, LayerPositions } from './types';
import { INITIAL_COVER_CONFIG } from './data/presets';
import { CoverCanvasPreview } from './components/CoverCanvasPreview';
import { HeaderNav } from './components/HeaderNav';
import { ContentTab } from './components/ContentTab';
import { ImageTab } from './components/ImageTab';
import { LayersTab } from './components/LayersTab';
import { ThemeTab } from './components/ThemeTab';
import { WebpExportTab } from './components/WebpExportTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { FooterTab } from './components/FooterTab';
import { QuickImageConverter } from './components/QuickImageConverter';
import { TeacherBioTab } from './components/TeacherBioTab';
import { TeacherCompareTab } from './components/TeacherCompareTab';
import { exportCoverToWebP, downloadFile, copyImageToClipboard } from './utils/exportWebp';
import { dehydrateAndStore, hydratedConfigJson } from './utils/imageStore';
import {
  Type,
  Image as ImageIcon,
  Palette,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Move,
  RotateCcw,
  Magnet,
  Layers as LayersIcon,
  RefreshCw,
  Zap,
  Globe,
  GraduationCap,
  Swords,
} from 'lucide-react';

// Helper to strip image data URLs from config if localStorage quota is exceeded
function stripImagesFromConfig(cfg: CoverConfig): CoverConfig {
  return {
    ...cfg,
    imageUrl: '',
    logoUrl: undefined,
    teacherBio: cfg.teacherBio
      ? {
          ...cfg.teacherBio,
          portraitCutoutUrl: undefined,
        }
      : undefined,
    teacherCompare: cfg.teacherCompare
      ? {
          ...cfg.teacherCompare,
          teachers: (cfg.teacherCompare.teachers || []).map((t) => ({
            ...t,
            photoUrl: '',
            portraitCutoutUrl: undefined,
          })),
        }
      : undefined,
    articleContent: cfg.articleContent
      ? {
          ...cfg.articleContent,
          imageUrl: '',
        }
      : undefined,
  };
}

function getInitialConfigAndMode(): {
  config: CoverConfig;
  appMode: 'cover' | 'teachers' | 'compare' | 'quick-converter';
  activeTab: 'teacher-profile' | 'teacher-compare' | 'content';
} {
  const saved = hydratedConfigJson ?? localStorage.getItem('wp_cover_config');
  let loadedConfig = INITIAL_COVER_CONFIG;

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.siteUrl === 'pydev.org' || !parsed.siteUrl) {
        parsed.siteUrl = 'rahekonkur.ir';
      }
      if (parsed.tagline === 'آکادمی برنامه‌نویسی' || !parsed.tagline) {
        parsed.tagline = 'موسسه راه کنکور';
      }
      if (parsed.siteName === 'پای‌دو' || !parsed.siteName) {
        parsed.siteName = 'موسسه راه کنکور';
      }
      if (!parsed.template) {
        parsed.template = 'teacher-compare';
      }
      if (parsed.themeId === 'tech-cyber' || !parsed.themeId) {
        parsed.themeId = 'konkur-paper';
        parsed.colors = {
          paper: '#E7EEE7',
          paperSecondary: '#DCE7DC',
          ink: '#16233A',
          graphite: '#5F6E7E',
          marker: '#E8456B',
          highlight: '#FFE08A',
          highlightText: '#16233A',
          footerBg: '#16233A',
          footerText: '#E6EDE6',
        };
      }
      // 37% quality caused heavy blur/blocking on photos & text — migrate old values
      if (parsed.webpQuality === undefined || parsed.webpQuality <= 0.4 || parsed.webpQuality === 0.85) {
        parsed.webpQuality = 0.82;
      }

      // Ensure positions are stored per template: positions[template][element]
      let normalizedPositions: Record<string, LayerPositions> = {};
      const knownTemplates = ['editorial', 'split-modern', 'magazine', 'minimal-card', 'badge-guide', 'dark-neon', 'teacher-bio', 'teacher-compare'];
      if (parsed.positions && typeof parsed.positions === 'object') {
        const hasTplKeys = Object.keys(parsed.positions).some((k) => knownTemplates.includes(k));
        if (hasTplKeys) {
          normalizedPositions = parsed.positions;
        } else {
          normalizedPositions = {
            [parsed.template || 'teacher-compare']: parsed.positions,
          };
        }
      } else if (parsed.templatePositions) {
        normalizedPositions = parsed.templatePositions;
      } else {
        normalizedPositions = {
          'teacher-compare': {},
          'teacher-bio': {},
          'editorial': {},
        };
      }

      loadedConfig = {
        ...INITIAL_COVER_CONFIG,
        ...parsed,
        positions: normalizedPositions as any,
        templatePositions: parsed.templatePositions || normalizedPositions,
      };
    } catch {
      loadedConfig = INITIAL_COVER_CONFIG;
    }
  }

  // 4. Initialize appMode from the saved config.template:
  // teacher-bio→"teachers", teacher-compare→"compare", anything else→"cover".
  let appMode: 'cover' | 'teachers' | 'compare' = 'cover';
  let activeTab: 'teacher-profile' | 'teacher-compare' | 'content' = 'content';

  if (loadedConfig.template === 'teacher-bio') {
    appMode = 'teachers';
    activeTab = 'teacher-profile';
  } else if (loadedConfig.template === 'teacher-compare') {
    appMode = 'compare';
    activeTab = 'teacher-compare';
  } else {
    appMode = 'cover';
    activeTab = 'content';
  }

  return { config: loadedConfig, appMode, activeTab };
}

export default function App() {
  const [initialData] = useState(() => getInitialConfigAndMode());
  const [appMode, setAppMode] = useState<'cover' | 'teachers' | 'compare' | 'quick-converter'>(initialData.appMode);
  const [config, setConfig] = useState<CoverConfig>(initialData.config);
  const [activeTab, setActiveTab] = useState<'teacher-profile' | 'teacher-compare' | 'content' | 'theme' | 'image' | 'footer' | 'layers' | 'export' | 'ai'>(initialData.activeTab);

  const handleSetAppMode = (mode: 'cover' | 'teachers' | 'compare' | 'quick-converter') => {
    setAppMode(mode);
    if (mode === 'teachers') {
      setConfig((prev) => {
        const nextTemplate = 'teacher-bio';
        return {
          ...prev,
          template: nextTemplate,
          visibility: {
            ...(prev.visibility || {}),
            footer: true,
            separatorLine: true,
          },
          footerConfig: {
            ...(prev.footerConfig || INITIAL_COVER_CONFIG.footerConfig),
            style: 'bar',
            height: Math.max(64, prev.footerConfig?.height || 64),
            fontSize: Math.max(20, prev.footerConfig?.fontSize || 20),
            showSeparator: true,
            iconType: prev.footerConfig?.iconType === 'wordpress' ? 'academy' : (prev.footerConfig?.iconType || 'academy'),
          },
        };
      });
      setActiveTab('teacher-profile');
    } else if (mode === 'compare') {
      setConfig((prev) => {
        const nextTemplate = 'teacher-compare';
        return {
          ...prev,
          template: nextTemplate,
          visibility: {
            ...(prev.visibility || {}),
            footer: true,
            separatorLine: true,
          },
          footerConfig: {
            ...(prev.footerConfig || INITIAL_COVER_CONFIG.footerConfig),
            style: 'bar',
            height: Math.max(64, prev.footerConfig?.height || 64),
            fontSize: Math.max(20, prev.footerConfig?.fontSize || 20),
            showSeparator: true,
            iconType: prev.footerConfig?.iconType === 'wordpress' ? 'academy' : (prev.footerConfig?.iconType || 'academy'),
          },
        };
      });
      setActiveTab('teacher-compare');
    } else if (mode === 'cover') {
      setConfig((prev) => {
        const nextTemplate = (prev.template === 'teacher-bio' || prev.template === 'teacher-compare') ? 'editorial' : prev.template;

        const savedArticle = prev.articleContent || {
          title: 'برنامه‌ریزی [۳ ماهه] کنکور تجربی از صفر',
          category: 'مشاوره و برنامه‌ریزی',
          highlightText: '۳ ماهه',
          tagline: prev.tagline || 'موسسه راه کنکور',
          badgeText: 'راهنمای جامع',
          showBadge: true,
          showBubbles: true,
          bubbleActiveIndex: 2,
          imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
        };

        const isTeacherTitle = prev.title === 'مهدی یحیوی' || prev.title.includes('استاد') || prev.title.includes('مقایسه');
        const nextTitle = isTeacherTitle ? savedArticle.title : prev.title;
        const nextCategory = (prev.category === 'بیوگرافی' || prev.category === 'مقایسه اساتید') ? savedArticle.category : prev.category;
        const nextImage = (!prev.imageUrl || prev.imageUrl.includes('photo-1534528741775') || prev.imageUrl.includes('photo-1507003211169') || prev.imageUrl.includes('photo-1500648767791'))
          ? savedArticle.imageUrl
          : prev.imageUrl;

        return {
          ...prev,
          template: nextTemplate,
          title: nextTitle,
          category: nextCategory,
          imageUrl: nextImage,
          highlightText: isTeacherTitle ? savedArticle.highlightText : prev.highlightText,
          showBadge: savedArticle.showBadge,
          showBubbles: savedArticle.showBubbles,
          bubbleActiveIndex: savedArticle.bubbleActiveIndex,
        };
      });
      setActiveTab('content');
    }
  };
  const [zoomLevel, setZoomLevel] = useState<number>(0.55);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [exportSizeKb, setExportSizeKb] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const previewNodeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 2. Wrap localStorage.setItem in try/catch; if quota exceeded, strip images and show toast
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        // Images go to IndexedDB; localStorage keeps only light refs
        const light = await dehydrateAndStore(config);
        if (cancelled) return;
        localStorage.setItem('wp_cover_config', JSON.stringify(light));
        return;
      } catch (idbErr) {
        console.warn('IndexedDB save failed, falling back to localStorage:', idbErr);
      }
      if (cancelled) return;
    try {
      localStorage.setItem('wp_cover_config', JSON.stringify(config));
    } catch (err) {
      console.warn('localStorage save failed (quota exceeded), saving without images...', err);
      try {
        const stripped = stripImagesFromConfig(config);
        localStorage.setItem('wp_cover_config', JSON.stringify(stripped));
        showToast('حافظه مرورگر پر شد؛ تنظیمات بدون تصاویر ذخیره شدند.', 'info');
      } catch (innerErr) {
        showToast('خطا در ذخیره‌سازی محلی تنظیمات.', 'info');
      }
    }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config]);

  // Sync activeTab with template mode
  useEffect(() => {
    if (config.template === 'teacher-bio' && activeTab === 'content') {
      setActiveTab('teacher-profile');
    } else if (config.template !== 'teacher-bio' && activeTab === 'teacher-profile') {
      setActiveTab('content');
    }
  }, [config.template, activeTab]);

  // Adjust default zoom based on viewport width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width < 640) {
          setZoomLevel(Math.min(0.28, (width - 32) / (config.width || 1200)));
        } else if (width < 1024) {
          setZoomLevel(Math.min(0.45, (width - 48) / (config.width || 1200)));
        } else {
          setZoomLevel(Math.min(0.62, (width - 80) / (config.width || 1200)));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.width]);

  const handleConfigChange = (updated: Partial<CoverConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      if (appMode === 'cover') {
        const existingArticle = prev.articleContent || {
          title: 'برنامه‌ریزی [۳ ماهه] کنکور تجربی از صفر',
          category: 'مشاوره و برنامه‌ریزی',
          highlightText: '۳ ماهه',
          tagline: prev.tagline || 'موسسه راه کنکور',
          badgeText: 'راهنمای جامع',
          showBadge: true,
          showBubbles: true,
          bubbleActiveIndex: 2,
          imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop',
        };
        next.articleContent = {
          title: updated.title !== undefined ? updated.title : (existingArticle.title || next.title),
          category: updated.category !== undefined ? updated.category : (existingArticle.category || next.category),
          highlightText: updated.highlightText !== undefined ? updated.highlightText : (existingArticle.highlightText || next.highlightText),
          highlightConfig: updated.highlightConfig !== undefined ? updated.highlightConfig : (existingArticle.highlightConfig || next.highlightConfig),
          tagline: updated.tagline !== undefined ? updated.tagline : (existingArticle.tagline || next.tagline),
          badgeText: updated.badgeText !== undefined ? updated.badgeText : (existingArticle.badgeText || next.badgeText),
          showBadge: updated.showBadge !== undefined ? updated.showBadge : (existingArticle.showBadge ?? next.showBadge),
          showBubbles: updated.showBubbles !== undefined ? updated.showBubbles : (existingArticle.showBubbles ?? next.showBubbles),
          bubbleActiveIndex: updated.bubbleActiveIndex !== undefined ? updated.bubbleActiveIndex : (existingArticle.bubbleActiveIndex ?? next.bubbleActiveIndex),
          imageUrl: updated.imageUrl !== undefined ? updated.imageUrl : (existingArticle.imageUrl || next.imageUrl),
        };
      }
      return next;
    });
  };

  const handleUpdatePosition = (layerKey: keyof LayerPositions, partial: Partial<LayerPosition>) => {
    setConfig((prev) => {
      const currentTpl = prev.template || 'editorial';
      const allPositions = (prev.positions as any) || {};
      const currentTplPositions = allPositions[currentTpl] || prev.templatePositions?.[currentTpl] || {};
      const currentPos = currentTplPositions[layerKey] || { x: 0, y: 0 };
      const updatedLayer = {
        ...currentPos,
        ...partial,
        isCustom: true,
      };
      const updatedTplPositions = {
        ...currentTplPositions,
        [layerKey]: updatedLayer,
      };
      return {
        ...prev,
        positions: {
          ...allPositions,
          [currentTpl]: updatedTplPositions,
        },
        templatePositions: {
          ...(prev.templatePositions || {}),
          [currentTpl]: updatedTplPositions,
        },
      };
    });
  };

  const handleToggleVisibility = (layerKey: keyof LayerPositions, visible?: boolean) => {
    setConfig((prev) => {
      const currentVis = prev.visibility || {
        title: true,
        category: true,
        badge: true,
        imageCard: true,
        bubbles: true,
        footer: true,
        separatorLine: true,
        logo: true,
      };
      const nextVal = visible !== undefined ? visible : !(currentVis[layerKey as keyof typeof currentVis] ?? true);
      const nextVis = {
        ...currentVis,
        [layerKey]: nextVal,
      };

      const updates: Partial<CoverConfig> = {
        visibility: nextVis,
      };

      if (layerKey === 'bubbles') {
        updates.showBubbles = nextVal;
      } else if (layerKey === 'badge') {
        updates.showBadge = nextVal;
      } else if (layerKey === 'logo') {
        updates.showLogo = nextVal;
      }

      return {
        ...prev,
        ...updates,
      };
    });

    const actionText = visible === false ? 'پنهان شد' : 'نمایان شد';
    showToast(`بخش ${layerKey} ${actionText}`, 'info');
  };

  const handleRestoreAllLayers = () => {
    setConfig((prev) => ({
      ...prev,
      visibility: {
        title: true,
        category: true,
        badge: true,
        imageCard: true,
        bubbles: true,
        footer: true,
        separatorLine: true,
        logo: true,
      },
      showBubbles: true,
      showBadge: true,
      showLogo: !!prev.logoUrl,
    }));
    showToast('همه بخش‌ها و لایه‌ها بازیابی شدند');
  };

  const handleResetPositions = () => {
    setConfig((prev) => {
      const currentTpl = prev.template || 'editorial';
      return {
        ...prev,
        positions: {
          ...(prev.positions || {}),
          [currentTpl]: {},
        },
        templatePositions: {
          ...(prev.templatePositions || {}),
          [currentTpl]: {},
        },
      };
    });
    showToast('موقعیت المان‌های این قالب به حالت پیش‌فرض بازگشت', 'info');
  };

  const handleApplyPreset = (preset: Partial<CoverConfig>) => {
    setConfig((prev) => {
      const nextTpl = preset.template || prev.template;
      return {
        ...prev,
        ...preset,
        positions: {
          ...(prev.positions || {}),
          [nextTpl]: {},
        },
        templatePositions: {
          ...(prev.templatePositions || {}),
          [nextTpl]: {},
        },
      };
    });
    showToast('قالب با موفقیت اعمال شد');
  };

  const handleReset = () => {
    setConfig(INITIAL_COVER_CONFIG);
    setSelectedLayer(null);
    showToast('تنظیمات به حالت اولیه بازگردانده شد', 'info');
  };

  // WebP Export handler
  const handleExportWebP = async () => {
    if (!previewNodeRef.current) return;
    setIsExporting(true);

    try {
      const result = await exportCoverToWebP(previewNodeRef.current, config);
      setExportSizeKb(result.fileSizeKb);

      // Generate filename based on title
      const cleanTitle = (config.title || 'wordpress-cover')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 40)
        .replace(/\s+/g, '-');

      const filename = `cover-${cleanTitle}.webp`;
      downloadFile(result.blob, filename);

      showToast(`فایل WebP با حجم ${result.fileSizeKb} KB با موفقیت دانلود شد`);
    } catch (err: any) {
      console.error('Export WebP failed:', err);
      showToast('خطا در تولید فایل WebP', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!previewNodeRef.current) return;
    setIsExporting(true);

    try {
      const result = await exportCoverToWebP(previewNodeRef.current, config, 'image/png');
      const success = await copyImageToClipboard(result.blob);
      if (success) {
        showToast('تصویر با کیفیت در کلیپ‌بورد کپی شد (آماده Paste در وردپرس)');
      } else {
        downloadFile(result.blob, 'cover.png');
        showToast('فایل WebP دانلود شد (مرورگر اجازه کپی مستقیم نداد)');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('خطا در کپی تصویر', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = appMode === 'compare'
    ? [
        { id: 'teacher-compare', label: 'تنظیمات مقایسه اساتید', icon: Swords, color: 'text-amber-400' },
        { id: 'theme', label: 'قالب و رنگ', icon: Palette, color: 'text-emerald-400' },
        { id: 'footer', label: 'تنظیمات فوتر', icon: Globe, color: 'text-amber-400' },
        { id: 'layers', label: 'چیدمان و لایه‌ها', icon: Move, color: 'text-pink-400' },
        { id: 'export', label: 'خروجی WebP و سئو', icon: Download, color: 'text-cyan-400' },
        { id: 'ai', label: 'هوش مصنوعی', icon: Sparkles, color: 'text-purple-400' },
      ]
    : appMode === 'teachers'
    ? [
        { id: 'teacher-profile', label: 'اطلاعات و رزومه استاد', icon: GraduationCap, color: 'text-purple-400' },
        { id: 'theme', label: 'قالب و رنگ', icon: Palette, color: 'text-emerald-400' },
        { id: 'footer', label: 'تنظیمات فوتر', icon: Globe, color: 'text-amber-400' },
        { id: 'layers', label: 'چیدمان و لایه‌ها', icon: Move, color: 'text-pink-400' },
        { id: 'export', label: 'خروجی WebP و سئو', icon: Download, color: 'text-cyan-400' },
        { id: 'ai', label: 'هوش مصنوعی', icon: Sparkles, color: 'text-purple-400' },
      ]
    : [
        { id: 'content', label: 'محتوا و تیترها', icon: Type, color: 'text-rose-400' },
        { id: 'theme', label: 'قالب و رنگ', icon: Palette, color: 'text-emerald-400' },
        { id: 'image', label: 'تصویر و قاب', icon: ImageIcon, color: 'text-sky-400' },
        { id: 'footer', label: 'تنظیمات فوتر', icon: Globe, color: 'text-amber-400' },
        { id: 'layers', label: 'چیدمان و لایه‌ها', icon: Move, color: 'text-pink-400' },
        { id: 'export', label: 'خروجی WebP و سئو', icon: Download, color: 'text-cyan-400' },
        { id: 'ai', label: 'هوش مصنوعی', icon: Sparkles, color: 'text-purple-400' },
      ];

  const artboardWidth = config.width || 1200;
  const artboardHeight = config.height || 675;
  const currentTplPositions = config.positions?.[config.template] || config.templatePositions?.[config.template] || {};
  const hasCustomPositions = Object.values(currentTplPositions).some(
    (p) => {
      const pos = p as LayerPosition | undefined;
      return pos && (pos.isCustom || pos.x !== 0 || pos.y !== 0 || pos.width || pos.height);
    }
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-vazir selection:bg-rose-500 selection:text-white">
      {/* Header Navigation */}
      <HeaderNav
        config={config}
        appMode={appMode}
        setAppMode={handleSetAppMode}
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onExport={handleExportWebP}
        onCopyImage={handleCopyImage}
        isExporting={isExporting}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />

      {/* Main Mode View */}
      {appMode === 'quick-converter' ? (
        <QuickImageConverter
          currentImage={config.imageUrl}
          onImageChange={(newUrl) => handleConfigChange({ imageUrl: newUrl })}
          brandText={config.tagline || config.siteName || 'موسسه راه کنکور'}
          domainText={config.siteUrl || 'rahekonkur.ir'}
          onNotify={showToast}
          onSwitchToCoverMode={() => setAppMode('teachers')}
        />
      ) : (
        /* Cover Designer Mode */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left/Main Area: Canvas Preview Stage */}
          <main
            ref={containerRef}
            className="flex-1 bg-slate-900/60 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-auto border-b lg:border-b-0 lg:border-l border-slate-800 min-h-[440px] lg:min-h-full"
          >
            {/* Subtle Grid Pattern in Canvas Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Interactive Canvas Bar: Drag Mode & Snapping Controls */}
            <div className="mb-3 z-20 flex flex-wrap items-center justify-between gap-2 w-full max-w-2xl px-2">
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={config.enableFreeDrag ?? true}
                    onChange={(e) => handleConfigChange({ enableFreeDrag: e.target.checked })}
                    className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                  />
                  <Move className="w-3.5 h-3.5 text-rose-400" />
                  <span>جابه‌جایی آزاد با ماوس</span>
                </label>

                <span className="text-slate-700">|</span>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.snapToGuides ?? true}
                    onChange={(e) => handleConfigChange({ snapToGuides: e.target.checked })}
                    className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                  />
                  <Magnet className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">جذب هوشمند (Snap)</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                {/* Hidden layers quick recovery indicator */}
                {(config.visibility && Object.values(config.visibility).some((v) => v === false)) && (
                  <button
                    type="button"
                    onClick={handleRestoreAllLayers}
                    className="text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shadow-sm transition-all"
                    title="بازیابی تمام لایه‌ها و بخش‌های حذف شده"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>بازیابی بخش‌های پنهان</span>
                  </button>
                )}

                {hasCustomPositions && (
                  <button
                    type="button"
                    onClick={handleResetPositions}
                    className="text-xs bg-slate-800/90 hover:bg-slate-700 text-rose-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-rose-500/30 flex items-center gap-1.5 shadow-sm transition-all"
                    title="بازنشانی موقعیت تمام المان‌ها"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>ریست چیدمان</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('layers')}
                  className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <LayersIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">مدیریت لایه‌ها و حذف</span>
                </button>
              </div>
            </div>

            {/* Canvas Wrapper with Zoom Scaling */}
            <div
              className="relative flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                width: `${artboardWidth * zoomLevel}px`,
                height: `${artboardHeight * zoomLevel}px`,
              }}
            >
              <div
                style={{
                  width: `${artboardWidth}px`,
                  height: `${artboardHeight}px`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top right',
                }}
                className="absolute top-0 right-0 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10"
              >
                <CoverCanvasPreview
                  ref={previewNodeRef}
                  config={config}
                  positions={currentTplPositions}
                  zoomLevel={zoomLevel}
                  selectedLayer={selectedLayer}
                  onSelectLayer={setSelectedLayer}
                  onUpdatePosition={handleUpdatePosition}
                  onToggleVisibility={handleToggleVisibility}
                  isExporting={isExporting}
                />
              </div>
            </div>

            {/* Quick Floating SEO Info Pill */}
            <div className="mt-4 z-10 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-md">
              <span className="flex items-center gap-1 text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {config.width} × {config.height} px
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold">فرمت WebP</span>
              <span className="text-slate-600">•</span>
              <span>کیفیت {Math.round(config.webpQuality * 100)}%</span>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => setActiveTab('export')}
                className="text-rose-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <FileCode className="w-3.5 h-3.5" />
                تنظیمات سئو
              </button>
            </div>
          </main>

          {/* Right Sidebar: Editor & Controls */}
          <aside className="w-full lg:w-[460px] xl:w-[490px] bg-slate-900 flex flex-col flex-shrink-0 border-slate-800 overflow-hidden h-auto lg:h-[calc(100vh-4rem)]">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[58px] py-2 px-1 rounded-xl text-[11px] leading-tight font-bold flex flex-col items-center gap-1 transition-all whitespace-normal text-center ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 p-5 md:p-6 overflow-y-auto">
              {activeTab === 'teacher-compare' && (
                <TeacherCompareTab
                  config={config}
                  onChange={handleConfigChange}
                  onNotify={showToast}
                />
              )}
              {activeTab === 'teacher-profile' && (
                <TeacherBioTab
                  config={config}
                  onChange={handleConfigChange}
                  onNotify={showToast}
                />
              )}
              {activeTab === 'content' && (
                <ContentTab config={config} onChange={handleConfigChange} />
              )}
              {activeTab === 'footer' && (
                <FooterTab config={config} onChange={handleConfigChange} />
              )}
              {activeTab === 'image' && (
                <ImageTab config={config} onChange={handleConfigChange} />
              )}
              {activeTab === 'layers' && (
                <LayersTab
                  config={config}
                  onChange={handleConfigChange}
                  selectedLayer={selectedLayer}
                  onSelectLayer={setSelectedLayer}
                />
              )}
              {activeTab === 'theme' && (
                <ThemeTab config={config} onChange={handleConfigChange} />
              )}
              {activeTab === 'export' && (
                <WebpExportTab
                  config={config}
                  onChange={handleConfigChange}
                  onExport={handleExportWebP}
                  onCopyImage={handleCopyImage}
                  isExporting={isExporting}
                  exportSizeKb={exportSizeKb}
                />
              )}
              {activeTab === 'ai' && (
                <AIAssistantTab config={config} onChange={handleConfigChange} />
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-4">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
