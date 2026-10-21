'use client';

import React, { useState } from 'react';
import { useProjects } from '../../../content/content-provider';
import { MediaImage } from '../../../components/media/media-image';
import { pick } from '../../../content/types';
import type { Project } from '../../../content/types';
import type { GalleryRow } from '../../../types';
import { useI18n } from '../../../i18n';
import { usePageTransition } from '../../../components/providers/page-transition-provider';
import { SectionHeading } from '../../portfolio/components/section-heading';
import { MarkdownRenderer } from './markdown-renderer';
import { GalleryRowView, slotCountOf } from './gallery-row-view';
import { getShortProjectTitle } from './project-badge-icon';
import { ArrowUpRight, ChevronDown, ExternalLink } from 'lucide-react';

/** 取出有圖的相簿列（全部顯示）；兩欄列只剩一張圖時退回整列 */
const previewRows = (p: Project): GalleryRow[] =>
  (p.galleryRows || [])
    .map((row) => {
      const filled = (row.slots || []).filter((s) => s?.url);
      if (filled.length === 0) return null;
      return slotCountOf(row.layout) > 1 && filled.length === 1 ? { ...row, layout: 'full' as const, slots: filled } : row;
    })
    .filter((r): r is GalleryRow => r !== null);

const ProjectBlock: React.FC<{ project: Project; index: number }> = ({ project: p, index }) => {
  const { t, lang, isEn } = useI18n();
  const { transitionTo } = usePageTransition();
  const [open, setOpen] = useState(false);

  const title = getShortProjectTitle(p, lang);
  const subtitle = isEn ? p.subtitleEn || p.summaryEn || p.summary : p.subtitle || p.summary;
  const summary = isEn ? p.summaryEn || p.summary : p.summary;
  const painPoints = (isEn && p.painPointsEn?.length ? p.painPointsEn : p.painPoints) || [];
  const content = isEn ? p.contentMdEn || p.contentMd : p.contentMd;
  const metrics = p.metrics || [];
  const hasStory = Boolean(summary) || metrics.length > 0 || painPoints.length > 0 || Boolean(content);
  const rows = previewRows(p);
  const goDetail = () => transitionTo(`/projects/${p.id}`);
  // 官網類作品叫「前往網站」，App／遊戲／活動頁叫「線上體驗」
  const isSite = /website|e-commerce|brand experience|seo/i.test(p.category || '');

  return (
    <article id={`work-${p.id}`} data-work-id={p.id} className="scroll-mt-6 py-12 sm:py-16 border-t border-slate-200/80 first:border-t-0">
      {/* 標題列：大標、一句話、年份與技術 */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6 sm:mb-8">
        <div className="min-w-0 max-w-2xl">
          <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="mt-1 text-[32px] sm:text-[44px] font-bold tracking-[-0.03em] leading-[1.08] text-[#121218]">{title}</h3>
          <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-slate-600 [text-wrap:pretty]">{subtitle}</p>
        </div>
        <div className="flex flex-col lg:items-end gap-2.5 shrink-0">
          <span className="text-xs font-mono text-slate-400">
            {pick(p.company, p.companyEn, lang)} • {p.year}
          </span>
          <div className="flex flex-wrap gap-1.5 lg:justify-end max-w-sm">
            {(p.techStack || []).slice(0, 4).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full border border-slate-200 bg-white/70 text-[11px] font-mono text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* 相簿：圖片全部直接顯示，點圖進完整案例 */}
      {rows.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {rows.map((row, i) => (
            <GalleryRowView
              key={row.id || i}
              row={row}
              alt={title}
              cellProps={() => ({ className: 'cursor-pointer' })}
              onSlotClick={goDetail}
            />
          ))}
        </div>
      ) : p.coverImage ? (
        <button onClick={goDetail} className="block w-full overflow-hidden rounded-2xl sm:rounded-3xl">
          <MediaImage src={p.coverImage} alt={title} className="block h-auto w-full" />
        </button>
      ) : null}

      {hasStory && (
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-out"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className={`overflow-hidden transition-[visibility] duration-500 ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
            {/* 文案全部收在這裡：有興趣的人再展開看 */}
            <div className="pt-6 sm:pt-8 space-y-6">
              {(summary || metrics.length > 0) && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  {summary && <p className="max-w-2xl text-[14px] sm:text-[15px] leading-relaxed text-slate-600">{summary}</p>}
                  {metrics.length > 0 && (
                    <dl className="flex gap-6 lg:justify-end">
                      {metrics.slice(0, 3).map((m) => (
                        <div key={m.value + m.label}>
                          <dt className="text-lg font-bold text-[#121218]">{m.value}</dt>
                          <dd className="text-[11px] font-mono text-slate-400">{pick(m.label, m.labelEn, lang)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
              {painPoints.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[13px] sm:text-sm text-slate-700">
                  {painPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 p-3.5">
                      <span className="text-slate-400 font-bold leading-none pt-0.5">✓</span>
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              )}
              {content && <MarkdownRenderer content={content} />}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        {hasStory && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {open ? t.projects.collapseStory : t.projects.expandStory}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
        <button
          onClick={goDetail}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:text-[#121218]"
        >
          {t.projects.fullCase}
          <ArrowUpRight className="w-4 h-4" />
        </button>
        {p.demoUrl && (
          <a
            href={p.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#121218] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-black"
          >
            {isSite ? t.projects.visitSite : t.projects.liveDemo}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </article>
  );
};

/** 首頁作品長頁：全部作品依序排開，側欄點選會捲到對應作品（id="work-{id}"） */
export const HomeProjectStream: React.FC = () => {
  const projects = useProjects();
  const { t } = useI18n();

  return (
    <section id="projects" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
      <SectionHeading
        className="mb-4 sm:mb-6"
        tag={
          <>
            {t.projects.tag}
            <span className="font-mono text-slate-400">{projects.length}</span>
          </>
        }
        title={t.projects.title}
        subtitle={t.projects.subtitle}
      />
      {projects.map((p, i) => (
        <ProjectBlock key={p.id} project={p} index={i} />
      ))}
    </section>
  );
};
