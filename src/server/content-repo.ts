import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { storage } from './storage';
import { defaultSiteContent } from '../content/default-site';
import type {
  ContentDocument,
  MediaItem,
  MediaMeta,
  Project,
  PublicContent,
  SiteContent,
} from '../content/types';
import type { GalleryRow } from '../types';
import { PRICING_ENABLED, licenseQuote } from '../features/inquiries/pricing';

const CONTENT_KEY = 'content/content.json';
// R2 可能有多個實例同時跑，快取設短一點；本機單一程序寫入時會直接更新快取
const CACHE_TTL_MS = storage.kind === 'r2' ? 10_000 : Infinity;

const g = globalThis as unknown as {
  __contentCache?: { doc: ContentDocument; loadedAt: number };
  __contentWriteQueue?: Promise<unknown>;
};

// ==========================================
// 讀取
// ==========================================
export async function getDocument(): Promise<ContentDocument> {
  const cached = g.__contentCache;
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) return cached.doc;

  const raw = await storage.get(CONTENT_KEY);
  let doc: ContentDocument;
  if (raw) {
    doc = normalize(JSON.parse(raw.toString('utf-8')));
  } else {
    doc = await migrateLegacy();
    await storage.put(CONTENT_KEY, Buffer.from(JSON.stringify(doc, null, 2)), 'application/json');
  }
  g.__contentCache = { doc, loadedAt: Date.now() };
  return doc;
}

/** 前台用：只含已發佈作品，不含詢問 */
export async function getPublicContent(): Promise<PublicContent> {
  const doc = await getDocument();
  const media: Record<string, MediaMeta> = {};
  for (const m of doc.media) {
    media[m.url] = { thumbUrl: m.thumbUrl, width: m.width, height: m.height, blurDataUrl: m.blurDataUrl };
  }
  return {
    site: doc.site,
    projects: doc.projects.filter((p) => p.published).sort(byOrder).map(toPublicProject),
    media,
  };
}

// 重建成本與營收是內部數字，前台只拿算好的價格區間
function toPublicProject({ rebuildCost, monthlyProfit, licenseQuotes: _q, ...p }: Project): Project {
  // 報價關閉時，前台連販售狀態都不送出
  if (!PRICING_ENABLED) return { ...p, forSale: false };
  const source = p.forSale && rebuildCost ? licenseQuote('source', rebuildCost, monthlyProfit) : null;
  const buyout = p.forSale && rebuildCost ? licenseQuote('buyout', rebuildCost, monthlyProfit) : null;
  return source && buyout ? { ...p, licenseQuotes: { source, buyout } } : { ...p, forSale: false };
}

const byOrder = (a: Project, b: Project) => a.order - b.order;

// ==========================================
// 寫入：所有寫入排隊執行，避免同時寫入互相覆蓋
// ==========================================
export async function mutate<T>(fn: (doc: ContentDocument) => T | Promise<T>): Promise<T> {
  const run = async () => {
    g.__contentCache = undefined; // 寫入前一定讀最新版
    const doc = structuredClone(await getDocument());
    const result = await fn(doc);
    doc.updatedAt = new Date().toISOString();
    await storage.put(CONTENT_KEY, Buffer.from(JSON.stringify(doc, null, 2)), 'application/json');
    g.__contentCache = { doc, loadedAt: Date.now() };
    return result;
  };
  const next = (g.__contentWriteQueue ?? Promise.resolve()).then(run, run);
  g.__contentWriteQueue = next.catch(() => undefined);
  return next;
}

// ==========================================
// 媒體引用：刪除前檢查哪些地方還在用這張圖
// ==========================================
export interface MediaUsage {
  where: string;
  label: string;
}

export function findMediaUsages(doc: ContentDocument, media: Pick<MediaItem, 'url' | 'thumbUrl'>): MediaUsage[] {
  const urls = [media.url, media.thumbUrl].filter(Boolean);
  const hit = (s: unknown) => typeof s === 'string' && urls.some((u) => s.includes(u));
  const usages: MediaUsage[] = [];

  const siteJson = JSON.stringify(doc.site);
  if (hit(siteJson)) usages.push({ where: 'site', label: '網站內容（個人資料 / 首頁 / 關於我）' });

  for (const p of doc.projects) {
    if (hit(p.coverImage)) usages.push({ where: `project:${p.id}`, label: `作品「${p.title}」封面` });
    if (p.galleryRows.some((r) => r.slots.some((s) => hit(s.url)))) {
      usages.push({ where: `project:${p.id}`, label: `作品「${p.title}」相簿` });
    }
    if (hit(p.contentMd) || hit(p.contentMdEn)) {
      usages.push({ where: `project:${p.id}`, label: `作品「${p.title}」內文` });
    }
  }
  return usages;
}

// ==========================================
// 正規化與舊資料遷移
// ==========================================
function normalize(doc: ContentDocument): ContentDocument {
  return {
    version: 2,
    site: mergeDeep(defaultSiteContent, doc.site || {}) as SiteContent,
    projects: (doc.projects || []).map(normalizeProject),
    media: doc.media || [],
    inquiries: doc.inquiries || [],
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

export function normalizeProject(p: any, index = 0): Project {
  const rows: GalleryRow[] = Array.isArray(p.galleryRows) ? p.galleryRows : [];
  const inRows = new Set(rows.flatMap((r) => r.slots.map((s) => s.url)));
  // 舊版 images[] 相簿：沒放進排版列的圖片，自動轉成全寬列，確保前台不會少圖
  const legacy: string[] = (p.images || []).filter((u: string) => u && !inRows.has(u) && u !== p.coverImage);
  const migratedRows: GalleryRow[] = legacy.map((url, i) => ({
    id: `row-migrated-${Date.now()}-${i}`,
    layout: 'full',
    slots: [{ id: `slot-migrated-${i}`, url, fit: 'cover' }],
  }));

  const { images: _images, ...rest } = p;
  return {
    published: true,
    featured: true,
    order: index,
    isNew: false,
    themeColor: 'yellow',
    tag: '',
    category: '',
    year: '',
    role: '',
    company: '',
    summary: '',
    painPoints: [],
    techStack: [],
    aiHighlights: { coreHighlights: [], animationHighlights: [], usageScenarios: [], clientPitch: '' },
    ...rest,
    galleryRows: [...rows, ...migratedRows],
  };
}

async function migrateLegacy(): Promise<ContentDocument> {
  const legacyPath = path.join(process.cwd(), 'src', 'data', 'storage.json');
  let legacy: any = {};
  try {
    legacy = JSON.parse(await fs.readFile(legacyPath, 'utf-8'));
  } catch {
    // 沒有舊資料就用預設內容
  }

  const projects = (legacy.projects || []).map((p: any, i: number) => normalizeProject(p, i));
  const media = await registerLegacyUploads();

  return {
    version: 2,
    site: structuredClone(defaultSiteContent),
    projects,
    media,
    inquiries: legacy.inquiries || [],
    updatedAt: new Date().toISOString(),
  };
}

/** 把 public/uploads 既有圖片登記進媒體庫，讓舊圖也能被管理 */
async function registerLegacyUploads(): Promise<MediaItem[]> {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const items: MediaItem[] = [];
  for (const f of files.filter((f) => /\.(webp|jpe?g|png|gif|avif)$/i.test(f))) {
    try {
      const full = path.join(dir, f);
      const [meta, stat] = await Promise.all([sharp(full).metadata(), fs.stat(full)]);
      items.push({
        id: `legacy-${f}`,
        url: `/uploads/${f}`,
        thumbUrl: `/uploads/${f}`,
        width: meta.width || 0,
        height: meta.height || 0,
        bytes: stat.size,
        originalName: f,
        mime: `image/${meta.format || 'webp'}`,
        createdAt: stat.mtime.toISOString(),
      });
    } catch {
      // 壞檔就略過
    }
  }
  return items;
}

function mergeDeep(base: any, override: any): any {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base;
  if (typeof base !== 'object' || base === null) return override ?? base;
  const out: any = { ...base };
  for (const k of Object.keys(override || {})) {
    out[k] = k in base ? mergeDeep(base[k], override[k]) : override[k];
  }
  return out;
}
