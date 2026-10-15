'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import type { Project, ThemeColor } from '../../../content/types';
import { adminApi } from '../shared/api';
import { Field, ListEditor, SectionCard, TagsInput, TextInput, Toggle, inputCls } from '../shared/fields';
import { ImageField, MediaPicker } from '../shared/media';
import { SaveBar } from '../shared/site-draft';
import { GalleryRowsEditor } from './gallery-rows-editor';
import { LICENSES, PROJECT_TIERS, formatNTD, licenseQuote } from '../../inquiries/pricing';

const SLUG_RE = /^[a-z0-9-]+$/;
const THEMES: { v: ThemeColor; l: string }[] = [
  { v: 'yellow', l: '黃' },
  { v: 'purple', l: '紫' },
  { v: 'coral', l: '珊瑚' },
  { v: 'mint', l: '薄荷' },
  { v: 'blue', l: '藍' },
];

export function createEmptyProject(order: number): Project {
  return {
    id: '',
    published: false,
    featured: false,
    order,
    title: '',
    titleEn: '',
    subtitle: '',
    subtitleEn: '',
    tag: '',
    tagEn: '',
    category: '',
    categoryEn: '',
    year: String(new Date().getFullYear()),
    role: '',
    roleEn: '',
    company: '',
    companyEn: '',
    badge: '',
    badgeEn: '',
    themeColor: 'yellow',
    isNew: false,
    summary: '',
    summaryEn: '',
    coverImage: '',
    galleryRows: [],
    contentMd: '',
    contentMdEn: '',
    painPoints: [],
    painPointsEn: [],
    techStack: [],
    aiHighlights: {
      coreHighlights: [],
      coreHighlightsEn: [],
      animationHighlights: [],
      animationHighlightsEn: [],
      usageScenarios: [],
      usageScenariosEn: [],
      clientPitch: '',
      clientPitchEn: '',
    },
    metrics: [],
    demoUrl: '',
    githubUrl: '',
    forSale: false,
  };
}

const suggestSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

type Tab = 'basic' | 'images' | 'content' | 'ai';
const TABS: { key: Tab; label: string }[] = [
  { key: 'basic', label: '基本資訊' },
  { key: 'images', label: '圖片' },
  { key: 'content', label: '內文' },
  { key: 'ai', label: 'AI 亮點' },
];

/** 一行一項的簡易清單 */
function LinesField({ label, value, onChange }: { label: string; value: string[] | undefined; onChange: (v: string[]) => void }) {
  return (
    <Field label={label} hint="一行一項">
      <textarea className={inputCls} rows={4} value={(value || []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} onBlur={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
    </Field>
  );
}

export function ProjectEditor({
  initial,
  isNew,
  onBack,
  onSaved,
}: {
  initial: Project;
  isNew: boolean;
  onBack: () => void;
  onSaved: (projects: Project[], saved: Project) => void;
}) {
  const [draft, setDraft] = useState<Project>(initial);
  const [base, setBase] = useState<string>(JSON.stringify(initial));
  const [creating, setCreating] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<Tab>('basic');
  const [slugTouched, setSlugTouched] = useState(false);

  const dirty = useMemo(() => JSON.stringify(draft) !== base, [draft, base]);
  const set = <K extends keyof Project>(k: K, v: Project[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setAi = <K extends keyof Project['aiHighlights']>(k: K, v: Project['aiHighlights'][K]) =>
    setDraft((d) => ({ ...d, aiHighlights: { ...d.aiHighlights, [k]: v } }));

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const slugError = creating ? (!draft.id ? '請填寫網址代號' : !SLUG_RE.test(draft.id) ? '只能使用小寫英文、數字與連字號 (-)' : null) : null;

  const save = useCallback(async () => {
    if (creating && slugError) {
      setError(slugError);
      setTab('basic');
      return;
    }
    if (!draft.title.trim()) {
      setError('請填寫作品標題');
      setTab('basic');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.projects.save(draft);
      const saved = res.projects.find((p) => p.id === draft.id) || draft;
      setDraft(saved);
      setBase(JSON.stringify(saved));
      setCreating(false);
      setOk(true);
      window.setTimeout(() => setOk(false), 2500);
      onSaved(res.projects, saved);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [creating, slugError, draft, onSaved]);

  const back = () => {
    if (dirty && !confirm('有尚未儲存的變更，確定要離開嗎？')) return;
    onBack();
  };

  return (
    <div className="space-y-5 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </button>
        <div className="flex items-center gap-3">
          {ok && <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">已儲存</span>}
          {!creating && draft.published && (
            <a href={`/projects/${draft.id}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 hover:underline">
              在前台預覽 ↗
            </a>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">{creating ? '新增作品' : draft.title || '編輯作品'}</h2>
        {!creating && <p className="text-xs text-slate-400">/projects/{draft.id}</p>}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <>
          <SectionCard title="標題與網址">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="標題（中）">
                <TextInput value={draft.title} onChange={(v) => set('title', v)} />
              </Field>
              <Field label="標題（英）">
                <TextInput
                  value={draft.titleEn || ''}
                  onChange={(v) => {
                    set('titleEn', v);
                    if (creating && !slugTouched) set('id', suggestSlug(v));
                  }}
                />
              </Field>
              <Field label="副標（中）">
                <TextInput value={draft.subtitle || ''} onChange={(v) => set('subtitle', v)} />
              </Field>
              <Field label="副標（英）">
                <TextInput value={draft.subtitleEn || ''} onChange={(v) => set('subtitleEn', v)} />
              </Field>
              <Field
                label="網址代號 (slug)"
                hint={creating ? '建立後無法修改。只能用小寫英文、數字、連字號；會自動從英文標題建議。' : '建立後無法修改'}
              >
                <input
                  className={`${inputCls} ${creating && slugError && draft.id ? 'border-rose-400' : ''} disabled:bg-slate-100 disabled:text-slate-500`}
                  value={draft.id}
                  disabled={!creating}
                  placeholder="my-project"
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('id', e.target.value);
                  }}
                />
                {creating && slugError && draft.id && <span className="block text-[11px] text-rose-600">{slugError}</span>}
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="狀態">
            <div className="grid gap-3 md:grid-cols-3">
              <Toggle checked={draft.published} onChange={(v) => set('published', v)} label="發佈到前台" hint="關閉＝草稿，訪客看不到" />
              <Toggle checked={draft.featured} onChange={(v) => set('featured', v)} label="首頁精選" hint="顯示在首頁作品區" />
              <Toggle checked={draft.isNew} onChange={(v) => set('isNew', v)} label="標示 NEW" />
            </div>
          </SectionCard>

          <SaleCard draft={draft} set={set} />

          <SectionCard title="分類與資訊">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="類別（中）"><TextInput value={draft.category} onChange={(v) => set('category', v)} /></Field>
              <Field label="類別（英）"><TextInput value={draft.categoryEn || ''} onChange={(v) => set('categoryEn', v)} /></Field>
              <Field label="標籤（中）"><TextInput value={draft.tag} onChange={(v) => set('tag', v)} /></Field>
              <Field label="標籤（英）"><TextInput value={draft.tagEn || ''} onChange={(v) => set('tagEn', v)} /></Field>
              <Field label="年份"><TextInput value={draft.year} onChange={(v) => set('year', v)} /></Field>
              <Field label="主題色">
                <select className={inputCls} value={draft.themeColor} onChange={(e) => set('themeColor', e.target.value as ThemeColor)}>
                  {THEMES.map((t) => (
                    <option key={t.v} value={t.v}>{t.l}</option>
                  ))}
                </select>
              </Field>
              <Field label="擔任角色（中）"><TextInput value={draft.role} onChange={(v) => set('role', v)} /></Field>
              <Field label="擔任角色（英）"><TextInput value={draft.roleEn || ''} onChange={(v) => set('roleEn', v)} /></Field>
              <Field label="公司／客戶（中）"><TextInput value={draft.company} onChange={(v) => set('company', v)} /></Field>
              <Field label="公司／客戶（英）"><TextInput value={draft.companyEn || ''} onChange={(v) => set('companyEn', v)} /></Field>
              <Field label="徽章（中）"><TextInput value={draft.badge || ''} onChange={(v) => set('badge', v)} /></Field>
              <Field label="徽章（英）"><TextInput value={draft.badgeEn || ''} onChange={(v) => set('badgeEn', v)} /></Field>
              <Field label="Demo 連結"><TextInput value={draft.demoUrl || ''} onChange={(v) => set('demoUrl', v)} placeholder="https://" /></Field>
              <Field label="GitHub 連結"><TextInput value={draft.githubUrl || ''} onChange={(v) => set('githubUrl', v)} placeholder="https://" /></Field>
            </div>
          </SectionCard>

          <SectionCard title="摘要與技術">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="摘要（中）"><TextInput multiline rows={4} value={draft.summary} onChange={(v) => set('summary', v)} /></Field>
              <Field label="摘要（英）"><TextInput multiline rows={4} value={draft.summaryEn || ''} onChange={(v) => set('summaryEn', v)} /></Field>
            </div>
            <TagsInput label="技術棧" value={draft.techStack} onChange={(v) => set('techStack', v)} />
          </SectionCard>

          <SectionCard title="成果指標">
            <ListEditor
              items={draft.metrics || []}
              onChange={(v) => set('metrics', v)}
              createItem={() => ({ label: '', labelEn: '', value: '' })}
              itemTitle={(m) => `${m.label} ${m.value}`.trim()}
              addLabel="新增指標"
              renderItem={(m, up) => (
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="名稱（中）"><TextInput value={m.label} onChange={(v) => up({ label: v })} /></Field>
                  <Field label="名稱（英）"><TextInput value={m.labelEn || ''} onChange={(v) => up({ labelEn: v })} /></Field>
                  <Field label="數值"><TextInput value={m.value} onChange={(v) => up({ value: v })} /></Field>
                </div>
              )}
            />
          </SectionCard>

          <SectionCard title="痛點">
            <div className="grid gap-4 md:grid-cols-2">
              <LinesField label="痛點（中）" value={draft.painPoints} onChange={(v) => set('painPoints', v)} />
              <LinesField label="痛點（英）" value={draft.painPointsEn} onChange={(v) => set('painPointsEn', v)} />
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'images' && (
        <>
          <SectionCard title="封面圖" description="用於作品卡片、側欄與分享預覽。">
            <div className="max-w-md">
              <ImageField label="封面圖" hint="用於作品卡片、側欄與分享預覽" value={draft.coverImage} onChange={(v) => set('coverImage', v)} />
            </div>
          </SectionCard>
          <SectionCard
            title="專案頁相簿"
            description="這是專案頁唯一的圖片區。沒有相簿時，專案頁會只顯示封面圖。"
          >
            <GalleryRowsEditor rows={draft.galleryRows || []} onChange={(rows) => set('galleryRows', rows)} />
          </SectionCard>
        </>
      )}

      {tab === 'content' && <ContentTab draft={draft} set={set} />}

      {tab === 'ai' && (
        <SectionCard title="AI 亮點" description="選填，進階內容。">
          <div className="grid gap-4 md:grid-cols-2">
            <LinesField label="核心亮點（中）" value={draft.aiHighlights.coreHighlights} onChange={(v) => setAi('coreHighlights', v)} />
            <LinesField label="核心亮點（英）" value={draft.aiHighlights.coreHighlightsEn} onChange={(v) => setAi('coreHighlightsEn', v)} />
            <LinesField label="動畫亮點（中）" value={draft.aiHighlights.animationHighlights} onChange={(v) => setAi('animationHighlights', v)} />
            <LinesField label="動畫亮點（英）" value={draft.aiHighlights.animationHighlightsEn} onChange={(v) => setAi('animationHighlightsEn', v)} />
            <LinesField label="使用情境（中）" value={draft.aiHighlights.usageScenarios} onChange={(v) => setAi('usageScenarios', v)} />
            <LinesField label="使用情境（英）" value={draft.aiHighlights.usageScenariosEn} onChange={(v) => setAi('usageScenariosEn', v)} />
            <Field label="客戶提案話術（中）"><TextInput multiline rows={4} value={draft.aiHighlights.clientPitch} onChange={(v) => setAi('clientPitch', v)} /></Field>
            <Field label="客戶提案話術（英）"><TextInput multiline rows={4} value={draft.aiHighlights.clientPitchEn || ''} onChange={(v) => setAi('clientPitchEn', v)} /></Field>
          </div>
        </SectionCard>
      )}

      <SaveBar dirty={dirty} saving={saving} error={error} onSave={save} onDiscard={() => { setDraft(JSON.parse(base)); setError(null); }} />
    </div>
  );
}

/** 金額欄位：空白存 undefined，避免存成 0 */
function MoneyInput({ value, onChange, placeholder }: { value?: number; onChange: (v: number | undefined) => void; placeholder?: string }) {
  return (
    <input
      className={inputCls}
      inputMode="numeric"
      value={value ? value.toLocaleString('en-US') : ''}
      placeholder={placeholder}
      onChange={(e) => {
        const n = Number(e.target.value.replace(/[^0-9]/g, ''));
        onChange(n > 0 ? n : undefined);
      }}
    />
  );
}

function SaleCard({ draft, set }: { draft: Project; set: <K extends keyof Project>(k: K, v: Project[K]) => void }) {
  const cost = draft.rebuildCost || 0;
  return (
    <SectionCard
      title="販售授權"
      description="只開放自己擁有著作權的產品；客戶網站的著作權在客戶，不要開。重建成本與月淨利只用來算價，不會出現在前台。"
    >
      <Toggle checked={!!draft.forSale} onChange={(v) => set('forSale', v)} label="開放購買" hint="作品頁會顯示託管授權、原始碼授權、獨家買斷三種方案" />
      {draft.forSale && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="重建成本（NT$）" hint="如果有人找你從零做出這個產品，你會報多少">
              <MoneyInput value={draft.rebuildCost} onChange={(v) => set('rebuildCost', v)} placeholder="例：250,000" />
            </Field>
            <Field label="月淨利（NT$，選填）" hint="有營收才填，買斷價會改取月淨利 × 24–36 與重建成本 50–80% 的較高者">
              <MoneyInput value={draft.monthlyProfit} onChange={(v) => set('monthlyProfit', v)} />
            </Field>
          </div>
          <p className="text-[11px] text-slate-500">
            參考接案報價表：{PROJECT_TIERS.map((t) => `${t.name.zh} ${formatNTD(t.min)}–${formatNTD(t.max)}`).join('、')}
          </p>
          {cost > 0 ? (
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs md:grid-cols-3">
              {LICENSES.map((l) => {
                const q = licenseQuote(l.id, cost, draft.monthlyProfit);
                return (
                  <div key={l.id}>
                    <div className="font-semibold text-slate-700">{l.name.zh}</div>
                    <div className="font-mono text-slate-900">{q ? `${formatNTD(q.min)} – ${formatNTD(q.max)}` : l.fixedPrice?.zh}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-amber-600">還沒填重建成本，前台不會顯示購買方案。</p>
          )}
        </>
      )}
    </SectionCard>
  );
}

function ContentTab({ draft, set }: { draft: Project; set: <K extends keyof Project>(k: K, v: Project[K]) => void }) {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [pick, setPick] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const key = lang === 'zh' ? 'contentMd' : 'contentMdEn';
  const value = (draft[key] as string | undefined) || '';

  const insert = (url: string) => {
    const el = ref.current;
    const pos = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    const md = `\n![](${url})\n`;
    set(key, value.slice(0, pos) + md + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const p = pos + md.length;
      el?.setSelectionRange(p, p);
    });
  };

  return (
    <SectionCard title="內文 (Markdown)" description="顯示在專案頁相簿之外的文字內容。支援 Markdown 語法。">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 text-xs">
          {(['zh', 'en'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-4 py-2 font-semibold ${lang === l ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>
              {l === 'zh' ? '中文' : 'English'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPick(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ImagePlus className="h-3.5 w-3.5" /> 插入圖片
        </button>
      </div>
      <textarea
        ref={ref}
        className={`${inputCls} min-h-[360px] font-mono text-[13px] leading-relaxed`}
        value={value}
        onChange={(e) => set(key, e.target.value)}
        placeholder="## 標題&#10;內文…"
      />
      <MediaPicker open={pick} onClose={() => setPick(false)} onSelect={([url]) => insert(url)} title="插入圖片到內文" />
    </SectionCard>
  );
}
