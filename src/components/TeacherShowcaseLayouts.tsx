import React from 'react';
import { CoverConfig, LayerPositions, TeacherCompareConfig, TeacherCompareItem } from '../types';

/*
  طرح «پاسخ‌برگ» — زبان بصری اختصاصی راه کنکور
  هر دبیر = یک حبابِ بزرگ پاسخ‌برگ (عکس دایره‌ای). کاغذ سبز، جوهر سرمه‌ای،
  صورتی فقط برای «یا» و نقطه‌ی برچسب، هایلایت زرد زیر کلمه‌ی کلیدی.
  بدون گرادیان، بدون شیشه، بدون شلوغی.
*/

const T = {
  paper: '#E7EEE7',
  paper2: '#F3F8F2',
  paper3: '#DCE7DC',
  ink: '#16233A',
  ink2: '#22314C',
  graphite: '#5F6E7E',
  marker: '#E8456B',
  hl: '#FFE08A',
  onInk: '#E6EDE6',
};

const DISPLAY = "'Lalezar', 'Vazirmatn', sans-serif";
const BODY = "'Vazirmatn', 'Vazir', Tahoma, sans-serif";

type Wrap = (
  layerKey: keyof LayerPositions,
  layerName: string,
  children: React.ReactNode,
  className?: string,
  hasResize?: boolean
) => React.ReactNode;

interface Ctx {
  compare: TeacherCompareConfig;
  config: CoverConfig;
  width: number;
  height: number;
  wrap: Wrap;
  renderLogo: () => React.ReactNode;
}

/** نشانه‌ی لوگو: میدان حباب با قطر پرشده */
const RkMark: React.FC<{ size: number; accent: string }> = ({ size, accent }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
    <g fill="none" stroke={T.ink} strokeWidth="2.6" opacity=".26">
      {[[46, 18], [74, 18], [102, 18], [18, 46], [74, 46], [102, 46], [18, 74], [46, 74], [102, 74], [18, 102], [46, 102], [74, 102]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="8.5" />
      ))}
    </g>
    <circle cx="18" cy="18" r="15" fill="none" stroke={accent} strokeWidth="2.2" opacity=".38" />
    <g fill={accent}>
      <circle cx="102" cy="102" r="10" />
      <circle cx="74" cy="74" r="10" />
      <circle cx="46" cy="46" r="10" />
      <circle cx="18" cy="18" r="11" />
    </g>
  </svg>
);

/** تیتر با هایلایت ماژیکی زیر کلمه‌ی کلیدی */
const HighlightTitle: React.FC<{ text: string; mark?: string; fontSize: number; u: number }> = ({ text, mark, fontSize, u }) => {
  const m = (mark || '').trim();
  const idx = m ? text.indexOf(m) : -1;
  const hl = (children: React.ReactNode) => (
    <span
      style={{
        backgroundImage: `linear-gradient(to top, transparent ${fontSize * 0.16}px, ${T.hl} ${fontSize * 0.16}px, ${T.hl} ${fontSize * 0.52}px, transparent ${fontSize * 0.52}px)`,
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        paddingInline: 4 * u,
      }}
    >
      {children}
    </span>
  );
  return (
    <h1 style={{ fontFamily: DISPLAY, fontSize, lineHeight: 1.4, color: T.ink, margin: 0, fontWeight: 400 }}>
      {idx < 0 ? text : (
        <>
          {text.slice(0, idx)}
          {hl(m)}
          {text.slice(idx + m.length)}
        </>
      )}
    </h1>
  );
};

/** عکس دبیر داخل حبابِ بزرگ */
const BubblePhoto: React.FC<{ t: TeacherCompareItem; d: number; u: number }> = ({ t, d, u }) => {
  const zoom = (t.photoZoom || 100) / 100;
  const posY = t.photoPosY ?? 22;
  const flip = t.photoFlipX ? ' scaleX(-1)' : '';
  const ring = 7 * u;
  return (
    <div className="relative" style={{ width: d, height: d }}>
      {/* حلقه‌ی پاسخ‌برگ دور حباب */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: -14 * u, border: `${2 * u}px solid rgba(22,35,58,.14)` }}
      />
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: T.paper3,
          border: `${ring}px solid ${T.paper2}`,
          boxShadow: `0 ${18 * u}px ${40 * u}px rgba(22,35,58,.20), 0 ${3 * u}px ${6 * u}px rgba(22,35,58,.08)`,
        }}
      >
        <img
          src={t.portraitCutoutUrl || t.photoUrl}
          alt={t.name}
          decoding="sync"
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
          style={{
            objectFit: 'cover',
            objectPosition: `50% ${posY}%`,
            transform: `scale(${zoom})${flip}`,
            transformOrigin: `50% ${posY}%`,
          }}
        />
      </div>
      {t.institute && (
        <span
          className="absolute left-1/2 whitespace-nowrap"
          style={{
            bottom: -6 * u, transform: 'translateX(-50%)',
            padding: `${4 * u}px ${16 * u}px`, borderRadius: 100,
            background: T.ink, color: T.onInk, fontSize: 15 * u, fontWeight: 800, lineHeight: 1.6,
            border: `${3 * u}px solid ${T.paper}`,
          }}
        >
          {t.institute}
        </span>
      )}
    </div>
  );
};

/* ===================================================================== */
export const renderAnswerSheet = ({ compare, config, width, height, wrap, renderLogo }: Ctx) => {
  const u = height / 675;
  const accent = compare.designAccent || T.marker;
  const teachers = (compare.teachers || []).slice(0, 3);
  const n = Math.max(1, teachers.length);
  const single = n === 1;

  const pad = 56 * u;
  const textW = (single ? 0.44 : n === 2 ? 0.36 : 0.29) * width;
  const gap = (n === 3 ? 40 : 64) * u;
  const stageW = width - textW - pad * 1.7;
  const target = (single ? 400 : n === 2 ? 290 : 222) * u;
  const d = Math.min(target, (stageW - gap * (n - 1)) / n - 30 * u); // قطر حباب
  const liftOf = (i: number) => (n === 3 && i === 1 ? -36 * u : 0);
  const nameFs = (single ? 30 : n === 2 ? 27 : 23) * u;

  const titleText = compare.title || (single ? 'معرفی و تحلیل دبیر' : 'کدام دبیر را انتخاب کنم؟');
  const titleFs = (titleText.length > 28 ? 50 : titleText.length > 18 ? 58 : 68) * u * (n === 3 ? 0.88 : 1);
  const eyebrow = compare.kicker || (single ? 'پرونده‌ی دبیر' : 'پرونده‌ی مقایسه');
  const points = single ? (teachers[0]?.points || []).filter(Boolean).slice(0, 3) : [];
  const site = (config.siteUrl || 'rahekonkur.ir').replace(/^https?:\/\//, '');

  return (
    <div className="h-full w-full relative overflow-hidden select-none" dir="rtl" style={{ background: T.paper, fontFamily: BODY }}>
      {/* بافت پاسخ‌برگ، فقط سمت عکس‌ها و محو به پایین */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0, top: 0, bottom: 0, width: width - textW - pad,
          backgroundImage: 'radial-gradient(circle, rgba(22,35,58,.12) 1.4px, transparent 1.5px)',
          backgroundSize: `${28 * u}px ${28 * u}px`,
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 72%)',
        }}
      />

      {/* ---------- ستون متن (راست) ---------- */}
      <div className="absolute z-20 flex flex-col" style={{ right: pad, top: 44 * u, bottom: 44 * u, width: textW }}>
        <div>
          {config.logoUrl && config.showLogo
            ? renderLogo()
            : wrap(
                'category',
                'لوگو',
                <div className="flex items-center" style={{ gap: 10 * u }}>
                  <RkMark size={42 * u} accent={accent} />
                  <span style={{ fontFamily: DISPLAY, fontSize: 28 * u, color: T.ink, lineHeight: 1.2 }}>{config.siteName || 'راه کنکور'}</span>
                </div>,
                'inline-block'
              )}
        </div>

        <div className="flex-1 flex flex-col justify-center" style={{ gap: 16 * u }}>
          {wrap(
            'imageCard',
            'برچسب بالا',
            <div className="inline-flex items-center" style={{ gap: 10 * u }}>
              <span style={{ width: 11 * u, height: 11 * u, borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: 20 * u, fontWeight: 800, color: T.graphite, lineHeight: 1.5 }}>{eyebrow}</span>
            </div>,
            'inline-block'
          )}

          {wrap('title', 'تیتر', <HighlightTitle text={titleText} mark={compare.titleHighlight} fontSize={titleFs} u={u} />, 'block')}

          {compare.subtitle && wrap(
            'subtitle',
            'زیرعنوان',
            <p style={{ fontSize: 22 * u, fontWeight: 500, color: T.graphite, lineHeight: 1.85, margin: 0 }}>{compare.subtitle}</p>,
            'block'
          )}

          {points.length > 0 && wrap(
            'teacherInfo1',
            'نکته‌ها',
            <div className="flex flex-col" style={{ gap: 12 * u, marginTop: 6 * u }}>
              {points.map((p, i) => (
                <div key={i} className="flex items-center" style={{ gap: 12 * u }}>
                  <span style={{ width: 16 * u, height: 16 * u, borderRadius: '50%', background: T.ink, flexShrink: 0 }} />
                  <span style={{ fontSize: 21 * u, fontWeight: 700, color: T.ink2, lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
            </div>,
            'block'
          )}
        </div>

        {/* پایین ستون: تحلیلگر یا آدرس سایت */}
        {wrap(
          'footer',
          'آدرس سایت',
          <div className="flex items-center" style={{ gap: 18 * u, fontSize: 18 * u, fontWeight: 700, color: T.graphite }}>
            {compare.bylineName && (
              <span>
                {compare.bylinePrefix ?? 'تحلیل'}{' '}
                <span style={{ color: T.ink, fontWeight: 900 }}>{compare.bylineName}</span>
              </span>
            )}
            {compare.bylineName && <span style={{ width: 5 * u, height: 5 * u, borderRadius: '50%', background: T.graphite, opacity: 0.6 }} />}
            <span dir="ltr" style={{ color: T.ink, fontWeight: 800 }}>{site}</span>
          </div>,
          'inline-block'
        )}
      </div>

      {/* ---------- حباب‌های دبیرها (چپ) ---------- */}
      <div
        className="absolute z-10 flex items-center justify-center"
        style={{ left: pad * 0.4, top: 0, bottom: 0, width: stageW, gap }}
      >
        {teachers.map((t, i) => {
          const key = `teacherFace${i + 1}` as keyof LayerPositions;
          const lift = liftOf(i);
          return (
            <div key={t.id} className="relative" style={{ transform: `translateY(${lift}px)` }}>
              {wrap(
                key,
                `دبیر ${t.name}`,
                <div className="flex flex-col items-center text-center" style={{ width: d + 28 * u }}>
                  <BubblePhoto t={t} d={d} u={u} />
                  <div style={{ marginTop: (t.institute ? 22 : 18) * u, fontSize: 15 * u, fontWeight: 700, color: T.graphite, lineHeight: 1.6 }}>
                    {compare.namePrefix ?? 'دبیر'}
                  </div>
                  <div style={{ fontSize: nameFs, fontWeight: 900, color: T.ink, lineHeight: 1.4, whiteSpace: 'nowrap' }}>{t.name}</div>
                </div>,
                'inline-block'
              )}
              {i < n - 1 && compare.showVsBadge !== false && (
                <div
                  className="absolute z-20 flex items-center justify-center pointer-events-none"
                  style={{
                    width: 46 * u, height: 46 * u, borderRadius: '50%',
                    left: -gap / 2 - 23 * u,
                    top: d / 2 - 23 * u + (liftOf(i + 1) - lift) / 2,
                    background: accent, color: '#fff', fontFamily: DISPLAY, fontSize: 22 * u,
                    border: `${4 * u}px solid ${T.paper}`,
                  }}
                >
                  <span style={{ marginTop: 3 * u }}>یا</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
