'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, ImagePlus, ImageIcon, Layers, Plus, RefreshCw, Trash2, X, Crop, Maximize } from 'lucide-react';
import type { GalleryRow, GalleryRowLayout, GallerySlot } from '../../../types';
import { MediaPicker } from '../shared/media';
import { IconBtn } from '../shared/fields';
import { DEFAULT_ROW_RATIO, GALLERY_LAYOUTS, GalleryRowView, columnsOf, slotCountOf } from '../../projects/components/gallery-row-view';

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const emptySlot = (url = ''): GallerySlot => ({ id: uid('slot'), url, fit: 'cover', aspectRatio: 'auto' });
const newRow = (layout: GalleryRowLayout, urls: string[] = []): GalleryRow => ({
  id: uid('row'),
  layout,
  slots: Array.from({ length: slotCountOf(layout) }, (_, i) => emptySlot(urls[i] || '')),
});

const ROW_RATIOS = [
  { v: '21/9', l: '很扁 21:9' },
  { v: '5/2', l: '扁 5:2' },
  { v: '2/1', l: '標準 2:1' },
  { v: '16/9', l: '偏高 16:9' },
  { v: '3/2', l: '高 3:2' },
];
const FULL_RATIOS = [
  { v: 'auto', l: '原圖比例' },
  { v: '21/9', l: '21:9' },
  { v: '16/9', l: '16:9' },
  { v: '4/3', l: '4:3' },
  { v: '1/1', l: '1:1' },
];

const selectCls = 'rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700';

function LayoutIcon({ layout, active }: { layout: GalleryRowLayout; active?: boolean }) {
  const cols = columnsOf(layout);
  const total = cols.reduce((a, b) => a + b, 0);
  return (
    <span className="flex h-3.5 w-8 gap-0.5">
      {cols.map((c, i) => (
        <span key={i} style={{ width: `${(c / total) * 100}%` }} className={`h-full rounded-sm ${active ? 'bg-white' : 'bg-slate-400'}`} />
      ))}
    </span>
  );
}

function InsertBar({ onInsert }: { onInsert: (layout: GalleryRowLayout) => void }) {
  return (
    <div className="group relative z-10 h-3 sm:h-4">
      <div className="absolute inset-x-0 top-1/2 h-px bg-transparent group-hover:bg-sky-300 group-focus-within:bg-sky-300" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-0.5 opacity-40 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button type="button" aria-label="在這裡插入新的一列" className="flex h-4 w-4 items-center justify-center rounded-full text-slate-500">
          <Plus className="h-3 w-3" />
        </button>
        <div className="hidden items-center gap-1 group-hover:flex group-focus-within:flex">
          {GALLERY_LAYOUTS.map((l) => (
            <button
              key={l.key}
              type="button"
              title={`插入「${l.label}」`}
              onClick={() => onInsert(l.key)}
              className="rounded-md bg-slate-50 px-1.5 py-1 hover:bg-slate-200"
            >
              <LayoutIcon layout={l.key} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GalleryRowsEditor({ rows, onChange }: { rows: GalleryRow[]; onChange: (rows: GalleryRow[]) => void }) {
  const [batchOpen, setBatchOpen] = useState(false);
  const [strategy, setStrategy] = useState<'full' | 'pair'>('full');
  const [pickSlot, setPickSlot] = useState<{ rowId: string; index: number } | null>(null);
  const [dragFrom, setDragFrom] = useState<{ rowId: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const updateRow = (id: string, fn: (r: GalleryRow) => GalleryRow) => onChange(rows.map((r) => (r.id === id ? fn(r) : r)));
  const updateSlot = (rowId: string, index: number, patch: Partial<GallerySlot>) =>
    updateRow(rowId, (r) => ({ ...r, slots: r.slots.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const changeLayout = (row: GalleryRow, layout: GalleryRowLayout) => {
    if (layout === row.layout) return;
    const need = slotCountOf(layout);
    // 縮減格數時優先保留有圖的格子
    const ordered = row.slots.length > need ? [...row.slots.filter((s) => s.url), ...row.slots.filter((s) => !s.url)] : row.slots;
    let slots = ordered.slice(0, need);
    if (ordered.slice(need).some((s) => s.url)) {
      if (!confirm('改成整列後，右側那張圖片會從這一列移除（圖片仍在媒體庫）。確定嗎？')) return;
    }
    while (slots.length < need) slots = [...slots, emptySlot()];
    updateRow(row.id, (r) => ({ ...r, layout, slots }));
  };

  const insertAt = (pos: number, layout: GalleryRowLayout) => {
    const next = [...rows];
    next.splice(pos, 0, newRow(layout));
    onChange(next);
  };

  const batchAdd = (urls: string[]) => {
    if (!urls.length) return;
    const created: GalleryRow[] = [];
    if (strategy === 'full') {
      urls.forEach((u) => created.push(newRow('full', [u])));
    } else {
      for (let i = 0; i < urls.length; i += 2) {
        if (i + 1 < urls.length) created.push(newRow('split-equal', [urls[i], urls[i + 1]]));
        else created.push(newRow('full', [urls[i]]));
      }
    }
    onChange([...rows, ...created]);
  };

  // 拖曳交換：兩個格子的內容整個對調，位置不變
  const swapSlots = (from: { rowId: string; index: number }, to: { rowId: string; index: number }) => {
    if (from.rowId === to.rowId && from.index === to.index) return;
    const rowA = rows.find((r) => r.id === from.rowId);
    const rowB = rows.find((r) => r.id === to.rowId);
    if (!rowA || !rowB) return;
    const a = rowA.slots[from.index];
    const b = rowB.slots[to.index];
    if (!a || !b) return;
    onChange(
      rows.map((r) => {
        if (r.id !== rowA.id && r.id !== rowB.id) return r;
        return {
          ...r,
          slots: r.slots.map((s, i) => {
            if (r.id === from.rowId && i === from.index) return b;
            if (r.id === to.rowId && i === to.index) return a;
            return s;
          }),
        };
      }),
    );
  };

  const cellPropsFor = (row: GalleryRow) => (index: number): React.HTMLAttributes<HTMLDivElement> => {
    const key = `${row.id}:${index}`;
    const filled = Boolean(row.slots[index]?.url);
    const isSource = dragFrom?.rowId === row.id && dragFrom.index === index;
    const isOver = dragOver === key && dragFrom && !isSource;
    return {
      draggable: filled,
      onDragStart: (e) => {
        if (!filled) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'gallery-slot');
        setDragFrom({ rowId: row.id, index });
      },
      onDragEnd: () => {
        setDragFrom(null);
        setDragOver(null);
      },
      onDragOver: (e) => {
        if (!dragFrom) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOver !== key) setDragOver(key);
      },
      onDragLeave: () => {
        if (dragOver === key) setDragOver(null);
      },
      onDrop: (e) => {
        e.preventDefault();
        if (dragFrom) swapSlots(dragFrom, { rowId: row.id, index });
        setDragFrom(null);
        setDragOver(null);
      },
      className: `${isOver ? 'ring-4 ring-sky-400' : ''} ${isSource ? 'opacity-50' : ''}`,
    };
  };

  const renderOverlay = (row: GalleryRow) => (slot: GallerySlot | undefined, index: number) => {
    if (!slot?.url) return null;
    const btn = 'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100';
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-2 top-2 z-10 flex flex-wrap items-center gap-0.5 rounded-xl bg-white/95 p-1 opacity-0 shadow-lg transition group-hover:opacity-100 focus-within:opacity-100"
      >
        <button type="button" className={btn} onClick={() => setPickSlot({ rowId: row.id, index })}>
          <RefreshCw className="h-3 w-3" /> 換圖
        </button>
        <button
          type="button"
          className={btn}
          title="切換圖片填滿方式"
          onClick={() => updateSlot(row.id, index, { fit: slot.fit === 'contain' ? 'cover' : 'contain' })}
        >
          {slot.fit === 'contain' ? <Maximize className="h-3 w-3" /> : <Crop className="h-3 w-3" />}
          {slot.fit === 'contain' ? '完整顯示' : '裁切填滿'}
        </button>
        <span className="inline-flex items-center gap-1 px-1 text-[11px] text-slate-600">
          背景
          <input
            type="color"
            value={slot.bgColor || '#eef0f3'}
            onChange={(e) => updateSlot(row.id, index, { bgColor: e.target.value })}
            className="h-5 w-6 cursor-pointer rounded border border-slate-200"
          />
          {slot.bgColor && (
            <button type="button" title="清除背景色" className="text-slate-400 hover:text-slate-700" onClick={() => updateSlot(row.id, index, { bgColor: undefined })}>
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
        <button type="button" className={`${btn} ml-auto text-red-600 hover:bg-red-50`} onClick={() => updateSlot(row.id, index, { url: '' })}>
          <Trash2 className="h-3 w-3" /> 移除圖片
        </button>
      </div>
    );
  };

  const renderEmpty = () => (
    <div className="absolute inset-2 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-400">
      <ImageIcon className="h-5 w-5" />
      點擊選擇圖片
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setBatchOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          <ImagePlus className="h-3.5 w-3.5" /> ＋ 批次加入圖片
        </button>
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStrategy('full')}
            className={`px-3 py-2 font-medium ${strategy === 'full' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
          >
            全部全寬
          </button>
          <button
            type="button"
            onClick={() => setStrategy('pair')}
            className={`px-3 py-2 font-medium ${strategy === 'pair' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
          >
            兩兩並排
          </button>
        </div>
        <span className="text-[11px] text-slate-400">
          {strategy === 'full' ? '每張圖各佔一列' : '依選取順序兩張一列，剩下單張用全寬'}
        </span>
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
        <Layers className="mr-1 inline h-3.5 w-3.5" />
        下方就是前台專案頁的實際樣子。點空格選圖、滑過圖片可換圖或調整填滿方式，拖曳圖片到另一格可對調位置，列與列之間的「＋」可插入新的一列。
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">還沒有相簿圖片</p>
          <p className="mt-1 text-xs text-slate-500">沒有相簿時，專案頁會只顯示封面圖。可以一次選多張圖，或先建立一個空白列再慢慢放。</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setBatchOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              <ImagePlus className="h-3.5 w-3.5" /> 批次加入圖片
            </button>
            <button
              type="button"
              onClick={() => insertAt(0, 'full')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> 新增第一列
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <InsertBar onInsert={(l) => insertAt(0, l)} />
          {rows.map((row, i) => {
            const isFull = row.layout === 'full';
            return (
              <div key={row.id}>
                <div className="group/row space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500 opacity-70 transition focus-within:opacity-100 group-hover/row:opacity-100">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold">{i + 1}</span>
                    <div className="flex items-center gap-0.5">
                      {GALLERY_LAYOUTS.map((l) => (
                        <button
                          key={l.key}
                          type="button"
                          title={l.label}
                          onClick={() => changeLayout(row, l.key)}
                          className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] ${
                            row.layout === l.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <LayoutIcon layout={l.key} active={row.layout === l.key} />
                          <span className="hidden md:inline">{l.label}</span>
                        </button>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-1 text-[11px]">
                      高度
                      {isFull ? (
                        <select className={selectCls} value={row.slots[0]?.aspectRatio || 'auto'} onChange={(e) => updateSlot(row.id, 0, { aspectRatio: e.target.value })}>
                          {FULL_RATIOS.map((a) => (
                            <option key={a.v} value={a.v}>
                              {a.l}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select className={selectCls} value={row.ratio || DEFAULT_ROW_RATIO} onChange={(e) => updateRow(row.id, (r) => ({ ...r, ratio: e.target.value }))}>
                          {ROW_RATIOS.map((a) => (
                            <option key={a.v} value={a.v}>
                              {a.l}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>
                    <div className="ml-auto flex items-center gap-0.5">
                      {!isFull && (
                        <IconBtn label="左右對調" onClick={() => updateRow(row.id, (r) => ({ ...r, slots: [r.slots[1], r.slots[0]] }))}>
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        </IconBtn>
                      )}
                      <IconBtn label="上移" onClick={() => move(i, -1)} disabled={i === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn label="下移" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        label="刪除這一列"
                        danger
                        onClick={() => {
                          if (confirm(`確定刪除第 ${i + 1} 列？（圖片仍保留在媒體庫）`)) onChange(rows.filter((r) => r.id !== row.id));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  </div>
                  <GalleryRowView
                    row={row}
                    cellProps={cellPropsFor(row)}
                    renderOverlay={renderOverlay(row)}
                    renderEmpty={renderEmpty}
                    onSlotClick={(slot, index) => {
                      if (!slot?.url) setPickSlot({ rowId: row.id, index });
                    }}
                  />
                </div>
                <InsertBar onInsert={(l) => insertAt(i + 1, l)} />
              </div>
            );
          })}
        </div>
      )}

      <MediaPicker multiple open={batchOpen} onClose={() => setBatchOpen(false)} onSelect={batchAdd} title="批次加入相簿圖片（依點選順序排列）" />
      <MediaPicker
        open={!!pickSlot}
        onClose={() => setPickSlot(null)}
        onSelect={([url]) => pickSlot && url && updateSlot(pickSlot.rowId, pickSlot.index, { url })}
        title="選擇這個格位的圖片"
      />
    </div>
  );
}
