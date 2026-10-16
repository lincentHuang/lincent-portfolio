import React from 'react';
import { Eyebrow, Headline } from './paper';

interface SectionHeadingProps {
  tag: React.ReactNode;
  /** 字串會套用 hero 同款斜體重點（見 Headline） */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** 標題右側的動作（例如「看全部」連結），窄螢幕會換到下方 */
  action?: React.ReactNode;
  className?: string;
}

/** 首頁各區塊共用的標題：與 hero 同一套標籤膠囊、字重與斜體重點 */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ tag, title, subtitle, action, className = 'mb-10 sm:mb-12' }) => (
  <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${className}`}>
    <div className="min-w-0 max-w-2xl flex flex-col">
      <Eyebrow>{tag}</Eyebrow>
      <h2 className="mt-5 text-[28px] sm:text-[38px] font-bold tracking-[-0.02em] leading-[1.18] text-[#121218] [text-wrap:balance]">
        {typeof title === 'string' ? <Headline text={title} /> : title}
      </h2>
      {subtitle && <p className="mt-4 max-w-xl text-[15px] sm:text-[16px] leading-relaxed text-slate-600 [text-wrap:pretty]">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
