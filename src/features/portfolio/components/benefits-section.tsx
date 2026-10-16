'use client';

import React from 'react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { SectionHeading } from './section-heading';
import { Creases } from './paper';

const SWATCHES = [
  { name: 'ink', className: 'bg-[#121218]' },
  { name: 'slate', className: 'bg-slate-500' },
  { name: 'mist', className: 'bg-[#E1E4E8]' },
  { name: 'paper', className: 'bg-white border border-slate-200' },
];

/** 卡片上方的小標 */
const CardTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{children}</span>
);

export const BenefitsSection: React.FC = () => {
  const { lang } = useI18n();
  const site = useSite();
  const c = site.benefits;
  const [design, perf, arch] = c.cards;

  return (
    <section id="benefits" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <SectionHeading tag={tx(c.tag, lang)} title={tx(c.title, lang)} subtitle={tx(c.subtitle, lang)} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* 設計系統 */}
        <div className="md:col-span-7 p-7 sm:p-9 portfolio-card flex flex-col gap-8">
          <div className="space-y-3">
            <CardTag>{tx(design?.tag, lang)}</CardTag>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121218]">{tx(design?.title, lang)}</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg">{tx(design?.desc, lang)}</p>
          </div>

          <div className="mt-auto grid grid-cols-[auto_1fr] gap-5 items-center rounded-2xl bg-gradient-to-br from-[#F2F3F5] to-[#E1E4E8] border border-[#D5D9E0] p-5">
            <span className="text-[44px] font-bold leading-none tracking-tight text-[#121218]" aria-hidden="true">
              Aa
            </span>
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2">
                {SWATCHES.map((s) => (
                  <span key={s.name} className="flex flex-col items-center gap-1">
                    <span className={`w-7 h-7 rounded-full ${s.className}`} />
                    <span className="text-[10px] font-mono text-slate-400">{s.name}</span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2" aria-hidden="true">
                <span className="px-3.5 py-1.5 rounded-full bg-[#121218] text-white text-xs font-medium">Primary</span>
                <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-medium">Secondary</span>
                <span className="px-3.5 py-1.5 rounded-full text-slate-500 text-xs font-medium">Ghost</span>
              </div>
            </div>
          </div>
        </div>

        {/* 效能與 SEO */}
        <div className="md:col-span-5 p-7 sm:p-9 portfolio-card flex flex-col gap-8">
          <div className="space-y-3">
            <CardTag>{tx(perf?.tag, lang)}</CardTag>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121218]">{tx(perf?.title, lang)}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tx(perf?.desc, lang)}</p>
          </div>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#F2F3F5] to-[#E1E4E8] border border-[#D5D9E0] p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-mono text-slate-500">Lighthouse</span>
              <span className="text-[11px] text-slate-400">{lang === 'zh' ? 'kryptoGO 官網實測' : 'Measured on kryptoGO.com'}</span>
            </div>
            <div className="mt-3 flex items-end gap-5">
              <span className="text-[44px] font-bold leading-none tracking-tight text-[#121218]">99</span>
              <dl className="flex gap-5 pb-1 text-[#121218]">
                <div>
                  <dt className="text-[10px] font-mono text-slate-400">FCP</dt>
                  <dd className="text-sm font-bold">0.4s</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono text-slate-400">LCP</dt>
                  <dd className="text-sm font-bold">0.8s</dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full w-[99%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* 工程架構 */}
        <div className="relative overflow-hidden md:col-span-12 p-7 sm:p-9 portfolio-card grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8 md:items-center">
          <div className="hidden md:block">
            <Creases variant="left" className="text-slate-400/25" />
          </div>
          <div className="relative space-y-3">
            <CardTag>{tx(arch?.tag, lang)}</CardTag>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121218]">{tx(arch?.title, lang)}</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">{tx(arch?.desc, lang)}</p>
          </div>

          <div className="relative flex flex-wrap gap-2 md:justify-end">
            {(arch?.chips || []).map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/70 text-slate-700 border border-slate-300/70">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
