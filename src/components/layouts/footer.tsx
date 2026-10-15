'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '../../i18n';
import { useSite } from '../../content/content-provider';
import { tx } from '../../content/types';
import { ArrowUp, Code2, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, lang } = useI18n();
  const { profile } = useSite();
  const name = tx(profile.name, lang) || 'Lincent Huang';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      {/* 寬度與內距和作品頁內容一致，分隔線畫在內層才會對齊卡片邊緣 */}
      <div className="py-16 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-sans font-bold text-xl tracking-tight text-slate-900 block">
              {name}
            </span>
            <p className="text-xs text-slate-500 font-mono">
              {[tx(profile.title, lang), tx(profile.location, lang)].filter(Boolean).join(' • ')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="/#benefits" className="hover:text-black transition-colors">
              {t.nav.benefits}
            </a>
            <Link href="/projects" className="hover:text-black transition-colors">
              {t.nav.projects}
            </Link>
            <a href="/#services" className="hover:text-black transition-colors">
              {t.nav.services}
            </a>
            <a href="/#process" className="hover:text-black transition-colors">
              {t.nav.process}
            </a>
            <a href="/#experience" className="hover:text-black transition-colors">
              {t.nav.experience}
            </a>
          </div>

          {/* Social / Top */}
          <div className="flex items-center gap-3">
            {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition-all shadow-xs"
              title="GitHub"
            >
              <Code2 className="w-4 h-4" />
            </a>
            )}
            {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition-all shadow-xs"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            )}
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition-all shadow-xs"
              title={t.footer.backToTop}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <span>© {new Date().getFullYear()} {t.footer.copyright}</span>
          <span>{t.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  );
};
