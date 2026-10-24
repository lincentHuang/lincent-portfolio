'use client';

import React from 'react';
import { Reorder } from 'framer-motion';
import { ArrowUpRight, EyeOff, Globe, GripVertical, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/layouts/global-sidebar';
import { useProjects, useSite } from '../../content/content-provider';
import { MediaImage } from '../../components/media/media-image';
import { Creases } from '../portfolio/components/paper';
import { useI18n } from '../../i18n';
import { pick, tx, type Language, type LinkItem, type LinksBackground, type LinksPage as LinksPageData, type Profile, type Project } from '../../content/types';

interface ResolvedLink {
  id: string;
  href: string;
  external: boolean;
  label: string;
  desc: string;
  cover?: string;
  highlight: boolean;
}

const isExternal = (url: string) => /^https?:\/\//i.test(url);

/** 把後台設定的按鈕轉成實際要顯示的連結；作品已下架或網址空白的回傳 null */
function resolveLink(item: LinkItem, projects: Project[], lang: Language): ResolvedLink | null {
  if (item.kind === 'project') {
    const p = projects.find((x) => x.id === item.projectId);
    if (!p) return null;
    const href = item.target === 'demo' && p.demoUrl ? p.demoUrl : `/projects/${p.id}`;
    return {
      id: item.id,
      href,
      external: isExternal(href),
      label: tx(item.label, lang) || pick(p.title, p.titleEn, lang),
      desc: tx(item.desc, lang) || pick(p.subtitle, p.subtitleEn, lang),
      cover: p.coverImage,
      highlight: !!item.highlight,
    };
  }
  const href = item.url?.trim();
  const label = tx(item.label, lang);
  if (!href || !label) return null;
  return { id: item.id, href, external: isExternal(href), label, desc: tx(item.desc, lang), highlight: !!item.highlight };
}

function backgroundStyle(bg: LinksBackground): React.CSSProperties | undefined {
  if (bg.type === 'color') return { background: bg.color };
  if (bg.type === 'gradient') return { background: `linear-gradient(160deg, ${bg.color}, ${bg.color2})` };
  if (bg.type === 'image' && bg.image) return { background: `${bg.color} url("${bg.image}") center / cover no-repeat` };
  return undefined;
}

/** 後台編輯模式：點選元素開啟對應設定、拖曳按鈕排序 */
export type LinksSelection = 'header' | 'background' | string;
interface EditProps {
  selected: LinksSelection | null;
  onSelect: (s: LinksSelection) => void;
  onReorder: (items: LinkItem[]) => void;
}

/** 入口頁畫面：前台與後台預覽共用同一個元件，達成所見即所得 */
export function LinksView({
  page,
  profile,
  projects,
  lang,
  onToggleLang,
  edit,
  className = 'min-h-screen',
}: {
  page: LinksPageData;
  profile: Profile;
  projects: Project[];
  lang: Language;
  onToggleLang?: () => void;
  edit?: EditProps;
  className?: string;
}) {
  const bg = page.background;
  const dark = bg.tone === 'dark';
  const ring = (key: LinksSelection) =>
    edit
      ? `cursor-pointer outline-offset-4 ${edit.selected === key ? 'outline outline-2 outline-sky-500' : 'hover:outline hover:outline-1 hover:outline-sky-400/60'}`
      : '';

  const socials = [
    profile.email && { href: `mailto:${profile.email}`, icon: Mail, label: 'Email' },
    profile.githubUrl && { href: profile.githubUrl, icon: GithubIcon, label: 'GitHub' },
    profile.linkedinUrl && { href: profile.linkedinUrl, icon: LinkedinIcon, label: 'LinkedIn' },
  ].filter(Boolean) as { href: string; icon: React.ComponentType<{ className?: string }>; label: string }[];

  const renderButton = (item: LinkItem) => {
    const l = resolveLink(item, projects, lang);
    const hl = !!item.highlight;
    const cls = `group flex items-center gap-3 rounded-2xl border p-2.5 pr-4 transition ${
      hl
        ? dark
          ? 'border-white bg-white text-[#121218] shadow-lg'
          : 'border-[#121218] bg-[#121218] text-white shadow-lg hover:bg-black'
        : dark
          ? 'border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15'
          : 'border-[#D5D9E0] bg-white/80 shadow-sm backdrop-blur hover:bg-white hover:shadow-md'
    } ${edit ? '' : 'active:scale-[0.99] hover:-translate-y-0.5'}`;
    const muted = hl ? (dark ? 'text-slate-500' : 'text-white/60') : dark ? 'text-white/60' : 'text-slate-500';
    const inner = (
      <>
        {edit && <GripVertical className={`h-4 w-4 shrink-0 cursor-grab ${muted}`} />}
        {l?.cover ? (
          <MediaImage src={l.cover} variant="thumb" alt="" draggable={false} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="h-12 w-1 shrink-0" />
        )}
        <span className="min-w-0 flex-1 text-center">
          <span className="block truncate text-[15px] font-semibold">{l?.label || '（尚未設定，前台不顯示）'}</span>
          {l?.desc && <span className={`mt-0.5 block truncate text-xs ${muted}`}>{l.desc}</span>}
        </span>
        {edit && !item.enabled ? (
          <EyeOff className={`h-4 w-4 shrink-0 ${muted}`} />
        ) : (
          <ArrowUpRight className={`h-4 w-4 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${muted}`} />
        )}
      </>
    );
    if (edit) return <div className={`${cls} ${!item.enabled || !l ? 'opacity-40' : ''}`}>{inner}</div>;
    if (!item.enabled || !l) return null;
    return (
      <a href={l.href} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})} className={cls}>
        {inner}
      </a>
    );
  };

  return (
    <div
      className={`relative overflow-hidden ${bg.type === 'paper' ? 'bg-gradient-to-br from-[#F2F3F5] via-[#ECEEF1] to-[#E1E4E8]' : ''} ${
        dark ? 'text-white' : 'text-[#121218]'
      } ${className}`}
      style={backgroundStyle(bg)}
      onClick={edit ? () => edit.onSelect('background') : undefined}
    >
      {bg.type === 'image' && bg.image && bg.dim > 0 && (
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: bg.dim / 100 }} />
      )}
      {bg.type === 'paper' && (
        <>
          <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/70 blur-3xl" />
          <Creases className="text-slate-400/25" />
        </>
      )}
      {edit && edit.selected === 'background' && <div className="pointer-events-none absolute inset-0 z-20 outline outline-2 -outline-offset-2 outline-sky-500" />}

      {onToggleLang && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLang();
          }}
          className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur ${
            dark ? 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20' : 'border-slate-300/70 bg-white/70 text-slate-600 hover:bg-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === 'zh' ? 'EN' : '繁中'}
        </button>
      )}

      <main className="relative mx-auto flex w-full max-w-[480px] flex-col items-center px-4 pb-16 pt-16 sm:pt-20">
        <div
          className={`flex flex-col items-center rounded-2xl ${ring('header')}`}
          onClick={
            edit
              ? (e) => {
                  e.stopPropagation();
                  edit.onSelect('header');
                }
              : undefined
          }
        >
          <img
            src={page.avatar || profile.avatar || '/images/lincent-logo-animated-badge.svg'}
            alt={tx(profile.name, lang)}
            className={`h-24 w-24 border-4 object-cover shadow-portfolio-card ${page.avatarShape === 'rounded' ? 'rounded-3xl' : 'rounded-full'} ${
              dark ? 'border-white/80' : 'border-white'
            }`}
          />
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight">{tx(page.title, lang) || tx(profile.name, lang)}</h1>
          <p className={`mt-2 max-w-sm whitespace-pre-line text-center text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-slate-500'}`}>
            {tx(page.bio, lang) || tx(profile.tagline, lang)}
          </p>
        </div>

        {edit ? (
          <Reorder.Group axis="y" values={page.items} onReorder={edit.onReorder} className="mt-8 flex w-full flex-col gap-3">
            {page.items.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className={`rounded-2xl ${ring(item.id)}`}
                whileDrag={{ scale: 1.03, zIndex: 30 }}
                onClick={(e) => {
                  e.stopPropagation();
                  edit.onSelect(item.id);
                }}
              >
                {renderButton(item)}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <ul className="mt-8 flex w-full flex-col gap-3">
            {page.items.map((item) => {
              const btn = renderButton(item);
              return btn && <li key={item.id}>{btn}</li>;
            })}
          </ul>
        )}

        {page.showSocials && socials.length > 0 && (
          <div className="mt-10 flex gap-3">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={edit ? undefined : href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur ${
                  dark ? 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20' : 'border-slate-300/70 bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}

        <a
          href={edit ? undefined : '/'}
          className={`mt-10 flex items-center gap-1.5 text-xs font-medium ${dark ? 'text-white/50 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <img src="/images/lincent-logo.svg" alt="" className={`h-4 w-4 opacity-60 ${dark ? 'invert' : ''}`} />
          lincent
        </a>
      </main>
    </div>
  );
}

export function LinksPage() {
  const site = useSite();
  const projects = useProjects();
  const { lang, toggleLang } = useI18n();
  return <LinksView page={site.links} profile={site.profile} projects={projects} lang={lang} onToggleLang={toggleLang} />;
}
