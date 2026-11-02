import React from 'react';
import { CoverConfig, LayerPosition, LayerPositions, LayerVisibility } from '../types';
import { LogoUploadSection } from './LogoUploadSection';
import {
  Move,
  RotateCcw,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sparkles,
  Layers as LayersIcon,
  HelpCircle,
  Magnet,
  Check,
  Trash2,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface LayersTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
  selectedLayer: string | null;
  onSelectLayer: (layer: string | null) => void;
}

interface LayerDefinition {
  id: keyof LayerPositions;
  label: string;
  icon: string;
  description: string;
  hasResize?: boolean;
}

export const LayersTab: React.FC<LayersTabProps> = ({
  config,
  onChange,
  selectedLayer,
  onSelectLayer,
}) => {
  const positions = config.positions?.[config.template] || config.templatePositions?.[config.template] || {};

  const getLayersForTemplate = (): LayerDefinition[] => {
    if (config.template === 'teacher-compare') {
      const teachers = config.teacherCompare?.teachers || [];
      const list: LayerDefinition[] = [
        {
          id: 'title',
          label: 'عنوان اصلی مقایسه (Title)',
          icon: '🏆',
          description: config.teacherCompare?.title || 'عنوان بالای مقایسه',
        },
        {
          id: 'subtitle',
          label: 'زیرعنوان مقایسه (Subtitle)',
          icon: '💬',
          description: config.teacherCompare?.subtitle || 'پرسش یا توضیح مقایسه',
        },
        {
          id: 'vsBadge',
          label: 'نشان مرکزی VS',
          icon: '⚔️',
          description: 'مدال نبرد رو در رو در وسط بوم',
        },
      ];

      teachers.forEach((t, idx) => {
        const num = idx + 1;
        list.push({
          id: `teacherFace${num}` as keyof LayerPositions,
          label: `چهره ${t.name || `استاد ${num}`}`,
          icon: '👤',
          description: `پرتره و هاله نوری ${t.name}`,
        });
        list.push({
          id: `teacherInfo${num}` as keyof LayerPositions,
          label: `مشخصات ${t.name || `استاد ${num}`}`,
          icon: '🏷️',
          description: `نام، آموزشگاه و نشان ${t.name}`,
        });
      });

      list.push(
        {
          id: 'badge',
          label: 'نشان و پیش‌عنوان بالای کاور',
          icon: '🔖',
          description: 'نشان بالا سمت چپ',
        },
        {
          id: 'logo',
          label: 'لوگو و نام آکادمی',
          icon: '✨',
          description: 'لوگو یا برند آکادمی بالا سمت راست',
          hasResize: true,
        },
        {
          id: 'footer',
          label: 'نوار فوتر و آدرس سایت',
          icon: '🌐',
          description: 'امضا و آدرس دامنه در پایین',
        }
      );
      return list;
    }

    if (config.template === 'teacher-bio') {
      return [
        {
          id: 'title',
          label: 'نام استاد (Title)',
          icon: '👤',
          description: config.teacherBio?.teacherName || 'نام کامل استاد',
          hasResize: true,
        },
        {
          id: 'category',
          label: 'پیش‌عنوان بیوگرافی',
          icon: '🎓',
          description: config.teacherBio?.prefixTitle || 'بیوگرافی یا پیش‌عنوان',
        },
        {
          id: 'badge',
          label: 'سمت و درس استاد (Role)',
          icon: '🏷️',
          description: config.teacherBio?.subtitleRole || 'دبیر و موسسه',
        },
        {
          id: 'imageCard',
          label: 'عکس پرتره استاد (Portrait)',
          icon: '🖼️',
          description: 'پرتره قدی یا برش خورده استاد',
          hasResize: true,
        },
        {
          id: 'bubbles',
          label: 'سوابق و افتخارات (Highlights)',
          icon: '⭐',
          description: 'کارت‌های افتخارات و سوابق',
        },
        {
          id: 'logo',
          label: 'لوگوی آکادمی',
          icon: '✨',
          description: 'نشان تجاری یا واترمارک سایت',
          hasResize: true,
        },
        {
          id: 'footer',
          label: 'نوار فوتر و آدرس سایت',
          icon: '🌐',
          description: 'آدرس دامنه و برندینگ',
        },
      ];
    }

    // Default article layers
    return [
      {
        id: 'title',
        label: 'عنوان اصلی مقاله (Title)',
        icon: '🔤',
        description: 'تیتر بزرگ و کلمات هایلایت‌شده',
        hasResize: true,
      },
      {
        id: 'category',
        label: 'دسته‌بندی و نشان (Category)',
        icon: '🏷️',
        description: 'برچسب موضوعی بالای عنوان',
      },
      {
        id: 'imageCard',
        label: 'کادر تصویر مقاله (Image Frame)',
        icon: '🖼️',
        description: 'عکس شاخص و کادر پس‌زمینه',
        hasResize: true,
      },
      {
        id: 'logo',
        label: 'لوگوی اختصاصی وب‌سایت (Site Logo)',
        icon: '✨',
        description: 'نشان تجاری، واترمارک یا آیکون سایت',
        hasResize: true,
      },
      {
        id: 'bubbles',
        label: 'حباب‌های پاسخ‌برگ (Bubbles)',
        icon: '🔘',
        description: 'نقاط تزئینی تحریریه (راه کنکور)',
      },
      {
        id: 'badge',
        label: 'برچسب ویژه (Special Badge)',
        icon: '🔖',
        description: 'نشان گرد یا کپسولی',
      },
      {
        id: 'footer',
        label: 'نوار فوتر و آدرس سایت (Footer)',
        icon: '🌐',
        description: 'شعار، آدرس دامنه و کپی‌رایت',
      },
      {
        id: 'separatorLine',
        label: 'خط تفکیک مارکر (Separator)',
        icon: '➖',
        description: 'خط باریک رنگی بالای فوتر',
      },
    ];
  };

  const layers = getLayersForTemplate();

  const visibility = config.visibility || {
    title: true,
    category: true,
    badge: true,
    imageCard: true,
    bubbles: true,
    footer: true,
    separatorLine: true,
    logo: true,
  };

  const handleToggleVisibility = (layerId: keyof LayerPositions) => {
    const isCurrentlyVisible = isLayerVisible(layerId);
    const nextVis = {
      ...visibility,
      [layerId]: !isCurrentlyVisible,
    };

    const updates: Partial<CoverConfig> = {
      visibility: nextVis,
    };

    // Keep legacy booleans in sync
    if (layerId === 'bubbles') {
      updates.showBubbles = !isCurrentlyVisible;
    } else if (layerId === 'badge') {
      updates.showBadge = !isCurrentlyVisible;
    } else if (layerId === 'logo') {
      updates.showLogo = !isCurrentlyVisible;
    }

    onChange(updates);
  };

  const isLayerVisible = (layerId: keyof LayerPositions): boolean => {
    if (layerId === 'bubbles') {
      return (config.showBubbles ?? true) && (visibility.bubbles ?? true);
    }
    if (layerId === 'badge') {
      return (config.showBadge ?? true) && (visibility.badge ?? true);
    }
    if (layerId === 'logo') {
      return (config.showLogo ?? false) && (visibility.logo ?? true) && !!config.logoUrl;
    }
    return visibility[layerId as keyof LayerVisibility] ?? true;
  };

  const handleUpdateLayer = (layerId: keyof LayerPositions, partial: Partial<LayerPosition>) => {
    const current = positions[layerId] || { x: 0, y: 0 };
    const updatedPos = {
      ...current,
      ...partial,
      isCustom: true,
    };
    const updatedPositions = {
      ...positions,
      [layerId]: updatedPos,
    };
    onChange({
      positions: {
        ...(config.positions || {}),
        [config.template]: updatedPositions,
      } as any,
      templatePositions: {
        ...(config.templatePositions || {}),
        [config.template]: updatedPositions,
      },
    });
  };

  const handleResetLayer = (layerId: keyof LayerPositions) => {
    const nextPositions = { ...positions };
    delete nextPositions[layerId];
    onChange({
      positions: {
        ...(config.positions || {}),
        [config.template]: nextPositions,
      } as any,
      templatePositions: {
        ...(config.templatePositions || {}),
        [config.template]: nextPositions,
      },
    });
  };

  const handleResetAllPositions = () => {
    onChange({
      positions: {
        ...(config.positions || {}),
        [config.template]: {},
      } as any,
      templatePositions: {
        ...(config.templatePositions || {}),
        [config.template]: {},
      },
    });
  };

  const handleRestoreAllLayers = () => {
    onChange({
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
      showLogo: !!config.logoUrl,
    });
  };

  const handleCenterHorizontal = (layerId: keyof LayerPositions) => {
    handleUpdateLayer(layerId, { x: 0 });
  };

  const handleCenterVertical = (layerId: keyof LayerPositions) => {
    handleUpdateLayer(layerId, { y: 0 });
  };

  const hasAnyCustomPosition = Object.values(positions).some((p) => {
    const pos = p as LayerPosition | undefined;
    return pos && (pos.x !== 0 || pos.y !== 0 || pos.width || pos.height);
  });

  const hiddenLayersCount = layers.filter((l) => !isLayerVisible(l.id)).length;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner Guide & Snapping */}
      <div className="p-4 bg-gradient-to-br from-rose-900/30 via-pink-900/20 to-slate-800 rounded-2xl border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow">
              <Move className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">جابه‌جایی آزاد با ماوس</span>
              <span className="text-xs text-rose-200">Drag & Drop مستقیم روی پیش‌نمایش</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableFreeDrag ?? true}
              onChange={(e) => onChange({ enableFreeDrag: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          می‌توانید با موس هر قسمتی (عنوان، لوگو، عکس، دسته‌بندی، حباب‌ها و فوتر) را جابه‌جا کنید یا با آیکون سطل زباله / چشم، آن قسمت را پنهان یا حذف نمایید.
        </p>

        {/* Snap to Guides toggle & quick actions */}
        <div className="flex items-center justify-between pt-2 border-t border-rose-500/20 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.snapToGuides ?? true}
              onChange={(e) => onChange({ snapToGuides: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center gap-1">
              <Magnet className="w-3.5 h-3.5 text-amber-400" />
              جذب هوشمند به مرکز و خطوط راهنما (Smart Snap)
            </span>
          </label>

          {hasAnyCustomPosition && (
            <button
              type="button"
              onClick={handleResetAllPositions}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              ریست مختصات
            </button>
          )}
        </div>
      </div>

      {/* Website Logo Section */}
      <LogoUploadSection config={config} onChange={onChange} />

      {/* Layers List & Visibility Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <LayersIcon className="w-4 h-4 text-sky-400" />
            نمایش، حذف و تنظیم موقعیت لایه‌ها
          </label>

          {hiddenLayersCount > 0 && (
            <button
              type="button"
              onClick={handleRestoreAllLayers}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-500/30 transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>بازیابی همه ({hiddenLayersCount} بخش پنهان)</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {layers.map((layer) => {
            const pos = positions[layer.id] || { x: 0, y: 0 };
            const isSelected = selectedLayer === layer.id;
            const isCustom = pos.x !== 0 || pos.y !== 0 || pos.width || pos.height;
            const visible = isLayerVisible(layer.id);

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(isSelected ? null : String(layer.id))}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !visible
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                    : isSelected
                    ? 'bg-slate-800 border-rose-500 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Layer Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{layer.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 block">{layer.label}</span>
                        {!visible && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-medium">
                            حذف / پنهان شده
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{layer.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Visibility Toggle Button (Eye / Trash) */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(layer.id)}
                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
                        visible
                          ? 'bg-slate-900 hover:bg-slate-700 text-slate-300 border-slate-700'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                      }`}
                      title={visible ? 'حذف / پنهان کردن این قسمت' : 'نمایش مجدد این قسمت'}
                    >
                      {visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[11px]">نمایش</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[11px]">پنهان</span>
                        </>
                      )}
                    </button>

                    {/* Reset Position */}
                    {isCustom && visible && (
                      <button
                        type="button"
                        onClick={() => handleResetLayer(layer.id)}
                        className="text-[11px] px-2 py-1 bg-slate-900 hover:bg-slate-700 text-rose-400 rounded-md border border-slate-700 flex items-center gap-1"
                        title="بازنشانی این لایه به جایگاه اولیه"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>ریست</span>
                      </button>
                    )}

                    {visible && (
                      <button
                        type="button"
                        onClick={() => handleCenterHorizontal(layer.id)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700"
                        title="وسط‌چین افقی (X = 0)"
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* X and Y Sliders & Controls (Only shown if layer is visible) */}
                {visible && (
                  <div
                    className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Position X */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">جابه‌جایی افقی (X):</span>
                        <span className="font-mono text-rose-400 font-bold">
                          {pos.x > 0 ? `+${pos.x}` : pos.x} px
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateLayer(layer.id, { x: (pos.x || 0) - 10 })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                        >
                          -10
                        </button>
                        <input
                          type="range"
                          min={-400}
                          max={400}
                          step={2}
                          value={pos.x || 0}
                          onChange={(e) => handleUpdateLayer(layer.id, { x: Number(e.target.value) })}
                          className="w-full accent-rose-500 bg-slate-700 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateLayer(layer.id, { x: (pos.x || 0) + 10 })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    {/* Position Y */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">جابه‌جایی عمودی (Y):</span>
                        <span className="font-mono text-rose-400 font-bold">
                          {pos.y > 0 ? `+${pos.y}` : pos.y} px
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateLayer(layer.id, { y: (pos.y || 0) - 10 })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                        >
                          -10
                        </button>
                        <input
                          type="range"
                          min={-300}
                          max={300}
                          step={2}
                          value={pos.y || 0}
                          onChange={(e) => handleUpdateLayer(layer.id, { y: Number(e.target.value) })}
                          className="w-full accent-rose-500 bg-slate-700 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateLayer(layer.id, { y: (pos.y || 0) + 10 })}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-mono"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Width / Height adjustments for image & title */}
                {visible && layer.hasResize && (
                  <div
                    className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {layer.id === 'imageCard' && (
                      <>
                        <div className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2 py-1 rounded-lg">
                          <span className="text-slate-400">عرض کادر:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLayer('imageCard', {
                                  width: Math.max(200, (pos.width || 450) - 30),
                                })
                              }
                              className="px-1 bg-slate-800 rounded text-slate-300 text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono text-sky-400">{pos.width || 'پیش‌فرض'}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLayer('imageCard', {
                                  width: Math.min(800, (pos.width || 450) + 30),
                                })
                              }
                              className="px-1 bg-slate-800 rounded text-slate-300 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2 py-1 rounded-lg">
                          <span className="text-slate-400">ارتفاع کادر:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLayer('imageCard', {
                                  height: Math.max(150, (pos.height || 400) - 30),
                                })
                              }
                              className="px-1 bg-slate-800 rounded text-slate-300 text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono text-sky-400">{pos.height || 'پیش‌فرض'}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLayer('imageCard', {
                                  height: Math.min(700, (pos.height || 400) + 30),
                                })
                              }
                              className="px-1 bg-slate-800 rounded text-slate-300 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {layer.id === 'title' && (
                      <div className="col-span-2 flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                        <span className="text-slate-400">حداکثر عرض متن عنوان (Wrap Width):</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateLayer('title', {
                                width: Math.max(300, (pos.width || 600) - 40),
                              })
                            }
                            className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-xs"
                          >
                            -40px
                          </button>
                          <span className="font-mono text-rose-400">{pos.width || 'خودکار'}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateLayer('title', {
                                width: Math.min(1100, (pos.width || 600) + 40),
                              })
                            }
                            className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 text-xs"
                          >
                            +40px
                          </button>
                        </div>
                      </div>
                    )}

                    {layer.id === 'logo' && (
                      <div className="col-span-2 flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                        <span className="text-slate-400">اندازه لوگو:</span>
                        <span className="font-mono text-amber-400">
                          {config.logoConfig?.width || 68} px
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Usage Tips */}
      <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/40 space-y-1.5 text-xs text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>راهنمای حذف و شخصی‌سازی المان‌ها:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 pr-1">
          <li>برای حذف هر بخش، دکمه «نمایش/پنهان» کنار آن را بزنید یا روی بوم علامت سطل را کلیک کنید.</li>
          <li>لوگوی اختصاصی خود را با فرمت PNG بدون پس‌زمینه در کادر بالا آپلود کنید.</li>
          <li>برای بازگرداندن تمام بخش‌ها دکمه «بازیابی همه» را لمس کنید.</li>
        </ul>
      </div>
    </div>
  );
};
