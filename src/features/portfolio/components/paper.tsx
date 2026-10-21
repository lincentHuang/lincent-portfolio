import React from 'react';

/** 首頁共用的「紙」視覺元素：漸層紙面板、摺痕線、標籤膠囊、斜體重點標題，hero 與下方區塊一致 */

/** 背景的淡淡摺痕線，呼應摺紙主題；variant 決定摺痕位置 */
export const Creases: React.FC<{ variant?: 'right' | 'left'; className?: string }> = ({ variant = 'right', className = 'text-slate-400/30' }) => (
  <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
    <path
      d={variant === 'right' ? 'M56 0 L100 44 M56 100 L100 56 M56 0 L56 100' : 'M44 0 L0 44 M44 100 L0 56 M44 0 L44 100'}
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      fill="none"
      strokeDasharray="3 5"
    />
  </svg>
);

/** 漸層紙面板：圓角、邊框、左上柔光，摺痕只在大螢幕顯示 */
export const PaperPanel: React.FC<{ children: React.ReactNode; className?: string; creases?: 'right' | 'left' | false }> = ({
  children,
  className = '',
  creases = 'right',
}) => (
  <div className={`relative overflow-hidden rounded-[28px] border border-[#D5D9E0] bg-gradient-to-br from-[#F2F3F5] via-[#ECEEF1] to-[#E1E4E8] shadow-portfolio-card ${className}`}>
    <div className="absolute -top-48 -left-48 w-[560px] h-[560px] rounded-full bg-white/70 blur-3xl pointer-events-none" />
    {creases && (
      <div className="hidden xl:block">
        <Creases variant={creases} />
      </div>
    )}
    <div className="relative">{children}</div>
  </div>
);

/** 標籤膠囊：白色半透明底，可帶呼吸綠點 */
export const Eyebrow: React.FC<{ children: React.ReactNode; dot?: 'live' | 'static' | false; tone?: 'light' | 'dark' }> = ({
  children,
  dot = 'static',
  tone = 'light',
}) => (
  <div
    className={`inline-flex items-center gap-2 self-start rounded-full border backdrop-blur px-3.5 py-1.5 text-[12px] font-medium ${
      tone === 'light' ? 'border-slate-300/70 bg-white/70 text-slate-600' : 'border-white/15 bg-white/10 text-white/80'
    }`}
  >
    {dot && (
      <span className="relative flex w-2 h-2">
        {dot === 'live' && <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />}
        <span className={`relative w-2 h-2 rounded-full ${dot === 'live' ? 'bg-emerald-500' : tone === 'light' ? 'bg-slate-400' : 'bg-white/50'}`} />
      </span>
    )}
    {children}
  </div>
);

/**
 * 標題的斜體重點：用 *文字* 標出重點；沒有標記時，中文標題取最後一個「，」之後的子句。
 * 讓下方區塊標題和 hero 的「做成 *簡單好用的產品*」同一種語氣。
 */
export const Headline: React.FC<{ text: string; highlightClassName?: string }> = ({ text, highlightClassName = 'text-slate-400' }) => {
  const hl = (s: string, key?: number) => (
    <span key={key} className={`inline-block font-serif italic font-normal ${highlightClassName}`}>
      {s}
    </span>
  );
  if (text.includes('*')) {
    return <>{text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? hl(part, i) : part))}</>;
  }
  const cut = text.lastIndexOf('，');
  if (cut > 0 && cut < text.length - 1) {
    return (
      <>
        <span className="inline-block">{text.slice(0, cut + 1)}</span>
        {hl(text.slice(cut + 1))}
      </>
    );
  }
  return <>{text}</>;
};
