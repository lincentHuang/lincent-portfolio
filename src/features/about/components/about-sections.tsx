'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import type { ExperienceItem } from '../../../content/types';
import { useI18n } from '../../../i18n';
import { MediaImage } from '../../../components/media/media-image';
import { Reveal, SectionHead } from './reveal';

const wrap = 'px-4 sm:px-8 max-w-7xl mx-auto py-10 sm:py-14';

export function Principles() {
  const { about } = useSite();
  const { lang, isEn } = useI18n();
  if (!about.principles.length) return null;
  return (
    <section className={wrap} aria-labelledby="principles-h">
      <SectionHead id="principles-h" eyebrow="Principles" title={isEn ? 'How I work' : '我的堅持'} />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {about.principles.map((p, i) => (
          <li key={i}>
            <Reveal delay={i * 0.05} className="h-full">
              <div className="portfolio-card p-6 h-full">
                <span className="font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-lg font-bold text-[#121218]">{tx(p.title, lang)}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{tx(p.desc, lang)}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Story() {
  const { about } = useSite();
  const { lang, isEn } = useI18n();
  if (!about.story.length) return null;
  return (
    <section className={wrap} aria-labelledby="story-h">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <SectionHead id="story-h" eyebrow="Story" title={isEn ? 'My story' : '我的故事'} />
          </div>
        </div>
        <div className="lg:col-span-8 space-y-10">
          {about.story.map((b, i) => (
            <Reveal key={i}>
              <article className="max-w-[68ch]">
                <span className="font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 text-xl font-bold text-[#121218]">{tx(b.title, lang)}</h3>
                <p className="mt-3 text-base text-slate-600 leading-[1.85] whitespace-pre-line">{tx(b.body, lang)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineEntry({ item, last }: { item: ExperienceItem; last: boolean }) {
  const { lang, isEn } = useI18n();
  const [open, setOpen] = React.useState(false);
  const hasHighlights = item.highlights.length > 0;
  const panelId = `exp-${item.id}`;
  return (
    <li className="relative pl-8 sm:pl-10 pb-10 last:pb-0">
      {!last && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-300" aria-hidden />}
      <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-[#121218]" aria-hidden />
      <Reveal>
        <div className="portfolio-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
            <time>{item.period}</time>
            {tx(item.duration, lang) && <span>· {tx(item.duration, lang)}</span>}
            {tx(item.location, lang) && <span>· {tx(item.location, lang)}</span>}
            {item.badge && tx(item.badge, lang) && (
              <span className="rounded-full bg-brand-limeLight text-brand-limeDark px-2.5 py-0.5 font-sans font-semibold">
                {tx(item.badge, lang)}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            {item.logo && (
              <MediaImage src={item.logo} variant="thumb" alt="" className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white" />
            )}
            <div>
              <h3 className="text-lg font-bold text-[#121218] leading-tight">{tx(item.role, lang)}</h3>
              <p className="text-sm text-slate-500">{tx(item.company, lang)}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tx(item.summary, lang)}</p>

          {hasHighlights && (
            <>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#121218] hover:text-slate-500"
              >
                {open ? (isEn ? 'Hide highlights' : '收合重點') : isEn ? 'Show highlights' : '展開重點'}
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {open && (
                <ul id={panelId} className="mt-3 space-y-2 list-disc pl-5 text-sm text-slate-600 leading-relaxed marker:text-slate-300">
                  {item.highlights.map((h, i) => (
                    <li key={i}>{tx(h, lang)}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          {item.techTags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {item.techTags.map((t) => (
                <li key={t} className="rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono px-2.5 py-1">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </li>
  );
}

export function Career() {
  const { experience } = useSite();
  const { lang, isEn } = useI18n();
  if (!experience.items.length) return null;
  return (
    <section className={wrap} aria-labelledby="career-h">
      <SectionHead id="career-h" eyebrow="Career" title={tx(experience.title, lang) || (isEn ? 'Career journey' : '職涯歷程')} />
      {tx(experience.subtitle, lang) && (
        <p className="-mt-5 mb-8 text-sm text-slate-500 max-w-[68ch]">{tx(experience.subtitle, lang)}</p>
      )}
      <ol className="max-w-3xl">
        {experience.items.map((it, i) => (
          <TimelineEntry key={it.id || i} item={it} last={i === experience.items.length - 1} />
        ))}
      </ol>
    </section>
  );
}

export function Skills() {
  const { about } = useSite();
  const { lang, isEn } = useI18n();
  if (!about.skills.length) return null;
  return (
    <section className={wrap} aria-labelledby="skills-h">
      <SectionHead id="skills-h" eyebrow="Skills" title={isEn ? 'Skills & tools' : '專長與工具'} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {about.skills.map((g, i) => (
          <Reveal key={i} delay={(i % 2) * 0.05}>
            <div className="portfolio-card p-6 h-full">
              <h3 className="text-sm font-bold text-[#121218]">{tx(g.category, lang)}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="rounded-full border border-slate-200 bg-[#F7F7F8] text-slate-700 text-xs font-medium px-3 py-1.5">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function EducationLanguages() {
  const { about } = useSite();
  const { lang, isEn } = useI18n();
  const hasEdu = about.education.length > 0;
  const hasLang = about.languages.length > 0;
  if (!hasEdu && !hasLang) return null;
  return (
    <section className={`${wrap} grid grid-cols-1 lg:grid-cols-2 gap-8`}>
      {hasEdu && (
        <div aria-labelledby="edu-h">
          <SectionHead id="edu-h" eyebrow="Education" title={isEn ? 'Education' : '學歷'} />
          <ul className="space-y-4">
            {about.education.map((e, i) => (
              <li key={i}>
                <Reveal>
                  <div className="portfolio-card p-6">
                    <p className="font-mono text-xs text-slate-400">{e.period}</p>
                    <h3 className="mt-1 text-lg font-bold text-[#121218]">{tx(e.school, lang)}</h3>
                    <p className="text-sm text-slate-500">{tx(e.department, lang)}</p>
                    {tx(e.highlights, lang) && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tx(e.highlights, lang)}</p>
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasLang && (
        <div aria-labelledby="lang-h">
          <SectionHead id="lang-h" eyebrow="Languages" title={isEn ? 'Languages' : '語言'} />
          <Reveal>
            <dl className="portfolio-card divide-y divide-slate-100">
              {about.languages.map((l, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-sm font-bold text-[#121218]">{tx(l.name, lang)}</dt>
                  <dd className="text-sm text-slate-500 text-right">{tx(l.level, lang)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      )}
    </section>
  );
}

export function Preferences() {
  const { about } = useSite();
  const { lang, isEn } = useI18n();
  return (
    <section className={wrap} aria-labelledby="pref-h">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {about.preferences.length > 0 && (
          <div className="lg:col-span-7">
            <SectionHead id="pref-h" eyebrow="Preferences" title={isEn ? 'What I am looking for' : '求職條件'} />
            <Reveal>
              <dl className="portfolio-card divide-y divide-slate-100">
                {about.preferences.map((p, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 px-6 py-4">
                    <dt className="text-xs font-mono text-slate-400 pt-0.5">{tx(p.label, lang)}</dt>
                    <dd className="col-span-2 text-sm text-slate-700 leading-relaxed">{tx(p.value, lang)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        )}
        <div className={about.preferences.length > 0 ? 'lg:col-span-5 lg:pt-[88px]' : 'lg:col-span-12'}>
          <Reveal className="h-full">
            <div className="portfolio-dark-card rounded-2xl p-8 h-full flex flex-col justify-between gap-6 bg-[#121218] text-white">
              <h2 className="text-2xl font-sans font-bold leading-snug">
                {isEn ? "Let's build something worth shipping." : '一起把好產品做出來。'}
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="rounded-full px-6 py-3 bg-white text-[#121218] text-xs font-semibold hover:scale-105 transition-transform">
                  {isEn ? 'Contact me' : '聯絡我'}
                </Link>
                <Link href="/projects" className="rounded-full px-6 py-3 border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
                  {isEn ? 'View projects' : '看作品'}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
