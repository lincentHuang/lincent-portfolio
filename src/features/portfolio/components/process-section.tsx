'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { SectionHeading } from './section-heading';
import { PaperPanel } from './paper';

/** 流程：和 hero 同一張漸層紙面板，左邊標題與預約卡，右邊六步用 hero 數據列的分隔線排 */
export const ProcessSection: React.FC = () => {
  const { lang } = useI18n();
  const site = useSite();
  const c = site.process;
  const zh = lang === 'zh';

  return (
    <section id="process" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <PaperPanel creases="left">
        <div className="grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 xl:gap-12 px-7 py-9 sm:px-12 sm:py-12 xl:p-14">
          <div className="flex flex-col">
            <SectionHeading tag={tx(c.tag, lang)} title={tx(c.title, lang)} subtitle={tx(c.subtitle, lang)} className="" />

            <Link
              href="/contact"
              className="mt-10 xl:mt-auto flex items-center gap-4 self-start rounded-2xl border border-white/15 bg-[#121218]/90 backdrop-blur-xl p-4 pl-5 text-white shadow-2xl max-w-[340px] transition-transform hover:-translate-y-0.5"
            >
              <div className="space-y-1 min-w-0">
                <span className="block text-[11px] font-mono text-slate-400">{zh ? '從第一步開始' : 'Start with step one'}</span>
                <span className="block text-sm font-bold leading-tight">{zh ? '先聊聊你的需求' : 'Tell me what you need'}</span>
                <span className="block text-[11px] leading-snug text-slate-400">{zh ? '幾個問題就能送出，24 小時內回覆。' : 'A few quick questions, reply within 24 hours.'}</span>
              </div>
              <span className="w-10 h-10 shrink-0 rounded-xl bg-white text-slate-900 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </Link>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 border-t border-slate-300/70">
            {c.steps.map((s, idx) => (
              <li
                key={idx}
                className={`group py-6 border-b border-slate-300/70 sm:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0 ${
                  idx % 2 === 1 ? 'sm:pl-7 sm:border-l' : 'sm:pr-7'
                }`}
              >
                <span className="block text-[26px] sm:text-[30px] font-bold tracking-tight leading-none text-slate-300 tabular-nums transition-colors group-hover:text-[#121218]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[17px] font-bold text-[#121218]">{tx(s.title, lang)}</h3>
                <p className="mt-1.5 text-[13px] sm:text-sm text-slate-600 leading-relaxed">{tx(s.desc, lang)}</p>
              </li>
            ))}
          </ol>
        </div>
      </PaperPanel>
    </section>
  );
};
