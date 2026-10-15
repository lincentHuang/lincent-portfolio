'use client';

import React from 'react';
import type { GalleryRow, GalleryRowLayout, GallerySlot } from '../../../types';
import { MediaImage } from '../../../components/media/media-image';

// ==========================================
// 專案頁相簿的單列渲染：前台與後台共用，確保後台所見即前台所得
// 兩欄列整列等高（依 row.ratio），圖片貼齊格子；手機寬度改為上下堆疊
// ==========================================

export const GALLERY_LAYOUTS: { key: GalleryRowLayout; label: string; columns: number[] }[] = [
  { key: 'full', label: '整列', columns: [1] },
  { key: 'split-equal', label: '一樣大', columns: [1, 1] },
  { key: 'split-left-large', label: '左邊大', columns: [3, 2] },
  { key: 'split-left-small', label: '右邊大', columns: [2, 3] },
];

export const DEFAULT_ROW_RATIO = '2/1';

export const columnsOf = (layout: GalleryRowLayout) =>
  (GALLERY_LAYOUTS.find((l) => l.key === layout) || GALLERY_LAYOUTS[0]).columns;

export const slotCountOf = (layout: GalleryRowLayout) => columnsOf(layout).length;

interface GalleryRowViewProps {
  row: GalleryRow;
  /** 疊在格子上的內容（後台工具列、前台放大提示） */
  renderOverlay?: (slot: GallerySlot | undefined, index: number) => React.ReactNode;
  /** 空格子要顯示的內容；不給則顯示淡灰底 */
  renderEmpty?: (index: number) => React.ReactNode;
  onSlotClick?: (slot: GallerySlot | undefined, index: number) => void;
  cellProps?: (index: number) => React.HTMLAttributes<HTMLDivElement>;
  alt?: string;
}

export function GalleryRowView({ row, renderOverlay, renderEmpty, onSlotClick, cellProps, alt = '' }: GalleryRowViewProps) {
  const columns = columnsOf(row.layout);

  const renderCell = (index: number, cellClass: string) => {
    const slot = row.slots[index];
    const hasImage = Boolean(slot?.url);
    return (
      <div
        key={slot?.id || index}
        {...cellProps?.(index)}
        onClick={onSlotClick ? () => onSlotClick(slot, index) : undefined}
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl ${cellClass} ${cellProps?.(index)?.className || ''}`}
        style={{ backgroundColor: slot?.bgColor || '#EEF0F3' }}
      >
        {hasImage ? (
          <MediaImage
            src={slot!.url}
            alt={slot!.title || alt}
            sizes={columns.length > 1 ? '(max-width: 640px) 100vw, 45vw' : undefined}
            className={`absolute inset-0 h-full w-full ${slot!.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          />
        ) : (
          renderEmpty?.(index)
        )}
        {renderOverlay?.(slot, index)}
      </div>
    );
  };

  // 全寬列：指定比例就裁切，'auto' 則依原圖比例
  if (columns.length === 1) {
    const slot = row.slots[0];
    const ratio = slot?.aspectRatio && slot.aspectRatio !== 'auto' ? slot.aspectRatio : undefined;
    if (!ratio && slot?.url) {
      return (
        <div
          {...cellProps?.(0)}
          onClick={onSlotClick ? () => onSlotClick(slot, 0) : undefined}
          className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl ${cellProps?.(0)?.className || ''}`}
          style={{ backgroundColor: slot.bgColor || '#EEF0F3' }}
        >
          <MediaImage src={slot.url} alt={slot.title || alt} className="block h-auto w-full" />
          {renderOverlay?.(slot, 0)}
        </div>
      );
    }
    return (
      <div style={{ aspectRatio: ratio || '16/9' }} className="grid">
        {renderCell(0, 'h-full w-full')}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:gap-4 sm:[aspect-ratio:var(--row-ratio)] sm:[grid-template-columns:var(--row-cols)]"
      style={
        {
          '--row-ratio': row.ratio || DEFAULT_ROW_RATIO,
          '--row-cols': columns.map((c) => `${c}fr`).join(' '),
        } as React.CSSProperties
      }
    >
      {columns.map((_, i) => renderCell(i, 'aspect-[4/3] sm:aspect-auto sm:h-full'))}
    </div>
  );
}
