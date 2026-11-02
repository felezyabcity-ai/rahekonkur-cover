import React, { useState, useRef } from 'react';
import { CoverConfig, TeacherBioConfig, TeacherHighlightItem } from '../types';
import { COLOR_THEMES } from '../data/presets';
import { optimizeImageUpload, IMAGE_PRESETS } from '../utils/imageOptimizer';
import {
  GraduationCap,
  Trophy,
  Users,
  Presentation,
  Lightbulb,
  BookOpen,
  Star,
  CheckCircle,
  Award,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Scissors,
  FlipHorizontal,
  Sun,
  Eye,
  Atom,
  Palette,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Type,
} from 'lucide-react';

interface TeacherBioTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
  onNotify: (text: string, type?: 'success' | 'info') => void;
}

const AVAILABLE_ICONS = [
  { id: 'grad-cap', label: 'کلاه فارغ‌التحصیلی / دانشگاه', icon: GraduationCap },
  { id: 'trophy', label: 'کاپ / رتبه برتر', icon: Trophy },
  { id: 'users', label: 'دانش‌آموزان / سابقه تدریس', icon: Users },
  { id: 'screen', label: 'تخته تدریس / کلاس آنلاین', icon: Presentation },
  { id: 'lightbulb', label: 'لامپ / روش مفهومی و ایده', icon: Lightbulb },
  { id: 'book', label: 'کتاب / مولف برتر', icon: BookOpen },
  { id: 'star', label: 'ستاره / افتخار طلایی', icon: Star },
  { id: 'check', label: 'تیک تایید / استاندارد', icon: CheckCircle },
  { id: 'award', label: 'مدال افتخار / نشان برتر', icon: Award },
];

export const TeacherBioTab: React.FC<TeacherBioTabProps> = ({
  config,
  onChange,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teacherBio: TeacherBioConfig = config.teacherBio || {
    teacherName: 'مهدی یحیوی',
    prefixTitle: 'بیوگرافی',
    subtitleRole: 'استاد فیزیک کنکور و دبیر تام لند',
    highlights: [
      { id: 'h1', icon: 'grad-cap', text: 'کارشناسی ارشد مهندسی مکانیک - دانشگاه صنعتی شریف' },
      { id: 'h2', icon: 'trophy', text: 'رتبه ۳۰ کنکور سراسری' },
      { id: 'h3', icon: 'users', text: 'سابقه تدریس در تام لند و مراکز آموزشی معتبر کشور' },
      { id: 'h4', icon: 'screen', text: 'مدرس برجسته فیزیک پایه و کنکور' },
      { id: 'h5', icon: 'lightbulb', text: 'سبک تدریس مفهومی، تحلیلی و کاربردی' },
    ],
    subjectDoodles: 'physics',
    photoStyle: 'cutout',
    photoGlow: true,
    photoFlipX: false,
    bottomFade: true,
    chromaKeyEnabled: false,
    chromaKeyColor: '#6ED6F6',
    chromaKeyTolerance: 35,
  };

  const [isProcessingChroma, setIsProcessingChroma] = useState(false);

  const updateTeacherBio = (changes: Partial<TeacherBioConfig>) => {
    onChange({
      template: 'teacher-bio',
      teacherBio: {
        ...teacherBio,
        ...changes,
      },
    });
  };

  // Handle single photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('لطفاً یک فایل تصویری معتبر انتخاب کنید', 'info');
      return;
    }

    try {
      const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.photo.maxSide, IMAGE_PRESETS.photo.quality);
      onChange({
        imageUrl: optimized,
        template: 'teacher-bio',
      });
      // If user had a cutout URL, clear it so the fresh upload is used
      updateTeacherBio({ portraitCutoutUrl: undefined });
      onNotify('عکس استاد با موفقیت بارگذاری شد');
    } catch (err) {
      console.error('Failed to optimize teacher photo:', err);
      onNotify('خطا در بارگذاری تصویر', 'info');
    }
  };

  // Client-side Chroma Key / Background Removal (removes cyan, blue, green or custom color)
  const applyChromaKeyRemoval = (targetHexColor: string, tolerance: number) => {
    if (!config.imageUrl) {
      onNotify('ابتدا یک عکس بارگذاری کنید', 'info');
      return;
    }

    setIsProcessingChroma(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessingChroma(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Parse target HEX
        const rTarget = parseInt(targetHexColor.slice(1, 3), 16) || 110;
        const gTarget = parseInt(targetHexColor.slice(3, 5), 16) || 214;
        const bTarget = parseInt(targetHexColor.slice(5, 7), 16) || 246;

        const tolDist = (tolerance / 100) * 255;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean distance in RGB color space
          const dist = Math.sqrt(
            Math.pow(r - rTarget, 2) +
            Math.pow(g - gTarget, 2) +
            Math.pow(b - bTarget, 2)
          );

          if (dist < tolDist) {
            // Soft alpha edge feathering
            if (dist < tolDist * 0.75) {
              data[i + 3] = 0;
            } else {
              const ratio = (dist - tolDist * 0.75) / (tolDist * 0.25);
              data[i + 3] = Math.round(data[i + 3] * ratio);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        let transparentCutout = canvas.toDataURL('image/webp', 0.95);
        if (!transparentCutout.startsWith('data:image/webp')) {
          transparentCutout = canvas.toDataURL('image/png');
        }

        updateTeacherBio({
          chromaKeyEnabled: true,
          chromaKeyColor: targetHexColor,
          chromaKeyTolerance: tolerance,
          portraitCutoutUrl: transparentCutout,
        });

        onNotify('رنگ پس‌زمینه با موفقیت حذف شد و پرتره شفاف شد');
      } catch (err) {
        console.error('Chroma key error:', err);
        onNotify('خطا در پردازش تصویر، لطفاً مجدداً امتحان کنید', 'info');
      } finally {
        setIsProcessingChroma(false);
      }
    };

    img.onerror = () => {
      setIsProcessingChroma(false);
      onNotify('امکان بارگذاری تصویر برای حذف رنگ وجود نداشت', 'info');
    };
  };

  // Add new resume highlight
  const handleAddHighlight = () => {
    if (teacherBio.highlights.length >= 6) {
      onNotify('حداکثر ۶ مورد سابقه در این کادر جا می‌گیرد', 'info');
      return;
    }
    const newItem: TeacherHighlightItem = {
      id: `h_${Date.now()}`,
      icon: 'check',
      text: 'سابقه یا دستاورد جدید استاد',
    };
    updateTeacherBio({
      highlights: [...teacherBio.highlights, newItem],
    });
  };

  // Update existing highlight
  const handleUpdateHighlight = (id: string, text: string) => {
    updateTeacherBio({
      highlights: teacherBio.highlights.map((h) => (h.id === id ? { ...h, text } : h)),
    });
  };

  // Update highlight icon
  const handleUpdateHighlightIcon = (id: string, icon: TeacherHighlightItem['icon']) => {
    updateTeacherBio({
      highlights: teacherBio.highlights.map((h) => (h.id === id ? { ...h, icon } : h)),
    });
  };

  // Delete highlight
  const handleDeleteHighlight = (id: string) => {
    updateTeacherBio({
      highlights: teacherBio.highlights.filter((h) => h.id !== id),
    });
  };

  // Subject quick presets
  const applySubjectPreset = (subject: 'physics' | 'math' | 'biology' | 'chemistry') => {
    if (subject === 'physics') {
      updateTeacherBio({
        teacherName: 'مهدی یحیوی',
        prefixTitle: 'بیوگرافی',
        subtitleRole: 'استاد فیزیک کنکور و دبیر تام لند',
        subjectDoodles: 'physics',
        highlights: [
          { id: '1', icon: 'grad-cap', text: 'کارشناسی ارشد مهندسی مکانیک - دانشگاه صنعتی شریف' },
          { id: '2', icon: 'trophy', text: 'رتبه ۳۰ کنکور سراسری ریاضی' },
          { id: '3', icon: 'users', text: 'سابقه تدریس در تام لند و مراکز آموزشی معتبر کشور' },
          { id: '4', icon: 'screen', text: 'مدرس برجسته فیزیک پایه و کنکور' },
          { id: '5', icon: 'lightbulb', text: 'سبک تدریس مفهومی، تحلیلی و کاربردی' },
        ],
      });
      onNotify('قالب فیزیک (مهدی یحیوی) اعمال شد');
    } else if (subject === 'math') {
      updateTeacherBio({
        teacherName: 'استاد ریاضی کنکور',
        prefixTitle: 'بیوگرافی و رزومه',
        subtitleRole: 'مدرس ریاضیات تجربی و حسابان کنکور',
        subjectDoodles: 'math',
        highlights: [
          { id: '1', icon: 'grad-cap', text: 'دانش‌آموخته مهندسی برق دانشگاه تهران' },
          { id: '2', icon: 'trophy', text: 'رتبه دورقمی کنکور سراسری ریاضی' },
          { id: '3', icon: 'book', text: 'مولف کتاب‌های پرفروش تست ریاضی جامع کنکور' },
          { id: '4', icon: 'screen', text: 'بیش از ۱۵ سال سابقه تدریس در مدارس تیزهوشان' },
          { id: '5', icon: 'lightbulb', text: 'آموزش تکنیک‌های حل سریع و بدون فرمول اضافه' },
        ],
      });
      onNotify('قالب ریاضی کنکور اعمال شد');
    } else if (subject === 'biology') {
      updateTeacherBio({
        teacherName: 'استاد زیست‌شناسی',
        prefixTitle: 'معرفی استاد',
        subtitleRole: 'دبیر رتبه‌پرور زیست‌شناسی کنکور تجربی',
        subjectDoodles: 'biology',
        highlights: [
          { id: '1', icon: 'grad-cap', text: 'دکترای حرفه‌ای پزشکی / داروسازی دانشگاه شهید بهشتی' },
          { id: '2', icon: 'trophy', text: 'پرورش‌دهنده ده‌ها رتبه تک‌رقمی و دورقمی تجربی' },
          { id: '3', icon: 'book', text: 'طراح آزمون‌های آزمایشی کشوری' },
          { id: '4', icon: 'screen', text: 'مدرس کلاس‌های آنلاین زیست جامع' },
          { id: '5', icon: 'lightbulb', text: 'تدریس ترکیبی خط به خط کتاب درسی و شکل‌ها' },
        ],
      });
      onNotify('قالب زیست‌شناسی کنکور اعمال شد');
    } else if (subject === 'chemistry') {
      updateTeacherBio({
        teacherName: 'استاد شیمی کنکور',
        prefixTitle: 'بیوگرافی',
        subtitleRole: 'مدرس تخصصی شیمی پایه و کنکور',
        subjectDoodles: 'chemistry',
        highlights: [
          { id: '1', icon: 'grad-cap', text: 'کارشناسی ارشد شیمی کاربردی دانشگاه تهران' },
          { id: '2', icon: 'trophy', text: 'مدال نقره المپیاد شیمی کشوری' },
          { id: '3', icon: 'book', text: 'مؤلف سری کتاب‌های جمع‌بندی شیمی کنکور' },
          { id: '4', icon: 'screen', text: 'سابقه تدریس در صدا و سیما و موسسات برتر' },
          { id: '5', icon: 'lightbulb', text: 'تسلط بی‌نظیر بر مسائل استوکیومتری و مفاهیم حفظی' },
        ],
      });
      onNotify('قالب شیمی کنکور اعمال شد');
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Subject Quick Templates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            قالب‌های آماده اساتید کنکور:
          </span>
          <span className="text-[10px] text-purple-400 font-normal">با یک کلیک</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => applySubjectPreset('physics')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 transition-all flex items-center justify-center gap-1"
          >
            <span>فیزیک (مهدی یحیوی)</span>
          </button>
          <button
            type="button"
            onClick={() => applySubjectPreset('math')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60 transition-all flex items-center justify-center gap-1"
          >
            <span>ریاضی و حسابان</span>
          </button>
          <button
            type="button"
            onClick={() => applySubjectPreset('biology')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-1"
          >
            <span>زیست‌شناسی</span>
          </button>
          <button
            type="button"
            onClick={() => applySubjectPreset('chemistry')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-all flex items-center justify-center gap-1"
          >
            <span>شیمی کنکور</span>
          </button>
        </div>
      </div>

      {/* Teacher Main Identity (Title, Name, Role) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <GraduationCap className="w-4 h-4 text-rose-400" />
          اطلاعات اصلی استاد
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              پیش‌عنوان / نشان بالا
            </label>
            <input
              type="text"
              value={teacherBio.prefixTitle}
              onChange={(e) => updateTeacherBio({ prefixTitle: e.target.value })}
              placeholder="مثلاً: بیوگرافی"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              نام و نام‌خانوادگی استاد
            </label>
            <input
              type="text"
              value={teacherBio.teacherName}
              onChange={(e) => updateTeacherBio({ teacherName: e.target.value })}
              placeholder="مثلاً: مهدی یحیوی"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base text-rose-400 font-black focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            سمت و درس (نشان کپسولی زیر نام)
          </label>
          <input
            type="text"
            value={teacherBio.subtitleRole}
            onChange={(e) => updateTeacherBio({ subtitleRole: e.target.value })}
            placeholder="مثلاً: استاد فیزیک کنکور و دبیر تام لند"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Resume Highlights List (Like uuuu.webp) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            سوابق، افتخارات و ویژگی‌ها ({teacherBio.highlights.length} مورد)
          </h3>
          <button
            type="button"
            onClick={handleAddHighlight}
            disabled={teacherBio.highlights.length >= 6}
            className="px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن سابقه</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {teacherBio.highlights.map((item, index) => {
            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 flex items-start gap-2.5 hover:border-slate-700 transition-all"
              >
                {/* Icon Selector Button */}
                <div className="relative shrink-0 pt-0.5">
                  <select
                    value={item.icon}
                    onChange={(e) =>
                      handleUpdateHighlightIcon(
                        item.id,
                        e.target.value as TeacherHighlightItem['icon']
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-700/60 text-purple-300 text-xs font-bold flex items-center justify-center cursor-pointer appearance-none px-1 text-center"
                    title="تغییر آیکون"
                  >
                    <option value="grad-cap">🎓 دانشگاه</option>
                    <option value="trophy">🏆 رتبه</option>
                    <option value="users">👥 تدریس</option>
                    <option value="screen">📺 آنلاین</option>
                    <option value="lightbulb">💡 روش</option>
                    <option value="book">📖 کتاب</option>
                    <option value="star">⭐ افتخار</option>
                    <option value="check">✔ تایید</option>
                    <option value="award">🎖 نشان</option>
                  </select>
                </div>

                {/* Text Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdateHighlight(item.id, e.target.value)}
                    placeholder={`مورد ${index + 1}...`}
                    className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-0 leading-relaxed font-medium"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteHighlight(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                  title="حذف این مورد"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Professor Photo & Cutout Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-sky-400" />
            عکس تکی استاد و استایل پرتره
          </span>
          <span className="text-[10px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800/40">
            برش و قاب پرتره
          </span>
        </h3>

        {/* Upload box */}
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-rose-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/60"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-200">
              کلیک برای انتخاب یا کشیدن و رها کردن عکس تکی استاد
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              پشتیبانی از عکس بدون بک‌گراند (PNG)، کات‌اوت، یا عکس معمولی (JPG / WebP)
            </p>
          </div>

          {/* Quick Chroma-Key Tool for Photos with Solid Background like images.jpg */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                حذف خودکار رنگ پس‌زمینه (Chroma Key):
              </span>
              {teacherBio.portraitCutoutUrl && (
                <button
                  type="button"
                  onClick={() => updateTeacherBio({ portraitCutoutUrl: undefined })}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  بازگشت به عکس اولیه
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              اگر عکس آپلود شده مانند نمونه پس‌زمینه فیروزه‌ای یا آبی یا سفید دارد، با یک کلیک آن را شفاف کنید:
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isProcessingChroma}
                onClick={() => applyChromaKeyRemoval('#6ED6F6', 42)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#6ED6F6]/20 text-[#6ED6F6] border border-[#6ED6F6]/40 hover:bg-[#6ED6F6]/30 transition-all flex items-center gap-1.5"
              >
                <span className="w-3 h-3 rounded-full bg-[#6ED6F6] inline-block shadow-sm" />
                <span>حذف پس‌زمینه فیروزه‌ای (عکس یحیوی)</span>
              </button>

              <button
                type="button"
                disabled={isProcessingChroma}
                onClick={() => applyChromaKeyRemoval('#FFFFFF', 25)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1.5"
              >
                <span className="w-3 h-3 rounded-full bg-white inline-block shadow-sm" />
                <span>حذف پس‌زمینه سفید</span>
              </button>

              <button
                type="button"
                disabled={isProcessingChroma}
                onClick={() => applyChromaKeyRemoval('#00FF00', 45)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-all flex items-center gap-1.5"
              >
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-sm" />
                <span>پرده سبز</span>
              </button>
            </div>

            {isProcessingChroma && (
              <p className="text-xs text-amber-300 font-semibold animate-pulse flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                در حال حذف رنگ پس‌زمینه و شفاف‌سازی پرتره...
              </p>
            )}
          </div>

          {/* Photo Frame / Display Style */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              استایل نمایش پرتره استاد:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateTeacherBio({ photoStyle: 'cutout' })}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  teacherBio.photoStyle === 'cutout'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">کات‌اوت بدون کادر (مشابه نمونه)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ادغام مستقیم استاد با پس‌زمینه کاور</div>
              </button>

              <button
                type="button"
                onClick={() => updateTeacherBio({ photoStyle: 'arched-frame' })}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  teacherBio.photoStyle === 'arched-frame'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">قاب قوسی شیک (Arched Portrait)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">مناسب عکس‌های دارای پس‌زمینه معمولی</div>
              </button>

              <button
                type="button"
                onClick={() => updateTeacherBio({ photoStyle: 'glass-card' })}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  teacherBio.photoStyle === 'glass-card'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">کارت شیشه‌ای مدرن (Glass)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">قاب با حاشیه گرادیان و بلور ملایم</div>
              </button>

              <button
                type="button"
                onClick={() => updateTeacherBio({ photoStyle: 'circle-frame' })}
                className={`p-2.5 rounded-xl border text-right transition-all ${
                  teacherBio.photoStyle === 'circle-frame'
                    ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">کادر دایره‌ای کلاسیک</div>
                <div className="text-[10px] text-slate-400 mt-0.5">پرتره گرد با رینگ رنگی متناسب تم</div>
              </button>
            </div>
          </div>

          {/* Photo Position and Fine Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>بزرگ‌نمایی عکس استاد</span>
                <span className="font-mono text-purple-300">{config.imageZoom || 100}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                step="2"
                value={config.imageZoom || 100}
                onChange={(e) => onChange({ imageZoom: parseInt(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>موقعیت افقی (X)</span>
                <span className="font-mono text-purple-300">{config.imagePosX || 50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={config.imagePosX ?? 50}
                onChange={(e) => onChange({ imagePosX: parseInt(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>موقعیت عمودی (Y)</span>
                <span className="font-mono text-purple-300">{config.imagePosY || 50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={config.imagePosY ?? 50}
                onChange={(e) => onChange({ imagePosY: parseInt(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => updateTeacherBio({ photoFlipX: !teacherBio.photoFlipX })}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  teacherBio.photoFlipX
                    ? 'bg-purple-900/40 border-purple-600 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>قرینه افقی (جهت نگاه)</span>
              </button>

              <button
                type="button"
                onClick={() => updateTeacherBio({ photoGlow: !teacherBio.photoGlow })}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  teacherBio.photoGlow
                    ? 'bg-purple-900/40 border-purple-600 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>هاله نور پشت استاد</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Doodles & Formulas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-bold text-white block flex items-center gap-2">
          <Atom className="w-4 h-4 text-purple-400" />
          دودل‌ها و فرمول‌های علمی پس‌زمینه (واترمارک هنری)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: 'physics', label: 'فیزیک (E=mc² و اتم)' },
            { id: 'math', label: 'ریاضی (انتگرال و π)' },
            { id: 'chemistry', label: 'شیمی (بنزن و بالن)' },
            { id: 'biology', label: 'زیست (DNA و سلول)' },
            { id: 'general', label: 'افتخارات (کاپ و کلاه)' },
            { id: 'none', label: 'بدون دودل (ساده)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                updateTeacherBio({
                  subjectDoodles: item.id as TeacherBioConfig['subjectDoodles'],
                })
              }
              className={`px-2 py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                teacherBio.subjectDoodles === item.id
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Color Theme Switcher for Teacher Cover */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-bold text-white block flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          هماهنگی با تم رنگی موسسه و آکادمی:
        </label>
        <p className="text-[11px] text-slate-400">
          می‌توانید کاور استاد را با رنگ سازمانی «راه کنکور»، تم بنفش نمونه، یا هر یک از تم‌های رسمی دیگر ست کنید:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COLOR_THEMES.slice(0, 6).map((theme) => {
            const isCurrent = config.themeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onChange({
                    themeId: theme.id,
                    colors: { ...theme.colors },
                  });
                  onNotify(`تم «${theme.name}» اعمال شد`);
                }}
                className={`p-2 rounded-lg text-right border text-xs flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'border-rose-500 bg-rose-950/30 text-rose-200 font-bold'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="truncate">{theme.name}</span>
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                  style={{ backgroundColor: theme.colors.marker }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 6: Footer & Branding (Similar to Reference Photo) */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>فوتر و برندینگ پایین کاور (مشابه عکس نمونه)</span>
          </label>
          <button
            type="button"
            onClick={() => {
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
              });
              onNotify('فوتر به حالت پررنگ و خوانای عکس نمونه (موسسه راه کنکور) تنظیم شد');
            }}
            className="text-[11px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg font-bold transition-colors"
          >
            تنظیم مشابه عکس نمونه
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">نام موسسه (سمت راست):</span>
            <input
              type="text"
              value={config.tagline || config.siteName || ''}
              onChange={(e) => onChange({ tagline: e.target.value, siteName: e.target.value })}
              placeholder="موسسه راه کنکور"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-purple-400"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400">آدرس وب‌سایت (سمت چپ):</span>
            <input
              type="text"
              dir="ltr"
              value={config.siteUrl || ''}
              onChange={(e) => onChange({ siteUrl: e.target.value })}
              placeholder="rahekonkur.ir"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white outline-none focus:border-purple-400 text-left"
            />
          </div>
        </div>

        {/* Quick Footer Font Size Selector */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>اندازه فونت فوتر:</span>
            </span>
            <span className="font-mono text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-xs">
              {config.footerConfig?.fontSize || 20}px
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'کوچک', size: 16 },
              { label: 'متوسط', size: 20 },
              { label: 'بزرگ', size: 24 },
              { label: 'خیلی بزرگ', size: 28 },
            ].map((item) => {
              const currentSize = config.footerConfig?.fontSize || 20;
              const isSelected = currentSize === item.size;
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() =>
                    onChange({
                      footerConfig: {
                        ...(config.footerConfig || {
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
                        }),
                        fontSize: item.size,
                        height: Math.max(config.footerConfig?.height || 64, Math.round(item.size * 2.8)),
                      },
                    })
                  }
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] opacity-75 font-mono">{item.size}px</div>
                </button>
              );
            })}
          </div>

          <input
            type="range"
            min={12}
            max={36}
            step={1}
            value={config.footerConfig?.fontSize || 20}
            onChange={(e) =>
              onChange({
                footerConfig: {
                  ...(config.footerConfig || {
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
                  }),
                  fontSize: Number(e.target.value),
                  height: Math.max(config.footerConfig?.height || 64, Math.round(Number(e.target.value) * 2.8)),
                },
              })
            }
            className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>
      </div>
    </div>
  );
};
