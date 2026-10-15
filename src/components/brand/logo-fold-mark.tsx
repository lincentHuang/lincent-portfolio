import React from 'react';

/** 單次摺疊完成所需時間（ms）：紙片傾斜後三角形翻開成 L */
export const LOGO_FOLD_DONE_MS = 1120;

const CYCLE = '1.6s';

const css = `
.lf-stage { transform-box: view-box; transform-origin: 140px 140px; animation: lf-stage ${CYCLE} cubic-bezier(.4,0,.2,1) infinite; }
.lf-sheet { transform-box: view-box; transform-origin: 29px 140px; animation: lf-tilt ${CYCLE} cubic-bezier(.65,0,.35,1) infinite; }
.lf-flap { transform-box: fill-box; transform-origin: -4px 50%; animation: lf-fold ${CYCLE} cubic-bezier(.65,0,.35,1) infinite; }
@keyframes lf-stage { 0% { opacity: 0; transform: scale(.9); } 10%, 90% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.96); } }
@keyframes lf-tilt { 0%, 10% { transform: skewY(-19.8deg); } 35%, 100% { transform: skewY(0deg); } }
@keyframes lf-fold { 0%, 35% { transform: scaleX(-0.85); } 70%, 100% { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .lf-stage, .lf-sheet, .lf-flap { animation: none; } }
`;

/**
 * 換頁轉場用的 logo：內嵌 SVG，每次掛載都從第一格開始播，
 * 確保轉場畫面至少看得到一次完整摺疊。
 */
export function LogoFoldMark({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true">
      <style>{css}</style>
      <g transform="translate(29 16)" fill={color}>
        <g className="lf-stage">
          <g className="lf-sheet">
            <path d="M0 14 Q0 0 13.17 4.74 L86.83 31.26 Q100 36 100 50 L100 234 Q100 248 86.83 243.26 L13.17 216.74 Q0 212 0 198 Z" />
            <g className="lf-flap">
              <path d="M108 147.09 Q108 137 116.18 131.09 L117.82 129.91 Q126 124 135.45 127.54 L208.89 155.08 Q222 160 210.63 168.18 L119.37 233.82 Q108 242 108 228 Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
