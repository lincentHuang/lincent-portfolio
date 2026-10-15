'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProjects } from '../../../content/content-provider';
import { MediaImage } from '../../../components/media/media-image';
import { pick } from '../../../content/types';
import { useI18n } from '../../../i18n';
import { ArrowUpRight } from 'lucide-react';

const ALL = '__all__';

export const ProjectsOverview: React.FC = () => {
  const projects = useProjects();
  const { t, lang } = useI18n();
  const [category, setCategory] = useState(ALL);

  // 分類依作品出現順序排列，只列出實際有用到的
  const categories = useMemo(() => {
    const seen = new Set<string>();
    projects.forEach((p) => {
      const c = pick(p.category, p.categoryEn, lang);
      if (c) seen.add(c);
    });
    return Array.from(seen);
  }, [projects, lang]);

  const visible = useMemo(
    () =>
      category === ALL
        ? projects
        : projects.filter((p) => pick(p.category, p.categoryEn, lang) === category),
    [projects, category, lang],
  );

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3 max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs whitespace-nowrap">
          <span>{t.projects.overviewTag}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[11px] text-slate-500 font-mono">{projects.length}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-slate-900">
          {t.projects.overviewTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
          {t.projects.overviewSubtitle}
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {[ALL, ...categories].map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#121218] text-white border-[#121218]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c === ALL ? t.projects.allCategories : c}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-20 text-center text-sm text-slate-500 font-mono">{t.projects.notFound}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {visible.map((proj) => {
            const title = pick(proj.title, proj.titleEn, lang);
            const summary = pick(proj.summary, proj.summaryEn, lang);
            const cat = pick(proj.category, proj.categoryEn, lang);
            const company = pick(proj.company, proj.companyEn, lang);
            const href = `/projects/${proj.id}`;

            return (
              <Link
                key={proj.id}
                href={href}
                className="group rounded-[28px] bg-white border border-[#E2E4E9] p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#D4D7DF] transition-all duration-300 flex flex-col"
              >
                <div className="relative rounded-[20px] overflow-hidden bg-slate-100 aspect-[4/3] mb-4">
                  {proj.coverImage ? (
                    <MediaImage
                      src={proj.coverImage}
                      variant="thumb"
                      alt={title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                      No Preview
                    </div>
                  )}
                  {cat && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                      {cat}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2 px-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-[#121218] tracking-tight line-clamp-1">{title}</h2>
                      <p className="text-xs text-slate-500 font-medium pt-0.5">
                        {[proj.year, company].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#121218] text-white flex items-center justify-center shrink-0 transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  {summary && (
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{summary}</p>
                  )}
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                      {proj.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
