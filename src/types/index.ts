// ==========================================
// 🌐 I18N & LANGUAGE TYPES
// ==========================================
export type Language = 'zh' | 'en';

export interface MultilingualText {
  zh: string;
  en: string;
}

// ==========================================
// 🖼️ MODULAR GALLERY ROWS (CUSTOM RATIO & FULL-WIDTH)
// ==========================================
export type GalleryRowLayout =
  | 'full'              // 100% 全寬大圖 (1 張)
  | 'split-left-small'  // 左小右大 (~40% : ~60% / 5:7 欄位) (2 張)
  | 'split-left-large'  // 左大右小 (~60% : ~40% / 7:5 欄位) (2 張)
  | 'split-equal';      // 左右等分 (50% : 50% / 6:6 欄位) (2 張)

export interface GallerySlot {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  aspectRatio?: string; // e.g. 'auto' | '16/9' | '4/3' | '1/1'
  fit?: 'contain' | 'cover';
  bgColor?: string;     // optional custom card background color e.g. #0A0A0E
}

export interface GalleryRow {
  id: string;
  layout: GalleryRowLayout;
  slots: GallerySlot[]; // slots[0] is Left/Main, slots[1] is Right (for 2-col layouts)
  caption?: string;
  /** 兩欄列的整列長寬比（例 '2/1'），兩張圖等高裁切；全寬列改用 slots[0].aspectRatio */
  ratio?: string;
}

// ==========================================
// 📥 INQUIRY ITEM
// ==========================================
export interface InquiryItem {
  id: string;
  name: string;
  company?: string;
  email: string;
  scope: string;
  budget?: string;
  message: string;
  status: 'unread' | 'replied' | 'archived';
  createdAt: string;
}

// ==========================================
// 🤖 AI TRANSLATE PAYLOAD & RESPONSE
// ==========================================
export interface AITranslateRequest {
  text?: string;
  fields?: Record<string, string>;
  from: Language;
  to: Language;
  context?: string;
}

export interface AITranslateResponse {
  success: boolean;
  translatedText?: string;
  translatedFields?: Record<string, string>;
  error?: string;
}

// ==========================================
// 🌊 SMOOTH SCROLL (LENIS) CONFIG & CONTEXT
// ==========================================
export interface SmoothScrollConfig {
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  smoothTouch?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  prevent?: (node: HTMLElement) => boolean;
}

export interface ScrollToOptions {
  offset?: number;
  immediate?: boolean;
  lock?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  onComplete?: () => void;
}

export interface SmoothScrollContextValue {
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
  isReady: boolean;
}

