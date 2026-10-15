'use client';

import React from 'react';
import { useI18n } from '../../../i18n';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { MediaImage } from '../../../components/media/media-image';
import { ArrowUpRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, lang } = useI18n();
  const site = useSite();
  const h = site.hero;

  return (
    <section className="pb-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Giant Rounded Hero Bento Container */}
      <div className="rounded-2xl bg-gradient-to-b from-[#E7E9EC] via-[#EEF0F3] to-[#E4E6EA] border border-[#D5D9E0] overflow-hidden relative p-8 sm:p-12 lg:p-16 min-h-[580px] lg:min-h-[640px] flex flex-col justify-between shadow-portfolio-card">
        {/* Background Subtle Noise / Mesh Gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-white/60 via-transparent to-transparent pointer-events-none" />

        {/* Top & Left Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
          <div className="lg:col-span-7 space-y-7 max-w-2xl">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-[#121218] leading-[1.06]">
              {tx(h.headlinePrefix, lang)} <br />
              {tx(h.headlineMain, lang)}
              <span className="font-serif italic font-normal text-slate-400">
                {tx(h.headlineHighlight, lang)}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-lg">
              {tx(h.subtitle, lang)}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Button 1: View Projects */}
              <a
                href="#projects"
                className="relative group overflow-hidden rounded-full px-7 py-3.5 bg-[#121218] text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center min-w-[140px] active:scale-95"
              >
                {/* Dynamic animated glow background */}
                <div
                  className="absolute inset-0 bg-[url('/images/button-glow.gif')] bg-cover bg-center opacity-85 mix-blend-screen group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"
                />
                <span className="relative z-10 font-medium tracking-wide">
                  {t.hero.viewProjects}
                </span>
              </a>

              {/* Button 2: Get in touch */}
              <a
                href="/contact"
                className="rounded-full px-6 py-3.5 bg-white/70 hover:bg-white text-slate-800 border border-slate-300/80 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                {t.hero.getInTouch}
              </a>
            </div>
          </div>
        </div>

        {/* Right Side Portrait Cutout (Desktop) */}
        <div className="hidden lg:block absolute right-0 bottom-0 top-0 w-[46%] pointer-events-none z-10">
          <MediaImage
            src={site.profile.heroImage}
            alt={tx(site.profile.name, lang)}
            priority
            className="w-full h-full object-contain object-bottom select-none"
          />
        </div>

        {/* Mobile / Tablet Portrait Cutout */}
        <div className="lg:hidden flex justify-center -mb-8 pt-2 relative z-10 pointer-events-none">
          <div className="relative [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
            <MediaImage
              src={site.profile.heroImage}
              alt={tx(site.profile.name, lang)}
              priority
              className="h-60 sm:h-72 object-contain select-none"
            />
          </div>
        </div>

        {/* Floating Frosted Glass Capsule (Bottom Right of Hero) */}
        <div className="hidden sm:flex absolute bottom-8 right-8 z-30 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 text-white max-w-[340px] shadow-2xl items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-300 font-mono block">
              {tx(h.booking.tag, lang)}
            </span>
            <h4 className="text-sm font-bold text-white leading-tight">
              {tx(h.booking.title, lang)}
            </h4>
            <p className="text-[11px] text-slate-300 leading-tight">
              {tx(h.booking.desc, lang)}
            </p>
          </div>
          <a
            href="/contact"
            className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center shrink-0 hover:scale-110 transition-transform shadow-md"
            title={t.hero.getInTouch}
          >
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>

        {/* Bottom Left Stats Row */}
        <div className="pt-12 sm:pt-16 mt-8 relative z-20 flex flex-wrap gap-8 sm:gap-14 border-t border-slate-300/60 max-w-xl">
          {h.stats.map((stat, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="font-sans font-bold text-2xl sm:text-3xl text-[#121218] block">
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {tx(stat.label, lang)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
