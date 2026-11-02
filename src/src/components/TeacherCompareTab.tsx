import React, { useRef } from 'react';
import { CoverConfig, TeacherCompareConfig, TeacherCompareItem } from '../types';
import { COMPARE_PRESETS, COLOR_THEMES, DEFAULT_TEACHER_COMPARE_CONFIG, DEFAULT_THREE_TEACHERS_CONFIG } from '../data/presets';
import { optimizeImageUpload, IMAGE_PRESETS } from '../utils/imageOptimizer';
import {
  Swords,
  Users,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Trophy,
  CheckCircle,
  Atom,
  Flame,
  LayoutGrid,
  Shield,
  Star,
  RefreshCw,
  Palette,
  Eye,
  FlipHorizontal,
  ZoomIn,
  Move,
  RotateCcw,
} from 'lucide-react';

interface TeacherCompareTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
  onNotify: (text: string, type?: 'success' | 'info') => void;
}

const PRESET_AVATARS = [
  { label: 'استاد ۱ (رسمی)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { label: 'استاد ۲ (کت شلوار)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { label: 'استاد ۳ (عینک)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
  { label: 'استاد ۴ (جوان)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop' },
  { label: 'استاد ۵ (پرانرژی)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop' },
  { label: 'استاد ۶ (تحلیلی)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
];

const TEACHER_COLORS = [
  { name: 'آبی تاملند', hex: '#0284C7' },
  { name: 'قرمز کلاسینو', hex: '#E11D48' },
  { name: 'سبز ماز', hex: '#059669' },
  { name: 'بنفش لوکس', hex: '#7C3AED' },
  { name: 'نارنجی پرانرژی', hex: '#EA580C' },
  { name: 'زرد طلایی', hex: '#EAB308' },
  { name: 'فیروزه‌ای', hex: '#0D9488' },
];

export const TeacherCompareTab: React.FC<TeacherCompareTabProps> = ({
  config,
  onChange,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTeacherUploadIndex = useRef<number | null>(null);

  const compareConfig: TeacherCompareConfig = config.teacherCompare || {
    title: 'مقایسه غول‌های کنکور',
    subtitle: 'بررسی سبک تدریس، تطابق سوالات و انتخاب بهترین استاد',
    kicker: 'نبرد اساتید برتر • تحلیل اختصاصی',
    layoutStyle: 'vs-duel',
    showVsBadge: true,
    subjectDoodles: 'physics',
    teachers: [
      {
        id: 't-default-1',
        name: 'مهدی یحیوی',
        roleOrSubject: 'استاد فیزیک کنکور',
        institute: 'تام لند',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
        accentColor: '#0284C7',
        badgeText: 'مفهومی و پایه‌ای',
        ratingScore: '۹۸٪ رضایت',
        points: ['تدریس مفهومی صفر تا صد', 'جزوه رنگی تیپ‌بندی شده', 'تطابق بالا با کنکور'],
      },
      {
        id: 't-default-2',
        name: 'امیر قضاتی',
        roleOrSubject: 'استاد فیزیک کنکور',
        institute: 'کلاسینو',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
        accentColor: '#E11D48',
        badgeText: 'تکنیکال و سرعتی',
        ratingScore: '۹۶٪ رضایت',
        points: ['روش‌های حل سریع تست', 'انرژی بالا در تدریس', 'بررسی تست‌های چالشی'],
      },
    ],
  };

  const updateCompareConfig = (changes: Partial<TeacherCompareConfig>) => {
    onChange({
      template: 'teacher-compare',
      teacherCompare: {
        ...compareConfig,
        ...changes,
      },
    });
  };

  const handleApplyPreset = (preset: (typeof COMPARE_PRESETS)[0]) => {
    onChange({
      template: 'teacher-compare',
      title: preset.config.title,
      category: 'مقایسه اساتید',
      teacherCompare: {
        ...preset.config,
      },
    });
    onNotify(`قالب پیش‌فرض "${preset.title}" بارگذاری شد`, 'success');
  };

  const handleUpdateTeacher = (index: number, changes: Partial<TeacherCompareItem>) => {
    const updated = [...compareConfig.teachers];
    updated[index] = {
      ...updated[index],
      ...changes,
    };
    updateCompareConfig({ teachers: updated });
  };

  const handleAddTeacher = () => {
    if (compareConfig.teachers.length >= 4) {
      onNotify('حداکثر ۴ استاد را می‌توانید در یک کاور مقایسه کنید', 'info');
      return;
    }
    const newId = `teacher-${Date.now()}`;
    const nextColor = TEACHER_COLORS[compareConfig.teachers.length % TEACHER_COLORS.length].hex;
    const newTeacher: TeacherCompareItem = {
      id: newId,
      name: `استاد جدید ${compareConfig.teachers.length + 1}`,
      roleOrSubject: 'مدرس کنکور',
      institute: 'موسسه آموزشی',
      photoUrl: PRESET_AVATARS[compareConfig.teachers.length % PRESET_AVATARS.length].url,
      accentColor: nextColor,
      badgeText: 'نکات تستی و مفهومی',
      ratingScore: '۹۵٪ رضایت',
      points: ['تسلط بالا بر سرفصل‌ها', 'حل تست‌های تالیفی', 'پشتیبانی دانش‌آموز'],
    };

    const newLayout = compareConfig.teachers.length + 1 === 2 ? 'vs-duel' : 'cards-grid';
    updateCompareConfig({
      teachers: [...compareConfig.teachers, newTeacher],
      layoutStyle: compareConfig.layoutStyle === 'vs-duel' && compareConfig.teachers.length + 1 > 2 ? 'cards-grid' : compareConfig.layoutStyle,
    });
    onNotify('استاد جدید به جدول مقایسه اضافه شد', 'success');
  };

  const handleDeleteTeacher = (index: number) => {
    const minTeachers = compareConfig.designStyle === 'classic' ? 2 : 1;
    if (compareConfig.teachers.length <= minTeachers) {
      onNotify(minTeachers === 1 ? 'حداقل یک استاد باید در کاور باشد' : 'برای مقایسه حداقل باید ۲ استاد در کاور وجود داشته باشند', 'info');
      return;
    }
    const teacherName = compareConfig.teachers[index]?.name || 'استاد';
    const updated = compareConfig.teachers.filter((_, idx) => idx !== index);
    const newLayout = updated.length === 2 ? 'vs-duel' : compareConfig.layoutStyle;
    updateCompareConfig({
      teachers: updated,
      layoutStyle: newLayout,
    });
    onNotify(`بخش مربوط به "${teacherName}" با موفقیت حذف شد`, 'success');
  };

  const handleSetTeacherCount = (count: 2 | 3) => {
    if (count === 2) {
      const teachers = compareConfig.teachers.length >= 2
        ? compareConfig.teachers.slice(0, 2)
        : DEFAULT_TEACHER_COMPARE_CONFIG.teachers;
      updateCompareConfig({
        teachers,
        layoutStyle: 'vs-duel',
        mode: 'two-teachers',
        showVsBadge: true,
      });
      onNotify('طرح ۲ استادی (دو نفره با نشان اختصاصی VS) فعال شد', 'success');
    } else {
      let teachers = [...compareConfig.teachers];
      if (teachers.length === 2) {
        teachers.push(DEFAULT_THREE_TEACHERS_CONFIG.teachers[2]);
      } else if (teachers.length > 3) {
        teachers = teachers.slice(0, 3);
      } else if (teachers.length < 2) {
        teachers = DEFAULT_THREE_TEACHERS_CONFIG.teachers;
      }
      updateCompareConfig({
        teachers,
        layoutStyle: 'cards-grid',
        mode: 'three-teachers',
        centerTeacherElevated: true,
      });
      onNotify('طرح ۳ استادی (سه نفره - ۳ چهره در کنار هم) فعال شد', 'success');
    }
  };

  const handleUploadPhoto = (teacherIndex: number) => {
    activeTeacherUploadIndex.current = teacherIndex;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeTeacherUploadIndex.current === null) return;
    const targetIndex = activeTeacherUploadIndex.current;

    try {
      const optimized = await optimizeImageUpload(file, IMAGE_PRESETS.photo.maxSide, IMAGE_PRESETS.photo.quality);
      handleUpdateTeacher(targetIndex, { photoUrl: optimized });
      onNotify('تصویر استاد با موفقیت بهینه‌سازی و بارگذاری شد', 'success');
    } catch (err) {
      console.error('Failed to optimize teacher photo:', err);
      onNotify('خطا در پردازش تصویر', 'info');
    }
    e.target.value = '';
  };

  const handleAddPoint = (teacherIndex: number) => {
    const currentPoints = compareConfig.teachers[teacherIndex]?.points || [];
    if (currentPoints.length >= 4) {
      onNotify('حداکثر ۴ نکته کلیدی برای هر استاد کافی است', 'info');
      return;
    }
    const updatedPoints = [...currentPoints, 'نکته و ویژگی تدریس'];
    handleUpdateTeacher(teacherIndex, { points: updatedPoints });
  };

  const handleUpdatePoint = (teacherIndex: number, pointIndex: number, text: string) => {
    const currentPoints = [...(compareConfig.teachers[teacherIndex]?.points || [])];
    currentPoints[pointIndex] = text;
    handleUpdateTeacher(teacherIndex, { points: currentPoints });
  };

  const handleDeletePoint = (teacherIndex: number, pointIndex: number) => {
    const currentPoints = (compareConfig.teachers[teacherIndex]?.points || []).filter((_, idx) => idx !== pointIndex);
    handleUpdateTeacher(teacherIndex, { points: currentPoints });
  };

  const handleResetAllPositions = () => {
    onChange({
      positions: {
        ...(config.positions || {}),
        'teacher-compare': {},
      },
      templatePositions: {
        ...(config.templatePositions || {}),
        'teacher-compare': {},
      },
    });
    onNotify('موقعیت تمام اجزا به چیدمان استاندارد بوم بازگشت', 'info');
  };

  const isTwoTeachers = compareConfig.teachers.length === 2;
  const isThreeTeachers = compareConfig.teachers.length === 3;

  return (
    <div className="space-y-6 text-right font-vazir" dir="rtl">
      {/* Hidden file input for teacher photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Free Drag Info & Quick Reset Banner */}
      <div className="bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-slate-900 border border-sky-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-sky-200 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>قابلیت جابجایی آزاد تمام قسمت‌ها با ماوس</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30 font-bold">
                فعال
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              می‌توانید چهره‌ها، نام‌ها، نشان VS، عنوان، زیرعنوان و لوگو را با درگ ماوس روی بوم جابجا کنید.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetAllPositions}
          className="shrink-0 mr-2 bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white px-3 py-1.5 rounded-xl border border-sky-500/40 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          title="بازنشانی تمام جابجایی‌ها به موقعیت اولیه"
        >
          <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
          <span>ریست موقعیت‌ها</span>
        </button>
      </div>

      {/* Prominent Mode Switcher: 2-Teacher vs 3-Teacher */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 rounded-2xl border-2 border-amber-500/50 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-amber-300 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            انتخاب ساختار مقایسه اساتید:
          </label>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {isTwoTeachers ? 'حالت ۲ استادی فعال است' : isThreeTeachers ? 'حالت ۳ استادی فعال است' : `${compareConfig.teachers.length} استادی`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSetTeacherCount(2)}
            className={`p-3 rounded-xl border-2 text-right transition-all group flex flex-col justify-between ${
              isTwoTeachers
                ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-black text-sm flex items-center gap-1.5 text-amber-300 group-hover:text-amber-200">
                <Flame className="w-4 h-4 text-rose-400" />
                ۲ استادی (دو نفره)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                نبرد VS
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              دو چهره بزرگ رو در رو در دو طرف با نشان اختصاصی VS و بدون هیچ کادر مستطیلی
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSetTeacherCount(3)}
            className={`p-3 rounded-xl border-2 text-right transition-all group flex flex-col justify-between ${
              isThreeTeachers
                ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-black text-sm flex items-center gap-1.5 text-purple-300 group-hover:text-purple-200">
                <Users className="w-4 h-4 text-sky-400" />
                ۳ استادی (سه نفره)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">
                ۳ چهره
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              سه چهره شاخص در کنار هم با خطوط تفکیک ظریف و برجسته‌سازی استاد وسط
            </p>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Presets */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          پیش‌فرض‌های آماده مقایسه (بارگذاری با ۱ کلیک):
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COMPARE_PRESETS.map((p) => {
            const isPreset3 = p.config.teachers.length === 3;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-right p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-amber-500/50 transition-all text-xs group"
              >
                <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>{p.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    isPreset3
                      ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}>
                    {isPreset3 ? '۳ استادی' : '۲ استادی'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  {p.config.teachers.map((t) => t.name).join(' vs ')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cover design */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">طرح کاور</h4>
        <div className="grid grid-cols-2 gap-2">
          {([
            ['answer-sheet', 'پاسخ‌برگ راه کنکور', 'هم‌خوان با هویت سایت؛ ۱ تا ۳ دبیر'],
            ['classic', 'کلاسیک', 'طرح قبلی (VS)'],
          ] as const).map(([id, label, hint]) => {
            const active = (compareConfig.designStyle === 'classic' ? 'classic' : 'answer-sheet') === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateCompareConfig({ designStyle: id })}
                className={`p-2 rounded-xl border text-right transition-colors ${active ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
              >
                <div className="text-xs font-bold text-white">{label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>
              </button>
            );
          })}
        </div>

        {compareConfig.designStyle !== 'classic' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['titleHighlight', 'کلمه‌ی هایلایت در تیتر', 'مثال: زیست'],
                ['namePrefix', 'عنوان بالای نام', 'دبیر'],
                ['bylinePrefix', 'متن کنار نام تحلیلگر', 'تحلیل'],
                ['bylineName', 'نام تحلیلگر (اختیاری)', 'مثال: امیر ...'],
              ] as const).map(([field, label, ph]) => (
                <div key={field}>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}:</label>
                  <input
                    type="text"
                    value={(compareConfig as any)[field] ?? ''}
                    onChange={(e) => updateCompareConfig({ [field]: e.target.value } as any)}
                    placeholder={ph}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">رنگ تأکید:</label>
              <input
                type="color"
                value={compareConfig.designAccent || '#E8456B'}
                onChange={(e) => updateCompareConfig({ designAccent: e.target.value })}
                className="w-9 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              {compareConfig.designAccent && (
                <button type="button" onClick={() => updateCompareConfig({ designAccent: undefined })} className="text-[10px] text-slate-400 hover:text-white">صورتی سایت</button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-5">
              با یک دبیر، کاور «معرفی دبیر» می‌شود و سه نکته‌ی اول دبیر کنار عکس می‌آید. «پیش‌عنوان» = برچسب بالای تیتر. برای کیفیت، عکس با عرض حداقل ۸۰۰ پیکسل آپلود کنید.
            </p>
          </>
        )}
      </div>

      {/* Main Titles & Kicker */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          متن و عنوان کاور مقایسه
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            عنوان اصلی مقایسه:
          </label>
          <input
            type="text"
            value={compareConfig.title}
            onChange={(e) => updateCompareConfig({ title: e.target.value })}
            placeholder="مثال: مقایسه غول‌های فیزیک کنکور"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            زیرعنوان یا پرسش کلیدی:
          </label>
          <input
            type="text"
            value={compareConfig.subtitle}
            onChange={(e) => updateCompareConfig({ subtitle: e.target.value })}
            placeholder="مثال: کدام استاد برای درصد بالای ۷۰ کنکور مناسب‌تر است؟"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              پیش‌عنوان / نشان بالا:
            </label>
            <input
              type="text"
              value={compareConfig.kicker}
              onChange={(e) => updateCompareConfig({ kicker: e.target.value })}
              placeholder="مثال: نبرد اساتید برتر"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              طرح دودل‌های پس‌زمینه:
            </label>
            <select
              value={compareConfig.subjectDoodles}
              onChange={(e) => updateCompareConfig({ subjectDoodles: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="physics">فرمول‌های فیزیک</option>
              <option value="math">ریاضیات و مثلثات</option>
              <option value="chemistry">شیمی و ساختارها</option>
              <option value="biology">زیست‌شناسی و DNA</option>
              <option value="general">نمادهای آموزشی عمومی</option>
              <option value="none">بدون طرح (ساده)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Face & Visual Appearance Controls (No-Box Design) */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-sky-400" />
            نمایش چهره‌ها روی بوم (بدون کادر مستطیلی)
          </span>
          <span className="text-[11px] text-amber-400 font-bold">
            {isTwoTeachers ? '۲ چهره رو در رو' : isThreeTeachers ? '۳ چهره هم‌سطح' : `${compareConfig.teachers.length} چهره`}
          </span>
        </h4>

        {/* Photo Display Style Buttons */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            سبک برش و نمایش چهره‌ها:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateCompareConfig({ photoStyle: 'cutout' })}
              className={`p-2 rounded-xl border text-center transition-all ${
                (compareConfig.photoStyle || 'cutout') === 'cutout'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs">بدون کادر (شفاف)</div>
              <div className="text-[10px] opacity-70 mt-0.5">چهره با هاله نوری</div>
            </button>

            <button
              type="button"
              onClick={() => updateCompareConfig({ photoStyle: 'circle-glow' })}
              className={`p-2 rounded-xl border text-center transition-all ${
                compareConfig.photoStyle === 'circle-glow'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs">دایره‌ای شناور</div>
              <div className="text-[10px] opacity-70 mt-0.5">مدالیون با رینگ رنگی</div>
            </button>

            <button
              type="button"
              onClick={() => updateCompareConfig({ photoStyle: 'vignette' })}
              className={`p-2 rounded-xl border text-center transition-all ${
                compareConfig.photoStyle === 'vignette'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs">بیضی محو نرم</div>
              <div className="text-[10px] opacity-70 mt-0.5">ادغام نرم با پس‌زمینه</div>
            </button>
          </div>
        </div>

        {/* Toggle VS Badge & Display Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {isTwoTeachers && (
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                نمایش نشان اختصاصی VS در مرکز کاور
              </span>
              <input
                type="checkbox"
                checked={compareConfig.showVsBadge}
                onChange={(e) => updateCompareConfig({ showVsBadge: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-900 border-slate-700"
              />
            </label>
          )}

          {isThreeTeachers && (
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-purple-400" />
                برجسته‌سازی چهره استاد وسط (Center Elevation)
              </span>
              <input
                type="checkbox"
                checked={compareConfig.centerTeacherElevated ?? true}
                onChange={(e) => updateCompareConfig({ centerTeacherElevated: e.target.checked })}
                className="rounded text-purple-500 focus:ring-purple-400 w-4 h-4 bg-slate-900 border-slate-700"
              />
            </label>
          )}

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              هاله نورانی رنگی دور و پشت چهره‌ها (Glow Aura)
            </span>
            <input
              type="checkbox"
              checked={compareConfig.photoGlow ?? true}
              onChange={(e) => updateCompareConfig({ photoGlow: e.target.checked })}
              className="rounded text-purple-500 focus:ring-purple-400 w-4 h-4 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              محو شدن تدریجی انتهای عکس (ادغام نرم با پس‌زمینه)
            </span>
            <input
              type="checkbox"
              checked={compareConfig.bottomFade ?? true}
              onChange={(e) => updateCompareConfig({ bottomFade: e.target.checked })}
              className="rounded text-sky-500 focus:ring-sky-400 w-4 h-4 bg-slate-900 border-slate-700"
            />
          </label>

          {/* Portrait Height Slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>اندازه و بزرگی چهره اساتید روی بوم:</span>
              <span className="text-white font-mono">{compareConfig.portraitHeight || 420} پیکسل</span>
            </div>
            <input
              type="range"
              min={320}
              max={520}
              step={10}
              value={compareConfig.portraitHeight || 420}
              onChange={(e) => updateCompareConfig({ portraitHeight: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Teachers Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            اساتید حاضر در مقایسه ({compareConfig.teachers.length} نفر)
          </h4>

          {compareConfig.teachers.length < 4 && (
            <button
              type="button"
              onClick={handleAddTeacher}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن استاد جدید
            </button>
          )}
        </div>

        {compareConfig.teachers.map((teacher, tIdx) => (
          <div
            key={teacher.id}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3.5 transition-all shadow-md relative overflow-hidden"
          >
            {/* Top Bar with Color Indicator & Delete Button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: teacher.accentColor }}
                />
                <span className="text-xs font-bold text-white">
                  استاد {tIdx + 1}: {teacher.name || 'بدون نام'}
                </span>
                {teacher.institute && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
                    {teacher.institute}
                  </span>
                )}
              </div>

              {/* Delete Teacher Button */}
              {compareConfig.teachers.length > 2 ? (
                <button
                  type="button"
                  onClick={() => handleDeleteTeacher(tIdx)}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 p-1.5 rounded-lg border border-rose-500/30 flex items-center gap-1 transition-all"
                  title="حذف این استاد از جدول مقایسه"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>حذف استاد</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">حداقل ۲ استاد</span>
              )}
            </div>

            {/* Teacher Details: Name, Role, Institute */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">نام کامل استاد:</label>
                <input
                  type="text"
                  value={teacher.name}
                  onChange={(e) => handleUpdateTeacher(tIdx, { name: e.target.value })}
                  placeholder="مثال: مهدی یحیوی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">موسسه / آکادمی:</label>
                <input
                  type="text"
                  value={teacher.institute || ''}
                  onChange={(e) => handleUpdateTeacher(tIdx, { institute: e.target.value })}
                  placeholder="مثال: تام لند، کلاسینو، ماز"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">برچسب سبک / تمایز:</label>
                <input
                  type="text"
                  value={teacher.badgeText}
                  onChange={(e) => handleUpdateTeacher(tIdx, { badgeText: e.target.value })}
                  placeholder="مثال: مفهومی و اصولی"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">درصد رضایت / امتیاز:</label>
                <input
                  type="text"
                  value={teacher.ratingScore || ''}
                  onChange={(e) => handleUpdateTeacher(tIdx, { ratingScore: e.target.value })}
                  placeholder="مثال: ۹۸٪ رضایت یا رتبه ۱"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo & Color Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <img
                  src={teacher.photoUrl}
                  alt={teacher.name}
                  className="w-8 h-8 rounded-full object-cover border-2 shadow-sm"
                  style={{ borderColor: teacher.accentColor }}
                />
                <button
                  type="button"
                  onClick={() => handleUploadPhoto(tIdx)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Upload className="w-3 h-3 text-sky-400" />
                  آپلود عکس
                </button>

                {/* Quick Avatar Presets */}
                <div className="flex items-center gap-1 mr-1">
                  {PRESET_AVATARS.slice(0, 4).map((av, avIdx) => (
                    <button
                      key={avIdx}
                      type="button"
                      onClick={() => handleUpdateTeacher(tIdx, { photoUrl: av.url })}
                      className="w-6 h-6 rounded-full overflow-hidden border border-slate-700 hover:border-amber-400 hover:scale-110 transition-all opacity-70 hover:opacity-100"
                      title={av.label}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color choices */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">رنگ شناسه:</span>
                {TEACHER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handleUpdateTeacher(tIdx, { accentColor: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      teacher.accentColor === c.hex
                        ? 'ring-2 ring-white scale-110 shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Face Adjustment Controls: Zoom, Vertical Position, Horizontal Flip */}
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-amber-400" />
                  تنظیم دقیق چهره و پرتره:
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateTeacher(tIdx, { photoFlipX: !teacher.photoFlipX })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    teacher.photoFlipX
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="چرخش افقی چهره برای قرارگیری رو در روی استاد مقابل"
                >
                  <FlipHorizontal className="w-3 h-3" />
                  <span>چرخش چهره (Flip)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>زوم چهره:</span>
                    <span className="text-white font-mono">{teacher.photoZoom || 110}%</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={180}
                    step={5}
                    value={teacher.photoZoom || 110}
                    onChange={(e) => handleUpdateTeacher(tIdx, { photoZoom: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>موقعیت بالا/پایین:</span>
                    <span className="text-white font-mono">{teacher.photoPosY ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={2}
                    value={teacher.photoPosY ?? 50}
                    onChange={(e) => handleUpdateTeacher(tIdx, { photoPosY: Number(e.target.value) })}
                    className="w-full accent-sky-500 cursor-pointer h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Bullet Points / Highlights for this teacher */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ویژگی‌ها و نقاط قوت در مقایسه:
                </span>
                {teacher.points.length < 4 && (
                  <button
                    type="button"
                    onClick={() => handleAddPoint(tIdx)}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    افزودن نکته
                  </button>
                )}
              </div>

              {teacher.points.map((pt, pIdx) => (
                <div key={pIdx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={pt}
                    onChange={(e) => handleUpdatePoint(tIdx, pIdx, e.target.value)}
                    placeholder="مثال: جزوه اختصاصی و تطابق با کنکور"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                  {teacher.points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePoint(tIdx, pIdx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="حذف این نکته"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
