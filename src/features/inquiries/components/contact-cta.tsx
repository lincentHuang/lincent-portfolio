'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, CalendarClock, Layers, MessageCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { Creases, Eyebrow } from '../../portfolio/components/paper';
import { CONTACT_OPTIONS, PRICING_ENABLED, type EngagementId } from '../pricing';

const ICONS: Record<EngagementId, React.ElementType> = {
  fulltime: Briefcase,
  contract: CalendarClock,
  project: Layers,
  other: MessageCircle,
};

/** 首頁、作品頁底部的聯繫入口：只放一句話和三個選項，詳細流程在 /contact */
export const ContactCta: React.FC = () => {
  const { t, lang, isEn } = useI18n();

  return (
    <section id="contact" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-6">
      <div className="relative overflow-hidden p-7 sm:p-12 rounded-[28px] bg-[#121218] text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 hidden lg:block">
          <Creases className="text-white/[0.08]" />
        </div>
        <div className="relative lg:col-span-6 flex flex-col">
          <Eyebrow dot="live" tone="dark">
            {isEn ? 'Work with me' : '與我聯繫'}
          </Eyebrow>
          <h2 className="mt-5 text-[28px] sm:text-[38px] font-bold tracking-[-0.02em] leading-[1.18]">
            <span className="inline-block">{t.contact.titlePrefix}</span> <span className="inline-block font-serif italic font-normal text-slate-400">{t.contact.titleItalic}</span>
          </h2>
          <p className="mt-4 text-[15px] text-white/60 leading-relaxed">
            {isEn ? 'A few quick steps, reply within 24 hours.' : '幾個簡單步驟就能送出，24 小時內回覆。'}
          </p>
        </div>

        <div className="relative lg:col-span-6 space-y-2.5">
          {CONTACT_OPTIONS.map((e) => {
            const Icon = ICONS[e.id];
            return (
              <Link
                key={e.id}
                href={`/contact?type=${e.id}`}
                className="group flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white hover:text-[#121218] transition-colors"
              >
                <Icon className="w-5 h-5 text-white/60 group-hover:text-[#121218] shrink-0" />
                <span className="flex-1 font-semibold text-sm">{e.name[lang]}</span>
                {PRICING_ENABLED && (
                  <span className="hidden sm:block text-xs text-white/50 group-hover:text-slate-500">{e.price[lang]}</span>
                )}
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
