import React, { useState } from 'react';
import { CoverConfig, HighlightConfig } from '../types';
import { Type, Sparkles, Sliders, CheckCircle2, Bookmark, Globe, Paintbrush, ChevronDown, ChevronUp } from 'lucide-react';

interface ContentTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({ config, onChange }) => {
  const [showHighlightSettings, setShowHighlightSettings] = useState(false);

  // Helper to quickly wrap selected word in title or set highlightText
  const handleKeywordPick = (word: string) => {
    onChange({ highlightText: word.trim() });
  };

  // Wrap selection in brackets or insert bracket
  const handleInsertBrackets = () => {
    if (config.highlightText && config.title.includes(config.highlightText)) {
      const updatedTitle = config.title.replace(config.highlightText, `[${config.highlightText}]`);
      onChange({ title: updatedTitle, highlightText: '' });
    } else if (config.title) {
      // Wrap first 2 words in brackets as a sample
      const words = config.title.split(' ');
      if (words.length >= 2) {
        const sample = `[${words.slice(0, 2).join(' ')}] ${words.slice(2).join(' ')}`;
        onChange({ title: sample });
      }
    }
  };

  // Get words in title for quick click-to-highlight (including numbers and short words)
  const titleWords = config.title
    ? config.title
        .replace(/<[^>]*>/g, '')
        .replace(/[[\]]/g, '')
        .split(/[\s,،؛]+/)
        .filter((w) => w.trim().length > 0)
    : [];

  const hlConfig: HighlightConfig = config.highlightConfig || {
    style: 'box',
    paddingX: 12,
    paddingY: 3,
    borderRadius: 8,
  };

  const updateHighlightConfig = (changes: Partial<HighlightConfig>) => {
    onChange({
      highlightConfig: {
        ...hlConfig,
        ...changes,
      },
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Title & Highlight Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-rose-400" />
            عنوان اصلی مقاله (تیتر کاور)
          </label>
          <span className="text-xs text-slate-400">پیشنهاد: ۵ تا ۸ کلمه</span>
        </div>
        <textarea
          rows={2}
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="مثال: برنامه‌ریزی کنکور تجربی از صفر یا [برنامه‌ریزی ۳ ماهه] کنکور"
          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-white text-base focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none font-vazir"
        />

        {/* Quick Keyword Highlighter & Controls */}
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              کلمه یا عبارت هایلایت شده:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHighlightSettings(!showHighlightSettings)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
              >
                <Paintbrush className="w-3 h-3" />
                <span>تنظیم کادر و پدینگ</span>
                {showHighlightSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {config.highlightText && (
                <button
                  type="button"
                  onClick={() => onChange({ highlightText: '' })}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  حذف هایلایت
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={config.highlightText}
              onChange={(e) => onChange({ highlightText: e.target.value })}
              placeholder="مثلا: برنامه‌ریزی ۳ ماهه"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 focus:ring-1 focus:ring-amber-400 outline-none"
            />
            <button
              type="button"
              onClick={handleInsertBrackets}
              title="گذاشتن متن در [براکت] در عنوان"
              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg font-mono border border-slate-600 transition-colors"
            >
              [ متن ]
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">نکته:</strong> می‌توانید مستقیماً در کادر عنوان، هر عبارتی را داخل <span className="text-amber-300 font-mono">[ ]</span> بگذارید تا به زیبایی و بدون بیرون‌زدگی هایلایت شود.
          </p>

          {titleWords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center">انتخاب سریع:</span>
              {titleWords.slice(0, 8).map((word, idx) => {
                const isSelected = config.highlightText === word;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleKeywordPick(word)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 font-bold shadow-sm'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}

          {/* Advanced Highlight Styler Drawer */}
          {showHighlightSettings && (
            <div className="mt-3 pt-3 border-t border-slate-700/70 space-y-3 bg-slate-900/60 p-3 rounded-lg">
              {/* Highlight Style Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300 block">سبک کادر هایلایت:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'box', label: 'کادر استاندارد' },
                      { id: 'pill', label: 'کپسولی گرد' },
                      { id: 'gradient', label: 'گرادیان' },
                      { id: 'underline', label: 'خط زیر مارکر' },
                      { id: 'outline', label: 'خط دور' },
                      { id: 'glow', label: 'نورانی نئون' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateHighlightConfig({ style: st.id })}
                      className={`text-xs py-1.5 px-2 rounded-md border text-center transition-all ${
                        (hlConfig.style || 'box') === st.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: PaddingX, PaddingY, BorderRadius */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>فاصله افقی (X)</span>
                    <span className="font-mono text-amber-300">{hlConfig.paddingX ?? 12}px</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={28}
                    step={1}
                    value={hlConfig.paddingX ?? 12}
                    onChange={(e) => updateHighlightConfig({ paddingX: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>فاصله عمودی (Y)</span>
                    <span className="font-mono text-amber-300">{hlConfig.paddingY ?? 3}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={14}
                    step={1}
                    value={hlConfig.paddingY ?? 3}
                    onChange={(e) => updateHighlightConfig({ paddingY: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>گردی گوشه</span>
                    <span className="font-mono text-amber-300">{hlConfig.borderRadius ?? 8}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={hlConfig.borderRadius ?? 8}
                    onChange={(e) => updateHighlightConfig({ borderRadius: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Color Pickers for Highlight Background & Text */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[11px] text-slate-300">رنگ پس‌زمینه:</span>
                  <input
                    type="color"
                    value={hlConfig.customBgColor || config.colors.highlight}
                    onChange={(e) => {
                      updateHighlightConfig({ customBgColor: e.target.value });
                      onChange({ colors: { ...config.colors, highlight: e.target.value } });
                    }}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                  <span className="text-[11px] text-slate-300">رنگ متن هایلایت:</span>
                  <input
                    type="color"
                    value={hlConfig.customTextColor || config.colors.highlightText}
                    onChange={(e) => {
                      updateHighlightConfig({ customTextColor: e.target.value });
                      onChange({ colors: { ...config.colors, highlightText: e.target.value } });
                    }}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category / Eyebrow */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          نام دسته‌بندی یا موضوع (بالای عنوان)
        </label>
        <input
          type="text"
          value={config.category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="مثال: برنامه‌ریزی و مشاوره"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Badge / Pill */}
      <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBadge}
              onChange={(e) => onChange({ showBadge: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 bg-slate-900 border-slate-700"
            />
            نمایش برچسب ویژه (Badge)
          </label>
        </div>

        {config.showBadge && (
          <input
            type="text"
            value={config.badgeText}
            onChange={(e) => onChange({ badgeText: e.target.value })}
            placeholder="مثال: راهنمای جامع ۱۴۰۵ یا ۵ دقیقه مطالعه"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-rose-400 outline-none"
          />
        )}
      </div>

      {/* Footer Branding: Site URL & Tagline */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            امضا و برندینگ پایین کاور (فوتر)
          </span>
          <span className="text-[11px] text-amber-400/90 font-medium">
            شخصی‌سازی پیشرفته در تب «تنظیمات فوتر»
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">نام سایت / شعار</label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="موسسه راه کنکور"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">آدرس دامنه سایت (URL)</label>
            <input
              type="text"
              dir="ltr"
              value={config.siteUrl}
              onChange={(e) => onChange({ siteUrl: e.target.value })}
              placeholder="rahekonkur.ir"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white focus:ring-1 focus:ring-rose-500 outline-none text-left"
            />
          </div>
        </div>

        {/* Quick Style Switcher */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">سبک فوتر:</span>
          {(['bar', 'pill', 'glass', 'minimal'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() =>
                onChange({
                  footerConfig: {
                    ...(config.footerConfig || {
                      style: 'bar',
                      height: 64,
                      fontSize: 14,
                      opacity: 1,
                      borderRadius: 0,
                      showSeparator: true,
                      separatorHeight: 4,
                      paddingX: 36,
                      iconType: 'wordpress',
                      alignment: 'space-between',
                    }),
                    style: st,
                  },
                })
              }
              className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                (config.footerConfig?.style || 'bar') === st
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'bar' && 'نوار کامل'}
              {st === 'pill' && 'کپسولی'}
              {st === 'glass' && 'شیشه‌ای'}
              {st === 'minimal' && 'مینیمال'}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Controls */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-sky-400" />
          تنظیمات قلم و تایپوگرافی
        </label>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'Vazirmatn', label: 'وزیرمتن (استاندارد وب)', fontClass: 'font-vazir' },
            { id: 'Lalezar', label: 'لاله‌زار (بولد و ژورنالی)', fontClass: 'font-lalezar' },
            { id: 'Noto Kufi Arabic', label: 'کوفی نوین (شیک)', fontClass: 'font-kufi' },
            { id: 'Tahoma', label: 'تاهوما (ساده)', fontClass: 'font-system' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ fontFamily: item.id as any })}
              className={`p-2.5 text-xs rounded-xl border text-right transition-all ${
                config.fontFamily === item.id
                  ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-bold'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className={item.fontClass}>{item.label}</div>
            </button>
          ))}
        </div>

        {/* Font Size & Line Height Sliders */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>اندازه قلم عنوان:</span>
            <span className="font-mono text-sky-400">{config.titleFontSize}px</span>
          </div>
          <input
            type="range"
            min={32}
            max={84}
            step={2}
            value={config.titleFontSize}
            onChange={(e) => onChange({ titleFontSize: Number(e.target.value) })}
            className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>فاصله خطوط (Line Height):</span>
          <span className="font-mono text-sky-400">{config.lineHeight}</span>
        </div>
        <input
          type="range"
          min={1.2}
          max={2.0}
          step={0.1}
          value={config.lineHeight}
          onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
          className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Answer Sheet Bubbles Element (for Editorial template) */}
      {config.template === 'editorial' && (
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showBubbles}
                onChange={(e) => onChange({ showBubbles: e.target.checked })}
                className="rounded text-rose-500 w-4 h-4 bg-slate-900 border-slate-700"
              />
              حباب‌های پاسخ‌برگ (تزئین تحریریه)
            </label>
          </div>

          {config.showBubbles && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">نقطه فعال:</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({ bubbleActiveIndex: idx })}
                    className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono ${
                      config.bubbleActiveIndex === idx
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
