import React, { useRef } from 'react';
import { CoverConfig, LogoConfig } from '../types';
import { optimizeImageUpload, IMAGE_PRESETS } from '../utils/imageOptimizer';
import {
  Upload,
  Trash2,
  Sliders,
  Eye,
  EyeOff,
  Sparkles,
  Move,
  Check,
  Image as ImageIcon,
  Sun,
  Moon,
} from 'lucide-react';

interface LogoUploadSectionProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

// Built-in starter logos for quick testing & preview
const SAMPLE_LOGOS = [
  {
    name: 'آیکون پیش‌فرض راه کنکور',
    url: 'https://api.iconify.design/lucide:graduation-cap.svg?color=%23f43f5e',
    preview: '🎓',
  },
  {
    name: 'قلم و کتاب (تحریریه)',
    url: 'https://api.iconify.design/lucide:book-open-check.svg?color=%230284c7',
    preview: '📖',
  },
  {
    name: 'وردپرس فارسی',
    url: 'https://api.iconify.design/lucide:sparkles.svg?color=%2310b981',
    preview: '✨',
  },
  {
    name: 'سپر آکادمیک',
    url: 'https://api.iconify.design/lucide:shield-check.svg?color=%23f59e0b',
    preview: '🛡️',
  },
  {
    name: 'آکادمی هوشمند',
    url: 'https://api.iconify.design/lucide:brain.svg?color=%238b5cf6',
    preview: '🧠',
  },
];

export const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoConfig: LogoConfig = config.logoConfig || {
    width: 68,
    opacity: 1,
    filter: 'none',
    placement: 'top-right',
    showBackground: false,
    bgPadding: 8,
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.logo.maxSide, IMAGE_PRESETS.logo.quality);
        onChange({
          logoUrl: optimized,
          showLogo: true,
          visibility: {
            ...config.visibility,
            logo: true,
          },
        });
      } catch (err) {
        console.error('Failed to optimize logo upload:', err);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.logo.maxSide, IMAGE_PRESETS.logo.quality);
        onChange({
          logoUrl: optimized,
          showLogo: true,
          visibility: {
            ...config.visibility,
            logo: true,
          },
        });
      } catch (err) {
        console.error('Failed to optimize dropped logo:', err);
      }
    }
  };

  const handleUpdateLogoConfig = (partial: Partial<LogoConfig>) => {
    onChange({
      logoConfig: {
        ...logoConfig,
        ...partial,
      },
    });
  };

  const handleRemoveLogo = () => {
    onChange({
      logoUrl: '',
      showLogo: false,
      visibility: {
        ...config.visibility,
        logo: false,
      },
    });
  };

  const isLogoVisible = (config.showLogo ?? false) && (config.visibility?.logo !== false) && !!config.logoUrl;

  return (
    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/80 space-y-4">
      {/* Header with show/hide toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100 block">لوگوی اختصاصی وب‌سایت</span>
            <span className="text-xs text-slate-400">لوگو، نشان برند یا واترمارک روی کاور</span>
          </div>
        </div>

        {config.logoUrl && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLogoVisible}
              onChange={(e) => {
                const checked = e.target.checked;
                onChange({
                  showLogo: checked,
                  visibility: {
                    ...config.visibility,
                    logo: checked,
                  },
                });
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        )}
      </div>

      {/* Upload Zone or Current Logo */}
      {!config.logoUrl ? (
        <div className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp,image/jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-amber-500/20 group-hover:text-amber-400 flex items-center justify-center text-slate-400 transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                کلیک برای آپلود فایل لوگو (PNG ترنسپرنت، SVG، WebP)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">یا فایل عکس لوگو را اینجا رها کنید</p>
            </div>
          </div>

          {/* Quick sample logo presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 block">یا انتخاب نشان پیش‌فرض تستی:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_LOGOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onChange({
                      logoUrl: sample.url,
                      showLogo: true,
                      visibility: { ...config.visibility, logo: true },
                    })
                  }
                  className="flex items-center gap-2 p-2 bg-slate-900/70 hover:bg-slate-700/80 rounded-xl border border-slate-700/60 text-right transition-all text-xs text-slate-300 group"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">{sample.preview}</span>
                  <span className="truncate">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Logo Card with Preview & Remove */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 p-1.5 flex items-center justify-center overflow-hidden">
                <img
                  src={config.logoUrl}
                  alt="لوگوی سایت"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">لوگو بارگذاری شده</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  آماده نمایش و جابه‌جایی آزاد با ماوس
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              >
                تغییر فایل
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                title="حذف لوگو"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logo Position / Placement Preset */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              موقعیت قرارگیری لوگو روی کاور:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'top-right', label: 'بالا راست' },
                { id: 'top-left', label: 'بالا چپ' },
                { id: 'bottom-right', label: 'پایین راست' },
                { id: 'bottom-left', label: 'پایین چپ' },
                { id: 'footer-inline', label: 'داخل فوتر' },
                { id: 'custom', label: 'آزاد (Drag با ماوس)' },
              ].map((pos) => {
                const isActive = (logoConfig.placement || 'top-right') === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handleUpdateLogoConfig({ placement: pos.id as any })}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size & Opacity Sliders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Width Slider */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">اندازه / عرض لوگو:</span>
                <span className="font-mono text-amber-400 font-bold">{logoConfig.width || 68} px</span>
              </div>
              <input
                type="range"
                min={24}
                max={160}
                step={2}
                value={logoConfig.width || 68}
                onChange={(e) => handleUpdateLogoConfig({ width: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">میزان شفافیت (Opacity):</span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round((logoConfig.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={logoConfig.opacity ?? 1}
                onChange={(e) => handleUpdateLogoConfig({ opacity: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Filters: Invert (white) / Dark / Normal */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-300 block">فیلتر رنگی و کنتراست لوگو:</span>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'none', label: 'رنگ اصلی' },
                { id: 'invert', label: 'سفید خالص' },
                { id: 'dark', label: 'مشکی تیره' },
                { id: 'grayscale', label: 'سیاه‌سفید' },
              ].map((f) => {
                const isActive = (logoConfig.filter || 'none') === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdateLogoConfig({ filter: f.id as any })}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all text-center ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Badge Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={logoConfig.showBackground || false}
                onChange={(e) => handleUpdateLogoConfig({ showBackground: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5 bg-slate-900 border-slate-700"
              />
              <span>ایجاد کادر پس‌زمینه سفید/محو برای لوگو</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
