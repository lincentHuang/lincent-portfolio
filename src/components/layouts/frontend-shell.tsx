'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '../../i18n';
import { GlobalSidebar } from './global-sidebar';
import { Globe, Menu, X } from 'lucide-react';
import { SmoothScrollProvider } from '../providers/smooth-scroll-provider';

interface FrontendShellProps {
  children: React.ReactNode;
  activeProjectId?: string;
}

export const FrontendShell: React.FC<FrontendShellProps> = ({
  children,
  activeProjectId,
}) => {
  const { lang, toggleLang, t } = useI18n();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SmoothScrollProvider duration={1.2}>
      <div className="min-h-screen bg-[#F7F7F8] text-[#121218] flex flex-col lg:flex-row w-full selection:bg-lime-400 selection:text-[#121218] relative">
        {/* 1. MOBILE RESPONSIVE TOP BAR */}
        <header className="lg:hidden sticky top-0 z-40 w-full bg-[#F7F7F8]/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/images/lincent-logo-animated.svg"
              alt="lincent"
              className="w-7 h-7 object-contain"
            />
            <span className="font-sans font-bold text-base tracking-tight text-slate-900">
              lincent
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'zh' ? '繁中' : 'EN'}</span>
            </button>

            {/* Let's talk link */}
            <Link
              href="/contact"
              className="px-3 py-1.5 rounded-lg bg-[#121218] text-white text-xs font-semibold hover:bg-black shadow-xs"
            >
              {t.common.talk}
            </Link>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 shadow-xs"
              aria-label="打開選單 / Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. MOBILE DRAWER SLIDE-OVER */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative w-[88%] max-w-[360px] h-full bg-[#F7F7F8] shadow-2xl flex flex-col z-10 overflow-hidden">
              {/* Drawer Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200/80 bg-white/80 shrink-0">
                <span className="font-sans font-bold text-sm tracking-tight text-slate-900">
                  Navigation
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-black"
                  aria-label="關閉選單"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Content inside Drawer with Lenis scroll prevention */}
              <div className="flex-1 min-h-0 overflow-hidden" data-lenis-prevent>
                <GlobalSidebar
                  onItemClick={() => setIsMobileMenuOpen(false)}
                  activeProjectId={activeProjectId}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. DESKTOP STICKY SIDEBAR */}
        <aside
          className="hidden lg:block w-[360px] xl:w-[380px] shrink-0 basis-[360px] xl:basis-[380px] sticky top-0 h-screen max-h-screen overflow-hidden border-r border-slate-200/80 bg-[#F7F7F8] z-30"
        >
          <GlobalSidebar activeProjectId={activeProjectId} />
        </aside>

        {/* 4. MAIN PAGE CONTENT COLUMN */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </SmoothScrollProvider>
  );
};
