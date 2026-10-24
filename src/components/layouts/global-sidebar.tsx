'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import Lenis from 'lenis';
import {
  selectedProjectAtom,
  sidebarScrollPositionAtom,
  type Project,
} from '../../store/atoms';
import { useProjects, useSite } from '../../content/content-provider';
import { tx } from '../../content/types';
import { MediaImage } from '../media/media-image';
import { useI18n } from '../../i18n';
import { ProjectBadgeIcon, getShortProjectTitle } from '../../features/projects/components/project-badge-icon';
import { usePageTransition } from '../providers/page-transition-provider';
import { useSmoothScroll } from '../providers/smooth-scroll-provider';
import {
  Globe,
  Search,
  Mail,
  Lock,
  User,
  FolderOpen,
} from 'lucide-react';

// Module-level cache to preserve scroll position during client-side route transitions
let cachedSidebarScrollTop: number | null = null;

// 從其他頁面點側欄作品時，回到首頁後要捲到的作品 id
let pendingWorkId: string | null = null;

const getSavedScrollTop = (): number => {
  if (typeof window === 'undefined') return 0;
  if (cachedSidebarScrollTop !== null) return cachedSidebarScrollTop;
  try {
    const saved = sessionStorage.getItem('sidebar_scroll_top');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {}
  return 0;
};

const persistScrollTop = (top: number) => {
  cachedSidebarScrollTop = top;
  try {
    sessionStorage.setItem('sidebar_scroll_top', String(Math.round(top)));
  } catch {}
};

export const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

interface GlobalSidebarProps {
  onItemClick?: () => void;
  activeProjectId?: string;
}

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
  onItemClick,
  activeProjectId,
}) => {
  const { lang, toggleLang, t, isEn } = useI18n();
  const projects = useProjects();
  const site = useSite();
  const profile = site.profile;
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);
  const [, setSidebarScrollPos] = useAtom(sidebarScrollPositionAtom);
  const pathname = usePathname();
  const router = useRouter();
  const { transitionTo } = usePageTransition();

  const isProjects = pathname.startsWith('/projects');
  const isHome = pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const { scrollTo } = useSmoothScroll();

  // 首頁：側欄只是快速導航，active 跟著主頁捲到哪個作品（scroll-spy）
  const [spyId, setSpyId] = useState<string | null>(null);
  const spyLockUntilRef = useRef(0);

  // Scroll container and card refs for collapse animation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const initialPositionedRef = useRef(false);

  // Determine active project ID based on props, URL params, or Jotai state
  const currentActiveId = useMemo(() => {
    if (activeProjectId) return activeProjectId;
    if (pathname.startsWith('/projects/')) {
      const seg = pathname.replace('/projects/', '').split('/')[0];
      if (seg) return seg;
    }
    return selectedProject?.id || (projects.length > 0 ? projects[0].id : '');
  }, [activeProjectId, pathname, selectedProject, projects]);

  // 實際高亮的作品：首頁看 scroll-spy，作品頁看網址
  const highlightedId = isHome ? spyId : isProjects ? currentActiveId : null;

  useEffect(() => {
    if (!isHome) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      if (Date.now() < spyLockUntilRef.current) return;
      const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-work-id]'));
      // 以視窗 35% 高度為判斷線：最後一個頂端越過判斷線、且底部還沒離開的作品
      const line = window.innerHeight * 0.35;
      let next: string | null = null;
      for (const el of blocks) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          next = el.dataset.workId || null;
          break;
        }
      }
      setSpyId((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [isHome]);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => {
      const title = (lang === 'en' ? p.titleEn || p.title : p.title).toLowerCase();
      const summary = (lang === 'en' ? p.summaryEn || p.summary : p.summary).toLowerCase();
      const company = (p.company || '').toLowerCase();
      const inStack = (p.techStack || []).some((t) => t.toLowerCase().includes(q));
      return title.includes(q) || summary.includes(q) || company.includes(q) || inStack;
    });
  }, [projects, searchQuery, lang]);

  // Bottom collapse stacking animation
  const updateCardTransforms = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const scrollTop = container.scrollTop;

    // Bottom collapse threshold: 0px from the bottom boundary
    const bottomPadding = 8;
    const effectiveBottom = containerHeight - bottomPadding;
    const collapseZone = 0; // 0px collapse threshold (directly at bottom boundary)
    const threshold = effectiveBottom - collapseZone;
    const L = 60; // Scroll distance to complete collapse

    cardRefs.current.forEach((card) => {
      if (!card) return;

      // Card bottom edge relative to container top
      const cardTop = card.offsetTop - scrollTop;
      const cardHeight = card.offsetHeight;
      const cardBottom = cardTop + cardHeight;

      if (cardBottom <= threshold) {
        // Above the collapse zone: normal appearance & speed
        card.style.transform = 'translate3d(0, 0px, 0) scale(1)';
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
      } else {
        // Enters collapse zone (0px threshold, sticky at bottom)
        const delta = cardBottom - threshold;
        const progress = Math.min(1, Math.max(0, delta / L));

        // Sticky at container bottom while collapsing
        const z = collapseZone * (1 - Math.pow(1 - progress, 2));
        const translateY = z - delta;
        const scale = 1 - 0.4 * progress;
        const opacity = Math.max(0, 1 - progress);

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        card.style.transformOrigin = '50% 100%';
        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto';
      }
    });
  }, []);

  // Smart active card scrolling and centering
  const scrollToActiveProject = useCallback((smooth: boolean = true, targetId?: string) => {
    const targetProjectId = targetId || highlightedId;
    const container = scrollContainerRef.current;
    if (!container || !targetProjectId) return;

    const activeIndex = filteredProjects.findIndex((p) => p.id === targetProjectId);
    if (activeIndex === -1) return;

    const card = cardRefs.current[activeIndex];
    if (!card) return;

    const containerHeight = container.clientHeight;
    const cardTop = card.offsetTop;
    const cardHeight = card.offsetHeight;

    // Center card vertically in visible scroll container
    const idealScrollTop = cardTop - (containerHeight - cardHeight) / 2;
    const maxScroll = Math.max(0, container.scrollHeight - containerHeight);
    const targetScrollTop = Math.max(0, Math.min(idealScrollTop, maxScroll));

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const shouldAnimate = smooth && !prefersReducedMotion;

    if (lenisRef.current) {
      if (shouldAnimate) {
        lenisRef.current.scrollTo(targetScrollTop, {
          duration: 0.8,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          lock: false,
          onComplete: () => {
            persistScrollTop(targetScrollTop);
            updateCardTransforms();
          },
        });
      } else {
        lenisRef.current.scrollTo(targetScrollTop, { immediate: true });
        persistScrollTop(targetScrollTop);
        updateCardTransforms();
      }
    } else {
      container.scrollTop = targetScrollTop;
      persistScrollTop(targetScrollTop);
      updateCardTransforms();
    }
  }, [highlightedId, filteredProjects, updateCardTransforms]);

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    if (onItemClick) onItemClick();

    // Smoothly scroll to clicked project card immediately
    scrollToActiveProject(true, proj.id);

    // 首頁：捲到長頁上的作品區塊，不換頁；捲動途中先鎖住 scroll-spy，避免高亮一路跳過中間作品
    const block = isHome ? document.getElementById(`work-${proj.id}`) : null;
    if (block) {
      setSpyId(proj.id);
      spyLockUntilRef.current = Date.now() + 1400;
      scrollTo(block, { offset: -24, duration: 1.2 });
      return;
    }

    // 其他頁面：回首頁並直接定位到該作品，不再開作品詳頁
    if (!isHome) {
      pendingWorkId = proj.id;
      transitionTo('/');
      return;
    }

    // 首頁但作品區塊被關閉時，退回作品詳頁
    transitionTo(`/projects/${proj.id}`);
  };

  // 從其他頁面點側欄回到首頁後，趁換頁布幕還蓋著時直接定位到該作品
  useEffect(() => {
    if (!isHome || !pendingWorkId) return;
    const id = pendingWorkId;
    // 計時器觸發時才清除，避免 StrictMode 重跑 effect 時目標先被清掉
    const timer = setTimeout(() => {
      pendingWorkId = null;
      const block = document.getElementById(`work-${id}`);
      if (!block) return;
      setSpyId(id);
      spyLockUntilRef.current = Date.now() + 600;
      scrollTo(block, { offset: -24, immediate: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [isHome, scrollTo]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      persistScrollTop(scrollContainerRef.current.scrollTop);
    }
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      updateCardTransforms();
      rafIdRef.current = null;
    });
  };

  const initialTargetRef = useRef({ isProjects, currentActiveId, scrollToActiveProject });
  initialTargetRef.current = { isProjects, currentActiveId, scrollToActiveProject };

  // Initialize independent nested Lenis instance for Sidebar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        wrapper: container,
        content: contentRef.current || container,
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: !prefersReducedMotion,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
        autoRaf: true,
        overscroll: true,
      });

      lenis.on('scroll', (e: { scroll: number }) => {
        persistScrollTop(e.scroll);
        updateCardTransforms();
      });

      lenisRef.current = lenis;

      // Position sidebar to active project or restore saved scroll position
      requestAnimationFrame(() => {
        const initial = initialTargetRef.current;
        if (initial.isProjects && initial.currentActiveId) {
          initial.scrollToActiveProject(false, initial.currentActiveId);
        } else {
          const savedTop = getSavedScrollTop();
          if (savedTop > 0 && container) {
            lenis?.scrollTo(savedTop, { immediate: true });
            persistScrollTop(savedTop);
            updateCardTransforms();
          }
        }
        initialPositionedRef.current = true;
      });
    } catch (err) {
      console.warn('GlobalSidebar: Failed to init nested Lenis', err);
    }

    return () => {
      if (scrollContainerRef.current) {
        const top = scrollContainerRef.current.scrollTop;
        persistScrollTop(top);
        setSidebarScrollPos(top);
      }
      if (lenis) {
        lenis.destroy();
      }
      lenisRef.current = null;
    };
  }, [updateCardTransforms, setSidebarScrollPos]);

  // 高亮的作品改變時（換頁或首頁捲動），把側欄卡片捲到中間
  useEffect(() => {
    if (!initialPositionedRef.current || !highlightedId) return;
    scrollToActiveProject(true);
  }, [highlightedId, scrollToActiveProject]);

  // Handle case where projects were populated asynchronously
  const previousProjectsLengthRef = useRef(filteredProjects.length);
  useEffect(() => {
    if (previousProjectsLengthRef.current === 0 && filteredProjects.length > 0) {
      if (highlightedId) {
        requestAnimationFrame(() => {
          scrollToActiveProject(false);
        });
      }
    }
    previousProjectsLengthRef.current = filteredProjects.length;
  }, [filteredProjects.length, highlightedId, scrollToActiveProject]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, filteredProjects.length);
    updateCardTransforms();
    lenisRef.current?.resize();

    const container = scrollContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      updateCardTransforms();
      lenisRef.current?.resize();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [filteredProjects, updateCardTransforms]);


  return (
    <aside className="w-full h-full flex flex-col text-[#121218] overflow-hidden select-none">
      {/* 1. TOP HEADER & SEARCH (PINNED AT TOP) */}
      <div className="p-4 pb-3 shrink-0 flex flex-col gap-3.5 w-full">
        {/* BRAND PROFILE CARD */}
        <Link
          href="/"
          onClick={onItemClick}
          className="group block w-full rounded-2xl bg-[#121218] text-white p-4 sm:p-5 border border-white/10 shadow-md transition-all hover:bg-[#1a1a24] active:scale-[0.99]"
        >
          <div className="flex items-start gap-3.5">
            <MediaImage
              src={profile.avatar || '/images/lincent-logo-animated-badge.svg'}
              variant="thumb"
              alt="lincent"
              className="w-10 h-10 object-cover rounded-xl shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-white/95">
                  lincent
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/15 text-slate-300">
                  STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal mt-1 leading-snug line-clamp-2">
                {tx(profile.tagline, lang)}
              </p>
            </div>
          </div>
        </Link>

        {/* TOP-LEVEL NAV */}
        <nav className="grid grid-cols-2 gap-2 w-full">
          <Link
            href="/projects"
            onClick={onItemClick}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isProjects
                ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                : 'bg-white/55 text-slate-600 border-slate-200/70 hover:bg-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{t.nav.works}</span>
          </Link>
          <Link
            href="/about"
            onClick={onItemClick}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              pathname.startsWith('/about')
                ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                : 'bg-white/55 text-slate-600 border-slate-200/70 hover:bg-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isEn ? 'About' : '關於我'}</span>
          </Link>
        </nav>

        {/* SEARCH FILTER INPUT */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.projects.searchPlaceholder}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#121218] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. SCROLLABLE PROJECT CARDS LIST (FILLS REMAINING SPACE) */}
      <div
        ref={scrollContainerRef}
        data-lenis-prevent
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 overscroll-contain relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div ref={contentRef} className="py-2 flex flex-col gap-2.5 w-full">
          {filteredProjects.map((proj, idx) => {
            const isActive = proj.id === highlightedId;
            const title = getShortProjectTitle(proj, lang);
            const summary = isEn ? proj.summaryEn || proj.summary : proj.summary;
            const tags = (proj.techStack || []).slice(0, 3);

            return (
              <button
                key={proj.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleSelectProject(proj)}
                style={{
                  zIndex: filteredProjects.length - idx + 10,
                }}
                aria-current={isActive ? 'true' : undefined}
                className={`group shrink-0 text-left w-full rounded-2xl p-3.5 transition-[background-color,border-color,box-shadow] duration-300 border relative overflow-hidden select-none will-change-transform ${isActive
                    ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                    : 'bg-white/55 hover:bg-white text-slate-800 border-slate-200/70 hover:border-slate-300'
                  }`}
              >
                {/* 柔和的 active 標記：左側細色條，不用整塊反黑 */}
                <span
                  aria-hidden
                  className={`absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-full bg-lime-500 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="flex items-start gap-3">
                  {proj.coverImage ? (
                    <MediaImage
                      src={proj.coverImage}
                      variant="thumb"
                      alt={title}
                      className="w-10 h-10 rounded-xl object-cover object-top shrink-0 border border-slate-200/60"
                    />
                  ) : (
                    <ProjectBadgeIcon id={proj.id} className="w-5 h-5" />
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className="font-sans font-bold text-sm tracking-tight truncate text-slate-900 group-hover:text-black"
                      >
                        {title}
                      </h4>
                      {proj.isNew && (
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-lime-400 text-[#121218]">
                          NEW
                        </span>
                      )}
                    </div>

                    <p
                      className="text-xs font-normal leading-relaxed line-clamp-2 text-slate-500"
                    >
                      {summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md border bg-slate-50 border-slate-200 text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredProjects.length > 3 && (
            <div className="h-24 shrink-0 pointer-events-none" />
          )}

          {filteredProjects.length === 0 && (
            <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-mono">
              {t.projects.notFound}
            </div>
          )}
        </div>
      </div>

      {/* 3. SIDEBAR FOOTER (FIXED PINNED AT BOTTOM) */}
      <div className="shrink-0 p-4 sm:p-5 pt-3 border-t border-slate-200/80 bg-[#F7F7F8] flex flex-col gap-2.5 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        {/* Status Indicator & Language Switcher */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">{t.common.availableForProjects}</span>
          </div>

          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all active:scale-95 shrink-0 shadow-2xs"
            title="切換語言 / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'zh' ? '繁中' : 'EN'}</span>
          </button>
        </div>

        {/* Social Icons & Admin link */}
        <div className="flex items-center justify-between px-1 text-slate-500 text-xs pt-1 border-t border-slate-200/50">
          <div className="flex items-center gap-3">
            {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-black transition-colors"
              title="GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
            )}
            {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-black transition-colors"
              title="LinkedIn"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
            </a>
            )}
            {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-black transition-colors"
              title="Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            )}
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-800 transition-colors p-1"
            title="Admin Console"
          >
            <Lock className="w-3 h-3" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
