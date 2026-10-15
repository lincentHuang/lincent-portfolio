// 合作方案與接案報價表：前台 CTA 與 AI 估價 API 共用同一份資料，改價格只要改這裡

export type L = { zh: string; en: string };

/**
 * 報價開關：預設關閉，前台不出現任何價格、AI 估價與作品授權購買，聯繫只剩單純表單
 * （免費主機方案限非商業用途）。換成可商用的方案後設 NEXT_PUBLIC_SHOW_PRICING=true 即可恢復
 */
export const PRICING_ENABLED = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';

export type EngagementId = 'fulltime' | 'contract' | 'project' | 'other';

export interface Engagement {
  id: EngagementId;
  name: L;
  price: L;
  priceNote: L;
  points: L[];
  /** 送出表單時寫入 scope 欄位的值 */
  scope: string;
}

export const ENGAGEMENTS: Engagement[] = [
  {
    id: 'fulltime',
    name: { zh: '正職工作', en: 'Full-time Role' },
    price: { zh: '月薪 NT$80,000 – 120,000', en: 'NT$80k – 120k / month' },
    priceNote: { zh: '依職責範圍與團隊規模調整', en: 'Depends on scope and team size' },
    points: [
      { zh: '資深前端工程師／前端架構師', en: 'Senior Frontend Engineer / Architect' },
      { zh: '設計系統、效能優化、產品前端從 0 到 1', en: 'Design systems, performance, 0→1 product frontends' },
      { zh: '可遠端或台北地區進辦公室', en: 'Remote or on-site in Taipei' },
    ],
    scope: '正職工作 / Full-time',
  },
  {
    id: 'contract',
    name: { zh: '短期合作', en: 'Short-term Contract' },
    price: { zh: '月 NT$100,000 – 150,000', en: 'NT$100k – 150k / month' },
    priceNote: {
      zh: '依實際工作天數按日計費（約 NT$4,500 – 6,800／人日，以每月 22 工作天計）',
      en: 'Billed by actual working days (≈ NT$4.5k – 6.8k / day, 22 days per month)',
    },
    points: [
      { zh: '駐點或遠端加入既有團隊', en: 'Join your existing team, on-site or remote' },
      { zh: '專案衝刺、技術救火、架構重構', en: 'Sprints, firefighting, architecture refactors' },
      { zh: '最短 2 週起', en: 'Minimum 2 weeks' },
    ],
    scope: '短期合作 / Contract',
  },
  {
    id: 'project',
    name: { zh: '專案接案', en: 'Project-based' },
    price: { zh: 'NT$10,000 起', en: 'From NT$10k' },
    priceNote: { zh: '依專案類型報價，可先用 AI 估價', en: 'Quoted by project type — try the AI estimate' },
    points: [
      { zh: '從需求、設計到上線一條龍', en: 'From requirements and design to launch' },
      { zh: '固定總價，分期付款', en: 'Fixed price with milestone payments' },
      { zh: '上線後提供保固與維護方案', en: 'Warranty and maintenance after launch' },
    ],
    scope: '專案接案 / Project',
  },
];

const NO_PRICE: L = { zh: '', en: '' };

/** 報價關閉時的聯繫選項：不帶任何價格 */
const SIMPLE_ENGAGEMENTS: Engagement[] = [
  {
    id: 'fulltime',
    name: { zh: '正職機會', en: 'Full-time Role' },
    price: NO_PRICE,
    priceNote: NO_PRICE,
    points: [{ zh: '前端工程師／前端架構相關職缺', en: 'Frontend engineering or architecture roles' }],
    scope: '正職工作 / Full-time',
  },
  {
    id: 'contract',
    name: { zh: '合作邀約', en: 'Collaboration' },
    price: NO_PRICE,
    priceNote: NO_PRICE,
    points: [{ zh: '一起做專案、技術交流或其他合作', en: 'Projects, tech exchange or other collaboration' }],
    scope: '合作邀約 / Collaboration',
  },
  {
    id: 'other',
    name: { zh: '其他', en: 'Something else' },
    price: NO_PRICE,
    priceNote: NO_PRICE,
    points: [{ zh: '問問題、打聲招呼都可以', en: 'Questions or just saying hi' }],
    scope: '其他 / Other',
  },
];

/** 前台實際顯示的聯繫選項 */
export const CONTACT_OPTIONS: Engagement[] = PRICING_ENABLED ? ENGAGEMENTS : SIMPLE_ENGAGEMENTS;

export type ProjectTierId = 'brand' | 'interactive' | 'business';

export interface ProjectTier {
  id: ProjectTierId;
  name: L;
  min: number;
  max: number;
  weeks: [number, number];
  desc: L;
  includes: L[];
}

export const PROJECT_TIERS: ProjectTier[] = [
  {
    id: 'brand',
    name: { zh: '形象網站', en: 'Brand Website' },
    min: 10_000,
    max: 30_000,
    weeks: [1, 3],
    desc: { zh: '個人、店家或小型企業的品牌門面', en: 'A brand presence for individuals and small businesses' },
    includes: [
      { zh: '1–5 頁響應式頁面', en: '1–5 responsive pages' },
      { zh: '基本 SEO 與社群分享設定', en: 'Basic SEO and social sharing' },
      { zh: '聯絡表單、部署上線', en: 'Contact form and deployment' },
    ],
  },
  {
    id: 'interactive',
    name: { zh: '互動式網站', en: 'Interactive Website' },
    min: 50_000,
    max: 100_000,
    weeks: [3, 6],
    desc: { zh: '有記憶點的活動頁、品牌體驗或作品集', en: 'Memorable campaigns, brand experiences, portfolios' },
    includes: [
      { zh: '滾動敘事、動畫與微互動', en: 'Scroll storytelling, motion, micro-interactions' },
      { zh: 'CMS 後台可自行更新內容', en: 'CMS for self-managed content' },
      { zh: '多語系、效能與 SEO 優化', en: 'i18n, performance and SEO tuning' },
    ],
  },
  {
    id: 'business',
    name: { zh: '商業工具', en: 'Business Tool' },
    min: 150_000,
    max: 1_000_000,
    weeks: [6, 24],
    desc: { zh: '會員、金流、後台與資料流程的系統', en: 'Systems with accounts, payments, admin and data flows' },
    includes: [
      { zh: '會員登入、權限、管理後台', en: 'Auth, roles, admin dashboard' },
      { zh: '金流、資料庫、第三方 API 串接', en: 'Payments, database, third-party APIs' },
      { zh: '報表、自動化或 AI 功能', en: 'Reporting, automation or AI features' },
    ],
  },
];

export const ADD_ONS: { name: L; price: L }[] = [
  { name: { zh: '多語系', en: 'Multi-language' }, price: { zh: '+15%', en: '+15%' } },
  { name: { zh: '急件（時程壓縮 30% 以上）', en: 'Rush (30%+ shorter timeline)' }, price: { zh: '+30%', en: '+30%' } },
  { name: { zh: '上線後維護', en: 'Post-launch maintenance' }, price: { zh: '每月 NT$3,000 起', en: 'From NT$3k / month' } },
];

/** AI 估價可勾選的功能，id 同時給前後端使用 */
export const ESTIMATE_FEATURES: { id: string; label: L }[] = [
  { id: 'i18n', label: { zh: '多語系', en: 'Multi-language' } },
  { id: 'cms', label: { zh: '內容後台', en: 'CMS' } },
  { id: 'motion', label: { zh: '動畫互動', en: 'Motion & interaction' } },
  { id: 'auth', label: { zh: '會員登入', en: 'User accounts' } },
  { id: 'payment', label: { zh: '金流付款', en: 'Payments' } },
  { id: 'admin', label: { zh: '管理後台', en: 'Admin dashboard' } },
  { id: 'integration', label: { zh: '第三方串接', en: 'Third-party APIs' } },
  { id: 'ai', label: { zh: 'AI 功能', en: 'AI features' } },
  { id: 'rush', label: { zh: '急件', en: 'Rush' } },
];

export interface EstimateResult {
  tier: ProjectTierId;
  min: number;
  max: number;
  weeksMin: number;
  weeksMax: number;
  summary: string;
  breakdown: { item: string; min: number; max: number }[];
  assumptions: string[];
  source: 'ai' | 'rule';
}

export const formatNTD = (n: number) => `NT$${Math.round(n).toLocaleString('en-US')}`;

// ==========================================
// 專案授權與買斷：以「重建成本」（從零接案要收多少）為基準打折
// ==========================================

export type LicenseId = 'hosted' | 'source' | 'buyout';

export interface License {
  id: LicenseId;
  name: L;
  desc: L;
  points: L[];
  /** 價格固定、不依重建成本計算時使用 */
  fixedPrice?: L;
}

/** 送出表單時寫入 scope 欄位的值 */
export const PURCHASE_SCOPE = '購買專案 / Purchase';

export const LICENSES: License[] = [
  {
    id: 'hosted',
    name: { zh: '託管授權', en: 'Hosted License' },
    desc: { zh: '我負責架設與維護，你直接使用', en: 'I host and maintain it, you just use it' },
    points: [
      { zh: '主機、更新、備份都由我處理', en: 'Hosting, updates and backups handled' },
      { zh: '開通費 NT$5,000–20,000（含品牌設定）', en: 'Setup fee NT$5k–20k incl. branding' },
      { zh: '程式碼與著作權仍屬於我', en: 'Code and copyright stay with me' },
    ],
    fixedPrice: { zh: '月費 NT$1,500–8,000', en: 'NT$1.5k–8k / month' },
  },
  {
    id: 'source',
    name: { zh: '原始碼授權', en: 'Source License' },
    desc: { zh: '拿到完整 repo，自己修改、商用', en: 'Get the full repo to modify and use commercially' },
    points: [
      { zh: '非獨家：我保留著作權，可授權給其他人', en: 'Non-exclusive: I keep the copyright' },
      { zh: '限一個品牌使用，不得轉售或公開原始碼', en: 'One brand; no resale or publishing the code' },
      { zh: '含部署文件、一次導入協助、30 天 bug 保固', en: 'Deploy docs, one onboarding session, 30-day bug fixes' },
    ],
  },
  {
    id: 'buyout',
    name: { zh: '獨家買斷', en: 'Exclusive Buyout' },
    desc: { zh: '著作財產權轉讓，產品從此是你的', en: 'Full IP transfer — the product becomes yours' },
    points: [
      { zh: '移交 repo、網域與服務帳號', en: 'Repo, domain and service accounts transferred' },
      { zh: '我下架並不再販售或授權他人', en: 'I stop selling or licensing it to anyone else' },
      { zh: '僅保留作品集展示權', en: 'I only keep the right to show it in my portfolio' },
    ],
  },
];

const round1k = (n: number) => Math.round(n / 1000) * 1000;

/**
 * 依重建成本試算授權價格區間；託管授權為固定價，回傳 null
 * - 原始碼授權：重建成本 15–25%，最低 NT$15,000
 * - 獨家買斷：重建成本 50–80%；有月淨利時改取「月淨利 × 24–36」與前者較高者
 */
export function licenseQuote(
  id: LicenseId,
  rebuildCost: number,
  monthlyProfit = 0,
): { min: number; max: number } | null {
  if (id === 'hosted' || !(rebuildCost > 0)) return null;
  if (id === 'source') {
    const min = Math.max(15_000, round1k(rebuildCost * 0.15));
    return { min, max: Math.max(min + 5_000, round1k(rebuildCost * 0.25)) };
  }
  const profit = monthlyProfit > 0 ? monthlyProfit : 0;
  const min = round1k(Math.max(rebuildCost * 0.5, profit * 24));
  return { min, max: Math.max(min + 5_000, round1k(Math.max(rebuildCost * 0.8, profit * 36))) };
}
