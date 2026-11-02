export interface LayerPosition {
  x: number; // px offset or absolute X
  y: number; // px offset or absolute Y
  width?: number;
  height?: number;
  isCustom?: boolean;
}

export interface LayerPositions {
  title?: LayerPosition;
  category?: LayerPosition;
  badge?: LayerPosition;
  imageCard?: LayerPosition;
  bubbles?: LayerPosition;
  footer?: LayerPosition;
  separatorLine?: LayerPosition;
  logo?: LayerPosition;
  subtitle?: LayerPosition;
  vsBadge?: LayerPosition;
  teacher1?: LayerPosition;
  teacher2?: LayerPosition;
  teacher3?: LayerPosition;
  teacherFace1?: LayerPosition;
  teacherFace2?: LayerPosition;
  teacherFace3?: LayerPosition;
  teacherInfo1?: LayerPosition;
  teacherInfo2?: LayerPosition;
  teacherInfo3?: LayerPosition;
  [key: string]: LayerPosition | undefined;
}

export interface LayerVisibility {
  title?: boolean;
  category?: boolean;
  badge?: boolean;
  imageCard?: boolean;
  bubbles?: boolean;
  footer?: boolean;
  separatorLine?: boolean;
  logo?: boolean;
  subtitle?: boolean;
  vsBadge?: boolean;
  teacher1?: boolean;
  teacher2?: boolean;
  teacher3?: boolean;
  teacherFace1?: boolean;
  teacherFace2?: boolean;
  teacherFace3?: boolean;
  teacherInfo1?: boolean;
  teacherInfo2?: boolean;
  teacherInfo3?: boolean;
  [key: string]: boolean | undefined;
}

export interface LogoConfig {
  width: number; // px (e.g. 70)
  height?: number; // px
  opacity: number; // 0.1 - 1.0
  filter: 'none' | 'invert' | 'brightness-white' | 'dark' | 'grayscale';
  placement: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'footer-inline' | 'custom';
  showBackground: boolean;
  bgPadding: number;
}

export interface HighlightConfig {
  style?: 'box' | 'pill' | 'underline' | 'gradient' | 'outline' | 'glow';
  paddingX?: number; // px (e.g. 4 - 24)
  paddingY?: number; // px (e.g. 0 - 14)
  borderRadius?: number; // px (e.g. 0 - 24)
  customBgColor?: string;
  customTextColor?: string;
}

export interface FooterConfig {
  style: 'bar' | 'pill' | 'minimal' | 'glass' | 'border-top' | 'hidden';
  height: number; // 40 - 100px (or percentage scaling)
  fontSize: number; // 12 - 24px
  opacity: number; // 0.2 - 1.0
  borderRadius: number; // 0 - 9999px
  showSeparator: boolean;
  separatorHeight: number; // 1 - 8px
  separatorColor?: string;
  paddingX: number; // 12 - 60px
  iconType: 'none' | 'wordpress' | 'globe' | 'sparkle' | 'dot' | 'badge' | 'grad-cap' | 'academy';
  customBadgeText?: string;
  alignment: 'space-between' | 'center' | 'right' | 'left';
  customLeftText?: string; // e.g. siteUrl
  customRightText?: string; // e.g. tagline or siteName
}

export interface TeacherHighlightItem {
  id: string;
  icon: 'grad-cap' | 'trophy' | 'users' | 'screen' | 'lightbulb' | 'book' | 'star' | 'check' | 'award';
  text: string;
}

export interface TeacherBioConfig {
  teacherName: string;
  prefixTitle: string;
  subtitleRole: string;
  highlights: TeacherHighlightItem[];
  subjectDoodles: 'physics' | 'math' | 'chemistry' | 'biology' | 'general' | 'none';
  photoStyle: 'cutout' | 'arched-frame' | 'circle-frame' | 'glass-card';
  photoGlow: boolean;
  photoFlipX: boolean;
  bottomFade: boolean;
  chromaKeyEnabled?: boolean;
  chromaKeyColor?: string;
  chromaKeyTolerance?: number;
  portraitCutoutUrl?: string;
}

export interface TeacherCompareItem {
  id: string;
  name: string;
  roleOrSubject: string;
  institute?: string;
  photoUrl: string;
  portraitCutoutUrl?: string;
  photoStyle?: 'cutout' | 'circle-glow' | 'vignette';
  photoZoom?: number;
  photoPosY?: number;
  photoFlipX?: boolean;
  accentColor: string;
  badgeText: string;
  ratingScore?: string;
  points: string[];
}

export interface TeacherCompareConfig {
  mode?: 'two-teachers' | 'three-teachers';
  title: string;
  subtitle: string;
  kicker: string;
  layoutStyle: 'vs-duel' | 'cards-grid' | 'podium' | 'minimal-table';
  photoStyle?: 'cutout' | 'circle-glow' | 'vignette';
  photoGlow?: boolean;
  bottomFade?: boolean;
  showPoints?: boolean;
  portraitHeight?: number;
  centerTeacherElevated?: boolean;
  showVsBadge: boolean;
  subjectDoodles: 'physics' | 'math' | 'chemistry' | 'biology' | 'general' | 'none';
  teachers: TeacherCompareItem[];
  // Answer-sheet design (rahekonkur identity)
  designStyle?: 'answer-sheet' | 'classic' | string;
  designAccent?: string;
  titleHighlight?: string;
  bylinePrefix?: string;
  bylineName?: string;
  namePrefix?: string;
}

export interface CoverConfig {
  id: string;
  template: 'editorial' | 'split-modern' | 'magazine' | 'minimal-card' | 'badge-guide' | 'dark-neon' | 'teacher-bio' | 'teacher-compare';
  
  // Content
  category: string;
  title: string;
  highlightText: string; // The word(s) to highlight with <mark>
  highlightConfig?: HighlightConfig;
  tagline: string;
  siteName: string;
  siteUrl: string;
  badgeText: string;
  showBadge: boolean;
  showBubbles: boolean;
  bubbleActiveIndex: number; // 0-8 for answer sheet style
  
  // Footer Customization
  footerConfig?: FooterConfig;
  
  // Image
  imageUrl: string;
  imageFit: 'cover' | 'contain';
  imageZoom: number; // 100 - 200%
  imagePosX: number; // 0 - 100%
  imagePosY: number; // 0 - 100%
  imageFilter: 'none' | 'grayscale' | 'warm' | 'cool' | 'contrast';
  
  // Dimensions & Export
  width: number;
  height: number;
  webpQuality: number; // 0.1 - 1.0 (default 0.85)
  targetPreset: 'wp-standard' | 'wp-retina' | 'wp-og' | 'wp-square' | 'wp-classic' | 'custom';
  
  // Typography
  fontFamily: 'Vazirmatn' | 'Lalezar' | 'Noto Kufi Arabic' | 'Tahoma';
  titleFontSize: number; // px for canvas rendering
  categoryFontSize: number;
  lineHeight: number;
  
  // Theme Colors
  themeId: string;
  colors: {
    paper: string;       // Background color
    paperSecondary: string; // Image card background / container
    ink: string;         // Main text color
    graphite: string;    // Subtitle / category color
    marker: string;      // Accent line / dot color
    highlight: string;   // Mark background color
    highlightText: string; // Mark text color
    footerBg: string;    // Footer bar background
    footerText: string;  // Footer text color
  };
  
  // Custom logo or watermark
  logoUrl?: string;
  logoConfig?: LogoConfig;
  showLogo?: boolean;
  showWpIcon: boolean;

  // Teacher Bio Specific Configuration
  teacherBio?: TeacherBioConfig;

  // Teacher Comparison Specific Configuration
  teacherCompare?: TeacherCompareConfig;

  // Preserved state for article covers
  articleContent?: {
    title: string;
    category: string;
    highlightText: string;
    highlightConfig?: HighlightConfig;
    tagline: string;
    badgeText: string;
    showBadge: boolean;
    showBubbles: boolean;
    bubbleActiveIndex: number;
    imageUrl: string;
    themeId?: string;
  };

  // Custom Layer Positions stored per template: positions[template][element]
  positions?: Record<string, LayerPositions>;
  templatePositions?: Record<string, LayerPositions>;
  visibility?: LayerVisibility;
  enableFreeDrag?: boolean;
  snapToGuides?: boolean;
}

export interface ColorThemePreset {
  id: string;
  name: string;
  colors: CoverConfig['colors'];
}

export interface DimensionPreset {
  id: CoverConfig['targetPreset'];
  label: string;
  sublabel: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface CuratedStockImage {
  id: string;
  name: string;
  category: string;
  url: string;
  thumb: string;
}
