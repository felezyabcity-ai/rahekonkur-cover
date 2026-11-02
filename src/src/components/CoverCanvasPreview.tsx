import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { CoverConfig, FooterConfig, HighlightConfig, LayerPosition, LayerPositions, LayerVisibility, LogoConfig } from '../types';
import { DEFAULT_TEACHER_BIO_CONFIG, DEFAULT_TEACHER_COMPARE_CONFIG } from '../data/presets';
import { TeacherDoodles } from './TeacherDoodles';
import { renderAnswerSheet } from './TeacherShowcaseLayouts';
import {
  Move,
  RotateCcw,
  AlignCenter,
  Maximize2,
  Minimize2,
  Sparkles,
  GripHorizontal,
  Trash2,
  EyeOff,
  Image as ImageIcon,
  GraduationCap,
  Trophy,
  Users,
  Presentation,
  Lightbulb,
  BookOpen,
  Star,
  CheckCircle,
  Award,
  Globe,
  Tag,
  Swords,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';

interface CoverCanvasPreviewProps {
  config: CoverConfig;
  positions?: LayerPositions;
  scale?: number;
  zoomLevel?: number;
  selectedLayer?: string | null;
  onSelectLayer?: (layer: string | null) => void;
  onUpdatePosition?: (layer: keyof LayerPositions, pos: Partial<LayerPosition>) => void;
  onToggleVisibility?: (layer: keyof LayerPositions, visible: boolean) => void;
  isExporting?: boolean;
}

export const CoverCanvasPreview = forwardRef<HTMLDivElement, CoverCanvasPreviewProps>(
  (
    {
      config,
      scale,
      zoomLevel = 1,
      selectedLayer = null,
      onSelectLayer,
      onUpdatePosition,
      onToggleVisibility,
      isExporting = false,
    },
    ref
  ) => {
    const {
      template,
      category,
      title,
      highlightText,
      tagline,
      siteName,
      siteUrl,
      badgeText,
      showBadge,
      showBubbles,
      bubbleActiveIndex,
      imageUrl,
      imageFit,
      imageZoom,
      imagePosX,
      imagePosY,
      imageFilter,
      fontFamily,
      titleFontSize,
      categoryFontSize,
      lineHeight,
      colors,
      showWpIcon,
      positions = {},
      visibility = {
        title: true,
        category: true,
        badge: true,
        imageCard: true,
        bubbles: true,
        footer: true,
        separatorLine: true,
        logo: true,
      },
      logoUrl,
      showLogo,
      logoConfig,
      footerConfig,
      highlightConfig,
      enableFreeDrag = true,
      snapToGuides = true,
    } = config;

    const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
    const [draggingLayer, setDraggingLayer] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<{
      mouseX: number;
      mouseY: number;
      initialX: number;
      initialY: number;
      initialW?: number;
      initialH?: number;
      isResizing?: boolean;
      resizeHandle?: 'se' | 'sw' | 'width';
    } | null>(null);

    // Snap indicators
    const [showSnapGuideX, setShowSnapGuideX] = useState(false);
    const [showSnapGuideY, setShowSnapGuideY] = useState(false);

    // Target dimensions
    const width = config.width || 1200;
    const height = config.height || 675;

    // Active positions isolated for the current template
    const activePositions =
      config.positions?.[config.template] ||
      config.templatePositions?.[config.template] ||
      ((positions && typeof positions === 'object' && config.template in positions)
        ? (positions as any)[config.template]
        : positions) ||
      {};

    // Font family style with comprehensive Persian fallbacks
    const getFontFamilyStyle = () => {
      switch (fontFamily) {
        case 'Lalezar':
          return "'Lalezar', 'Vazirmatn', 'Vazir', cursive, sans-serif";
        case 'Noto Kufi Arabic':
          return "'Noto Kufi Arabic', 'Vazirmatn', 'Vazir', Tahoma, sans-serif";
        case 'Tahoma':
          return "Tahoma, 'Segoe UI', Arial, sans-serif";
        default:
          return "'Vazirmatn', 'Vazir', 'Shabnam', 'Sahel', 'Samim', Tahoma, 'Segoe UI', sans-serif";
      }
    };

    // Font family style
    const fontClass =
      fontFamily === 'Lalezar'
        ? 'font-lalezar'
        : fontFamily === 'Noto Kufi Arabic'
        ? 'font-kufi'
        : fontFamily === 'Tahoma'
        ? 'font-system'
        : 'font-vazir';

    // Helper to check if a layer is visible
    const isLayerVisible = (layerKey: keyof LayerPositions): boolean => {
      if (visibility[layerKey as keyof LayerVisibility] === false) return false;
      if (layerKey === 'bubbles') return (showBubbles ?? true) && (visibility.bubbles ?? true);
      if (layerKey === 'badge') return (showBadge ?? true) && (visibility.badge ?? true);
      if (layerKey === 'logo') return (showLogo ?? false) && (visibility.logo ?? true) && !!logoUrl;
      return true;
    };

    // Helper to render title with highlighted keyword
    const renderTitle = () => {
      if (!title) return <span>عنوان مقاله را وارد کنید</span>;

      const hlConfig: HighlightConfig = highlightConfig || {};
      const hlStyle = hlConfig.style || 'box';
      const hlBg = hlConfig.customBgColor || colors.highlight;
      const hlText = hlConfig.customTextColor || colors.highlightText;
      const hlRadius = hlConfig.borderRadius !== undefined ? `${hlConfig.borderRadius}px` : '8px';
      const hlPadX = hlConfig.paddingX !== undefined ? `${hlConfig.paddingX}px` : '12px';
      const hlPadY = hlConfig.paddingY !== undefined ? `${hlConfig.paddingY}px` : '3px';

      // Build CSS style for highlighted text
      const getMarkStyle = (): React.CSSProperties => {
        const base: React.CSSProperties = {
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          display: 'inline',
          lineHeight: 'inherit',
          verticalAlign: 'baseline',
          fontWeight: 'inherit',
          margin: '0 2px',
        };

        if (hlStyle === 'underline') {
          return {
            ...base,
            backgroundColor: 'transparent',
            color: 'inherit',
            borderBottom: `6px solid ${hlBg}`,
            paddingBottom: '2px',
            paddingLeft: '4px',
            paddingRight: '4px',
            borderRadius: '0px',
          };
        }

        if (hlStyle === 'outline') {
          return {
            ...base,
            backgroundColor: `${hlBg}22`,
            color: hlText,
            border: `2px solid ${hlBg}`,
            padding: `${hlPadY} ${hlPadX}`,
            borderRadius: hlRadius,
          };
        }

        if (hlStyle === 'glow') {
          return {
            ...base,
            backgroundColor: hlBg,
            color: hlText,
            padding: `${hlPadY} ${hlPadX}`,
            borderRadius: hlRadius,
            boxShadow: `0 0 24px ${hlBg}90`,
          };
        }

        if (hlStyle === 'gradient') {
          return {
            ...base,
            backgroundImage: `linear-gradient(135deg, ${hlBg}, ${colors.marker || hlBg})`,
            color: hlText,
            padding: `${hlPadY} ${hlPadX}`,
            borderRadius: hlRadius,
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          };
        }

        if (hlStyle === 'pill') {
          return {
            ...base,
            backgroundColor: hlBg,
            color: hlText,
            padding: `${hlPadY} ${Math.max(16, Number(hlConfig.paddingX || 16))}px`,
            borderRadius: '9999px',
          };
        }

        // Standard 'box'
        return {
          ...base,
          backgroundColor: hlBg,
          color: hlText,
          padding: `${hlPadY} ${hlPadX}`,
          borderRadius: hlRadius,
        };
      };

      const createMarkElement = (content: React.ReactNode, key: React.Key) => (
        <mark key={key} style={getMarkStyle()}>
          {content}
        </mark>
      );

      // 1. Support [Bracket notation]: e.g. "برنامه‌ریزی [۳ ماهه] کنکور"
      if (title.includes('[') && title.includes(']')) {
        const parts = title.split(/(\[[^\]]+\])/g);
        return parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const inner = part.slice(1, -1);
            return createMarkElement(inner, `bracket-${index}`);
          }
          return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
        });
      }

      // 2. Support <mark>...</mark> manual tags
      if (title.includes('<mark>') && title.includes('</mark>')) {
        const parts = title.split(/(<mark>.*?<\/mark>)/g);
        return parts.map((part, index) => {
          if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
            const inner = part.replace('<mark>', '').replace('</mark>', '');
            return createMarkElement(inner, `mark-${index}`);
          }
          return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
        });
      }

      // 3. Support highlightText matching
      if (highlightText && highlightText.trim() && title.includes(highlightText.trim())) {
        const keyword = highlightText.trim();
        const parts = title.split(keyword);
        return parts.map((part, index) => (
          <React.Fragment key={`part-${index}`}>
            {part}
            {index < parts.length - 1 && createMarkElement(keyword, `hl-${index}`)}
          </React.Fragment>
        ));
      }

      return <span>{title}</span>;
    };

    // Filter styling
    const getFilterStyle = () => {
      switch (imageFilter) {
        case 'grayscale':
          return 'grayscale(100%)';
        case 'warm':
          return 'sepia(30%) saturate(140%)';
        case 'cool':
          return 'hue-rotate(180deg) saturate(110%)';
        case 'contrast':
          return 'contrast(125%) saturate(115%)';
        default:
          return 'none';
      }
    };

    // Layer styles with translation offset & custom dimensions
    const getLayerTransformStyle = (layerKey: keyof LayerPositions): React.CSSProperties => {
      const pos = activePositions[layerKey] || { x: 0, y: 0 };
      const isBeingDragged = draggingLayer === layerKey;
      const isElevated = layerKey === 'title' || layerKey === 'subtitle' || layerKey === 'vsBadge';

      const style: React.CSSProperties = {
        transform: `translate(${pos.x || 0}px, ${pos.y || 0}px)`,
        transition: isBeingDragged ? 'none' : 'transform 0.15s ease-out',
        position: 'relative',
        zIndex: isBeingDragged ? 50 : selectedLayer === layerKey ? 40 : isElevated ? 30 : 10,
      };

      if (pos.width) {
        style.maxWidth = `${pos.width}px`;
        if (layerKey === 'imageCard' || layerKey === 'logo') {
          style.width = `${pos.width}px`;
        }
      }

      if (pos.height && (layerKey === 'imageCard' || layerKey === 'logo')) {
        style.height = `${pos.height}px`;
      }

      return style;
    };

    // Start drag handler
    const handleMouseDownOnLayer = (
      e: React.MouseEvent,
      layerKey: keyof LayerPositions,
      isResizing = false,
      resizeHandle?: 'se' | 'sw' | 'width'
    ) => {
      if (!enableFreeDrag && !isResizing) return;
      if (isExporting) return;

      e.stopPropagation();
      e.preventDefault();

      const currentPos = activePositions[layerKey] || { x: 0, y: 0 };

      setDraggingLayer(String(layerKey));
      if (onSelectLayer) {
        onSelectLayer(String(layerKey));
      }

      setDragStart({
        mouseX: e.clientX,
        mouseY: e.clientY,
        initialX: currentPos.x || 0,
        initialY: currentPos.y || 0,
        initialW: currentPos.width,
        initialH: currentPos.height,
        isResizing,
        resizeHandle,
      });
    };

    // Window mousemove & mouseup for drag interactions
    useEffect(() => {
      if (!draggingLayer || !dragStart) return;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = (e.clientX - dragStart.mouseX) / (zoomLevel || 1);
        const deltaY = (e.clientY - dragStart.mouseY) / (zoomLevel || 1);

        if (dragStart.isResizing) {
          // Resizing element
          if (dragStart.resizeHandle === 'width') {
            const newW = Math.max(200, (dragStart.initialW || 600) + deltaX);
            if (onUpdatePosition) {
              onUpdatePosition(draggingLayer as keyof LayerPositions, {
                width: Math.round(newW),
              });
            }
          } else {
            const newW = Math.max(120, (dragStart.initialW || 440) + deltaX);
            const newH = Math.max(80, (dragStart.initialH || 400) + deltaY);
            if (onUpdatePosition) {
              onUpdatePosition(draggingLayer as keyof LayerPositions, {
                width: Math.round(newW),
                height: Math.round(newH),
              });
            }
          }
          return;
        }

        // Standard Translation Drag
        let nextX = Math.round(dragStart.initialX + deltaX);
        let nextY = Math.round(dragStart.initialY + deltaY);

        // Smart snapping
        if (snapToGuides) {
          if (Math.abs(nextX) < 8) {
            nextX = 0;
            setShowSnapGuideX(true);
          } else {
            setShowSnapGuideX(false);
          }

          if (Math.abs(nextY) < 8) {
            nextY = 0;
            setShowSnapGuideY(true);
          } else {
            setShowSnapGuideY(false);
          }
        }

        if (onUpdatePosition) {
          onUpdatePosition(draggingLayer as keyof LayerPositions, {
            x: nextX,
            y: nextY,
          });
        }
      };

      const handleMouseUp = () => {
        setDraggingLayer(null);
        setDragStart(null);
        setShowSnapGuideX(false);
        setShowSnapGuideY(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [draggingLayer, dragStart, zoomLevel, snapToGuides, onUpdatePosition]);

    // Render interactive overlay box when hovering or selected
    const renderInteractiveLayerWrapper = (
      layerKey: keyof LayerPositions,
      layerName: string,
      children: React.ReactNode,
      className = '',
      hasResize = false
    ) => {
      // Check visibility first
      if (!isLayerVisible(layerKey)) {
        return null;
      }

      const isSelected = selectedLayer === layerKey;
      const isHovered = hoveredLayer === layerKey;
      const isDragging = draggingLayer === layerKey;
      const pos = activePositions[layerKey] || { x: 0, y: 0 };
      const isCustom = pos.x !== 0 || pos.y !== 0 || pos.width || pos.height;

      const showOverlay = !isExporting && enableFreeDrag && (isSelected || isHovered || isDragging);

      return (
        <div
          style={getLayerTransformStyle(layerKey)}
          className={`group/layer relative transition-all ${className} ${
            enableFreeDrag && !isExporting ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onMouseDown={(e) => handleMouseDownOnLayer(e, layerKey)}
          onMouseEnter={() => !isExporting && setHoveredLayer(String(layerKey))}
          onMouseLeave={() => !isExporting && setHoveredLayer(null)}
          onClick={(e) => {
            if (!isExporting) {
              e.stopPropagation();
              if (onSelectLayer) onSelectLayer(String(layerKey));
            }
          }}
        >
          {/* Main child element content */}
          {children}

          {/* Interactive Bounding Box & Drag Visuals (Hidden in Export) */}
          {showOverlay && (
            <div
              data-export-ignore="true"
              className={`absolute -inset-2.5 rounded-2xl pointer-events-none transition-all z-40 ${
                isSelected || isDragging
                  ? 'border-2 border-rose-500 bg-rose-500/5 shadow-lg'
                  : 'border border-dashed border-sky-400 bg-sky-400/5'
              }`}
            >
              {/* Top Floating Badge with coordinates & quick actions */}
              <div
                className="absolute -top-8 right-2 pointer-events-auto flex items-center gap-1.5 bg-slate-900/95 text-white px-2.5 py-1 rounded-full text-[10px] font-sans font-bold shadow-xl border border-slate-700 backdrop-blur-md"
                dir="rtl"
              >
                <Move className="w-2.5 h-2.5 text-rose-400" />
                <span>{layerName}</span>

                {isCustom && (
                  <span className="font-mono text-rose-300 text-[9px]">
                    ({pos.x > 0 ? `+${pos.x}` : pos.x}, {pos.y > 0 ? `+${pos.y}` : pos.y})
                  </span>
                )}

                {/* Reset button inside floating tooltip */}
                {isCustom && onUpdatePosition && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePosition(layerKey, { x: 0, y: 0 });
                    }}
                    className="text-[9px] text-amber-300 hover:text-white px-1 py-0.5 rounded hover:bg-slate-800 transition-colors"
                    title="بازنشانی موقعیت"
                  >
                    ریست
                  </button>
                )}

                {/* Quick Delete / Hide Button */}
                {onToggleVisibility && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layerKey, false);
                    }}
                    className="text-[9px] text-rose-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-rose-600/80 flex items-center gap-0.5 transition-colors"
                    title="حذف / پنهان کردن این بخش"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              {/* 4 Corner Control Dots */}
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />

              {/* Resize Handle if allowed */}
              {hasResize && (
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-amber-400 ring-2 ring-slate-900 pointer-events-auto cursor-nwse-resize flex items-center justify-center shadow-md hover:scale-125 transition-transform"
                  title="برای تغییر سایز بکشید"
                  onMouseDown={(e) => handleMouseDownOnLayer(e, layerKey, true, 'se')}
                >
                  <GripHorizontal className="w-2.5 h-2.5 text-slate-950" />
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // Render Website Logo Layer
    const renderLogoLayer = (defaultPlacementClass = '') => {
      const isVisible = (showLogo ?? false) && (visibility.logo !== false) && !!logoUrl;
      if (!isVisible) return null;

      const logoCfg: LogoConfig = logoConfig || {
        width: 68,
        opacity: 1,
        filter: 'none',
        placement: 'top-right',
        showBackground: false,
        bgPadding: 8,
      };

      const getLogoFilterStyle = () => {
        switch (logoCfg.filter) {
          case 'invert':
          case 'brightness-white':
            return 'brightness(0) invert(1)';
          case 'dark':
            return 'brightness(0)';
          case 'grayscale':
            return 'grayscale(100%)';
          default:
            return 'none';
        }
      };

      // Determine placement
      let placementClasses = '';
      if (logoCfg.placement === 'top-left') {
        placementClasses = 'absolute top-6 left-8';
      } else if (logoCfg.placement === 'bottom-right') {
        placementClasses = 'absolute bottom-20 right-8';
      } else if (logoCfg.placement === 'bottom-left') {
        placementClasses = 'absolute bottom-20 left-8';
      } else if (logoCfg.placement === 'footer-inline') {
        placementClasses = 'relative inline-flex items-center';
      } else if (logoCfg.placement === 'custom') {
        placementClasses = 'absolute top-8 right-8';
      } else {
        // default top-right
        placementClasses = defaultPlacementClass || 'absolute top-6 right-8';
      }

      const logoContent = (
        <div
          className={`inline-flex items-center justify-center transition-all ${
            logoCfg.showBackground ? 'bg-white/95 shadow-md rounded-xl' : ''
          }`}
          style={{
            padding: logoCfg.showBackground ? `${logoCfg.bgPadding || 8}px` : '0px',
            opacity: logoCfg.opacity ?? 1,
          }}
        >
          <img
            src={logoUrl}
            alt="لوگوی سایت"
            style={{
              width: `${logoCfg.width || 68}px`,
              height: logoCfg.height ? `${logoCfg.height}px` : 'auto',
              filter: getLogoFilterStyle(),
              objectFit: 'contain',
            }}
            className="pointer-events-none select-none max-h-24 max-w-full"
            referrerPolicy="no-referrer"
          />
        </div>
      );

      return (
        <div className={`${placementClasses} z-30`}>
          {renderInteractiveLayerWrapper('logo', 'لوگوی سایت', logoContent, '', true)}
        </div>
      );
    };

    // Render Footer Component with deep customizations
    const renderFooterLayer = (isAbsolute = true, extraWrapperClass = '') => {
      if (!isLayerVisible('footer')) return null;

      const footerCfg: FooterConfig = footerConfig || {
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

      if (footerCfg.style === 'hidden') return null;

      const baseFontSize = footerCfg.fontSize || 20;
      const calcHeight = footerCfg.height ? `${footerCfg.height}px` : `${Math.max(64, Math.round(baseFontSize * 2.8))}px`;
      const calcFontSize = `${baseFontSize}px`;
      const calcPaddingX = footerCfg.paddingX !== undefined ? `${footerCfg.paddingX}px` : `${Math.round(width * 0.05)}px`;

      const rightText = footerCfg.customRightText || tagline || siteName || 'موسسه راه کنکور';
      const leftText = footerCfg.customLeftText || siteUrl || 'rahekonkur.ir';

      // Icon generator scaled with baseFontSize
      const renderFooterIcon = () => {
        const boxSize = Math.max(26, Math.round(baseFontSize * 1.45));
        const svgSize = Math.max(14, Math.round(baseFontSize * 0.85));

        switch (footerCfg.iconType) {
          case 'academy':
          case 'grad-cap':
            return (
              <span
                className="inline-flex shrink-0 items-center justify-center rounded-lg shadow-sm"
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  backgroundColor: colors.marker,
                  color: '#ffffff',
                }}
              >
                <GraduationCap style={{ width: `${svgSize}px`, height: `${svgSize}px` }} className="text-white" />
              </span>
            );
          case 'wordpress':
            return (
              <span
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/20 font-bold font-mono leading-none text-white"
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                  fontSize: `${Math.max(12, Math.round(baseFontSize * 0.65))}px`,
                }}
              >
                W
              </span>
            );
          case 'globe':
            return (
              <span
                className="inline-flex shrink-0 items-center justify-center rounded-lg shadow-sm bg-white/15 text-white"
                style={{
                  width: `${boxSize}px`,
                  height: `${boxSize}px`,
                }}
              >
                <Globe style={{ width: `${svgSize}px`, height: `${svgSize}px` }} className="text-white" />
              </span>
            );
          case 'sparkle':
            return (
              <span
                style={{ fontSize: `${Math.max(16, Math.round(baseFontSize * 1.05))}px` }}
                className="shrink-0 leading-none"
              >
                ✨
              </span>
            );
          case 'dot':
            return (
              <span
                className="inline-block shrink-0 rounded-full shadow-sm ring-2 ring-white/30"
                style={{
                  width: `${Math.max(10, Math.round(baseFontSize * 0.5))}px`,
                  height: `${Math.max(10, Math.round(baseFontSize * 0.5))}px`,
                  backgroundColor: colors.marker,
                }}
              />
            );
          case 'badge':
            return (
              <span
                className="shrink-0 rounded-full font-black uppercase tracking-wider leading-none shadow-sm"
                style={{
                  backgroundColor: colors.marker,
                  color: '#fff',
                  fontSize: `${Math.max(11, Math.round(baseFontSize * 0.65))}px`,
                  padding: `${Math.max(3, Math.round(baseFontSize * 0.2))}px ${Math.max(8, Math.round(baseFontSize * 0.5))}px`,
                }}
              >
                {footerCfg.customBadgeText || 'VIP'}
              </span>
            );
          default:
            if (showWpIcon) {
              return (
                <span
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/20 font-bold font-mono leading-none text-white"
                  style={{
                    width: `${boxSize}px`,
                    height: `${boxSize}px`,
                    fontSize: `${Math.max(12, Math.round(baseFontSize * 0.65))}px`,
                  }}
                >
                  W
                </span>
              );
            }
            return null;
        }
      };

      // Styling based on style variant
      let footerStyle: React.CSSProperties = {
        color: colors.footerText || '#FFFFFF',
        fontSize: calcFontSize,
        opacity: footerCfg.opacity ?? 1,
      };

      let containerClasses = 'w-full flex items-center transition-all z-30 flex-nowrap overflow-hidden';

      if (footerCfg.alignment === 'center') {
        containerClasses += ' justify-center gap-6';
      } else if (footerCfg.alignment === 'right') {
        containerClasses += ' justify-start gap-4';
      } else if (footerCfg.alignment === 'left') {
        containerClasses += ' justify-end gap-4';
      } else {
        containerClasses += ' justify-between';
      }

      if (footerCfg.style === 'pill') {
        footerStyle = {
          ...footerStyle,
          backgroundColor: colors.footerBg,
          borderRadius: '9999px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
          border: '1.5px solid rgba(255,255,255,0.22)',
          padding: `0 ${calcPaddingX}`,
          height: calcHeight,
          margin: '0 auto',
          maxWidth: '92%',
        };
      } else if (footerCfg.style === 'glass') {
        footerStyle = {
          ...footerStyle,
          backgroundColor: `${colors.footerBg}e6`,
          backdropFilter: 'blur(16px)',
          borderTop: '1.5px solid rgba(255,255,255,0.25)',
          padding: `0 ${calcPaddingX}`,
          height: calcHeight,
        };
      } else if (footerCfg.style === 'border-top') {
        footerStyle = {
          ...footerStyle,
          backgroundColor: 'transparent',
          borderTop: `${footerCfg.separatorHeight || 3.5}px solid ${colors.marker || colors.footerText}`,
          padding: `0 ${calcPaddingX}`,
          height: calcHeight,
        };
      } else if (footerCfg.style === 'minimal') {
        footerStyle = {
          ...footerStyle,
          backgroundColor: 'transparent',
          padding: `0 ${calcPaddingX}`,
          height: calcHeight,
        };
      } else {
        // default full bar
        footerStyle = {
          ...footerStyle,
          backgroundColor: colors.footerBg,
          padding: `0 ${calcPaddingX}`,
          height: calcHeight,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.18)',
        };
      }

      const footerContent = (
        <div style={footerStyle} className={containerClasses}>
          {rightText ? (
            <div className="flex items-center gap-3 font-bold whitespace-nowrap shrink-0">
              {renderFooterIcon()}
              <span
                style={{ color: colors.footerText, fontSize: calcFontSize }}
                className="whitespace-nowrap leading-none inline-block font-black tracking-wide"
              >
                {rightText}
              </span>
            </div>
          ) : <div />}

          {leftText && (
            <div
              dir="ltr"
              style={{ letterSpacing: '0.6px', color: colors.footerText, fontSize: calcFontSize }}
              className="font-black opacity-95 hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 text-left leading-none font-mono tracking-wider flex items-center gap-2.5"
            >
              <span
                className="rounded-full inline-block shrink-0 shadow-sm"
                style={{
                  backgroundColor: colors.marker,
                  width: `${Math.max(9, Math.round(baseFontSize * 0.45))}px`,
                  height: `${Math.max(9, Math.round(baseFontSize * 0.45))}px`,
                }}
              />
              <span>{leftText}</span>
            </div>
          )}
        </div>
      );

      const wrapperPosClass = isAbsolute
        ? footerCfg.style === 'pill'
          ? 'absolute bottom-4 left-0 right-0 z-30 flex justify-center'
          : 'absolute bottom-0 left-0 right-0 z-30'
        : extraWrapperClass || 'relative z-30';

      return renderInteractiveLayerWrapper(
        'footer',
        'نوار فوتر و برندینگ',
        footerContent,
        wrapperPosClass
      );
    };

    // Category Badge Layer
    const renderCategoryBadge = () => {
      if (!isLayerVisible('category') || !category) return null;
      return renderInteractiveLayerWrapper(
        'category',
        'دسته‌بندی موضوعی',
        <div
          style={{
            backgroundColor: colors.marker,
            color: '#FFFFFF',
            fontSize: `${categoryFontSize || 14}px`,
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold tracking-wide shadow-sm"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{category}</span>
        </div>
      );
    };

    // Special Badge Layer
    const renderSpecialBadge = () => {
      if (!isLayerVisible('badge') || !badgeText) return null;
      return renderInteractiveLayerWrapper(
        'badge',
        'نشان ویژه',
        <div
          style={{
            backgroundColor: colors.highlight,
            color: colors.highlightText,
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm border border-black/10"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>{badgeText}</span>
        </div>
      );
    };

    // Tagline / Subtitle Layer
    const renderTaglineLayer = () => {
      if (!tagline) return null;
      return (
        <p
          style={{ color: colors.graphite }}
          className="text-base md:text-xl font-semibold leading-relaxed line-clamp-2"
        >
          {tagline}
        </p>
      );
    };

    // Main Image Card Layer
    const renderImageCardLayer = (customClass = '', aspectClass = 'aspect-[16/10]') => {
      if (!isLayerVisible('imageCard')) return null;
      const displayImg = imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop';
      const zoom = (imageZoom || 100) / 100;
      const posX = (imagePosX ?? 50) - 50;
      const posY = (imagePosY ?? 50) - 50;

      return renderInteractiveLayerWrapper(
        'imageCard',
        'کادر تصویر شاخص',
        <div
          style={{
            borderRadius: '18px',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.35)',
            border: `3px solid ${colors.paperSecondary}`,
          }}
          className={`relative overflow-hidden bg-slate-800 ${aspectClass} ${customClass}`}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              transform: `scale(${zoom}) translate(${posX}%, ${posY}%)`,
              filter: getFilterStyle(),
              objectFit: 'cover',
            }}
            className="w-full h-full object-cover transition-transform select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>,
        '',
        true
      );
    };

    // Answer Sheet Bubbles Layer
    const renderAnswerSheetBubbles = () => {
      if (!isLayerVisible('bubbles')) return null;
      return renderInteractiveLayerWrapper(
        'bubbles',
        'حباب‌های پاسخنامه',
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 backdrop-blur-sm border border-black/10 w-fit">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                i === (bubbleActiveIndex ?? 2)
                  ? 'bg-rose-500 border-rose-500 text-white scale-110 shadow-sm'
                  : 'border-slate-400/60 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        id="wp-cover-artboard"
        dir="rtl"
        data-font={fontFamily}
        onClick={() => onSelectLayer && onSelectLayer(null)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: colors.paper,
          color: colors.ink,
          fontFamily: getFontFamilyStyle(),
        }}
        className={`relative overflow-hidden select-none ${fontClass} flex flex-col justify-between`}
      >
        {/* Dynamic Snap Guides (Hidden in Export) */}
        {!isExporting && showSnapGuideX && (
          <div
            data-export-ignore="true"
            className="absolute top-0 bottom-0 right-1/2 w-0.5 bg-rose-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          />
        )}
        {!isExporting && showSnapGuideY && (
          <div
            data-export-ignore="true"
            className="absolute left-0 right-0 top-1/2 h-0.5 bg-rose-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          />
        )}

        {/* انتخاب و رندر قالب: بیوگرافی اساتید یا قالب‌های مقالات */}
        {config.template === 'teacher-bio' ? (
          (() => {
            const teacherBioData = config.teacherBio || DEFAULT_TEACHER_BIO_CONFIG;
          const displayPhotoUrl = teacherBioData.portraitCutoutUrl || imageUrl;
          const photoZoom = (imageZoom || 100) / 100;
          const photoX = (imagePosX ?? 50) - 50;
          const photoY = (imagePosY ?? 50) - 50;

          const renderHighlightIcon = (iconName: string) => {
            switch (iconName) {
              case 'grad-cap':
                return <GraduationCap className="w-3.5 h-3.5 text-white" />;
              case 'trophy':
                return <Trophy className="w-3.5 h-3.5 text-white" />;
              case 'users':
                return <Users className="w-3.5 h-3.5 text-white" />;
              case 'screen':
                return <Presentation className="w-3.5 h-3.5 text-white" />;
              case 'lightbulb':
                return <Lightbulb className="w-3.5 h-3.5 text-white" />;
              case 'book':
                return <BookOpen className="w-3.5 h-3.5 text-white" />;
              case 'star':
                return <Star className="w-3.5 h-3.5 text-white" />;
              case 'award':
                return <Award className="w-3.5 h-3.5 text-white" />;
              default:
                return <CheckCircle className="w-3.5 h-3.5 text-white" />;
            }
          };

          return (
            <div className="h-full w-full relative flex flex-col justify-between overflow-hidden">
              {/* Fluid Decorative Curved Wave Shapes */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <linearGradient id="teacherWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.paperSecondary} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={colors.paper} stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="teacherRightBlob" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={colors.marker} stopOpacity="0.14" />
                    <stop offset="100%" stopColor={colors.highlight} stopOpacity="0.04" />
                  </linearGradient>
                </defs>

                {/* Sweeping fluid curve behind the professor */}
                <path
                  d={`M ${width * 0.46} 0 C ${width * 0.53} ${height * 0.3}, ${width * 0.49} ${height * 0.72}, ${width * 0.63} ${height} L ${width} ${height} L ${width} 0 Z`}
                  fill="url(#teacherWaveGrad)"
                />
                <path
                  d={`M ${width * 0.42} 0 C ${width * 0.5} ${height * 0.34}, ${width * 0.44} ${height * 0.76}, ${width * 0.56} ${height} L ${width * 0.63} ${height} C ${width * 0.49} ${height * 0.72}, ${width * 0.53} ${height * 0.3}, ${width * 0.46} 0 Z`}
                  fill={colors.marker}
                  opacity="0.12"
                />
                {/* Background ambient glow circle */}
                <circle
                  cx={width * 0.76}
                  cy={height * 0.45}
                  r={height * 0.44}
                  fill="url(#teacherRightBlob)"
                />
              </svg>

              {/* Scientific Doodles & Formulas */}
              <TeacherDoodles
                subject={teacherBioData.subjectDoodles || 'physics'}
                color={colors.ink}
                opacity={0.22}
              />

              {/* Top Academy Logo & Branding */}
              {logoUrl && showLogo ? (
                renderLogoLayer('absolute top-7 right-10')
              ) : (
                <div className="absolute top-7 right-10 z-20 flex items-center gap-2.5 text-right">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform"
                    style={{ backgroundColor: colors.marker }}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="text-xs font-black leading-tight"
                      style={{ color: colors.ink }}
                    >
                      {siteName || 'آکادمی راه کنکور'}
                    </div>
                    <div
                      className="text-[10px] font-semibold opacity-75"
                      style={{ color: colors.graphite }}
                    >
                      {tagline || 'مرجع برترین اساتید کنکور'}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Grid */}
              <div
                className="grid items-center w-full relative z-10"
                style={{
                  gridTemplateColumns: '1.25fr 0.75fr',
                  height: `calc(100% - ${footerConfig?.style === 'hidden' ? 0 : (footerConfig?.height || Math.round(height * 0.095))}px)`,
                  padding: `${Math.round(height * 0.05)}px ${Math.round(width * 0.06)}px 8px`,
                  gap: `${Math.round(width * 0.03)}px`,
                }}
              >
                {/* Left Visual Column (in RTL): Copy, Badges & Highlights */}
                <div className="flex flex-col justify-center items-start text-right max-w-full z-10">
                  {/* Kicker: "بیوگرافی" */}
                  {renderInteractiveLayerWrapper(
                    'category',
                    'پیش‌عنوان بیوگرافی',
                    <div className="mb-2">
                      <span
                        style={{
                          fontSize: `${Math.round(categoryFontSize * 1.55)}px`,
                          color: colors.marker,
                          letterSpacing: '1px',
                        }}
                        className="font-black drop-shadow-sm select-none inline-block font-lalezar"
                      >
                        {teacherBioData.prefixTitle || 'بیوگرافی'}
                      </span>
                    </div>
                  )}

                  {/* Huge Name: "مهدی یحیوی" */}
                  {renderInteractiveLayerWrapper(
                    'title',
                    'نام استاد',
                    <h1
                      style={{
                        fontSize: `${Math.round(titleFontSize * 1.25)}px`,
                        lineHeight: 1.15,
                        color: colors.ink,
                        maxWidth: activePositions.title?.width ? `${activePositions.title.width}px` : '100%',
                      }}
                      className="font-black mb-3 tracking-tight drop-shadow-sm"
                    >
                      {teacherBioData.teacherName || 'مهدی یحیوی'}
                    </h1>,
                    '',
                    true
                  )}

                  {/* Subtitle / Role Badge */}
                  {renderInteractiveLayerWrapper(
                    'badge',
                    'سمت و درس استاد',
                    <div className="mb-4">
                      <span
                        style={{
                          backgroundColor: colors.marker,
                          color: '#ffffff',
                          fontSize: `${Math.max(12, Math.round(categoryFontSize * 0.95))}px`,
                          padding: '6px 20px',
                          borderRadius: '9999px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                        }}
                        className="font-bold inline-block shadow-md leading-none whitespace-nowrap"
                      >
                        {teacherBioData.subtitleRole || 'استاد فیزیک کنکور و دبیر تام لند'}
                      </span>
                    </div>
                  )}

                  {/* Highlights List Cards */}
                  {renderInteractiveLayerWrapper(
                    'bubbles',
                    'سوابق و افتخارات',
                    <div className="flex flex-col gap-2 w-full max-w-[540px]">
                      {(teacherBioData.highlights || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3.5 py-1.5 rounded-full border transition-all"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            borderColor: 'rgba(255, 255, 255, 0.95)',
                            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: colors.marker }}
                          >
                            {renderHighlightIcon(item.icon)}
                          </div>
                          <span
                            style={{
                              color: colors.ink,
                              fontSize: `${Math.max(11, Math.round(categoryFontSize * 0.78))}px`,
                            }}
                            className="font-bold leading-tight"
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Visual Column (in RTL): Professor Portrait Photo */}
                <div className="flex items-end justify-center h-full relative z-10">
                  {renderInteractiveLayerWrapper(
                    'imageCard',
                    'عکس پرتره استاد',
                    <div
                      style={{
                        width: activePositions.imageCard?.width ? `${activePositions.imageCard.width}px` : '100%',
                        height: activePositions.imageCard?.height ? `${activePositions.imageCard.height}px` : `${Math.round(height * 0.88)}px`,
                      }}
                      className="relative flex items-end justify-center"
                    >
                      {/* Photo Glow Behind Portrait */}
                      {teacherBioData.photoGlow && (
                        <div
                          className="absolute bottom-6 w-72 h-72 rounded-full pointer-events-none"
                          style={{
                            backgroundColor: colors.marker,
                            filter: 'blur(75px)',
                            opacity: 0.28,
                          }}
                        />
                      )}

                      {/* Display Mode 1: Cutout / Clean Cut */}
                      {teacherBioData.photoStyle === 'cutout' && (
                        <div
                          className="w-full h-full flex items-end justify-center relative overflow-visible"
                          style={{
                            maskImage: teacherBioData.bottomFade
                              ? 'linear-gradient(to top, transparent 0%, black 14%, black 100%)'
                              : 'none',
                            WebkitMaskImage: teacherBioData.bottomFade
                              ? 'linear-gradient(to top, transparent 0%, black 14%, black 100%)'
                              : 'none',
                          }}
                        >
                          <img
                            src={displayPhotoUrl}
                            alt={teacherBioData.teacherName}
                            style={{
                              transform: `translate(${photoX * 2}px, ${photoY * 2}px) scale(${photoZoom}) ${
                                teacherBioData.photoFlipX ? 'scaleX(-1)' : ''
                              }`,
                              filter: teacherBioData.photoGlow
                                ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.18))'
                                : 'none',
                              height: '100%',
                              width: 'auto',
                              maxHeight: '100%',
                              maxWidth: '100%',
                              objectFit: 'contain',
                            }}
                            className="pointer-events-none select-none origin-bottom transition-transform"
                            decoding="sync"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Display Mode 2: Arched Portrait Frame */}
                      {teacherBioData.photoStyle === 'arched-frame' && (
                        <div
                          style={{
                            width: '320px',
                            height: '420px',
                            borderRadius: '160px 160px 24px 24px',
                            backgroundColor: colors.paperSecondary,
                            backgroundImage: `url("${displayPhotoUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: `${config.imagePosX ?? 50}% ${config.imagePosY ?? 50}%`,
                            boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
                            transform: teacherBioData.photoFlipX ? 'scaleX(-1)' : 'none',
                          }}
                          className="border-4 border-white/95 overflow-hidden"
                        />
                      )}

                      {/* Display Mode 3: Glass Card */}
                      {teacherBioData.photoStyle === 'glass-card' && (
                        <div
                          style={{
                            width: '320px',
                            height: '400px',
                            borderRadius: '24px',
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                            backgroundImage: `url("${displayPhotoUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: `${config.imagePosX ?? 50}% ${config.imagePosY ?? 50}%`,
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 18px 40px rgba(0,0,0,0.14)',
                            transform: teacherBioData.photoFlipX ? 'scaleX(-1)' : 'none',
                          }}
                          className="border-2 border-white/80 overflow-hidden"
                        />
                      )}

                      {/* Display Mode 4: Circle Frame */}
                      {teacherBioData.photoStyle === 'circle-frame' && (
                        <div
                          style={{
                            width: '320px',
                            height: '320px',
                            borderRadius: '50%',
                            backgroundColor: colors.paperSecondary,
                            backgroundImage: `url("${displayPhotoUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: `${config.imagePosX ?? 50}% ${config.imagePosY ?? 50}%`,
                            boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
                            transform: teacherBioData.photoFlipX ? 'scaleX(-1)' : 'none',
                          }}
                          className="border-4 border-white ring-4 ring-purple-400/40 overflow-hidden"
                        />
                      )}
                    </div>,
                    'w-full flex items-end justify-center',
                    true
                  )}
                </div>
              </div>

              {/* Separator line on top of footer */}
              {isLayerVisible('separatorLine') && (footerConfig?.showSeparator ?? true) && footerConfig?.style !== 'hidden' && (
                <div
                  style={{
                    backgroundColor: footerConfig?.separatorColor || colors.marker,
                    height: `${footerConfig?.separatorHeight || 3.5}px`,
                    bottom: `${footerConfig?.height || Math.round(height * 0.095)}px`,
                    boxShadow: `0 0 10px ${footerConfig?.separatorColor || colors.marker}60`,
                  }}
                  className="absolute left-0 right-0 z-30 pointer-events-none"
                />
              )}

              {/* Preserved Footer Layer */}
              {renderFooterLayer(true)}
            </div>
          );
        })()
      ) : config.template === 'teacher-compare' ? (
        (() => {
          const compareData = config.teacherCompare || DEFAULT_TEACHER_COMPARE_CONFIG;
          const designStyle = compareData.designStyle === 'classic' ? 'classic' : 'answer-sheet';
          if (designStyle !== 'classic') {
            const ctx = {
              compare: compareData,
              config,
              width,
              height,
              wrap: renderInteractiveLayerWrapper,
              renderLogo: () => renderLogoLayer('relative'),
            };
            return renderAnswerSheet(ctx);
          }
          const teachers = compareData.teachers || [];
          const count = teachers.length;
          const isDuel = compareData.layoutStyle === 'vs-duel' || count === 2;
          const isPodium = compareData.layoutStyle === 'podium';
          const footerH = (footerConfig?.style === 'hidden' || !isLayerVisible('footer')) ? 0 : (footerConfig?.height || Math.round(height * 0.095));

          return (
            <div className="h-full w-full relative flex flex-col justify-between overflow-hidden select-none font-vazir text-right" dir="rtl">
              {/* Ambient Gradient Background Glows */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 25%, ${colors.paperSecondary} 0%, ${colors.paper} 100%)`,
                }}
              />

              {/* Dynamic Curved SVG wave / Duel Split lines in background */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                fill="none"
              >
                <defs>
                  <linearGradient id="cmpGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={teachers[0]?.accentColor || colors.marker} stopOpacity="0.22" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="cmpGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={teachers[1]?.accentColor || colors.ink} stopOpacity="0.22" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle cx={width * 0.15} cy={height * 0.45} r={height * 0.42} fill="url(#cmpGradLeft)" />
                <circle cx={width * 0.85} cy={height * 0.45} r={height * 0.42} fill="url(#cmpGradRight)" />
                {isDuel && (
                  <line
                    x1={width * 0.5}
                    y1={height * 0.18}
                    x2={width * 0.5}
                    y2={height * 0.88}
                    stroke={colors.marker}
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    opacity="0.3"
                  />
                )}
              </svg>

              {/* Scientific Doodles for the Subject */}
              <TeacherDoodles
                subject={compareData.subjectDoodles || 'physics'}
                color={colors.ink}
                opacity={0.16}
              />

              {/* Top Header Bar: Logo & Kicker Badge */}
              <div className="relative z-20 flex items-center justify-between px-10 pt-6">
                {/* Right side: Academy / Logo */}
                {logoUrl && showLogo ? (
                  renderLogoLayer('relative')
                ) : (
                  renderInteractiveLayerWrapper(
                    'logo',
                    'لوگو و نام آکادمی',
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: colors.marker }}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black" style={{ color: colors.ink }}>
                          {siteName || 'آکادمی راه کنکور'}
                        </div>
                        <div className="text-[10px] font-semibold opacity-70" style={{ color: colors.graphite }}>
                          {tagline || 'مرجع تخصصی مقایسه و تحلیل اساتید کنکور'}
                        </div>
                      </div>
                    </div>,
                    'inline-flex items-center'
                  )
                )}

                {/* Left side: Kicker Badge */}
                {renderInteractiveLayerWrapper(
                  'badge',
                  'نشان بالای کاور',
                  <div
                    className="px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border"
                    style={{
                      backgroundColor: `${colors.marker}18`,
                      borderColor: `${colors.marker}40`,
                      color: colors.marker,
                    }}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{compareData.kicker || 'مقایسه و تحلیل اختصاصی'}</span>
                  </div>
                )}
              </div>

              {/* Comparison Title & Subtitle */}
              <div className="relative z-30 px-6 text-center mt-2 mb-2 flex flex-col items-center justify-center pointer-events-auto">
                {renderInteractiveLayerWrapper(
                  'title',
                  'عنوان اصلی مقایسه',
                  <h1
                    className="text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm mb-1 px-4 py-1"
                    style={{ color: colors.ink }}
                  >
                    {compareData.title || title || 'مقایسه غول‌های کنکور'}
                  </h1>,
                  'inline-block max-w-full'
                )}
                {compareData.subtitle && (
                  <div className="flex justify-center mt-0.5">
                    {renderInteractiveLayerWrapper(
                      'subtitle',
                      'زیرعنوان مقایسه',
                      <p
                        className="text-xs lg:text-sm font-medium opacity-85 max-w-2xl mx-auto px-3 py-0.5"
                        style={{ color: colors.graphite }}
                      >
                        {compareData.subtitle}
                      </p>,
                      'inline-block max-w-full'
                    )}
                  </div>
                )}
              </div>

              {/* Main Stage: The Comparative Teacher Faces / Cutout Stage (No Boxed Cards!) */}
              <div
                className="relative z-10 flex-1 min-h-0 px-4 md:px-8 flex items-end justify-center w-full"
                style={{
                  paddingBottom: `${footerH > 0 ? 8 : 16}px`,
                }}
              >
                {(() => {
                  // Render free-standing prominent teacher face (NO BOX FRAMES)
                  const renderTeacherFaceOnly = (teacher: typeof teachers[0], isCenter: boolean = false, isDuelLayout: boolean = false) => {
                    const currentPhotoStyle = teacher.photoStyle || compareData.photoStyle || 'cutout';
                    const glowEnabled = compareData.photoGlow ?? true;
                    const bottomFadeEnabled = compareData.bottomFade ?? true;
                    const pHeight = compareData.portraitHeight || (isDuelLayout ? 430 : 380);
                    const effectiveHeight = isCenter && (compareData.centerTeacherElevated ?? true) ? Math.round(pHeight * 1.08) : pHeight;
                    const zoom = (teacher.photoZoom || 110) / 100;
                    const posY = ((teacher.photoPosY ?? 50) - 50) * 1.5;
                    const flip = teacher.photoFlipX ? 'scaleX(-1)' : '';

                    return (
                      <div className="w-full flex-1 flex flex-col items-center justify-end relative z-10 pointer-events-none">
                        {/* Ambient Aura Glow Behind Face */}
                        {glowEnabled && (
                          <div
                            className="absolute top-1/4 rounded-full pointer-events-none transition-all"
                            style={{
                              width: isDuelLayout ? '19rem' : isCenter ? '16rem' : '13rem',
                              height: isDuelLayout ? '19rem' : isCenter ? '16rem' : '13rem',
                              backgroundColor: teacher.accentColor || colors.marker,
                              filter: isDuelLayout ? 'blur(80px)' : 'blur(55px)',
                              opacity: isDuelLayout ? 0.35 : 0.28,
                            }}
                          />
                        )}

                        {/* Teacher Face / Portrait (Cutout, Organic Circle, or Vignette) */}
                        <div className="w-full flex-1 flex items-end justify-center relative overflow-visible pointer-events-auto">
                          {currentPhotoStyle === 'circle-glow' ? (
                            /* Floating Organic Circular Face (No boxy rectangular edges) */
                            <div
                              className="relative rounded-full overflow-hidden border-4 shadow-2xl transition-all mb-2"
                              style={{
                                width: `${Math.round(effectiveHeight * (isDuelLayout ? 0.72 : 0.65))}px`,
                                height: `${Math.round(effectiveHeight * (isDuelLayout ? 0.72 : 0.65))}px`,
                                borderColor: teacher.accentColor || colors.marker,
                                boxShadow: `0 0 40px ${teacher.accentColor || colors.marker}55, 0 10px 25px rgba(0,0,0,0.35)`,
                              }}
                            >
                              <img
                                src={teacher.portraitCutoutUrl || teacher.photoUrl}
                                alt={teacher.name}
                                style={{
                                  transform: `scale(${zoom}) translateY(${posY}px) ${flip}`,
                                }}
                                className="w-full h-full object-cover select-none pointer-events-none"
                              />
                            </div>
                          ) : currentPhotoStyle === 'vignette' ? (
                            /* Feathered Oval Silhouette (Blends seamlessly into background) */
                            <div
                              className="relative flex items-end justify-center overflow-visible"
                              style={{
                                maskImage: 'radial-gradient(ellipse at 50% 48%, black 46%, transparent 75%)',
                                WebkitMaskImage: 'radial-gradient(ellipse at 50% 48%, black 46%, transparent 75%)',
                                maxHeight: `${effectiveHeight}px`,
                              }}
                            >
                              <img
                                src={teacher.portraitCutoutUrl || teacher.photoUrl}
                                alt={teacher.name}
                                style={{
                                  transform: `scale(${zoom}) translateY(${posY}px) ${flip}`,
                                  filter: glowEnabled
                                    ? `drop-shadow(0 15px 30px ${teacher.accentColor}40)`
                                    : 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))',
                                  height: `${effectiveHeight}px`,
                                  width: 'auto',
                                  maxHeight: `${effectiveHeight}px`,
                                  objectFit: 'contain',
                                }}
                                className="select-none pointer-events-none origin-bottom transition-all max-w-full"
                              />
                            </div>
                          ) : (
                            /* Pure Cutout Face (Free-standing with subtle soft bottom fade, NO RECTANGULAR BOX) */
                            <div
                              className="w-full flex-1 flex items-end justify-center relative overflow-visible"
                              style={{
                                maskImage: bottomFadeEnabled
                                  ? 'linear-gradient(to top, transparent 0%, black 16%, black 100%)'
                                  : 'none',
                                WebkitMaskImage: bottomFadeEnabled
                                  ? 'linear-gradient(to top, transparent 0%, black 16%, black 100%)'
                                  : 'none',
                              }}
                            >
                              <img
                                src={teacher.portraitCutoutUrl || teacher.photoUrl}
                                alt={teacher.name}
                                style={{
                                  transform: `scale(${zoom}) translateY(${posY}px) ${flip}`,
                                  filter: glowEnabled
                                    ? `drop-shadow(0 16px 32px ${teacher.accentColor}45) drop-shadow(0 6px 14px rgba(0,0,0,0.3))`
                                    : 'drop-shadow(0 12px 20px rgba(0,0,0,0.25))',
                                  height: `${effectiveHeight}px`,
                                  width: 'auto',
                                  maxHeight: `${effectiveHeight}px`,
                                  objectFit: 'contain',
                                }}
                                className="select-none pointer-events-none origin-bottom transition-all max-w-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  };

                  // Render Persian typography & info ribbon (NO BOX CARD)
                  const renderTeacherInfoOnly = (teacher: typeof teachers[0], isCenter: boolean = false, isDuelLayout: boolean = false) => {
                    return (
                      <div className="relative z-20 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2">
                          <h2
                            className={`${
                              isDuelLayout ? 'text-2xl md:text-3xl' : isCenter ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                            } font-black drop-shadow-md tracking-tight leading-tight`}
                            style={{ color: colors.ink }}
                          >
                            {teacher.name}
                          </h2>
                          {teacher.ratingScore && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-md flex items-center gap-0.5"
                              style={{ backgroundColor: teacher.accentColor }}
                            >
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {teacher.ratingScore}
                            </span>
                          )}
                        </div>

                        {/* Minimalist Floating Pill (Institute & Subject) */}
                        <div
                          className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-lg backdrop-blur-md"
                          style={{
                            backgroundColor: `${colors.paper}f2`,
                            borderColor: `${teacher.accentColor}50`,
                            color: colors.ink,
                          }}
                        >
                          {teacher.institute && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] text-white font-bold"
                              style={{ backgroundColor: teacher.accentColor }}
                            >
                              {teacher.institute}
                            </span>
                          )}
                          <span className="font-semibold text-xs opacity-90">
                            {teacher.badgeText || teacher.roleOrSubject}
                          </span>
                        </div>

                        {/* Optional Highlights (if enabled) */}
                        {compareData.showPoints && teacher.points && (
                          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5 max-w-xs">
                            {teacher.points.slice(0, 2).map((pt, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900/80 text-white shadow-xs border border-white/10"
                              >
                                {pt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  };

                  if (isDuel || count === 2) {
                    /* --- 2-TEACHER MODE (DOO OSTADI): PURE FACES DUEL --- */
                    return (
                      <div className="w-full h-full max-w-6xl grid grid-cols-11 items-end relative">
                        {/* Teacher 1 (Right in RTL) */}
                        {teachers[0] && (
                          <div className="col-span-5 h-full flex flex-col items-center justify-end">
                            {renderInteractiveLayerWrapper(
                              'teacherFace1',
                              `چهره ${teachers[0].name}`,
                              renderTeacherFaceOnly(teachers[0], false, true),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              'teacherInfo1',
                              `مشخصات ${teachers[0].name}`,
                              renderTeacherInfoOnly(teachers[0], false, true),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        )}

                        {/* Center Epic VS Emblem */}
                        <div className="col-span-1 h-full flex flex-col items-center justify-center relative z-30 pb-10">
                          {compareData.showVsBadge ? (
                            renderInteractiveLayerWrapper(
                              'vsBadge',
                              'نشان مرکزی VS',
                              <div className="relative group">
                                <div
                                  className="absolute -inset-3 rounded-full animate-ping opacity-25 pointer-events-none"
                                  style={{ backgroundColor: colors.marker }}
                                />
                                <div
                                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-black text-lg md:text-xl shadow-2xl border-2 border-white relative z-10"
                                  style={{
                                    background: `linear-gradient(135deg, ${teachers[0]?.accentColor || colors.marker}, ${teachers[1]?.accentColor || colors.ink})`,
                                    boxShadow: `0 0 35px ${colors.marker}90, inset 0 2px 4px rgba(255,255,255,0.4)`,
                                  }}
                                >
                                  <span className="drop-shadow-md">VS</span>
                                </div>
                              </div>,
                              'relative flex items-center justify-center'
                            )
                          ) : (
                            <div className="w-0.5 h-32 bg-gradient-to-b from-transparent via-slate-400/50 to-transparent" />
                          )}
                        </div>

                        {/* Teacher 2 (Left in RTL) */}
                        {teachers[1] && (
                          <div className="col-span-5 h-full flex flex-col items-center justify-end">
                            {renderInteractiveLayerWrapper(
                              'teacherFace2',
                              `چهره ${teachers[1].name}`,
                              renderTeacherFaceOnly(teachers[1], false, true),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              'teacherInfo2',
                              `مشخصات ${teachers[1].name}`,
                              renderTeacherInfoOnly(teachers[1], false, true),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (count === 3) {
                    /* --- 3-TEACHER MODE (SE OSTADI): 3 PURE CUTOUT FACES SIDE-BY-SIDE --- */
                    return (
                      <div className="w-full h-full max-w-6xl grid grid-cols-3 gap-3 md:gap-6 items-end relative">
                        {/* Elegant Divider Line between Teacher 1 & 2 */}
                        <div className="absolute right-1/3 top-1/4 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-400/30 to-transparent z-20 pointer-events-none" />
                        {/* Elegant Divider Line between Teacher 2 & 3 */}
                        <div className="absolute left-1/3 top-1/4 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-400/30 to-transparent z-20 pointer-events-none" />

                        {/* Teacher 1 (Right) */}
                        {teachers[0] && (
                          <div className="h-full flex flex-col items-center justify-end relative">
                            {renderInteractiveLayerWrapper(
                              'teacherFace1',
                              `چهره ${teachers[0].name}`,
                              renderTeacherFaceOnly(teachers[0], false, false),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              'teacherInfo1',
                              `مشخصات ${teachers[0].name}`,
                              renderTeacherInfoOnly(teachers[0], false, false),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        )}

                        {/* Teacher 2 (Center Hero) */}
                        {teachers[1] && (
                          <div className="h-full flex flex-col items-center justify-end relative z-20">
                            {renderInteractiveLayerWrapper(
                              'teacherFace2',
                              `چهره ${teachers[1].name}`,
                              renderTeacherFaceOnly(teachers[1], true, false),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              'teacherInfo2',
                              `مشخصات ${teachers[1].name}`,
                              renderTeacherInfoOnly(teachers[1], true, false),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        )}

                        {/* Teacher 3 (Left) */}
                        {teachers[2] && (
                          <div className="h-full flex flex-col items-center justify-end relative">
                            {renderInteractiveLayerWrapper(
                              'teacherFace3',
                              `چهره ${teachers[2].name}`,
                              renderTeacherFaceOnly(teachers[2], false, false),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              'teacherInfo3',
                              `مشخصات ${teachers[2].name}`,
                              renderTeacherInfoOnly(teachers[2], false, false),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  /* 4+ Teachers Fallback */
                  return (
                    <div
                      className="w-full h-full max-w-6xl grid gap-4 items-end"
                      style={{
                        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                      }}
                    >
                      {teachers.map((teacher, idx) => {
                        const faceKey = `teacherFace${idx + 1}` as keyof LayerPositions;
                        const infoKey = `teacherInfo${idx + 1}` as keyof LayerPositions;
                        return (
                          <div key={teacher.id} className="h-full flex flex-col items-center justify-end">
                            {renderInteractiveLayerWrapper(
                              faceKey,
                              `چهره ${teacher.name}`,
                              renderTeacherFaceOnly(teacher, false, false),
                              'w-full flex-1 flex items-end justify-center'
                            )}
                            {renderInteractiveLayerWrapper(
                              infoKey,
                              `مشخصات ${teacher.name}`,
                              renderTeacherInfoOnly(teacher, false, false),
                              'mt-1 z-20 flex flex-col items-center'
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>


              {/* Separator line above footer */}
              {isLayerVisible('separatorLine') && (footerConfig?.showSeparator ?? true) && footerConfig?.style !== 'hidden' && (
                <div
                  style={{
                    backgroundColor: footerConfig?.separatorColor || colors.marker,
                    height: `${footerConfig?.separatorHeight || 3.5}px`,
                    bottom: `${footerConfig?.height || Math.round(height * 0.095)}px`,
                    boxShadow: `0 0 10px ${footerConfig?.separatorColor || colors.marker}60`,
                  }}
                  className="absolute left-0 right-0 z-30 pointer-events-none"
                />
              )}

              {/* Preserved Official Footer Layer */}
              {renderFooterLayer(true)}
            </div>
          );
        })()
      ) : (
        /* سایر قالب‌های شاخص وردپرس: کلاسیک تحریریه، مدرن Split، مجله‌ای، مینیمال، راهنما و دارک نئونی */
        (() => {
          const footerH = (footerConfig?.style === 'hidden' || !isLayerVisible('footer')) ? 0 : (footerConfig?.height || 64);
          const contentBottomPadding = `${footerH + 16}px`;

          if (config.template === 'split-modern') {
            return (
              <div className="h-full w-full relative flex flex-col justify-between overflow-hidden">
                <div
                  className="flex-1 min-h-0 grid grid-cols-12 gap-8 items-center px-10 md:px-14 pt-8"
                  style={{ paddingBottom: contentBottomPadding }}
                >
                  <div className="col-span-5 h-full max-h-[500px] flex items-center justify-center">
                    {renderImageCardLayer('w-full h-full object-cover', 'aspect-auto h-full')}
                  </div>

                  <div className="col-span-7 flex flex-col justify-center gap-5 text-right">
                    <div className="flex flex-wrap items-center gap-3">
                      {renderCategoryBadge()}
                      {renderSpecialBadge()}
                      {renderLogoLayer('relative')}
                    </div>

                    <div className="space-y-3">
                      {renderInteractiveLayerWrapper(
                        'title',
                        'عنوان مقاله',
                        <h1
                          style={{
                            color: colors.ink,
                            fontSize: `${titleFontSize || 44}px`,
                            lineHeight: lineHeight || 1.3,
                          }}
                          className="font-black tracking-tight drop-shadow-sm"
                        >
                          {renderTitle()}
                        </h1>
                      )}
                      {renderTaglineLayer()}
                    </div>

                    {renderAnswerSheetBubbles()}
                  </div>
                </div>

                {renderFooterLayer(true)}
              </div>
            );
          }

          if (config.template === 'magazine') {
            return (
              <div className="h-full w-full relative flex flex-col justify-between overflow-hidden">
                {imageUrl && isLayerVisible('imageCard') && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={imageUrl}
                      alt={title}
                      style={{ filter: getFilterStyle() }}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${colors.paper} 0%, ${colors.paper}ee 45%, ${colors.paper}70 75%, transparent 100%)`,
                      }}
                    />
                  </div>
                )}

                <div className="relative z-10 p-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderCategoryBadge()}
                    {renderSpecialBadge()}
                  </div>
                  {renderLogoLayer('relative')}
                </div>

                <div
                  className="relative z-10 px-10 md:px-14 pb-4 space-y-4 max-w-4xl"
                  style={{ marginBottom: `${footerH + 12}px` }}
                >
                  {renderInteractiveLayerWrapper(
                    'title',
                    'عنوان مجله‌ای',
                    <h1
                      style={{
                        color: colors.ink,
                        fontSize: `${Math.round((titleFontSize || 46) * 1.15)}px`,
                        lineHeight: lineHeight || 1.25,
                      }}
                      className="font-black leading-snug tracking-tight"
                    >
                      {renderTitle()}
                    </h1>
                  )}
                  {renderTaglineLayer()}
                  {renderAnswerSheetBubbles()}
                </div>

                {renderFooterLayer(true)}
              </div>
            );
          }

          if (config.template === 'minimal-card') {
            return (
              <div className="h-full w-full relative flex flex-col justify-between p-8 md:p-12 overflow-hidden">
                <div
                  className="flex-1 min-h-0 w-full max-w-4xl mx-auto rounded-3xl p-8 md:p-12 flex flex-col justify-between shadow-2xl border"
                  style={{
                    backgroundColor: colors.paperSecondary,
                    borderColor: 'rgba(255,255,255,0.15)',
                    marginBottom: `${footerH}px`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {renderCategoryBadge()}
                      {renderSpecialBadge()}
                    </div>
                    {renderLogoLayer('relative')}
                  </div>

                  <div className="my-auto space-y-4">
                    {renderInteractiveLayerWrapper(
                      'title',
                      'عنوان مقاله',
                      <h1
                        style={{
                          color: colors.ink,
                          fontSize: `${titleFontSize || 44}px`,
                          lineHeight: lineHeight || 1.3,
                        }}
                        className="font-black text-center"
                      >
                        {renderTitle()}
                      </h1>
                    )}
                    <div className="flex justify-center text-center">
                      {renderTaglineLayer()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    {renderAnswerSheetBubbles()}
                    {imageUrl && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {renderFooterLayer(true)}
              </div>
            );
          }

          if (config.template === 'badge-guide') {
            return (
              <div className="h-full w-full relative flex flex-col justify-between overflow-hidden">
                <div className="p-8 md:p-12 flex-1 min-h-0 flex flex-col justify-between" style={{ paddingBottom: contentBottomPadding }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-4 py-1.5 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-md flex items-center gap-2"
                        style={{ backgroundColor: colors.marker }}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>راهنمای جامع کنکور</span>
                      </span>
                      {renderSpecialBadge()}
                    </div>
                    {renderLogoLayer('relative')}
                  </div>

                  <div className="grid grid-cols-12 gap-8 items-center my-auto">
                    <div className="col-span-7 space-y-4">
                      {renderCategoryBadge()}
                      {renderInteractiveLayerWrapper(
                        'title',
                        'عنوان راهنما',
                        <h1
                          style={{
                            color: colors.ink,
                            fontSize: `${titleFontSize || 44}px`,
                            lineHeight: lineHeight || 1.3,
                          }}
                          className="font-black leading-tight"
                        >
                          {renderTitle()}
                        </h1>
                      )}
                      {renderTaglineLayer()}
                      {renderAnswerSheetBubbles()}
                    </div>

                    <div className="col-span-5 flex justify-center">
                      {renderImageCardLayer('w-full max-w-sm', 'aspect-[4/3]')}
                    </div>
                  </div>
                </div>

                {renderFooterLayer(true)}
              </div>
            );
          }

          if (config.template === 'dark-neon') {
            return (
              <div
                className="h-full w-full relative flex flex-col justify-between overflow-hidden text-white"
                style={{ backgroundColor: '#090D16' }}
              >
                <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: colors.marker }} />
                <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: colors.highlight }} />

                <div className="relative z-10 p-8 md:p-12 flex-1 min-h-0 flex flex-col justify-between" style={{ paddingBottom: contentBottomPadding }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {renderCategoryBadge()}
                      {renderSpecialBadge()}
                    </div>
                    {renderLogoLayer('relative')}
                  </div>

                  <div className="grid grid-cols-12 gap-8 items-center my-auto">
                    <div className="col-span-7 space-y-4">
                      {renderInteractiveLayerWrapper(
                        'title',
                        'عنوان نئونی',
                        <h1
                          style={{
                            color: '#FFFFFF',
                            fontSize: `${titleFontSize || 44}px`,
                            lineHeight: lineHeight || 1.3,
                          }}
                          className="font-black drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                        >
                          {renderTitle()}
                        </h1>
                      )}
                      {renderTaglineLayer()}
                      {renderAnswerSheetBubbles()}
                    </div>

                    <div className="col-span-5 flex justify-center">
                      {renderImageCardLayer('w-full max-w-sm ring-2 ring-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]', 'aspect-[16/10]')}
                    </div>
                  </div>
                </div>

                {renderFooterLayer(true)}
              </div>
            );
          }

          // Default 'editorial'
          return (
            <div className="h-full w-full relative flex flex-col justify-between overflow-hidden">
              <div
                className="p-8 md:p-12 flex-1 min-h-0 flex flex-col justify-between"
                style={{ paddingBottom: contentBottomPadding }}
              >
                {/* Top Bar: Category, Badge, Logo */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {renderCategoryBadge()}
                    {renderSpecialBadge()}
                  </div>
                  {renderLogoLayer('relative')}
                </div>

                {/* Main Grid: Headline & Image */}
                <div className="grid grid-cols-12 gap-8 items-center my-auto">
                  <div className="col-span-7 space-y-4 text-right">
                    {renderInteractiveLayerWrapper(
                      'title',
                      'عنوان مقاله',
                      <h1
                        style={{
                          color: colors.ink,
                          fontSize: `${titleFontSize || 46}px`,
                          lineHeight: lineHeight || 1.3,
                        }}
                        className="font-black tracking-tight"
                      >
                        {renderTitle()}
                      </h1>
                    )}
                    {renderTaglineLayer()}
                    {renderAnswerSheetBubbles()}
                  </div>

                  <div className="col-span-5 flex justify-center">
                    {renderImageCardLayer('w-full max-w-md shadow-2xl')}
                  </div>
                </div>
              </div>

              {renderFooterLayer(true)}
            </div>
          );
        })()
      )}
      </div>
    );
  }
);

CoverCanvasPreview.displayName = 'CoverCanvasPreview';
