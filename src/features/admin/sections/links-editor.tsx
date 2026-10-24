'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check, Plus, Trash2, MousePointerClick } from 'lucide-react';
import { Field, LInput, TextInput, Toggle, inputCls, emptyL } from '../shared/fields';
import { ImageField } from '../shared/media';
import { useSiteDraft } from '../shared/site-draft';
import { adminApi } from '../shared/api';
import { Loading } from './profile-editor';
import { LinksView, type LinksSelection } from '../../links/links-page';
import type { Language, LinkItem, LinksBackground, LinksPage, Project } from '../../../content/types';

const newId = () => `link-${Date.now().toString(36)}`;

/** 背景快速套用 */
const BG_PRESETS: { name: string; bg: Partial<LinksBackground> }[] = [
  { name: '紙面', bg: { type: 'paper', tone: 'light' } },
  { name: '純白', bg: { type: 'color', color: '#FFFFFF', tone: 'light' } },
  { name: '墨黑', bg: { type: 'color', color: '#121218', tone: 'dark' } },
  { name: '薄荷', bg: { type: 'gradient', color: '#ECFDF5', color2: '#A7F3D0', tone: 'light' } },
  { name: '晨霧', bg: { type: 'gradient', color: '#EEF2FF', color2: '#FBCFE8', tone: 'light' } },
  { name: '夜空', bg: { type: 'gradient', color: '#0F172A', color2: '#312E81', tone: 'dark' } },
];

const presetSwatch = (bg: Partial<LinksBackground>) =>
  bg.type === 'paper'
    ? 'linear-gradient(135deg, #F2F3F5, #E1E4E8)'
    : bg.type === 'gradient'
      ? `linear-gradient(160deg, ${bg.color}, ${bg.color2})`
      : bg.color;

export function LinksEditor() {
  const { site, update } = useSiteDraft();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<LinksSelection | null>('header');
  const [lang, setLang] = useState<Language>('zh');
  const [picking, setPicking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminApi.projects
      .list()
      .then((r) => setProjects([...r.projects].sort((a, b) => a.order - b.order)))
      .catch(() => undefined);
  }, []);

  if (!site) return <Loading />;
  const page = site.links;
  const setPage = (patch: Partial<LinksPage>) => update((s) => ({ ...s, links: { ...s.links, ...patch } }));
  const setItem = (id: string, patch: Partial<LinkItem>) => setPage({ items: page.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const setBg = (patch: Partial<LinksBackground>) => setPage({ background: { ...page.background, ...patch } });

  const used = new Set(page.items.filter((i) => i.kind === 'project').map((i) => i.projectId));
  const addProjects = (ids: string[]) => {
    const added = ids.map((projectId, i) => ({ id: `${newId()}-${i}`, kind: 'project' as const, enabled: true, projectId, target: 'case' as const }));
    setPage({ items: [...page.items, ...added] });
    if (added.length) setSelected(added[added.length - 1].id);
  };
  const addCustom = () => {
    const item: LinkItem = { id: newId(), kind: 'custom', enabled: true, url: 'https://', label: { zh: '新連結', en: 'New link' } };
    setPage({ items: [...page.items, item] });
    setSelected(item.id);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/links`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const item = page.items.find((i) => i.id === selected);

  return (
    <div className="space-y-4">
      {/* 工具列 */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <button type="button" onClick={() => setPicking((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black">
          <Plus className="h-3.5 w-3.5" /> 從作品加入
        </button>
        <button type="button" onClick={addCustom} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Plus className="h-3.5 w-3.5" /> 自訂連結
        </button>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
            {(['zh', 'en'] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-md px-2.5 py-1 ${lang === l ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                {l === 'zh' ? '中文預覽' : 'EN'}
              </button>
            ))}
          </div>
          <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? '已複製' : '複製網址'}
          </button>
        </div>
        {picking && (
          <div className="w-full">
            <ProjectPicker
              projects={projects.filter((p) => !used.has(p.id))}
              onAdd={(ids) => {
                addProjects(ids);
                setPicking(false);
              }}
              onCancel={() => setPicking(false)}
            />
          </div>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[400px_1fr]">
        {/* 手機預覽：與前台同一個元件，直接拖曳排序、點選編輯 */}
        <div className="lg:sticky lg:top-20">
          <div className="mx-auto w-full max-w-[400px] rounded-[44px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
            <div className="h-[720px] overflow-y-auto overflow-x-hidden rounded-[34px]">
              <LinksView
                page={page}
                profile={site.profile}
                projects={projects.filter((p) => p.published)}
                lang={lang}
                className="min-h-full"
                edit={{ selected, onSelect: setSelected, onReorder: (items) => setPage({ items }) }}
              />
            </div>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <MousePointerClick className="h-3 w-3" /> 點畫面上的元素編輯，按住按鈕拖曳排序
          </p>
        </div>

        {/* 屬性面板 */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {selected === 'header' && (
            <>
              <PanelTitle title="頭像與介紹" />
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <ImageField label="頭像" hint="留空使用個人資料大頭照" aspect="aspect-square" value={page.avatar} onChange={(v) => setPage({ avatar: v })} />
                <div className="space-y-4">
                  <Field label="頭像形狀">
                    <select className={inputCls} value={page.avatarShape} onChange={(e) => setPage({ avatarShape: e.target.value as LinksPage['avatarShape'] })}>
                      <option value="circle">圓形</option>
                      <option value="rounded">圓角方形</option>
                    </select>
                  </Field>
                  <Toggle checked={page.showSocials} onChange={(v) => setPage({ showSocials: v })} label="顯示社群小圖示" hint="Email、GitHub、LinkedIn（取自個人資料）" />
                </div>
              </div>
              <LInput label="標題" hint={`留空顯示「${site.profile.name.zh}」`} value={page.title} onChange={(v) => setPage({ title: v })} />
              <LInput label="介紹" hint="留空顯示個人資料的一句話介紹" value={page.bio} onChange={(v) => setPage({ bio: v })} multiline rows={2} />
            </>
          )}

          {selected === 'background' && (
            <>
              <PanelTitle title="背景" />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {BG_PRESETS.map((p) => (
                  <button key={p.name} type="button" onClick={() => setBg(p.bg)} className="space-y-1 text-center text-[11px] text-slate-600">
                    <span className="block h-12 rounded-xl border border-slate-200" style={{ background: presetSwatch(p.bg) }} />
                    {p.name}
                  </button>
                ))}
              </div>
              <Field label="類型">
                <select className={inputCls} value={page.background.type} onChange={(e) => setBg({ type: e.target.value as LinksBackground['type'] })}>
                  <option value="paper">紙面（與首頁一致）</option>
                  <option value="color">純色</option>
                  <option value="gradient">漸層</option>
                  <option value="image">圖片</option>
                </select>
              </Field>
              {page.background.type !== 'paper' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label={page.background.type === 'gradient' ? '起始色' : page.background.type === 'image' ? '圖片載入前的底色' : '顏色'} value={page.background.color} onChange={(v) => setBg({ color: v })} />
                  {page.background.type === 'gradient' && <ColorField label="結束色" value={page.background.color2} onChange={(v) => setBg({ color2: v })} />}
                </div>
              )}
              {page.background.type === 'image' && (
                <>
                  <ImageField label="背景圖" hint="建議直式、至少 1080 寬" aspect="aspect-[9/16] max-w-[200px]" value={page.background.image} onChange={(v) => setBg({ image: v })} />
                  <Field label={`暗化 ${page.background.dim}%`} hint="圖片較花時調高，文字比較清楚">
                    <input type="range" min={0} max={80} step={5} value={page.background.dim} onChange={(e) => setBg({ dim: Number(e.target.value) })} className="w-full" />
                  </Field>
                </>
              )}
              <Field label="文字顏色">
                <select className={inputCls} value={page.background.tone} onChange={(e) => setBg({ tone: e.target.value as LinksBackground['tone'] })}>
                  <option value="light">深色字（淺色背景用）</option>
                  <option value="dark">白色字（深色背景用）</option>
                </select>
              </Field>
            </>
          )}

          {item && (
            <>
              <PanelTitle
                title={item.kind === 'project' ? '作品按鈕' : '自訂連結'}
                action={
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm('確定刪除這個按鈕？')) return;
                      setPage({ items: page.items.filter((i) => i.id !== item.id) });
                      setSelected('header');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 刪除
                  </button>
                }
              />
              <ItemFields item={item} projects={projects} set={(patch) => setItem(item.id, patch)} />
            </>
          )}

          {!item && selected !== 'header' && selected !== 'background' && (
            <p className="py-8 text-center text-sm text-slate-400">點左邊預覽畫面上的元素開始編輯</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {action}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
        <TextInput value={value} onChange={onChange} />
      </div>
    </Field>
  );
}

function ItemFields({ item, projects, set }: { item: LinkItem; projects: Project[]; set: (patch: Partial<LinkItem>) => void }) {
  const project = projects.find((p) => p.id === item.projectId);
  return (
    <>
      <Toggle checked={item.enabled} onChange={(v) => set({ enabled: v })} label="顯示這個按鈕" hint="關閉後前台不顯示，預覽中變淡" />
      {item.kind === 'project' ? (
        <>
          <Field label="作品" hint={project && !project.published ? '這個作品是草稿，前台不會顯示' : undefined}>
            <select className={inputCls} value={item.projectId || ''} onChange={(e) => set({ projectId: e.target.value })}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.published ? '' : '（草稿）'}
                </option>
              ))}
            </select>
          </Field>
          <Field label="點下去前往" hint={project?.demoUrl || '這個作品沒有線上網址，只能連到作品介紹頁'}>
            <select className={inputCls} value={item.target || 'case'} onChange={(e) => set({ target: e.target.value as LinkItem['target'] })}>
              <option value="case">作品介紹頁</option>
              <option value="demo" disabled={!project?.demoUrl}>
                線上網站／Demo
              </option>
            </select>
          </Field>
          <LInput label="按鈕文字（選填）" hint="留空使用作品標題" value={item.label} onChange={(v) => set({ label: v })} />
          <LInput label="小字說明（選填）" hint="留空使用作品副標" value={item.desc} onChange={(v) => set({ desc: v })} />
        </>
      ) : (
        <>
          <Field label="網址" hint="站外連結請以 https:// 開頭；站內頁面可填 /contact、/about">
            <TextInput value={item.url || ''} onChange={(v) => set({ url: v })} placeholder="https://..." />
          </Field>
          <LInput label="按鈕文字" value={item.label || emptyL()} onChange={(v) => set({ label: v })} />
          <LInput label="小字說明（選填）" value={item.desc} onChange={(v) => set({ desc: v })} />
        </>
      )}
      <Toggle checked={!!item.highlight} onChange={(v) => set({ highlight: v })} label="醒目樣式" hint="深色底，適合放最想讓人點的那一個" />
    </>
  );
}

/** 一次勾選多個作品加入清單 */
function ProjectPicker({ projects, onAdd, onCancel }: { projects: Project[]; onAdd: (ids: string[]) => void; onCancel: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  if (!projects.length) return <p className="py-2 text-xs text-slate-400">所有作品都已加入</p>;

  return (
    <div className="mt-1 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2">
        {projects.map((p) => (
          <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white">
            <input
              type="checkbox"
              checked={picked.includes(p.id)}
              onChange={(e) => setPicked(e.target.checked ? [...picked, p.id] : picked.filter((x) => x !== p.id))}
            />
            {p.coverImage && <img src={p.coverImage} alt="" className="h-6 w-6 rounded object-cover" />}
            <span className="truncate">{p.title}</span>
            {!p.published && <span className="shrink-0 text-[10px] text-slate-400">草稿</span>}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-white">
          取消
        </button>
        <button
          type="button"
          disabled={!picked.length}
          onClick={() => onAdd(picked)}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          加入 {picked.length || ''} 個作品
        </button>
      </div>
    </div>
  );
}
