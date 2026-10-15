'use client';

import React from 'react';
import { useMediaMeta } from '../../content/content-provider';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string;
  /** 'thumb' 只用小圖（卡片、縮圖）；'full' 依螢幕寬度自動挑大小 */
  variant?: 'thumb' | 'full';
  /** 首屏圖片設 true，不延遲載入 */
  priority?: boolean;
};

export const isVideoUrl = (url?: string) => !!url && /\.(mp4|webm)$/i.test(url.split('?')[0]);

/**
 * 前台統一的圖片元件：
 * - 媒體庫圖片自動帶寬高（避免版面跳動）、模糊預覽、srcset 響應式載入
 * - 外部網址或舊圖照常顯示
 * - 影片（.mp4 / .webm）：縮圖模式顯示封面圖，完整模式靜音循環播放
 */
export function MediaImage({ src, variant = 'full', priority, style, alt = '', sizes, ...rest }: Props) {
  const media = useMediaMeta();
  const [loaded, setLoaded] = React.useState(false);
  if (!src) return null;
  const meta = media[src];

  if (isVideoUrl(src) && variant === 'full') {
    return <AutoplayVideo src={src} poster={meta?.thumbUrl} width={meta?.width} height={meta?.height} title={alt} className={rest.className} style={style} />;
  }

  if (!meta) {
    return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" style={style} {...rest} />;
  }

  const hasThumb = meta.thumbUrl && meta.thumbUrl !== src;
  // GIF 的小圖是靜態 WebP，放進 srcSet 會讓瀏覽器挑到不會動的版本
  const isGif = src.toLowerCase().endsWith('.gif');
  const srcSet = hasThumb && variant === 'full' && !isGif ? `${meta.thumbUrl} 800w, ${src} ${meta.width}w` : undefined;

  return (
    <img
      src={variant === 'thumb' && hasThumb ? meta.thumbUrl : src}
      srcSet={srcSet}
      sizes={srcSet ? sizes || '(max-width: 1024px) 100vw, 70vw' : undefined}
      width={meta.width || undefined}
      height={meta.height || undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      style={{
        ...style,
        backgroundImage: !loaded && meta.blurDataUrl ? `url(${meta.blurDataUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      {...rest}
    />
  );
}

/** 進到畫面才開始播、離開就暫停，避免整頁影片同時下載播放 */
function AutoplayVideo({
  src,
  poster,
  width,
  height,
  title,
  className,
  style,
}: {
  src: string;
  poster?: string;
  width?: number;
  height?: number;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={width || undefined}
      height={height || undefined}
      title={title}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
      style={style}
    />
  );
}
