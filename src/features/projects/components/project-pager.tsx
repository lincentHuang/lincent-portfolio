'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '../../../store/atoms';
import { useI18n } from '../../../i18n';
import { MediaImage } from '../../../components/media/media-image';
import { getShortProjectTitle } from './project-badge-icon';

interface ProjectPagerProps {
  projects: Project[];
  currentId: string;
}

// 作品頁底部的上一個／下一個導覽，頭尾相接循環
export const ProjectPager: React.FC<ProjectPagerProps> = ({ projects, currentId }) => {
  const { lang, isEn } = useI18n();
  const idx = projects.findIndex((p) => p.id === currentId);
  if (idx < 0 || projects.length < 2) return null;

  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  const card = (p: Project, dir: 'prev' | 'next') => {
    const isNext = dir === 'next';
    return (
      <Link
        href={`/projects/${p.id}`}
        className={`group relative flex items-center gap-4 sm:gap-5 rounded-[24px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-900 hover:shadow-md ${
          isNext ? 'flex-row-reverse text-right' : ''
        }`}
      >
        <div className="relative w-20 h-14 sm:w-28 sm:h-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {p.coverImage && (
            <MediaImage
              src={p.coverImage}
              variant="thumb"
              alt={getShortProjectTitle(p, lang)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div
            className={`flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 ${
              isNext ? 'justify-end' : ''
            }`}
          >
            {!isNext && <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />}
            <span>{isNext ? (isEn ? 'Next Project' : '下一個作品') : isEn ? 'Previous Project' : '上一個作品'}</span>
            {isNext && <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
          </div>
          <div className="truncate text-base sm:text-lg font-bold tracking-tight text-[#121218]">
            {getShortProjectTitle(p, lang)}
          </div>
          <div className="truncate text-xs text-slate-500">
            {p.company} • {p.year}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <nav aria-label={isEn ? 'Project navigation' : '作品導覽'} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {card(prev, 'prev')}
      {card(next, 'next')}
    </nav>
  );
};
