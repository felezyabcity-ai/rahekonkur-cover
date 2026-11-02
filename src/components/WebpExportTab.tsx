import React, { useState } from 'react';
import { CoverConfig } from '../types';
import { DIMENSION_PRESETS } from '../data/presets';
import {
  Download,
  Copy,
  Check,
  Zap,
  HardDrive,
  FileCode,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';

interface WebpExportTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
  onExport: () => Promise<void>;
  onCopyImage: () => Promise<void>;
  isExporting: boolean;
  exportSizeKb?: number;
}

export const WebpExportTab: React.FC<WebpExportTabProps> = ({
  config,
  onChange,
  onExport,
  onCopyImage,
  isExporting,
  exportSizeKb,
}) => {
  const [copiedAlt, setCopiedAlt] = useState(false);
  const [copiedFilename, setCopiedFilename] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  // Generate suggested WordPress slug & Alt text
  const cleanTitle = (config.title || 'کاور مقاله')
    .replace(/<[^>]*>/g, '')
    .trim();

  const suggestedAlt = `${cleanTitle} - ${config.category || 'وبلاگ وردپرس'}`;

  const suggestedFilename =
    cleanTitle
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '.webp';

  const handleCopyAlt = () => {
    navigator.clipboard.writeText(suggestedAlt);
    setCopiedAlt(true);
    setTimeout(() => setCopiedAlt(false), 2000);
  };

  const handleCopyFilename = () => {
    navigator.clipboard.writeText(suggestedFilename);
    setCopiedFilename(true);
    setTimeout(() => setCopiedFilename(false), 2000);
  };

  const handleTriggerCopyImage = async () => {
    await onCopyImage();
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2500);
  };

  // Preset dimension change
  const handleDimensionSelect = (preset: (typeof DIMENSION_PRESETS)[0]) => {
    if (preset.id === 'custom') {
      onChange({ targetPreset: 'custom' });
    } else {
      onChange({
        targetPreset: preset.id,
        width: preset.width,
        height: preset.height,
      });
    }
  };

  // Estimate WebP size vs PNG size
  const estimatedWebpKb = exportSizeKb || Math.round((config.width * config.height * 0.000045 * (config.webpQuality * 1.1)) * 10) / 10;
  const estimatedPngKb = Math.round(estimatedWebpKb * 4.8);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Primary Download Button */}
      <div className="p-4 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-slate-800/80 rounded-2xl border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              WEBP
            </div>
            <div>
              <span className="text-sm font-bold text-white block">خروجی استاندارد وردپرس</span>
              <span className="text-xs text-rose-200/80">فرمت فوق‌سریع و بهینه برای سئو</span>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              ~{estimatedWebpKb} KB
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'در حال تولید...' : 'دانلود فایل WebP'}
          </button>

          <button
            type="button"
            onClick={handleTriggerCopyImage}
            disabled={isExporting}
            className="w-full bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50 text-slate-200 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-600 transition-all text-sm"
          >
            {copiedImage ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>کپی در کلیپ‌بورد</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WebP Quality Slider */}
      <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            کیفیت فشرده‌سازی WebP (کیفیت تصویر)
          </label>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            {Math.round(config.webpQuality * 100)}%
          </span>
        </div>

        <input
          type="range"
          min={0.1}
          max={1.0}
          step={0.01}
          value={config.webpQuality}
          onChange={(e) => onChange({ webpQuality: Number(e.target.value) })}
          className="w-full accent-amber-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
        />

        {/* Compression Comparison */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700/50">
          <div className="bg-slate-900/60 p-2 rounded-lg text-slate-300">
            <span className="text-slate-400 block">حجم در WebP (۸۵٪ سبک‌تر):</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">~{estimatedWebpKb} کیلوبایت</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg text-slate-300">
            <span className="text-slate-400 block">حجم معادل در PNG/JPG:</span>
            <span className="font-mono font-bold text-slate-400 text-xs">~{estimatedPngKb} کیلوبایت</span>
          </div>
        </div>
      </div>

      {/* Resolution & Dimensions */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Maximize2 className="w-4 h-4 text-sky-400" />
          ابعاد و نسبت تصویر (Pixel Dimensions)
        </label>

        <div className="grid grid-cols-1 gap-2">
          {DIMENSION_PRESETS.map((preset) => {
            const isSelected =
              config.targetPreset === preset.id ||
              (config.width === preset.width && config.height === preset.height);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleDimensionSelect(preset)}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white font-medium'
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{preset.label}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{preset.sublabel}</span>
                </div>
                <div className="text-left font-mono text-xs text-sky-400 bg-slate-900/80 px-2 py-1 rounded">
                  {preset.width} × {preset.height}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom dimensions if selected */}
        {config.targetPreset === 'custom' && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">عرض (Width px):</label>
              <input
                type="number"
                min={400}
                max={3840}
                value={config.width}
                onChange={(e) => onChange({ width: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">ارتفاع (Height px):</label>
              <input
                type="number"
                min={300}
                max={2160}
                value={config.height}
                onChange={(e) => onChange({ height: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* WordPress SEO Helper: Alt Tag & File Name */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-emerald-400" />
          بهینه‌ساز سئو برای رسانه وردپرس (WordPress Media)
        </label>

        {/* Alt Tag */}
        <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">متن جایگزین (Alt Text):</span>
            <button
              type="button"
              onClick={handleCopyAlt}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {copiedAlt ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی Alt</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg text-xs text-slate-200 break-words font-vazir">
            {suggestedAlt}
          </div>
        </div>

        {/* File Name */}
        <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">نام فایل سئوشده:</span>
            <button
              type="button"
              onClick={handleCopyFilename}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {copiedFilename ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی نام فایل</span>
                </>
              )}
            </button>
          </div>
          <div dir="ltr" className="bg-slate-900 p-2 rounded-lg text-xs font-mono text-slate-300 break-all text-left">
            {suggestedFilename}
          </div>
        </div>
      </div>

      {/* Download Entire Project Source Code (ZIP) */}
      <div className="p-4 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900/80 rounded-2xl border border-indigo-500/30 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">دانلود سورس کامل پروژه</h4>
            <p className="text-[11px] text-slate-400">فایل فشرده (ZIP) آماده برای اجرا بر روی کامپیوتر یا هاست</p>
          </div>
        </div>

        <a
          href="/api/download-project"
          download="wordpress-cover-generator.zip"
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>دانلود فایل فشرده پروژه (ZIP)</span>
        </a>

        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1" dir="ltr">
          <p className="text-slate-500 text-[10px]"># دستورات اجرا بعد از دانلود و آنزیپ:</p>
          <p className="text-emerald-400">npm install</p>
          <p className="text-emerald-400">npm run dev</p>
        </div>
      </div>

      {/* WordPress Performance Info Tip */}
      <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-0.5">چرا خروجی WebP برای وردپرس حیاتی است؟</strong>
          تصاویر WebP بدون افت کیفیت تا ۸۰٪ سبک‌تر از JPG و PNG هستند که امتیاز Core Web Vitals و سرعت
          بارگذاری رتبه ۱ گوگل را به شدت افزایش می‌دهند.
        </div>
      </div>
    </div>
  );
};
