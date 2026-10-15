'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useSite } from '../../../content/content-provider';
import { tx } from '../../../content/types';
import { useI18n } from '../../../i18n';
import { MediaImage } from '../../../components/media/media-image';
import { Reveal } from './reveal';

export function AboutHero() {
  const { profile, about } = useSite();
  const { lang, isEn } = useI18n();

  return (
    <section className="px-4 sm:px-8 max-w-7xl mx-auto pb-12" aria-labelledby="about-title">
      <Reveal>
        <div className="rounded-2xl bg-gradient-to-b from-[#E7E9EC] via-[#EEF0F3] to-[#E4E6EA] border border-[#D5D9E0] overflow-hidden shadow-portfolio-card">
          {profile.aboutCover && (
            <div className="h-40 sm:h-56 w-full overflow-hidden">
              <MediaImage src={profile.aboutCover} alt="" priority className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-4">
                {profile.avatar && (
                  <MediaImage
                    src={profile.avatar}
                    variant="thumb"
                    alt={tx(profile.name, lang)}
                    priority
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                )}
                <div>
                  <p className="text-sm text-slate-500 font-medium">{tx(profile.title, lang)}</p>
                  <h1 id="about-title" className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-[#121218]">
                    {tx(profile.name, lang)}
                  </h1>
                </div>
              </div>

              <p className="text-xl sm:text-2xl font-sans font-semibold text-[#121218] leading-snug max-w-2xl">
                {tx(about.headline, lang)}
              </p>

              {about.motto.zh || about.motto.en ? (
                <blockquote className="border-l-2 border-brand-lime pl-4 font-serif italic text-lg sm:text-xl text-slate-500 max-w-xl">
                  {tx(about.motto, lang)}
                </blockquote>
              ) : null}

              <p className="text-base text-slate-600 leading-relaxed max-w-[68ch]">{tx(about.intro, lang)}</p>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {profile.availability.zh || profile.availability.en ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-300/70 px-3.5 py-2 font-medium text-slate-700">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-70 animate-ping motion-reduce:hidden" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-lime" />
                    </span>
                    {tx(profile.availability, lang)}
                  </span>
                ) : null}
                {profile.location.zh || profile.location.en ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-300/70 px-3.5 py-2 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5" aria-hidden />
                    {tx(profile.location, lang)}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/contact"
                  className="rounded-full px-7 py-3.5 bg-[#121218] text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  {isEn ? 'Contact me' : '聯絡我'}
                  <ArrowUpRight className="w-4 h-4" aria-hidden />
                </Link>
                <Link
                  href="/projects"
                  className="rounded-full px-6 py-3.5 bg-white/70 hover:bg-white text-slate-800 border border-slate-300/80 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  {isEn ? 'View projects' : '看作品'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
