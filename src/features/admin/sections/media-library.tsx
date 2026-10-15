'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Search, Trash2, X, Check } from 'lucide-react';
import { ApiError, adminApi, type MediaUsage, type MediaWithUsage } from '../shared/api';
import { UploadDropzone, UploadQueue, useMediaLibrary } from '../shared/media';
import { isVideoUrl } from '../../../components/media/media-image';

type Filter = 'all' | 'used' | 'unused';

const kb = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function MediaLibrary() {
  const { media, loading, setMedia, refresh } = useMediaLibrary();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const sorted = useMemo(
    () => [...media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [media]
  );
  const unused = sorted.filter((m) => m.usages.length === 0);
  const visible = sorted.filter((m) => {
    if (filter === 'used' && m.usages.length === 0) return false;
    if (filter === 'unused' && m.usages.length > 0) return false;
    const q = query.trim().toLowerCase();
    return !q || m.originalName.toLowerCase().includes(q) || (m.alt || '').toLowerCase().includes(q);
  });
  const active = media.find((m) => m.id === activeId) || null;

  const cleanUnused = async () => {
    if (!unused.length) return;
    if (!confirm(`確定刪除全部 ${unused.length} 張未使用的圖片？此動作無法復原。`)) return;
    setCleaning(true);
    setError(null);
    const removed: string[] = [];
    let failed = 0;
    for (const m of unused) {
      try {
        await adminApi.media.remove(m.id);
        removed.push(m.id);
      } catch {
        failed++;
      }
    }
    setMedia((list) => list.filter((m) => !removed.includes(m.id)));
    setCleaning(false);
    if (failed) setError(`有 ${failed} 張刪除失敗（可能剛被使用），請重新整理確認`);
    flash(`已刪除 ${removed.length} 張未使用圖片`);
  };

  const tabs: { key: Filter; label: string; n: number }[] = [
    { key: 'all', label: '全部', n: media.length },
    { key: 'used', label: '使用中', n: media.length - unused.length },
    { key: 'unused', label: '未使用', n: unused.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">媒體庫</h2>
          <p className="text-xs text-slate-500">所有圖片都在這裡管理；作品封面、相簿與網站圖片都從這裡挑選。</p>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">{toast}</span>}
          <button
            onClick={cleanUnused}
            disabled={!unused.length || cleaning}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> {cleaning ? '清除中…' : `清除所有未使用圖片（${unused.length}）`}
          </button>
        </div>
      </div>

      <UploadDropzone />
      <UploadQueue />

      {error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
          <button className="ml-3 underline" onClick={() => setError(null)}>
            關閉
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋檔名或替代文字"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {loading && !media.length ? (
        <div className="py-16 text-center text-sm text-slate-500">載入媒體庫…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          {media.length === 0 ? '媒體庫還是空的，拖曳圖片到上方開始上傳' : '沒有符合條件的圖片'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {visible.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-slate-400 hover:shadow"
            >
              <div className="relative aspect-square bg-slate-100">
                <img src={m.thumbUrl} alt={m.alt || ''} loading="lazy" className="h-full w-full object-cover" />
                {m.usages.length === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">未使用</span>
                )}
              </div>
              <div className="px-2.5 py-2">
                <div className="truncate text-[11px] font-medium text-slate-700">{m.originalName}</div>
                <div className="text-[10px] text-slate-400">
                  {m.width}×{m.height} · {kb(m.bytes)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <MediaDetail
          item={active}
          onClose={() => setActiveId(null)}
          onChanged={(updated) => setMedia((list) => list.map((m) => (m.id === updated.id ? updated : m)))}
          onDeleted={(id) => {
            setMedia((list) => list.filter((m) => m.id !== id));
            setActiveId(null);
            flash('圖片已刪除');
            refresh().catch(() => undefined);
          }}
          flash={flash}
        />
      )}
    </div>
  );
}

function MediaDetail({
  item,
  onClose,
  onChanged,
  onDeleted,
  flash,
}: {
  item: MediaWithUsage;
  onClose: () => void;
  onChanged: (m: MediaWithUsage) => void;
  onDeleted: (id: string) => void;
  flash: (m: string) => void;
}) {
  const [alt, setAlt] = useState(item.alt || '');
  const [savingAlt, setSavingAlt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUsages, setBlockedUsages] = useState<MediaUsage[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setAlt(item.alt || '');
    setBlockedUsages(null);
    setError(null);
  }, [item.id, item.alt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const saveAlt = async () => {
    setSavingAlt(true);
    setError(null);
    try {
      await adminApi.media.updateAlt(item.id, alt);
      onChanged({ ...item, alt });
      flash('替代文字已儲存');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingAlt(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(item.url, window.location.origin).toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('無法複製，請手動複製網址');
    }
  };

  const doDelete = async (force: boolean) => {
    setDeleting(true);
    setError(null);
    try {
      await adminApi.media.remove(item.id, force);
      onDeleted(item.id);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) {
        setBlockedUsages((e.data?.usages as MediaUsage[]) || item.usages);
      } else setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const onDeleteClick = () => {
    if (item.usages.length === 0) {
      if (confirm(`確定刪除「${item.originalName}」？此動作無法復原。`)) doDelete(false);
    } else {
      setBlockedUsages(item.usages);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/40 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="truncate pr-3 text-sm font-bold text-slate-900">{item.originalName}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="關閉">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {isVideoUrl(item.url) ? (
              <video src={item.url} poster={item.thumbUrl} controls muted playsInline className="max-h-[360px] w-full object-contain" />
            ) : (
              <img src={item.url} alt={item.alt || ''} className="max-h-[360px] w-full object-contain" />
            )}
          </div>

          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5">
              <dt className="text-slate-400">尺寸</dt>
              <dd className="font-semibold text-slate-800">
                {item.width}×{item.height}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <dt className="text-slate-400">大小</dt>
              <dd className="font-semibold text-slate-800">{kb(item.bytes)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5">
              <dt className="text-slate-400">上傳日期</dt>
              <dd className="font-semibold text-slate-800">{new Date(item.createdAt).toLocaleDateString('zh-TW')}</dd>
            </div>
          </dl>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">替代文字（alt，利於無障礙與 SEO）</label>
            <div className="flex gap-2">
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="簡短描述這張圖片"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <button
                onClick={saveAlt}
                disabled={savingAlt || alt === (item.alt || '')}
                className="rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white disabled:opacity-40"
              >
                {savingAlt ? '儲存中' : '儲存'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">圖片網址</span>
            <div className="flex gap-2">
              <input readOnly value={item.url} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" />
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-700">使用位置（{item.usages.length}）</span>
            {item.usages.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">目前沒有被任何地方使用，可以安全刪除。</p>
            ) : (
              <ul className="space-y-1">
                {item.usages.map((u, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {u.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

          {blockedUsages ? (
            <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold text-rose-800">這張圖片正在使用中，刪除後下列位置會出現破圖：</p>
              <ul className="list-inside list-disc text-xs text-rose-700">
                {blockedUsages.map((u, i) => (
                  <li key={i}>{u.label}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => doDelete(true)}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {deleting ? '刪除中…' : '仍要刪除'}
                </button>
                <button onClick={() => setBlockedUsages(null)} className="rounded-lg px-4 py-2 text-xs text-slate-600 hover:bg-white">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onDeleteClick}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> 刪除圖片
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
