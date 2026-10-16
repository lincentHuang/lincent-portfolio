'use client';

import React from 'react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { SectionHeading } from './section-heading';
import { Creases } from './paper';

/** 成果數字：一條深色數據帶，和其他卡片區塊做出節奏差異 */
export const WhyChooseMeSection: React.FC = () => {
  const { lang } = useI18n();
  const site = useSite();
  const c = site.whyChooseMe;

  return (
    <section id="why-choose-me" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <SectionHeading tag={tx(c.tag, lang)} title={tx(c.title, lang)} subtitle={tx(c.subtitle, lang)} />

      <div className="relative rounded-[28px] bg-[#121218] text-white overflow-hidden shadow-2xl shadow-slate-900/10">
        <div className="hidden lg:block">
          <Creases className="text-white/[0.08]" />
        </div>
        <dl className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {c.stats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-7 sm:p-8 flex flex-col gap-3 border-white/10 ${idx > 0 ? 'border-t sm:border-t-0' : ''} ${idx % 2 === 1 ? 'sm:border-l' : ''} ${idx >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${idx === 2 ? 'lg:border-l' : ''}`}
            >
              <dt className="order-2 text-sm font-semibold">{tx(stat.title, lang)}</dt>
              <dd className="order-1 text-[36px] sm:text-[40px] font-bold tracking-tight leading-none tabular-nums">{stat.value}</dd>
              <dd className="order-3 text-[13px] leading-relaxed text-white/55">{tx(stat.desc, lang)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
