// ==========================================
// 內容模型：前台顯示與後台編輯共用的單一真理源
// 所有面向訪客的文字都是雙語 L 物件，避免中英文清單長度不一致
// ==========================================
import type { GalleryRow, InquiryItem, Language } from '../types';

export type { Language };

/** 雙語文字 */
export interface L {
  zh: string;
  en: string;
}

export interface StatItem {
  value: string;
  label: L;
}

export interface SectionHeader {
  tag: L;
  title: L;
  subtitle: L;
}

export interface Profile {
  name: L;
  title: L;
  tagline: L;
  location: L;
  availability: L;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  /** 大頭照（側欄、關於我） */
  avatar: string;
  /** 首頁 Hero 去背人像 */
  heroImage: string;
  /** 關於我頁面頂部橫幅 */
  aboutCover: string;
}

export interface HeroContent {
  headlinePrefix: L;
  headlineMain: L;
  headlineHighlight: L;
  subtitle: L;
  booking: { tag: L; title: L; desc: L };
  stats: StatItem[];
}

export interface BenefitCard {
  tag: L;
  title: L;
  desc: L;
  chips: string[];
}

export interface ValueStat {
  value: string;
  title: L;
  desc: L;
}

export interface ServiceItem {
  title: L;
  desc: L;
  tags: string[];
}

export interface ProcessStep {
  title: L;
  desc: L;
}

export interface Testimonial {
  quote: L;
  author: string;
  role: L;
  avatar?: string;
}

export interface ExperienceItem {
  id: string;
  company: L;
  role: L;
  period: string;
  duration: L;
  location: L;
  logo?: string;
  badge?: L;
  summary: L;
  highlights: L[];
  techTags: string[];
}

export interface EducationItem {
  school: L;
  department: L;
  period: string;
  highlights: L;
}

export interface SkillGroup {
  category: L;
  items: string[];
}

export interface StoryBlock {
  title: L;
  body: L;
}

export interface AboutContent {
  headline: L;
  /** 一句話座右銘 */
  motto: L;
  intro: L;
  /** 自傳段落 */
  story: StoryBlock[];
  /** 風格 / 堅持 這類關鍵字 */
  principles: { title: L; desc: L }[];
  skills: SkillGroup[];
  education: EducationItem[];
  languages: { name: L; level: L }[];
  /** 求職條件 / 合作偏好 */
  preferences: { label: L; value: L }[];
}

export type SectionKey =
  | 'benefits'
  | 'projects'
  | 'whyChooseMe'
  | 'services'
  | 'process'
  | 'testimonials'
  | 'experience'
  | 'contact';

export interface SiteContent {
  profile: Profile;
  seo: { title: L; description: L; ogImage: string };
  hero: HeroContent;
  benefits: SectionHeader & { cards: BenefitCard[] };
  whyChooseMe: SectionHeader & { stats: ValueStat[] };
  services: SectionHeader & { items: ServiceItem[] };
  process: SectionHeader & { steps: ProcessStep[] };
  testimonials: SectionHeader & { items: Testimonial[] };
  experience: SectionHeader & { items: ExperienceItem[] };
  about: AboutContent;
  /** 首頁各區塊顯示開關 */
  sections: Record<SectionKey, boolean>;
}

// ==========================================
// 作品
// ==========================================
export type ThemeColor = 'yellow' | 'purple' | 'coral' | 'mint' | 'blue';

export interface Project {
  id: string;
  /** 是否在前台顯示（草稿不顯示） */
  published: boolean;
  /** 是否出現在首頁精選 */
  featured: boolean;
  order: number;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  tag: string;
  tagEn?: string;
  category: string;
  categoryEn?: string;
  year: string;
  role: string;
  roleEn?: string;
  company: string;
  companyEn?: string;
  badge?: string;
  badgeEn?: string;
  themeColor: ThemeColor;
  isNew: boolean;
  summary: string;
  summaryEn?: string;
  /** 封面：列表卡片、側欄、分享圖 */
  coverImage?: string;
  /** 專案頁圖片：唯一的相簿來源，依排版列呈現 */
  galleryRows: GalleryRow[];
  contentMd?: string;
  contentMdEn?: string;
  painPoints: string[];
  painPointsEn?: string[];
  techStack: string[];
  aiHighlights: {
    coreHighlights: string[];
    coreHighlightsEn?: string[];
    animationHighlights: string[];
    animationHighlightsEn?: string[];
    usageScenarios: string[];
    usageScenariosEn?: string[];
    clientPitch: string;
    clientPitchEn?: string;
  };
  metrics?: { label: string; labelEn?: string; value: string }[];
  demoUrl?: string;
  githubUrl?: string;
  /** 是否開放購買授權／買斷（只限自己擁有著作權的產品） */
  forSale?: boolean;
  /** 重建成本：從零接案要收的價格（NT$），授權價依此計算；不會送到前台 */
  rebuildCost?: number;
  /** 月淨利（NT$），有營收時用來拉高買斷價；不會送到前台 */
  monthlyProfit?: number;
  /** 前台用：伺服器依上面兩個數字算好的價格區間 */
  licenseQuotes?: { source: { min: number; max: number }; buyout: { min: number; max: number } };
  updatedAt?: string;
}

// ==========================================
// 媒體庫
// ==========================================
export interface MediaItem {
  id: string;
  /** 原尺寸（最長邊 ≤ 2400px）公開網址 */
  url: string;
  /** 小圖（寬 ≤ 800px），列表與縮圖用 */
  thumbUrl: string;
  width: number;
  height: number;
  /** 16px 模糊預覽圖 data URI */
  blurDataUrl?: string;
  bytes: number;
  originalName: string;
  alt?: string;
  mime: string;
  createdAt: string;
}

/** 前台用的精簡媒體資訊：依 url 查尺寸與縮圖 */
export type MediaMeta = Pick<MediaItem, 'thumbUrl' | 'width' | 'height' | 'blurDataUrl'>;

export interface ContentDocument {
  version: 2;
  site: SiteContent;
  projects: Project[];
  media: MediaItem[];
  inquiries: InquiryItem[];
  updatedAt: string;
}

/** 前台拿得到的內容（不含詢問、不含草稿） */
export interface PublicContent {
  site: SiteContent;
  projects: Project[];
  media: Record<string, MediaMeta>;
}

export const tx = (l: L | undefined, lang: Language): string =>
  !l ? '' : (lang === 'en' ? l.en || l.zh : l.zh || l.en);

export const pick = (zh: string | undefined, en: string | undefined, lang: Language): string =>
  lang === 'en' ? en || zh || '' : zh || en || '';
