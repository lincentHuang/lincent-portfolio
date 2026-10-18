'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAtom } from 'jotai';
import { selectedProjectAtom, type Project } from '../../../store/atoms';
import { useProjects } from '../../../content/content-provider';
import { MediaImage, isVideoUrl } from '../../../components/media/media-image';
import { useI18n } from '../../../i18n';
import { MarkdownRenderer } from './markdown-renderer';
import { GalleryRowView, slotCountOf } from './gallery-row-view';
import type { GalleryRow } from '../../../types';
import { ProjectBadgeIcon, getShortProjectTitle } from './project-badge-icon';
import { ProjectPager } from './project-pager';
import { ProjectPurchase } from './project-purchase';
import {
  ExternalLink,
  Sparkles,
  Maximize2,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProjectShowcaseProps {
  initialSelectedId?: string;
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  initialSelectedId,
}) => {
  const { t, lang, isEn } = useI18n();
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const showcaseTopRef = useRef<HTMLDivElement>(null);

  const projects = useProjects();

  // Active selected project
  const activeProject = useMemo(() => {
    if (initialSelectedId) {
      const found = projects.find((p) => p.id === initialSelectedId);
      if (found) return found;
    }
    if (selectedProject) {
      const found = projects.find((p) => p.id === selectedProject.id);
      if (found) return found;
    }
    return projects[0] || null;
  }, [projects, initialSelectedId, selectedProject]);

  // Sync selectedProject atom with current activeProject
  useEffect(() => {
    if (activeProject && selectedProject?.id !== activeProject.id) {
      setSelectedProject(activeProject);
    }
  }, [activeProject, selectedProject, setSelectedProject]);

  // Scroll to showcase top when project changes
  useEffect(() => {
    if (initialSelectedId && showcaseTopRef.current) {
      showcaseTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [initialSelectedId]);

  // 燈箱圖片：只來自 galleryRows；沒有相簿時退回封面
  const albumImages = useMemo(() => {
    if (!activeProject) return [];
    const set = new Set<string>();
    (activeProject.galleryRows || []).forEach((row) => {
      (row.slots || []).forEach((slot) => {
        if (slot?.url && slot.url.trim()) set.add(slot.url.trim());
      });
    });
    if (set.size === 0 && activeProject.coverImage && activeProject.coverImage.trim()) {
      set.add(activeProject.coverImage.trim());
    }
    return Array.from(set);
  }, [activeProject]);

  // Lightbox keyboard navigation (ArrowLeft, ArrowRight, ESC)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + albumImages.length) % albumImages.length : 0));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % albumImages.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, albumImages.length]);

  // Format hashtags for project
  const getHashtags = (p: Project) => {
    const rawTags = [
      ...(p.techStack || []).slice(0, 4),
      p.category || 'Architecture',
      p.tag || 'Design',
    ];
    const set = new Set<string>();
    rawTags.forEach((t) => {
      const clean = t.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean && clean.length > 1) set.add(clean);
    });
    return Array.from(set).slice(0, 6);
  };

  if (!activeProject) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-mono text-xs">
          <Sparkles className="w-4 h-4 text-[#121218] animate-spin" />
          <span>Loading Works...</span>
        </div>
      </div>
    );
  }

  const hasModularRows = Boolean(activeProject.galleryRows && activeProject.galleryRows.length > 0);

  return (
    <div ref={showcaseTopRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
      {/* 1. TOP HEADER CARD */}
      <div className="rounded-[28px] border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-[#121218]">
              {getShortProjectTitle(activeProject, lang)}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
            {isEn
              ? activeProject.subtitleEn || activeProject.summaryEn || activeProject.summary
              : activeProject.subtitle || activeProject.summary}
          </p>

          <div className="text-xs font-mono text-slate-400 pt-1">
            {activeProject.company} • {activeProject.year}
          </div>
        </div>

        <div className="flex flex-col xl:items-end gap-3.5 shrink-0">
          <div className="flex flex-wrap gap-1.5 xl:justify-end max-w-md">
            {getHashtags(activeProject).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            {activeProject.demoUrl && (
              <a
                href={activeProject.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-full bg-[#121218] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <span>{t.projects.liveDemo}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. HERO RESPONSIVE GALLERY SHOWCASE (模組化展間排版：全寬大圖、左小右大、左大右小、左右等分) */}
      {albumImages.length > 0 && (
      <div className="space-y-4 sm:space-y-6">
        {/* Gallery Section Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-lime-600" />
              <span>01 / {isEn ? 'Visual Gallery' : '專案視覺展間'}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {albumImages.length} {isEn ? 'Photos' : '張相片'}
            </span>
          </div>

          <button
            onClick={() => setLightboxIndex(0)}
            className="text-xs font-mono text-slate-500 hover:text-black flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-black" />
            <span>{isEn ? 'Open Fullscreen Gallery' : '展開全螢幕相簿'}</span>
          </button>
        </div>

        {/* Modular Row Showcase Layout */}
        {hasModularRows ? (
          <div className="space-y-3 sm:space-y-4">
            {activeProject.galleryRows!.map((rawRow, rowIdx) => {
              // 兩欄列只剩一張圖時，退回整列顯示；整列都沒圖就略過
              const filled = (rawRow.slots || []).filter((s) => s?.url);
              if (filled.length === 0) return null;
              const row: GalleryRow =
                slotCountOf(rawRow.layout) > 1 && filled.length === 1 ? { ...rawRow, layout: 'full', slots: filled } : rawRow;

              return (
                <GalleryRowView
                  key={row.id || rowIdx}
                  row={row}
                  alt={getShortProjectTitle(activeProject, lang)}
                  cellProps={() => ({ className: 'cursor-zoom-in' })}
                  onSlotClick={(slot) => {
                    if (!slot?.url) return;
                    const idx = albumImages.indexOf(slot.url.trim());
                    setLightboxIndex(idx >= 0 ? idx : 0);
                  }}
                  renderOverlay={(slot) =>
                    slot?.url ? (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    ) : null
                  }
                />
              );
            })}
          </div>
        ) : activeProject.coverImage ? (
          <div
            onClick={() => setLightboxIndex(0)}
            className="w-full group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-zoom-in"
          >
            <MediaImage
              src={activeProject.coverImage}
              alt={getShortProjectTitle(activeProject, lang)}
              priority
              className="block h-auto w-full group-hover:scale-[1.015] transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : null}
      </div>
      )}

      {/* 2.5 SPECS & ARCHITECTURE METRICS CARD */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
              02 / {isEn ? 'Specs & Architecture Focus' : '架構與技術核心'}
            </span>
            <span className="text-xs font-mono text-slate-400">{activeProject.tag || 'Architecture'}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {isEn ? activeProject.summaryEn || activeProject.summary : activeProject.summary}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(activeProject.techStack || []).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 shrink-0 text-xs font-mono text-slate-500 gap-2">
          <div>Lighthouse: <span className="text-emerald-600 font-bold text-sm">99+</span></div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
            Production Verified
          </span>
        </div>
      </div>

      {/* 3. 專案詳細資訊與深度架構剖析 (常駐於下方) */}
      <div className="rounded-[28px] border border-slate-200/90 bg-white p-7 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-lime-600" />
              <span>{isEn ? '03 / Detailed Architecture & Case Study' : '03 / 專案詳細資訊與技術突破'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-[#121218] tracking-tight">
              {activeProject.title}
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {activeProject.company} • {activeProject.year}
          </div>
        </div>

        {/* 核心痛點解決方案 */}
        {activeProject.painPoints && activeProject.painPoints.length > 0 && (
          <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-600 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500" />
              <span>{t.projects.challengesSolved}</span>
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 pt-1">
              {activeProject.painPoints.map((p, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs"
                >
                  <span className="text-lime-600 font-bold text-base leading-none">✓</span>
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 完整 Markdown 文章內容 */}
        {activeProject.contentMd && (
          <div className="pt-2">
            <MarkdownRenderer content={activeProject.contentMd} />
          </div>
        )}
      </div>

      {/* 4. 購買授權／買斷（後台開啟販售才顯示） */}
      <ProjectPurchase key={activeProject.id} project={activeProject} />

      {/* 4. 上一個／下一個作品 */}
      <ProjectPager projects={projects} currentId={activeProject.id} />

      {/* 5. LIGHTBOX FULLSCREEN ZOOM & MULTI-PHOTO GALLERY MODAL */}
      {lightboxIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 select-none"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between w-full max-w-6xl mx-auto z-10 text-white pb-4 border-b border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-mono text-slate-300">
                {lightboxIndex + 1} / {albumImages.length}
              </span>
              <span className="text-sm font-sans font-semibold tracking-tight text-white/90 hidden sm:inline">
                {activeProject.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline mr-2">
                按 ← → 切換 • ESC 關閉
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
                title="關閉相簿 (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Center View */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-auto flex items-center justify-between w-full max-w-6xl mx-auto relative px-2 sm:px-4"
          >
            {/* Previous Button */}
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + albumImages.length) % albumImages.length)}
              className="p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 transition-all cursor-pointer z-10 shrink-0"
              title="上一張相片 (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Photo */}
            <div className="flex-1 flex items-center justify-center px-4 max-h-[72vh]">
              {isVideoUrl(albumImages[lightboxIndex]) ? (
                <video
                  key={lightboxIndex}
                  src={albumImages[lightboxIndex]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full max-h-[72vh] rounded-2xl object-contain shadow-2xl border border-white/10 bg-black"
                />
              ) : (
                <img
                  key={lightboxIndex}
                  src={albumImages[lightboxIndex]}
                  alt={`Photo ${lightboxIndex + 1}`}
                  className="max-w-full max-h-[72vh] rounded-2xl object-contain shadow-2xl border border-white/10"
                />
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % albumImages.length)}
              className="p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 transition-all cursor-pointer z-10 shrink-0"
              title="下一張相片 (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails Filmstrip */}
          {albumImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-4 z-10"
              style={{ scrollbarWidth: 'none' }}
            >
              {albumImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 sm:w-16 h-10 sm:h-12 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                    lightboxIndex === idx
                      ? 'ring-2 ring-lime-400 border-lime-400 scale-105 shadow-md'
                      : 'border-white/20 opacity-40 hover:opacity-100'
                  }`}
                >
                  <MediaImage src={thumbUrl} variant="thumb" alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};
