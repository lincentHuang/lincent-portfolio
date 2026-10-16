'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { ORIGAMI_MODELS } from '../../../components/brand/origami-models';
import { Eyebrow, PaperPanel } from './paper';

// three.js 只在瀏覽器端載入，並與首屏程式碼分開打包
const OrigamiFold3D = dynamic(() => import('../../../components/brand/origami-fold-3d').then((m) => m.OrigamiFold3D), { ssr: false });

export const HeroSection: React.FC = () => {
  const { t, lang } = useI18n();
  const site = useSite();
  const h = site.hero;
  const [model, setModel] = React.useState(0);
  const next = () => setModel((m) => (m + 1) % ORIGAMI_MODELS.length);

  return (
    <section className="pb-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <PaperPanel>
        <div className="relative grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:min-h-[640px]">
          {/* Left: copy */}
          <div className="relative z-20 flex flex-col px-7 pt-9 pb-2 sm:px-12 sm:pt-12 xl:pl-14 xl:pr-4 xl:py-14">
            <Eyebrow dot="live">
              {tx(site.profile.name, lang)} · {tx(site.profile.title, lang)}
            </Eyebrow>

            <h1 className="mt-7 text-[32px] sm:text-[46px] xl:text-[48px] font-bold tracking-[-0.02em] text-[#121218] leading-[1.14]">
              <span className="xl:whitespace-nowrap">{tx(h.headlinePrefix, lang)}</span>
              <br />
              <span className="xl:whitespace-nowrap">
                {tx(h.headlineMain, lang)}
                <span className="font-serif italic font-normal text-slate-400">{tx(h.headlineHighlight, lang)}</span>
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] sm:text-[17px] leading-relaxed text-slate-600 [text-wrap:pretty]">{tx(h.subtitle, lang)}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-[#121218] pl-6 pr-5 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-slate-900/15 transition-all hover:shadow-xl active:scale-95"
              >
                <span className="absolute inset-0 bg-[url('/images/button-glow.gif')] bg-cover bg-center opacity-70 mix-blend-screen transition-opacity group-hover:opacity-100 pointer-events-none" />
                <span className="relative">{t.hero.viewProjects}</span>
                <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/60 px-6 py-3.5 text-[13px] font-semibold text-slate-800 transition-colors hover:bg-white active:scale-95"
              >
                {t.hero.getInTouch}
              </a>
            </div>

            {/* Stats */}
            <dl className="mt-12 xl:mt-auto pt-6 grid grid-cols-3 max-w-lg border-t border-slate-300/70">
              {h.stats.map((stat, idx) => (
                <div key={idx} className={idx === 0 ? 'pr-4' : 'px-4 border-l border-slate-300/70'}>
                  <dt className="sr-only">{tx(stat.label, lang)}</dt>
                  <dd className="text-[26px] sm:text-[32px] font-bold tracking-tight text-[#121218] leading-none">{stat.value}</dd>
                  <dd className="mt-2 text-[12px] leading-snug text-slate-500">{tx(stat.label, lang)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: origami */}
          <div className="relative flex flex-col">
            <div className="relative h-[340px] sm:h-[440px] xl:h-auto xl:flex-1">
              <OrigamiFold3D index={model} onClick={next} className="absolute inset-0 cursor-pointer" />
            </div>

            {/* Model switcher */}
            <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 backdrop-blur pl-4 pr-1.5 py-1">
              <span className="text-[12px] font-medium text-slate-600 tabular-nums">
                {String(model + 1).padStart(2, '0')} · {tx(ORIGAMI_MODELS[model].label, lang)}
              </span>
              <div className="flex items-center">
                {ORIGAMI_MODELS.map((m, i) => (
                  <button key={m.key} type="button" onClick={() => setModel(i)} aria-label={tx(m.label, lang)} aria-pressed={i === model} className="p-1.5">
                    <span className={`block h-1.5 rounded-full transition-all ${i === model ? 'w-4 bg-[#121218]' : 'w-1.5 bg-slate-400/70 hover:bg-slate-500'}`} />
                  </button>
                ))}
              </div>
            </div>

            <p className="absolute right-7 top-[72px] z-20 hidden sm:block text-[12px] text-slate-500 pointer-events-none">
              {lang === 'zh' ? '點一下紙，摺成下一個' : 'Tap the paper to fold the next one'}
            </p>

            {/* Booking */}
            <a
              href="/contact"
              className="relative mx-5 mb-5 sm:mx-7 sm:mb-7 xl:m-0 xl:absolute xl:right-7 xl:bottom-7 z-20 flex items-center gap-4 rounded-2xl border border-white/15 bg-[#121218]/85 backdrop-blur-xl p-4 pl-5 text-white shadow-2xl xl:max-w-[320px] transition-transform hover:-translate-y-0.5"
            >
              <div className="space-y-1 min-w-0">
                <span className="block text-[11px] font-mono text-slate-400">{tx(h.booking.tag, lang)}</span>
                <span className="block text-sm font-bold leading-tight">{tx(h.booking.title, lang)}</span>
                <span className="block text-[11px] leading-snug text-slate-400">{tx(h.booking.desc, lang)}</span>
              </div>
              <span className="w-10 h-10 shrink-0 rounded-xl bg-white text-slate-900 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </a>
          </div>
        </div>
      </PaperPanel>
    </section>
  );
};
