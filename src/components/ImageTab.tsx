import React, { useRef } from 'react';
import { CoverConfig } from '../types';
import { CURATED_STOCK_IMAGES } from '../data/presets';
import { LogoUploadSection } from './LogoUploadSection';
import { optimizeImageUpload, IMAGE_PRESETS } from '../utils/imageOptimizer';
import { Image as ImageIcon, Upload, Trash2, ZoomIn, Move, Sparkles, Filter } from 'lucide-react';

interface ImageTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

export const ImageTab: React.FC<ImageTabProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.background.maxSide, IMAGE_PRESETS.background.quality);
        onChange({ imageUrl: optimized });
      } catch (err) {
        console.error('Failed to optimize image upload:', err);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.background.maxSide, IMAGE_PRESETS.background.quality);
        onChange({ imageUrl: optimized });
      } catch (err) {
        console.error('Failed to optimize dropped image:', err);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Upload Zone */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-rose-400" />
          تصویر یا عکس شاخص کاور
        </label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-rose-500/70 bg-slate-800/60 hover:bg-slate-800/90 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-12 h-12 rounded-xl bg-slate-700/80 group-hover:bg-rose-500/20 group-hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              کلیک برای انتخاب فایل یا رها کردن عکس در اینجا
            </p>
            <p className="text-xs text-slate-400 mt-0.5">فرمت‌های PNG، JPG، WEBP، SVG پشتیبانی می‌شوند</p>
          </div>
        </div>

        {config.imageUrl && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              ✓ تصویر بارگذاری شد
            </span>
            <button
              type="button"
              onClick={() => onChange({ imageUrl: '' })}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف تصویر
            </button>
          </div>
        )}
      </div>

      {/* Image Controls: Zoom & Position */}
      {config.imageUrl && (
        <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/70 space-y-4">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Move className="w-4 h-4 text-sky-400" />
            تنظیم موقعیت و بزرگ‌نمایی عکس
          </span>

          {/* Zoom */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                بزرگ‌نمایی (Zoom):
              </span>
              <span className="font-mono text-sky-400">{config.imageZoom}%</span>
            </div>
            <input
              type="range"
              min={80}
              max={220}
              step={5}
              value={config.imageZoom}
              onChange={(e) => onChange({ imageZoom: Number(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Position X */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>موقعیت افقی (X):</span>
              <span className="font-mono text-sky-400">{config.imagePosX}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={config.imagePosX}
              onChange={(e) => onChange({ imagePosX: Number(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Position Y */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>موقعیت عمودی (Y):</span>
              <span className="font-mono text-sky-400">{config.imagePosY}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={config.imagePosY}
              onChange={(e) => onChange({ imagePosY: Number(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              فیلتر رنگی تصویر:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'none', label: 'طبیعی' },
                { id: 'grayscale', label: 'سیاه‌سفید' },
                { id: 'warm', label: 'گرم' },
                { id: 'cool', label: 'سرد' },
                { id: 'contrast', label: 'کنتراست بالا' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ imageFilter: f.id as any })}
                  className={`text-xs py-1.5 px-2 rounded-lg border text-center transition-all ${
                    config.imageFilter === f.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Curated Royalty-Free Gallery */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            آرشیو تصاویر باکیفیت و آماده
          </label>
          <span className="text-xs text-slate-400">بدون کپی‌رایت</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {CURATED_STOCK_IMAGES.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() =>
                onChange({
                  imageUrl: img.url,
                  imageZoom: 100,
                  imagePosX: 50,
                  imagePosY: 50,
                })
              }
              className={`group relative rounded-xl overflow-hidden border text-right transition-all h-24 ${
                config.imageUrl === img.url
                  ? 'ring-2 ring-rose-500 border-transparent shadow-lg'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <img
                src={img.thumb}
                alt={img.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2">
                <span className="text-[11px] font-bold text-white leading-tight drop-shadow">
                  {img.name}
                </span>
                <span className="text-[9px] text-slate-300">{img.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Website Logo Section */}
      <LogoUploadSection config={config} onChange={onChange} />
    </div>
  );
};
