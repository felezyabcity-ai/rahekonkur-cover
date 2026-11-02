import React from 'react';
import { CoverConfig, FooterConfig } from '../types';
import {
  Globe,
  Palette,
  Sliders,
  Type,
  LayoutTemplate,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Split,
  Tag,
  CircleDot,
  Layers,
  Square,
  Minus,
} from 'lucide-react';

interface FooterTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

export const FooterTab: React.FC<FooterTabProps> = ({ config, onChange }) => {
  const footerCfg: FooterConfig = config.footerConfig || {
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
  };

  const isFooterVisible = (config.visibility?.footer !== false);

  const updateFooter = (partial: Partial<FooterConfig>) => {
    onChange({
      footerConfig: {
        ...footerCfg,
        ...partial,
      },
    });
  };

  const footerStyles: { id: FooterConfig['style']; label: string; desc: string; icon: any }[] = [
    { id: 'bar', label: 'نوار پررنگ کلاسیک (Full Bar)', desc: 'نوار پهن چسبیده به لبه پایین با رنگ مجزا', icon: Square },
    { id: 'pill', label: 'کپسولی شناور (Floating Pill)', desc: 'باکس گرد و مدرن با گوشه‌های نیم‌دایره و سایه', icon: CircleDot },
    { id: 'glass', label: 'شیشه‌ای مات (Glassmorphism)', desc: 'پس‌زمینه نیمه‌شفاف با بلور شیک و مدرن', icon: Sparkles },
    { id: 'border-top', label: 'خطی مینیمال (Border Top)', desc: 'تفکیک فقط با یک خط باریک مدرن بدون باکس پر', icon: Minus },
    { id: 'minimal', label: 'متن ساده شفاف (Pure Clean)', desc: 'نوشته‌ها مستقیماً روی زمینه بدون کادر', icon: Type },
    { id: 'hidden', label: 'مخفی و بدون فوتر', desc: 'حذف کامل فوتر و خالی نگه‌داشتن پایین تصویر', icon: EyeOff },
  ];

  const iconOptions: { id: FooterConfig['iconType']; label: string; iconPreview: string }[] = [
    { id: 'academy', label: 'کلاه آکادمی (راه کنکور)', iconPreview: '🎓' },
    { id: 'wordpress', label: 'آیکون W (وردپرس)', iconPreview: 'W' },
    { id: 'globe', label: 'آیکون کره زمین (وب)', iconPreview: '🌐' },
    { id: 'sparkle', label: 'ستاره جرقه (VIP)', iconPreview: '✨' },
    { id: 'dot', label: 'نقطه رنگی هوشمند', iconPreview: '🔴' },
    { id: 'badge', label: 'بج کپسولی کوچک', iconPreview: '🏷️' },
    { id: 'none', label: 'بدون آیکون', iconPreview: '🚫' },
  ];

  const handleApplyExactReferenceFooter = () => {
    onChange({
      tagline: 'موسسه راه کنکور',
      siteName: 'موسسه راه کنکور',
      siteUrl: 'rahekonkur.ir',
      visibility: {
        ...(config.visibility || {}),
        footer: true,
        separatorLine: true,
      },
      footerConfig: {
        style: 'bar',
        height: 64,
        fontSize: 20,
        opacity: 1,
        borderRadius: 0,
        showSeparator: true,
        separatorHeight: 3.5,
        paddingX: 36,
        iconType: 'academy',
        alignment: 'space-between',
        customRightText: 'موسسه راه کنکور',
        customLeftText: 'rahekonkur.ir',
      },
      colors: {
        ...config.colors,
        footerBg: config.themeId === 'konkur-paper' ? '#16233A' : '#230541',
        footerText: '#FFFFFF',
      },
    });
  };

  return (
    <div className="footer-tab-container space-y-4 text-slate-200" dir="rtl">
      {/* Reference Image Quick Sync Banner */}
      <div className="p-3.5 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 rounded-2xl border border-purple-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <span className="text-xs font-black text-white block">تنظیم فوتر دقیقاً مطابق عکس نمونه ارسالی</span>
            <span className="text-[11px] text-purple-200/80">نوار پررنگ، برند موسسه راه کنکور، دامنه rahekonkur.ir و خط تفکیک</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleApplyExactReferenceFooter}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95"
        >
          <span>اعمال فوتر عکس نمونه (راه کنکور)</span>
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Preview of Footer */}
      <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
          <span>پیش‌نمایش زنده فوتر کاور:</span>
          <span className="font-mono text-purple-400">{footerCfg.height || 60}px | {footerCfg.style}</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-700/60 shadow-inner relative">
          {/* Separator line preview */}
          {footerCfg.showSeparator && (
            <div
              style={{
                backgroundColor: footerCfg.separatorColor || config.colors.marker,
                height: `${footerCfg.separatorHeight || 3.5}px`,
              }}
              className="w-full"
            />
          )}
          {/* Footer bar preview */}
          <div
            style={{
              backgroundColor: config.colors.footerBg,
              color: config.colors.footerText || '#FFFFFF',
              height: `${Math.min(52, footerCfg.height || 60)}px`,
              padding: '0 20px',
            }}
            className="w-full flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 font-black">
              {footerCfg.iconType === 'academy' && (
                <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] shadow-sm" style={{ backgroundColor: config.colors.marker, color: '#fff' }}>
                  🎓
                </span>
              )}
              {footerCfg.iconType === 'wordpress' && (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-mono font-bold">
                  W
                </span>
              )}
              {footerCfg.iconType === 'globe' && <span>🌐</span>}
              {footerCfg.iconType === 'dot' && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.marker }} />}
              <span>{config.tagline || config.siteName || 'موسسه راه کنکور'}</span>
            </div>
            <div dir="ltr" className="font-mono font-bold text-[11px] opacity-95 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.marker }} />
              <span>{config.siteUrl || 'rahekonkur.ir'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner with Quick Toggle */}
      <div className="p-3.5 bg-gradient-to-br from-slate-800 to-slate-900/90 rounded-2xl border border-slate-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">شخصی‌سازی متن و استایل فوتر</span>
              <span className="text-[11px] text-slate-400">متن، لینک، استایل، آیکون و رنگ</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextState = !isFooterVisible;
              onChange({
                visibility: {
                  ...(config.visibility || {}),
                  footer: nextState,
                },
              });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFooterVisible
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {isFooterVisible ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>فوتر فعال</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>فوتر پنهان</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Grid for Footer Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column (Content, Style, Icon) */}
        <div className="space-y-4">
          {/* Quick Texts Section */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-sky-400" />
              متن‌ها و پیوند فوتر
            </label>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">متن شعار یا عنوان (سمت راست)</label>
                <input
                  type="text"
                  value={config.tagline || ''}
                  onChange={(e) => onChange({ tagline: e.target.value })}
                  placeholder="موسسه راه کنکور"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-sky-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">آدرس وب‌سایت یا شناسه (سمت چپ)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={config.siteUrl || ''}
                  onChange={(e) => onChange({ siteUrl: e.target.value })}
                  placeholder="rahekonkur.ir"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:ring-1 focus:ring-sky-400 outline-none text-left transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Visual Styles */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
              طرح و استایل ظاهری
            </label>

            <div className="grid grid-cols-2 gap-2">
              {footerStyles.map((style) => {
                const isSelected = footerCfg.style === style.id;
                const IconComp = style.icon;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateFooter({ style: style.id })}
                    className={`p-2 rounded-lg border text-right transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400 text-white'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      {isSelected && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{style.label.split('(')[0]}</div>
                      <div className="text-[9px] text-slate-400 leading-tight truncate">{style.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Icon & Decoration */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              آیکون و نشان کنار متن
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {iconOptions.map((opt) => {
                const isSelected = footerCfg.iconType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFooter({ iconType: opt.id })}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs mb-0.5">{opt.iconPreview}</div>
                    <div className="text-[10px] leading-none truncate">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Colors, Sliders, Separator) */}
        <div className="space-y-4">
          {/* Footer Colors */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              رنگ‌بندی اختصاصی فوتر
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-200 block">رنگ پس‌زمینه</span>
                  <span className="text-[9px] text-slate-400 font-mono">{config.colors.footerBg}</span>
                </div>
                <input
                  type="color"
                  value={config.colors.footerBg || '#14361E'}
                  onChange={(e) =>
                    onChange({
                      colors: {
                        ...config.colors,
                        footerBg: e.target.value,
                      },
                    })
                  }
                  className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
                />
              </div>

              <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-200 block">رنگ متن و پیوند</span>
                  <span className="text-[9px] text-slate-400 font-mono">{config.colors.footerText}</span>
                </div>
                <input
                  type="color"
                  value={config.colors.footerText || '#E9F5EC'}
                  onChange={(e) =>
                    onChange({
                      colors: {
                        ...config.colors,
                        footerText: e.target.value,
                      },
                    })
                  }
                  className="w-7 h-7 rounded border border-slate-600 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer Sliders: Height, Font Size, Padding */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              ابعاد و مقیاس فوتر
            </label>

            {/* Font Size Quick Presets & Slider */}
            <div className="space-y-2 p-2.5 bg-slate-900/80 rounded-lg border border-slate-750">
              <div className="flex items-center justify-between text-[11px] text-slate-200 font-bold">
                <span className="flex items-center gap-1.5">
                  <Type className="w-3 h-3 text-sky-400" />
                  <span>اندازه فونت متن‌های فوتر:</span>
                </span>
                <span className="font-mono text-sky-300 font-black text-xs px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800">
                  {footerCfg.fontSize || 20}px
                </span>
              </div>

              {/* Quick Font Size Buttons */}
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'کوچک', size: 16 },
                  { label: 'متوسط', size: 20 },
                  { label: 'بزرگ', size: 24 },
                  { label: 'خیلی بزرگ', size: 28 },
                ].map((item) => {
                  const isCurrent = (footerCfg.fontSize || 20) === item.size;
                  return (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => updateFooter({ fontSize: item.size })}
                      className={`py-1 px-1.5 rounded-md text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[9px] opacity-80 font-mono">{item.size}px</div>
                    </button>
                  );
                })}
              </div>

              <input
                type="range"
                min={12}
                max={36}
                step={1}
                value={footerCfg.fontSize || 20}
                onChange={(e) => updateFooter({ fontSize: Number(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>۱۲px</span>
                <span>۲۰px (پیش‌فرض کنکور)</span>
                <span>۳۶px</span>
              </div>
            </div>

            {/* Height Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>ارتفاع نوار فوتر:</span>
                <span className="font-mono text-sky-400 font-bold">{footerCfg.height || 64}px</span>
              </div>
              <input
                type="range"
                min={44}
                max={120}
                step={2}
                value={footerCfg.height || 64}
                onChange={(e) => updateFooter({ height: Number(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Padding Horizontal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>فاصله افقی از طرفین:</span>
                <span className="font-mono text-sky-400 font-bold">{footerCfg.paddingX || 36}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={80}
                step={4}
                value={footerCfg.paddingX || 36}
                onChange={(e) => updateFooter({ paddingX: Number(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Separator Line Option */}
          <div className="p-3.5 bg-slate-850 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Minus className="w-3.5 h-3.5 text-amber-400" />
                نمایش خط تفکیک بالای فوتر
              </span>
              <input
                type="checkbox"
                checked={footerCfg.showSeparator ?? true}
                onChange={(e) => updateFooter({ showSeparator: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </label>

            {footerCfg.showSeparator && (
              <div className="space-y-1 pt-1 border-t border-slate-700/60">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ضخامت خط:</span>
                  <span className="font-mono text-amber-400">{footerCfg.separatorHeight || 4}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={footerCfg.separatorHeight || 4}
                  onChange={(e) => updateFooter({ separatorHeight: Number(e.target.value) })}
                  className="w-full accent-amber-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
