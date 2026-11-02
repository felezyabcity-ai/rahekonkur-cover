import React from 'react';
import { CoverConfig } from '../types';
import { COLOR_THEMES, TEMPLATES } from '../data/presets';
import { Layout, Palette, Check, Sparkles } from 'lucide-react';

interface ThemeTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

export const ThemeTab: React.FC<ThemeTabProps> = ({ config, onChange }) => {
  const templates = TEMPLATES;

  const handleSelectTemplate = (templateId: CoverConfig['template']) => {
    onChange({
      template: templateId,
    });
  };

  const handleApplyTheme = (theme: (typeof COLOR_THEMES)[0]) => {
    onChange({
      themeId: theme.id,
      colors: { ...theme.colors },
    });
  };

  const handleColorChange = (key: keyof CoverConfig['colors'], value: string) => {
    onChange({
      colors: {
        ...config.colors,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Template Layout Picker */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-rose-400" />
          ساختار و چیدمان قالب کاور
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tpl.id as any)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex items-start justify-between ${
                config.template === tpl.id
                  ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div>
                <span className="text-sm font-bold block">{tpl.name}</span>
                <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{tpl.desc}</span>
              </div>
              {config.template === tpl.id && (
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Color Palettes */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-amber-400" />
          پالت‌های رنگی آماده و هماهنگ
        </label>

        <div className="grid grid-cols-1 gap-2">
          {COLOR_THEMES.map((th) => {
            const isSelected = config.themeId === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => handleApplyTheme(th)}
                className={`p-3 rounded-xl border flex items-center justify-between text-right transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-semibold text-slate-200">{th.name}</span>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: th.colors.paper }}
                    title="پس‌زمینه"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: th.colors.ink }}
                    title="متن اصلی"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: th.colors.marker }}
                    title="مارکر و تاکیدی"
                  />
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: th.colors.highlight }}
                    title="هایلایت"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Granular Color Picker */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sky-400" />
          تنظیم دقیق رنگ‌های اجزای کاور
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: 'paper', label: 'رنگ پس‌زمینه (Paper)' },
            { key: 'paperSecondary', label: 'کادر تصویر (Card)' },
            { key: 'ink', label: 'رنگ متن اصلی (Ink)' },
            { key: 'graphite', label: 'رنگ دسته و جزئیات' },
            { key: 'marker', label: 'رنگ خط مارکر و حاشیه' },
            { key: 'highlight', label: 'رنگ هایلایت <mark>' },
            { key: 'footerBg', label: 'رنگ نوار فوتر پایین' },
            { key: 'footerText', label: 'رنگ متن فوتر' },
          ].map((item) => (
            <div
              key={item.key}
              className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2"
            >
              <label className="text-[11px] text-slate-300 font-medium leading-tight">
                {item.label}
              </label>
              <input
                type="color"
                value={config.colors[item.key as keyof CoverConfig['colors']] || '#000000'}
                onChange={(e) =>
                  handleColorChange(item.key as keyof CoverConfig['colors'], e.target.value)
                }
                className="w-7 h-7 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
