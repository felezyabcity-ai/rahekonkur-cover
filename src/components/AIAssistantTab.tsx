import React, { useState } from 'react';
import { CoverConfig } from '../types';
import { COLOR_THEMES } from '../data/presets';
import { Sparkles, Loader2, Wand2, Lightbulb, Check, AlertCircle } from 'lucide-react';

interface AIAssistantTabProps {
  config: CoverConfig;
  onChange: (updated: Partial<CoverConfig>) => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ config, onChange }) => {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('آموزش و کنکور');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [headlines, setHeadlines] = useState<Array<{ title: string; highlightWord: string; category: string }>>([]);

  const quickSamples = [
    { topic: 'برنامه‌ریزی کنکور تجربی برای قبولی پزشکی', niche: 'آموزش و کنکور' },
    { topic: 'راهنمای بهینه‌سازی سرعت وردپرس با خروجی WebP', niche: 'توسعه وب و سئو' },
    { topic: '۱۰ ترفند روانشناسی برای غلبه بر تنبلی و اهمال‌کاری', niche: 'سلامت و سبک زندگی' },
    { topic: 'تحلیل بازار ارز دیجیتال و استراتژی سرمایه‌گذاری ۲۰۲۶', niche: 'اقتصاد و سرمایه‌گذاری' },
  ];

  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // 1. Auto generate full cover suggestions
  const handleGenerateCover = async () => {
    if (!topic.trim()) {
      setErrorMsg('لطفاً موضوع یا متن مقاله را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoNotice(null);

    try {
      const response = await fetch('/api/ai/suggest-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const data = resData.data;

        // Match theme
        let targetTheme = COLOR_THEMES[0];
        if (data.recommendedTheme === 'tech') targetTheme = COLOR_THEMES[1];
        else if (data.recommendedTheme === 'vibrant' || data.recommendedTheme === 'wordpress')
          targetTheme = COLOR_THEMES[2];
        else if (data.recommendedTheme === 'nature') targetTheme = COLOR_THEMES[3];
        else if (data.recommendedTheme === 'warm') targetTheme = COLOR_THEMES[4];

        onChange({
          title: data.title || topic,
          highlightText: data.highlightWord || '',
          category: data.category || niche,
          tagline: data.siteTagline || config.tagline,
          themeId: targetTheme.id,
          colors: { ...targetTheme.colors },
        });

        if (resData.notice) {
          setInfoNotice(resData.notice);
        }
      } else {
        smartLocalFallback(topic);
      }
    } catch (err: any) {
      console.warn('AI endpoint fallback:', err);
      smartLocalFallback(topic);
    } finally {
      setIsLoading(false);
    }
  };

  // Local rule-based fallback if API is offline
  const smartLocalFallback = (text: string) => {
    const words = text.split(' ').filter(Boolean);
    const highlight = words.find((w) => w.length > 4) || words[1] || words[0] || 'وردپرس';

    onChange({
      title: text,
      highlightText: highlight,
      category: niche,
    });
  };

  // 2. Generate 4 Catchy Headlines
  const handleGenerateHeadlines = async () => {
    if (!topic.trim()) {
      setErrorMsg('لطفاً متن یا ایده اولیه را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoNotice(null);

    try {
      const response = await fetch('/api/ai/generate-headlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: topic }),
      });

      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
        setHeadlines(resData.data);
        if (resData.notice) {
          setInfoNotice(resData.notice);
        }
      } else {
        // Fallback headline suggestions
        setHeadlines([
          { title: `${topic}: راهنمای جامع و کاربردی`, highlightWord: topic.split(' ')[0] || 'جامع', category: niche },
          { title: `۱۰ ترفند طلایی برای ${topic}`, highlightWord: 'ترفند طلایی', category: niche },
          { title: `صفر تا صد ${topic} در سال ۲۰۲۶`, highlightWord: 'صفر تا صد', category: niche },
          { title: `چگونه با ${topic} به موفقیت برسیم؟`, highlightWord: 'موفقیت', category: niche },
        ]);
      }
    } catch {
      setHeadlines([
        { title: `${topic}: راهنمای جامع و کاربردی`, highlightWord: topic.split(' ')[0] || 'جامع', category: niche },
        { title: `۱۰ ترفند طلایی برای ${topic}`, highlightWord: 'ترفند طلایی', category: niche },
        { title: `صفر تا صد ${topic} در سال ۲۰۲۶`, highlightWord: 'صفر تا صد', category: niche },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyHeadline = (h: { title: string; highlightWord: string; category: string }) => {
    onChange({
      title: h.title,
      highlightText: h.highlightWord,
      category: h.category,
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Intro Banner */}
      <div className="p-4 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-800 rounded-2xl border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">دستیار هوشمند طراحی کاور</span>
            <span className="text-xs text-indigo-200">قدرت‌گرفته از Gemini 3.7 Flash</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          موضوع یا خلاصه مقاله را وارد کنید تا هوش مصنوعی به طور خودکار بهترین تیتر کلیک‌خور، کلمه هایلایت،
          دسته‌بندی و پالت رنگی هماهنگ را برای شما بسازد.
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
          <Wand2 className="w-4 h-4 text-purple-400" />
          موضوع، عنوان یا خلاصه پست وردپرس
        </label>

        <textarea
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="مثال: روش‌های برنامه‌ریزی کنکور تجربی برای داوطلبان پشت کنکوری و افزایش تراز..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none font-vazir"
        />

        {/* Niche selector */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300">حوزه تخصصی مقاله:</label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none"
          >
            <option value="آموزش و کنکور">آموزش، کنکور و دانشگاه</option>
            <option value="توسعه وب و سئو">وردپرس، سئو و برنامه‌نویسی</option>
            <option value="تکنولوژی و هوش مصنوعی">تکنولوژی و هوش مصنوعی</option>
            <option value="سلامت و سبک زندگی">پزشکی، سلامت و روانشناسی</option>
            <option value="کسب و کار و بازاریابی">کسب‌وکار و دیجیتال مارکتینگ</option>
            <option value="اقتصاد و سرمایه‌گذاری">ارز دیجیتال، بورس و مالی</option>
          </select>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-slate-400">پیشنهادات سریع برای تست:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(sample.topic);
                  setNiche(sample.niche);
                }}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60 transition-colors text-right"
              >
                {sample.topic.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoNotice && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            <Lightbulb className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handleGenerateCover}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            ساخت خودکار کاور
          </button>

          <button
            type="button"
            onClick={handleGenerateHeadlines}
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
          >
            <Lightbulb className="w-4 h-4 text-purple-400" />
            پیشنهاد ۴ تیتر جذاب
          </button>
        </div>
      </div>

      {/* Generated Headline Suggestions List */}
      {headlines.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            عناوین پیشنهادی با نرخ کلیک بالا (CTR):
          </label>

          <div className="space-y-2">
            {headlines.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3 transition-all"
              >
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-100 leading-snug">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      هایلایت: {item.highlightWord}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => applyHeadline(item)}
                  className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  اعمال
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
