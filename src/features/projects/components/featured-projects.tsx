'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../../../content/content-provider';
import { MediaImage } from '../../../components/media/media-image';
import { pick } from '../../../content/types';
import { useI18n } from '../../../i18n';
import { usePageTransition } from '../../../components/providers/page-transition-provider';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export const FeaturedProjects: React.FC = () => {
  const allProjects = useProjects();
  const projects = React.useMemo(() => allProjects.filter((p) => p.featured), [allProjects]);
  const { t, isEn, lang } = useI18n();
  const router = useRouter();
  const { transitionTo } = usePageTransition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Detect mobile screen for responsive fan spread
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = projects.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play interval (3.8s), paused when isPaused is true
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused, total, handleNext]);

  // Calculate circular offset distance between card index and currentIndex
  const getDiff = (index: number) => {
    if (total <= 1) return 0;
    let diff = index - currentIndex;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 max-w-6xl mx-auto">
        <div className="space-y-3 min-w-0 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs whitespace-nowrap">
            <span>{t.projects.tag}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="text-[11px] text-slate-500 font-mono">
              {total > 0 ? `${currentIndex + 1} / ${total}` : ''}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
            {t.projects.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Right Action & Autoplay Status Badge */}
        <div className="flex items-center gap-3 self-start md:self-end shrink-0 whitespace-nowrap">
          {/* Autoplay status indicator */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono transition-all border ${
              isPaused
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span>{isPaused ? (isEn ? 'PAUSED' : '已暫停輪播') : (isEn ? 'AUTO-PLAYING' : '自動播放中')}</span>
          </div>

          <Link
            href="/projects"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all hover:scale-105 shadow-xs"
          >
            <span>{t.projects.viewArchive}</span>
          </Link>
        </div>
      </div>

      {/* Fan-Shaped Carousel Deck Area */}
      <div
        className="relative w-full max-w-6xl mx-auto h-[610px] sm:h-[650px] md:h-[670px] flex items-center justify-center select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredCardIndex(null);
        }}
      >
        {/* Navigation Arrow Buttons */}
        <button
          onClick={handlePrev}
          aria-label="Previous project"
          className="absolute left-2 sm:left-4 z-40 p-3 sm:p-3.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 shadow-lg text-slate-800 hover:text-black hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next project"
          className="absolute right-2 sm:right-4 z-40 p-3 sm:p-3.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 shadow-lg text-slate-800 hover:text-black hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* The Card Deck Stack */}
        <div className="relative w-full h-full flex items-center justify-center">
          {projects.map((proj, index) => {
            const diff = getDiff(index);
            const isCenter = diff === 0;
            const isVisible = Math.abs(diff) <= 2;
            const isHovered = hoveredCardIndex === index;

            const title = isEn ? (proj.titleEn || proj.title) : proj.title;
            const summary = isEn ? (proj.summaryEn || proj.summary) : proj.summary;
            const category = isEn ? (proj.categoryEn || proj.category) : proj.category;
            const primaryTech = proj.techStack?.[0] || 'TypeScript';

            // Fan geometry calculations
            const xOffsetMultiplier = isMobile ? 180 : 280;
            const targetX = diff * xOffsetMultiplier;
            // Droop down in an arc curve to create the fan shape
            const targetY = Math.pow(Math.abs(diff), 1.35) * (isMobile ? 14 : 18);
            // Fan rotation angle (negative on left, positive on right)
            const targetRotate = diff * (isMobile ? 3.5 : 4.5);
            // Base scale
            const baseScale = isCenter ? 1 : Math.max(0.75, 1 - Math.abs(diff) * 0.08);
            // Hover zoom: slightly enlarge the card when hovered
            const finalScale = isHovered ? baseScale * 1.04 : baseScale;
            // Z-index layer
            const zIndex = 30 - Math.abs(diff) * 6;
            // Opacity fade-out for peripheral cards
            const opacity = Math.abs(diff) > 2 ? 0 : Math.max(0.35, 1 - Math.abs(diff) * 0.25);

            return (
              <motion.div
                key={proj.id}
                className={`absolute w-[90vw] max-w-[360px] sm:max-w-[420px] md:max-w-[480px] origin-bottom cursor-pointer ${
                  !isVisible ? 'pointer-events-none' : ''
                }`}
                style={{
                  zIndex,
                  transformOrigin: '50% 120%',
                }}
                animate={{
                  x: targetX,
                  y: isHovered && isCenter ? targetY - 10 : targetY,
                  rotate: targetRotate,
                  scale: finalScale,
                  opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                  mass: 0.8,
                }}
                onMouseEnter={() => {
                  setHoveredCardIndex(index);
                  setIsPaused(true);
                }}
                onMouseLeave={() => {
                  setHoveredCardIndex(null);
                }}
                onClick={() => {
                  if (isCenter) {
                    transitionTo(`/projects/${proj.id}`);
                  } else {
                    handleSelect(index);
                  }
                }}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) {
                    handleNext();
                  } else if (info.offset.x > 50) {
                    handlePrev();
                  }
                }}
              >
                {/* Project Card Container */}
                <div
                  className={`rounded-[28px] sm:rounded-[32px] bg-white border p-4 sm:p-5 transition-shadow duration-300 flex flex-col justify-between block ${
                    isCenter
                      ? 'border-[#D4D7DF] shadow-xl hover:shadow-2xl ring-1 ring-black/5'
                      : 'border-[#E2E4E9] shadow-md hover:shadow-lg opacity-95'
                  } ${isHovered ? 'shadow-2xl ring-2 ring-black/10' : ''}`}
                >
                  {/* Top Image Box with Badges */}
                  <div className="relative rounded-[22px] overflow-hidden bg-slate-100 h-56 sm:h-64 md:h-70 w-full mb-4 sm:mb-5">
                    {proj.coverImage ? (
                      <MediaImage
                        src={proj.coverImage}
                        variant="thumb"
                        alt={title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 ease-out"
                        style={{
                          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-mono text-xs">
                        No Preview
                      </div>
                    )}

                    {/* Floating Glass Pills (Top-Left) */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wide shadow-xs">
                        {category}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-mono shadow-xs">
                        {primaryTech}
                      </span>
                    </div>

                    {/* Subtle Click Indicator for Side Cards */}
                    {!isCenter && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                        <span className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-medium shadow-md">
                          {isEn ? 'Click to center' : '點擊切換至此專案'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Details */}
                  <div className="space-y-3.5 px-1 pb-1">
                    {/* Header Row: Title & Right Tag */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-sans font-bold text-[#121218] tracking-tight transition-colors line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">
                          {proj.year} • {proj.company}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold shrink-0">
                        {proj.tag || 'Featured'}
                      </span>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed line-clamp-2">
                      {summary}
                    </p>

                    {/* Bottom Action Row: Metric / Role + Sleek Black Pill Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      {proj.metrics?.[0] ? (
                        <div>
                          <span className="text-sm sm:text-base font-bold text-[#121218] block font-sans">
                            {proj.metrics[0].value}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {pick(proj.metrics[0].label, proj.metrics[0].labelEn, lang)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">{pick(proj.role, proj.roleEn, lang)}</span>
                      )}

                      {/* Black Pill Button with Circular Arrow Badge */}
                      <div
                        className={`px-4 py-2 rounded-full text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all ${
                          isCenter
                            ? 'bg-[#121218] hover:bg-black hover:scale-105'
                            : 'bg-slate-700 hover:bg-[#121218]'
                        }`}
                      >
                        <span>{t.projects.viewCase}</span>
                        <span className="w-5 h-5 rounded-full bg-white text-[#121218] flex items-center justify-center">
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Interactive Navigation Dots & Play/Pause Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-xs">
          {/* Pause / Play Toggle Button */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors mr-1"
            title={isPaused ? (isEn ? 'Resume Auto-play' : '恢復自動播放') : (isEn ? 'Pause Auto-play' : '暫停自動播放')}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-700" /> : <Pause className="w-3.5 h-3.5 fill-slate-700" />}
          </button>

          <div className="h-3 w-[1px] bg-slate-200 mr-1" />

          {/* Dots */}
          {projects.map((proj, idx) => {
            const isCenter = idx === currentIndex;
            return (
              <button
                key={proj.id}
                onClick={() => handleSelect(idx)}
                aria-label={`Jump to project ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isCenter
                    ? 'w-8 bg-slate-900 shadow-xs'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
