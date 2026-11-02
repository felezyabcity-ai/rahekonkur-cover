import React from 'react';
import { CoverConfig } from '../types';
import { SAMPLE_PRESETS } from '../data/presets';
import {
  Download,
  Copy,
  Sparkles,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileImage,
  Layers,
  Zap,
  LayoutTemplate,
  GraduationCap,
  Swords,
  FileCode,
} from 'lucide-react';

interface HeaderNavProps {
  config: CoverConfig;
  appMode: 'cover' | 'teachers' | 'compare' | 'quick-converter';
  setAppMode: (mode: 'cover' | 'teachers' | 'compare' | 'quick-converter') => void;
  onApplyPreset: (preset: Partial<CoverConfig>) => void;
  onReset: () => void;
  onExport: () => Promise<void>;
  onCopyImage: () => Promise<void>;
  isExporting: boolean;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  config,
  appMode,
  setAppMode,
  onApplyPreset,
  onReset,
  onExport,
  onCopyImage,
  isExporting,
  zoomLevel,
  setZoomLevel,
}) => {
  return (
    <header className="min-h-16 flex-wrap bg-slate-900 border-b border-slate-800 px-3 md:px-6 py-2 gap-2 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-black text-white tracking-tight whitespace-nowrap">
              سازنده کاور وردپرس و اساتید
            </h1>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30 hidden sm:inline-block whitespace-nowrap">
              نسخه کامل
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden lg:block">
            طراحی کاور مقالات، بیوگرافی و مقایسه اساتید (VS) با خروجی فوق بهینه WebP
          </p>
        </div>
      </div>

      {/* Center: Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setAppMode('teachers')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            appMode === 'teachers'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-200 shrink-0" />
          <span>کاور تک استاد</span>
        </button>

        <button
          type="button"
          onClick={() => setAppMode('compare')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            appMode === 'compare'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-amber-500/25 ring-1 ring-amber-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Swords className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="font-extrabold">مقایسه اساتید (VS)</span>
        </button>

        <button
          type="button"
          onClick={() => setAppMode('cover')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            appMode === 'cover'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-sky-200 shrink-0" />
          <span>کاور مقالات</span>
        </button>

        <button
          type="button"
          onClick={() => setAppMode('quick-converter')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            appMode === 'quick-converter'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="hidden sm:inline">تبدیل سریع WebP</span>
          <span className="sm:hidden">تبدیل</span>
        </button>
      </div>

      {/* Right Actions: Zoom & WebP Download */}
      {appMode !== 'quick-converter' && (
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(0.6)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors border-r border-slate-700"
              title="اندازه پیش‌فرض (Fit)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition-all hidden md:flex"
            title="بازنشانی به حالت اولیه"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Download Project Source Code ZIP */}
          <a
            href="/api/download-project"
            download="wordpress-cover-generator.zip"
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-sm transition-all text-xs whitespace-nowrap active:scale-[0.97]"
            title="دانلود فایل سورس پروژه (ZIP) برای استفاده و توسعه محلی"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">دانلود سورس (ZIP)</span>
            <span className="sm:hidden">سورس</span>
          </a>

          {/* 1-Click WebP Download */}
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="bg-rose-500 hover:bg-rose-600 active:scale-[0.97] text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all text-xs sm:text-sm disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'در حال خروجی...' : 'دانلود WebP'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

