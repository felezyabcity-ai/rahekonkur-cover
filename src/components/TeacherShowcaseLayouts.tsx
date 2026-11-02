import React from 'react';
import { CoverConfig, LayerPositions, TeacherCompareConfig, TeacherCompareItem } from '../types';

/*
  طرح «پاسخ‌برگ» — زبان بصری اختصاصی راه کنکور
  کاغذ سبز پاسخ‌برگ، جوهر سرمه‌ای، تنها رنگ تأکید صورتی ماژیکی، هایلایت زرد،
  حباب گزینه، خط‌چین فرم چاپی. بدون گرادیان و بدون شیشه.
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
  onInk2: '#9FB0C2',
};

const DISPLAY = "'Lalezar', 'Vazirmatn', sans-serif";
const BODY = "'Vazirmatn', 'Vazir', Tahoma, sans-serif";
const FA = '۰۱۲۳۴۵۶۷۸۹';
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => FA[+d]);

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
        borderRadius: 4 * u,
      }}
    >
      {children}
    </span>
  );
  return (
    <h1 style={{ fontFamily: DISPLAY, fontSize, lineHeight: 1.45, color: T.ink, margin: 0, fontWeight: 400, }}>
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

const TeacherPhoto: React.FC<{ t: TeacherCompareItem }> = ({ t }) => {
  const zoom = (t.photoZoom || 100) / 100;
  const posY = t.photoPosY ?? 25;
  const flip = t.photoFlipX ? ' scaleX(-1)' : '';
  return (
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
  );
};

/** ردیف حباب‌های پاسخ‌برگ؛ گزینه‌ی خودِ کارت پر است */
const BubbleRow: React.FC<{ active: number; u: number; accent: string }> = ({ active, u, accent }) => (
  <div className="flex items-center" style={{ gap: 6 * u, flexShrink: 0 }} aria-hidden="true">
    {[1, 2, 3, 4].map((k) => (
      <div
        key={k}
        className="flex items-center justify-center"
        style={{
          width: 22 * u, height: 22 * u, borderRadius: '50%',
          border: `${1.6 * u}px solid ${k === active ? accent : 'rgba(22,35,58,.28)'}`,
          background: k === active ? accent : 'transparent',
          color: k === active ? '#fff' : 'rgba(22,35,58,.45)',
          fontSize: 12 * u, fontWeight: 800, fontFamily: BODY, lineHeight: 1,
        }}
      >
        {fa(k)}
      </div>
    ))}
  </div>
);

/* ===================================================================== */
export const renderAnswerSheet = ({ compare, config, width, height, wrap, renderLogo }: Ctx) => {
  const u = height / 675;
  const accent = compare.designAccent || T.marker;
  const teachers = (compare.teachers || []).slice(0, 3);
  const n = Math.max(1, teachers.length);
  const single = n === 1;

  const footerH = 58 * u;
  const pad = 44 * u;
  const textW = (single ? 0.48 : n === 2 ? 0.38 : 0.33) * width;
  const stageW = width - textW - pad * 2 - 40 * u;
  const gap = (n === 3 ? 18 : 28) * u;
  const cardW = single ? Math.min(stageW, 0.36 * width) : (stageW - gap * (n - 1)) / n;
  const cardH = height - footerH - 60 * u - 30 * u;
  const infoH = 108 * u;
  const nameFs = (n === 3 ? 21 : 25) * u;

  const titleText = compare.title || (single ? 'معرفی و تحلیل دبیر' : 'کدام دبیر را انتخاب کنم؟');
  const titleFs = (titleText.length > 26 ? 48 : titleText.length > 16 ? 56 : 64) * u;
  const eyebrow = compare.kicker || (single ? 'پرونده‌ی دبیر' : 'پرونده‌ی مقایسه');
  const points = single ? (teachers[0]?.points || []).filter(Boolean).slice(0, 3) : [];

  return (
    <div className="h-full w-full relative overflow-hidden select-none" dir="rtl" style={{ background: T.paper, fontFamily: BODY }}>
      {/* بافت پاسخ‌برگ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(22,35,58,.13) 1.4px, transparent 1.5px)',
          backgroundSize: `${26 * u}px ${26 * u}px`,
          WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent 80%)',
          maskImage: 'linear-gradient(to bottom, #000, transparent 80%)',
        }}
      />
      {/* نشانه‌های زمان‌بندی کنار پاسخ‌برگ */}
      <div className="absolute flex flex-col pointer-events-none" style={{ left: 14 * u, top: 40 * u, gap: 15 * u }} aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <div key={i} style={{ width: 14 * u, height: 6 * u, background: T.ink, opacity: 0.75 }} />
        ))}
      </div>

      {/* ---------- ستون متن (راست) ---------- */}
      <div className="absolute z-20 flex flex-col" style={{ right: pad, top: 34 * u, width: textW, bottom: footerH + 28 * u }}>
        <div>
          {config.logoUrl && config.showLogo
            ? renderLogo()
            : wrap(
                'category',
                'لوگو',
                <div className="flex items-center" style={{ gap: 10 * u }}>
                  <RkMark size={44 * u} accent={accent} />
                  <span style={{ fontFamily: DISPLAY, fontSize: 30 * u, color: T.ink, lineHeight: 1.2 }}>{config.siteName || 'راه کنکور'}</span>
                </div>,
                'inline-block'
              )}
        </div>

        <div className="flex-1 flex flex-col justify-center" style={{ gap: 12 * u }}>
          {wrap(
            'imageCard',
            'برچسب بالا',
            <div className="inline-flex items-center" style={{ gap: 10 * u }}>
              <span style={{ width: 10 * u, height: 10 * u, borderRadius: '50%', background: accent }} />
              <span style={{ fontFamily: DISPLAY, fontSize: 24 * u, color: accent, lineHeight: 1.4 }}>{eyebrow}</span>
              <span style={{ width: 60 * u, borderTop: `${1.5 * u}px dashed ${T.graphite}`, opacity: 0.5 }} />
            </div>,
            'inline-block'
          )}

          {wrap('title', 'تیتر', <HighlightTitle text={titleText} mark={compare.titleHighlight} fontSize={titleFs} u={u} />, 'block')}

          {compare.subtitle && wrap(
            'subtitle',
            'زیرعنوان',
            <p style={{ fontSize: 22 * u, fontWeight: 600, color: T.graphite, lineHeight: 1.8, margin: 0 }}>{compare.subtitle}</p>,
            'block'
          )}

          {points.length > 0 && wrap(
            'teacherInfo1',
            'نکته‌ها',
            <div className="flex flex-col" style={{ gap: 8 * u, marginTop: 2 * u }}>
              {points.map((p, i) => (
                <div key={i} className="flex items-center" style={{ gap: 12 * u, paddingBottom: 8 * u, borderBottom: `${1 * u}px dashed rgba(22,35,58,.22)` }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 20 * u, color: T.graphite, width: 20 * u, textAlign: 'center' }}>{fa(i + 1)}</span>
                  <span style={{ width: 18 * u, height: 18 * u, borderRadius: '50%', background: T.ink, flexShrink: 0 }} />
                  <span style={{ fontSize: 20 * u, fontWeight: 700, color: T.ink2 }}>{p}</span>
                </div>
              ))}
            </div>,
            'block'
          )}

          {compare.bylineName && wrap(
            'teacherInfo3',
            'نام تحلیلگر',
            <div className="inline-flex items-center" style={{ gap: 10 * u, marginTop: 4 * u }}>
              <span style={{ fontSize: 18 * u, fontWeight: 700, color: T.graphite }}>{compare.bylinePrefix ?? 'تحلیل'}</span>
              <span style={{ fontSize: 20 * u, fontWeight: 900, color: T.ink, padding: `${3 * u}px ${16 * u}px`, border: `${1.5 * u}px solid ${T.ink}`, borderRadius: 100 }}>
                {compare.bylineName}
              </span>
            </div>,
            'inline-block'
          )}
        </div>
      </div>

      {/* ---------- کارت‌های گزینه (چپ) ---------- */}
      <div
        className="absolute z-10 flex items-end"
        style={{ left: pad + 20 * u, bottom: footerH + 28 * u, gap, flexDirection: 'row-reverse' }}
      >
        {teachers.map((t, i) => {
          const key = `teacherFace${i + 1}` as keyof LayerPositions;
          const lower = n === 3 && i !== 1 ? 22 * u : 0;
          const h = cardH - lower;
          return (
            <React.Fragment key={t.id}>
              <div>
                {wrap(
                  key,
                  `کارت ${t.name}`,
                  <div
                    className="relative flex flex-col"
                    style={{
                      width: cardW, height: h,
                      background: T.paper2,
                      borderRadius: 22 * u,
                      border: `${1.5 * u}px solid ${T.paper3}`,
                      boxShadow: `0 ${16 * u}px ${34 * u}px rgba(22,35,58,.16), 0 ${2 * u}px ${4 * u}px rgba(22,35,58,.06)`,
                      padding: 10 * u,
                    }}
                  >
                    {!single && (
                      <div
                        className="absolute z-10 flex items-center justify-center"
                        style={{
                          top: -16 * u, right: 18 * u, width: 42 * u, height: 42 * u, borderRadius: '50%',
                          background: T.ink, color: T.onInk, fontFamily: DISPLAY, fontSize: 23 * u, lineHeight: 1,
                          border: `${3 * u}px solid ${T.paper}`,
                        }}
                      >
                        <span style={{ marginTop: 4 * u }}>{fa(i + 1)}</span>
                      </div>
                    )}
                    <div className="relative overflow-hidden" style={{ flex: 1, borderRadius: 14 * u, background: T.paper3 }}>
                      <TeacherPhoto t={t} />
                      {t.institute && (
                        <span
                          className="absolute"
                          style={{
                            bottom: 10 * u, left: 10 * u, padding: `${3 * u}px ${12 * u}px`, borderRadius: 100,
                            background: T.ink, color: T.onInk, fontSize: 14 * u, fontWeight: 800, lineHeight: 1.7,
                          }}
                        >
                          {t.institute}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col justify-center" style={{ height: infoH, paddingInline: 6 * u }}>
                      <div style={{ fontSize: 14 * u, fontWeight: 700, color: T.graphite, lineHeight: 1.6 }}>{compare.namePrefix ?? 'دبیر'}</div>
                      <div style={{ fontSize: nameFs, fontWeight: 900, color: T.ink, lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.name}
                      </div>
                      <div
                        className="flex items-center justify-between"
                        style={{ gap: 8 * u, marginTop: 5 * u, paddingTop: 6 * u, borderTop: `${1 * u}px dashed rgba(22,35,58,.22)` }}
                      >
                        <span style={{ fontSize: 15 * u, fontWeight: 700, color: T.graphite, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                          {t.badgeText || t.roleOrSubject}
                        </span>
                        {n < 3 && <BubbleRow active={single ? 1 : i + 1} u={u} accent={accent} />}
                      </div>
                    </div>
                  </div>,
                  'inline-block'
                )}
              </div>
              {i < n - 1 && compare.showVsBadge !== false && (
                <div className="relative z-20 self-center" style={{ width: 0 }}>
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      width: 42 * u, height: 42 * u, left: -21 * u, top: -21 * u, borderRadius: '50%', background: accent, color: '#fff',
                      fontFamily: DISPLAY, fontSize: 20 * u, border: `${3 * u}px solid ${T.paper}`,
                    }}
                  >
                    <span style={{ marginTop: 3 * u }}>یا</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ---------- نوار پایین ---------- */}
      <div className="absolute left-0 right-0 bottom-0 z-30">
        {wrap(
          'footer',
          'نوار پایین',
          <div
            className="flex items-center justify-between"
            style={{ height: footerH, width, background: T.ink, paddingInline: pad, color: T.onInk }}
          >
            <span style={{ fontSize: 18 * u, fontWeight: 700, color: T.onInk2 }}>{config.tagline || 'مشاوره و برنامه‌ریزی کنکور'}</span>
            <span className="flex items-center" dir="ltr" style={{ gap: 10 * u, fontSize: 20 * u, fontWeight: 800 }}>
              <span style={{ width: 10 * u, height: 10 * u, borderRadius: '50%', background: accent }} />
              {(config.siteUrl || 'rahekonkur.ir').replace(/^https?:\/\//, '')}
            </span>
          </div>,
          'block'
        )}
      </div>
    </div>
  );
};
