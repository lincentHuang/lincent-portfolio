'use client';

import React from 'react';
import { Field, LInput, ListEditor, SectionCard, TagsInput, TextInput, Toggle, emptyL } from '../shared/fields';
import { ImageField } from '../shared/media';
import { useSiteDraft } from '../shared/site-draft';
import { Loading } from './profile-editor';
import { HeaderFields } from './experience-editor';
import type { SectionKey, SiteContent } from '../../../content/types';

const SECTION_LABELS: { key: SectionKey; label: string; hint?: string }[] = [
  { key: 'benefits', label: '核心優勢' },
  { key: 'projects', label: '精選作品' },
  { key: 'whyChooseMe', label: '核心價值' },
  { key: 'services', label: '服務項目' },
  { key: 'process', label: '合作流程' },
  { key: 'testimonials', label: '推薦評價', hint: '只放真實推薦' },
  { key: 'experience', label: '工作經歷' },
  { key: 'contact', label: '聯繫入口（導向 /contact）' },
];

function HiddenBadge({ show }: { show: boolean }) {
  return show ? (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">前台目前隱藏</span>
  ) : null;
}

export function HomeEditor() {
  const { site, update } = useSiteDraft();
  if (!site) return <Loading />;
  const off = (k: SectionKey) => !site.sections[k];
  const patch = <K extends keyof SiteContent>(key: K, p: Partial<SiteContent[K]>) =>
    update((s) => ({ ...s, [key]: { ...(s[key] as object), ...(p as object) } }));
  const { hero, benefits, whyChooseMe, services, process, testimonials } = site;

  return (
    <div className="space-y-6">
      <SectionCard title="區塊顯示與順序說明" description="關閉後該區塊不會出現在首頁；前台順序固定為下方卡片由上到下。">
        <div className="grid gap-2 md:grid-cols-2">
          {SECTION_LABELS.map((s) => (
            <Toggle
              key={s.key}
              label={s.label}
              hint={s.hint}
              checked={site.sections[s.key]}
              onChange={(v) => update((st) => ({ ...st, sections: { ...st.sections, [s.key]: v } }))}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Hero 首屏" previewHref="/">
        <LInput label="標題前綴" value={hero.headlinePrefix} onChange={(v) => patch('hero', { headlinePrefix: v })} />
        <LInput label="標題主文" value={hero.headlineMain} onChange={(v) => patch('hero', { headlineMain: v })} />
        <LInput
          label="標題強調字"
          hint="強調字會以斜體灰色襯線字體顯示"
          value={hero.headlineHighlight}
          onChange={(v) => patch('hero', { headlineHighlight: v })}
        />
        <LInput label="副標" value={hero.subtitle} onChange={(v) => patch('hero', { subtitle: v })} multiline rows={3} />
        <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <span className="block text-xs font-bold text-slate-700">預約卡片</span>
          <LInput label="小標" value={hero.booking.tag} onChange={(v) => patch('hero', { booking: { ...hero.booking, tag: v } })} />
          <LInput label="標題" value={hero.booking.title} onChange={(v) => patch('hero', { booking: { ...hero.booking, title: v } })} />
          <LInput label="說明" value={hero.booking.desc} onChange={(v) => patch('hero', { booking: { ...hero.booking, desc: v } })} multiline rows={2} />
        </div>
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-700">數據統計</span>
          <ListEditor
            items={hero.stats}
            onChange={(stats) => patch('hero', { stats })}
            addLabel="新增數據"
            createItem={() => ({ value: '', label: emptyL() })}
            itemTitle={(s) => `${s.value} ${s.label.zh}`}
            renderItem={(s, up) => (
              <>
                <Field label="數值">
                  <TextInput value={s.value} onChange={(v) => up({ value: v })} />
                </Field>
                <LInput label="標籤" value={s.label} onChange={(v) => up({ label: v })} />
              </>
            )}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="核心優勢"
        previewHref="/#benefits"
        description="版面固定顯示 3 張卡片，最多只能新增 3 張。"
        actions={<HiddenBadge show={off('benefits')} />}
      >
        <HeaderFields value={benefits} onChange={(h) => patch('benefits', h)} />
        <ListEditor
          items={benefits.cards}
          max={3}
          onChange={(cards) => patch('benefits', { cards })}
          addLabel="新增卡片"
          createItem={() => ({ tag: emptyL(), title: emptyL(), desc: emptyL(), chips: [] as string[] })}
          itemTitle={(c) => c.title.zh}
          renderItem={(c, up) => (
            <>
              <LInput label="小標" value={c.tag} onChange={(v) => up({ tag: v })} />
              <LInput label="標題" value={c.title} onChange={(v) => up({ title: v })} />
              <LInput label="說明" value={c.desc} onChange={(v) => up({ desc: v })} multiline rows={3} />
              <TagsInput label="標籤" value={c.chips} onChange={(chips) => up({ chips })} />
            </>
          )}
        />
      </SectionCard>

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-3 text-xs text-sky-800">
        精選作品的內容在「作品管理」設定（勾選『首頁精選』）。
      </div>

      <SectionCard title="核心價值" previewHref="/#why-choose-me" actions={<HiddenBadge show={off('whyChooseMe')} />}>
        <HeaderFields value={whyChooseMe} onChange={(h) => patch('whyChooseMe', h)} />
        <ListEditor
          items={whyChooseMe.stats}
          onChange={(stats) => patch('whyChooseMe', { stats })}
          addLabel="新增項目"
          createItem={() => ({ value: '', title: emptyL(), desc: emptyL() })}
          itemTitle={(s) => `${s.value} ${s.title.zh}`}
          renderItem={(s, up) => (
            <>
              <Field label="數值">
                <TextInput value={s.value} onChange={(v) => up({ value: v })} />
              </Field>
              <LInput label="標題" value={s.title} onChange={(v) => up({ title: v })} />
              <LInput label="說明" value={s.desc} onChange={(v) => up({ desc: v })} multiline rows={2} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard title="服務項目" previewHref="/#services" actions={<HiddenBadge show={off('services')} />}>
        <HeaderFields value={services} onChange={(h) => patch('services', h)} />
        <ListEditor
          items={services.items}
          onChange={(items) => patch('services', { items })}
          addLabel="新增服務"
          createItem={() => ({ title: emptyL(), desc: emptyL(), tags: [] as string[] })}
          itemTitle={(s) => s.title.zh}
          renderItem={(s, up) => (
            <>
              <LInput label="標題" value={s.title} onChange={(v) => up({ title: v })} />
              <LInput label="說明" value={s.desc} onChange={(v) => up({ desc: v })} multiline rows={3} />
              <TagsInput label="標籤" value={s.tags} onChange={(tags) => up({ tags })} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard
        title="合作流程"
        description="步驟編號由系統依順序自動產生。"
        previewHref="/#process"
        actions={<HiddenBadge show={off('process')} />}
      >
        <HeaderFields value={process} onChange={(h) => patch('process', h)} />
        <ListEditor
          items={process.steps}
          onChange={(steps) => patch('process', { steps })}
          addLabel="新增步驟"
          createItem={() => ({ title: emptyL(), desc: emptyL() })}
          itemTitle={(s) => s.title.zh}
          renderItem={(s, up) => (
            <>
              <LInput label="標題" value={s.title} onChange={(v) => up({ title: v })} />
              <LInput label="說明" value={s.desc} onChange={(v) => up({ desc: v })} multiline rows={2} />
            </>
          )}
        />
      </SectionCard>

      <SectionCard
        title="推薦評價"
        description="只放真實推薦。"
        previewHref="/#testimonials"
        actions={<HiddenBadge show={off('testimonials')} />}
      >
        <HeaderFields value={testimonials} onChange={(h) => patch('testimonials', h)} />
        <ListEditor
          items={testimonials.items}
          onChange={(items) => patch('testimonials', { items })}
          addLabel="新增評價"
          createItem={() => ({ quote: emptyL(), author: '', role: emptyL(), avatar: '' })}
          itemTitle={(t) => t.author}
          renderItem={(t, up) => (
            <>
              <LInput label="評價內容" value={t.quote} onChange={(v) => up({ quote: v })} multiline rows={4} />
              <Field label="署名">
                <TextInput value={t.author} onChange={(v) => up({ author: v })} />
              </Field>
              <LInput label="職稱／公司" value={t.role} onChange={(v) => up({ role: v })} />
              <div className="max-w-[120px]">
                <ImageField label="頭像" aspect="aspect-square" value={t.avatar} onChange={(v) => up({ avatar: v })} />
              </div>
            </>
          )}
        />
      </SectionCard>
    </div>
  );
}
