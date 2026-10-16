'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, GraduationCap } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { SectionHeading } from './section-heading';

const MAX_TAGS = 6;

/** 首頁的經歷摘要：時間軸 + 可展開的重點，完整內容放在 /resume */
export const ResumeSection: React.FC = () => {
  const { t, lang } = useI18n();
  const site = useSite();
  const c = site.experience;
  const edu = site.about.education[0];
  const zh = lang === 'zh';

  return (
    <section id="experience" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <SectionHeading
        tag={tx(c.tag, lang)}
        title={tx(c.title, lang)}
        subtitle={tx(c.subtitle, lang)}
        action={
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            {zh ? '完整履歷' : 'Full résumé'}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* 工作經歷 */}
        <ol className="lg:col-span-7 border-l border-slate-300 ml-1.5">
          {c.items.map((exp, idx) => {
            const location = tx(exp.location, lang);
            const duration = tx(exp.duration, lang);
            const tags = exp.techTags || [];
            return (
              <li key={exp.id || idx} className="relative pl-7 pb-9 last:pb-0">
                <span
                  className={`absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full ring-4 ring-[#F5F6F8] ${idx === 0 ? 'bg-[#121218]' : 'bg-slate-400'}`}
                  aria-hidden="true"
                />
                <div className="text-[12px] font-mono text-slate-500">
                  {exp.period}
                  {duration ? ` · ${duration}` : ''}
                </div>
                <h3 className="mt-1.5 text-base sm:text-lg font-bold text-[#121218]">
                  {tx(exp.role, lang)}
                  {exp.badge && tx(exp.badge, lang) && (
                    <span className="ml-2 align-middle px-2 py-0.5 rounded-full border border-slate-300 text-[10px] font-semibold text-slate-600">
                      {tx(exp.badge, lang)}
                    </span>
                  )}
                </h3>
                <div className="mt-0.5 text-[13px] text-slate-500">
                  {tx(exp.company, lang)}
                  {location ? ` · ${location}` : ''}
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tx(exp.summary, lang)}</p>

                {exp.highlights && exp.highlights.length > 0 && (
                  <details className="group mt-3" open={idx === 0}>
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] font-semibold text-slate-700 hover:text-[#121218] [&::-webkit-details-marker]:hidden">
                      {zh ? `做了什麼（${exp.highlights.length}）` : `Highlights (${exp.highlights.length})`}
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mt-3 space-y-2">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="relative pl-4 text-[13px] leading-relaxed text-slate-600">
                          <span className="absolute left-0 top-[9px] w-1.5 h-px bg-slate-400" aria-hidden="true" />
                          {tx(h, lang)}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.slice(0, MAX_TAGS).map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-white text-slate-600 border border-slate-200">
                        {tag}
                      </span>
                    ))}
                    {tags.length > MAX_TAGS && (
                      <span className="px-2 py-0.5 text-[11px] font-mono text-slate-400">+{tags.length - MAX_TAGS}</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* 技能與學歷 */}
        <aside className="lg:col-span-5 lg:sticky lg:top-8 space-y-5">
          <div className="p-6 sm:p-7 portfolio-card">
            <h3 className="text-[12px] font-semibold tracking-wide text-slate-500">{t.experience.coreStack}</h3>
            <div className="mt-5 space-y-5">
              {site.about.skills.map((group, gi) => (
                <div key={gi} className={gi > 0 ? 'pt-5 border-t border-slate-100' : ''}>
                  <span className="block text-[13px] font-bold text-[#121218]">{tx(group.category, lang)}</span>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {group.items.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-50 text-slate-700 border border-slate-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {edu && (
            <div className="p-6 portfolio-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#121218]">
                  {tx(edu.school, lang)} {tx(edu.department, lang)}
                </h4>
                <span className="text-xs font-mono text-slate-500">{edu.period}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};
