'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ImagePlus, Loader2, Search, UploadCloud, X, AlertCircle } from 'lucide-react';
import { adminApi, uploadFile, type MediaWithUsage } from './api';
import { isVideoUrl } from '../../../components/media/media-image';

// ==========================================
// 圖片流程（後台）
// 上傳 → 伺服器壓縮/縮圖 → 進媒體庫 → 任何圖片欄位都從媒體庫選
// 媒體庫狀態在整個後台共用：任一處上傳，其他地方立刻看得到
// ==========================================

export interface UploadTask {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  previewUrl: string;
}

interface MediaLibraryCtx {
  media: MediaWithUsage[];
  loading: boolean;
  tasks: UploadTask[];
  refresh: () => Promise<void>;
  /** 上傳多個檔案（最多 3 個同時），回傳成功的媒體 */
  upload: (files: File[] | FileList) => Promise<MediaWithUsage[]>;
  clearFinished: () => void;
  setMedia: React.Dispatch<React.SetStateAction<MediaWithUsage[]>>;
}

const Ctx = createContext<MediaLibraryCtx | null>(null);

export function useMediaLibrary() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMediaLibrary 必須在 MediaLibraryProvider 內使用');
  return ctx;
}

const CONCURRENCY = 3;

export function MediaLibraryProvider({ children }: { children: React.ReactNode }) {
  const [media, setMedia] = useState<MediaWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setMedia((await adminApi.media.list()).media);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const upload = useCallback(async (input: File[] | FileList) => {
    const files = Array.from(input).filter((f) => f.type.startsWith('image/'));
    const newTasks = files.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      progress: 0,
      status: 'uploading' as const,
      previewUrl: URL.createObjectURL(f),
    }));
    setTasks((t) => [...newTasks, ...t]);

    const patch = (id: string, p: Partial<UploadTask>) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...p } : x)));
    const results: (MediaWithUsage | null)[] = new Array(files.length).fill(null);
    let cursor = 0;

    const worker = async () => {
      while (cursor < files.length) {
        const i = cursor++;
        const task = newTasks[i];
        try {
          const item = await uploadFile(files[i], (progress) => patch(task.id, { progress }));
          results[i] = item;
          setMedia((m) => [item, ...m]);
          patch(task.id, { status: 'done', progress: 100 });
        } catch (e: any) {
          patch(task.id, { status: 'error', error: e.message });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
    // 保持原本選取的順序
    return results.filter((x): x is MediaWithUsage => !!x);
  }, []);

  const clearFinished = useCallback(() => setTasks((t) => t.filter((x) => x.status === 'uploading')), []);

  const value = useMemo(
    () => ({ media, loading, tasks, refresh, upload, clearFinished, setMedia }),
    [media, loading, tasks, refresh, upload, clearFinished]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** 拖放 / 點擊 / 貼上（Ctrl+V）上傳區 */
export function UploadDropzone({
  onUploaded,
  multiple = true,
  compact,
}: {
  onUploaded?: (items: MediaWithUsage[]) => void;
  multiple?: boolean;
  compact?: boolean;
}) {
  const { upload } = useMediaLibrary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    const list = multiple ? Array.from(files) : [Array.from(files)[0]];
    const items = await upload(list);
    if (items.length) onUploaded?.(items);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'));
      if (files.length) {
        e.preventDefault();
        handle(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiple]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-center transition-colors ${
        compact ? 'p-4' : 'p-8'
      } ${dragging ? 'border-slate-900 bg-slate-100' : 'border-slate-300 bg-slate-50 hover:border-slate-500'}`}
    >
      <UploadCloud className="h-6 w-6 text-slate-500" />
      <span className="text-sm font-semibold text-slate-800">拖曳圖片到這裡、點擊選擇，或直接貼上</span>
      <span className="text-[11px] text-slate-500">
        JPG / PNG / WebP / HEIC / GIF，單檔 20MB 內。系統會自動轉正、壓縮成 WebP（最長邊 2400px）並產生縮圖
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/** 上傳進度列表 */
export function UploadQueue() {
  const { tasks, clearFinished } = useMediaLibrary();
  if (!tasks.length) return null;
  const busy = tasks.some((t) => t.status === 'uploading');
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{busy ? '上傳中…' : '上傳完成'}</span>
        {!busy && (
          <button className="text-slate-500 hover:text-slate-900" onClick={clearFinished}>
            清除
          </button>
        )}
      </div>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center gap-3">
          <img src={t.previewUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs text-slate-700">{t.name}</div>
            {t.status === 'error' ? (
              <div className="flex items-center gap-1 text-[11px] text-rose-600">
                <AlertCircle className="h-3 w-3" /> {t.error}
              </div>
            ) : (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${t.status === 'done' ? 'bg-emerald-500' : 'bg-slate-900'}`}
                  style={{ width: `${t.status === 'done' ? 100 : Math.min(t.progress, 95)}%` }}
                />
              </div>
            )}
          </div>
          {t.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {t.status === 'done' && <Check className="h-4 w-4 text-emerald-500" />}
        </div>
      ))}
    </div>
  );
}

/** 選圖器：上傳新圖或從媒體庫挑選 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple,
  title = '選擇圖片',
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  title?: string;
}) {
  const { media, loading } = useMediaLibrary();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = media.filter(
    (m) => !query || m.originalName.toLowerCase().includes(query.toLowerCase()) || m.alt?.includes(query)
  );

  const toggle = (url: string) => {
    if (!multiple) {
      onSelect([url]);
      onClose();
      return;
    }
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="關閉">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-3 overflow-y-auto p-5">
          <UploadDropzone
            compact
            multiple={multiple}
            onUploaded={(items) => {
              if (multiple) setSelected((s) => [...s, ...items.map((i) => i.url)]);
              else {
                onSelect([items[0].url]);
                onClose();
              }
            }}
          />
          <UploadQueue />

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋檔名或替代文字"
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500">載入媒體庫…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">媒體庫還沒有圖片，先上傳一張吧</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {filtered.map((m) => {
                const idx = selected.indexOf(m.url);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.url)}
                    className={`group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-2 transition ${
                      idx >= 0 ? 'ring-slate-900' : 'ring-transparent hover:ring-slate-300'
                    }`}
                    title={m.originalName}
                  >
                    <img src={m.thumbUrl} alt={m.alt || ''} className="h-full w-full object-cover" loading="lazy" />
                    {idx >= 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                    )}
                    {m.usages.length === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1 text-[9px] font-semibold text-slate-500">未使用</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {multiple && (
          <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <span className="text-xs text-slate-500">已選 {selected.length} 張（依點選順序加入）</span>
            <button
              disabled={!selected.length}
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              加入 {selected.length} 張
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

/** 單張圖片欄位：預覽 + 更換 + 移除 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect = 'aspect-video',
}: {
  label: string;
  hint?: string;
  value: string | undefined;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      <div className={`group relative ${aspect} w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50`}>
        {value ? (
          <>
            {isVideoUrl(value) ? (
              <video src={value} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/50 opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold">
                更換
              </button>
              <button type="button" onClick={() => onChange('')} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-600">
                移除
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-900"
          >
            <ImagePlus className="h-5 w-5" /> 選擇或上傳圖片
          </button>
        )}
      </div>
      {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={([url]) => onChange(url)} title={label} />
    </div>
  );
}
