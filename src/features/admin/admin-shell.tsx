'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  UserRound,
  Home,
  BookUser,
  Briefcase,
  FolderKanban,
  Images,
  Inbox,
  LogOut,
  ExternalLink,
  Lock,
  Loader2,
  Menu,
  X,
  Link2,
} from 'lucide-react';
import { adminApi } from './shared/api';
import { MediaLibraryProvider } from './shared/media';
import { SiteDraftProvider, SiteSaveBar, useSiteDraft } from './shared/site-draft';
import { ProfileEditor } from './sections/profile-editor';
import { HomeEditor } from './sections/home-editor';
import { AboutEditor } from './sections/about-editor';
import { ExperienceEditor } from './sections/experience-editor';
import { ProjectsManager } from './sections/projects-manager';
import { MediaLibrary } from './sections/media-library';
import { InquiriesInbox } from './sections/inquiries-inbox';
import { Overview } from './sections/overview';
import { LinksEditor } from './sections/links-editor';

// 導覽順序對應前台：先網站內容（由上而下），再作品、媒體、詢問
export const ADMIN_TABS = [
  { key: 'overview', label: '總覽', icon: LayoutDashboard, group: '' },
  { key: 'profile', label: '個人資料與 SEO', icon: UserRound, group: '網站內容', preview: '/' },
  { key: 'home', label: '首頁區塊', icon: Home, group: '網站內容', preview: '/' },
  { key: 'experience', label: '工作經歷', icon: Briefcase, group: '網站內容', preview: '/#experience' },
  { key: 'about', label: '關於我頁面', icon: BookUser, group: '網站內容', preview: '/about' },
  { key: 'links', label: '入口頁', icon: Link2, group: '網站內容', preview: '/links' },
  { key: 'projects', label: '作品管理', icon: FolderKanban, group: '作品集', preview: '/projects' },
  { key: 'media', label: '媒體庫', icon: Images, group: '素材' },
  { key: 'inquiries', label: '詢問信箱', icon: Inbox, group: '聯絡' },
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number]['key'];
const SITE_TABS: AdminTab[] = ['profile', 'home', 'experience', 'about', 'links'];

export function AdminShell() {
  const [auth, setAuth] = useState<'checking' | 'in' | 'out'>('checking');
  const [passwordConfigured, setPasswordConfigured] = useState(true);

  useEffect(() => {
    adminApi.auth
      .status()
      .then((s) => {
        setAuth(s.authenticated ? 'in' : 'out');
        setPasswordConfigured(s.passwordConfigured);
      })
      .catch(() => setAuth('out'));
    const onUnauthorized = () => setAuth('out');
    window.addEventListener('admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', onUnauthorized);
  }, []);

  if (auth === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (auth === 'out') return <LoginScreen onSuccess={() => setAuth('in')} />;

  return (
    <SiteDraftProvider>
      <MediaLibraryProvider>
        <AdminLayout passwordConfigured={passwordConfigured} onLogout={() => setAuth('out')} />
      </MediaLibraryProvider>
    </SiteDraftProvider>
  );
}

function useTab(): [AdminTab, (t: AdminTab) => void] {
  const [tab, setTabState] = useState<AdminTab>('overview');
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab') as AdminTab | null;
    if (t && ADMIN_TABS.some((x) => x.key === t)) setTabState(t);
  }, []);
  const setTab = useCallback((t: AdminTab) => {
    setTabState(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    url.searchParams.delete('project');
    window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0 });
  }, []);
  return [tab, setTab];
}

function AdminLayout({ passwordConfigured, onLogout }: { passwordConfigured: boolean; onLogout: () => void }) {
  const [tab, setTab] = useTab();
  const [navOpen, setNavOpen] = useState(false);
  const { dirty } = useSiteDraft();
  const current = ADMIN_TABS.find((t) => t.key === tab)!;

  const logout = async () => {
    if (dirty && !confirm('網站內容還有未儲存的變更，確定要登出？')) return;
    await adminApi.auth.logout().catch(() => undefined);
    onLogout();
  };

  let lastGroup = '';
  const nav = (
    <nav className="space-y-0.5">
      {ADMIN_TABS.map((t) => {
        const showGroup = t.group && t.group !== lastGroup;
        lastGroup = t.group;
        const Icon = t.icon;
        const active = t.key === tab;
        return (
          <React.Fragment key={t.key}>
            {showGroup && <div className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.group}</div>}
            <button
              onClick={() => {
                setTab(t.key);
                setNavOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{t.label}</span>
              {dirty && SITE_TABS.includes(t.key) && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="未儲存" />}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        {/* 側欄 */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-0 lg:flex lg:h-screen ${
            navOpen ? 'flex' : 'hidden'
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <img src="/images/lincent-logo.svg" alt="" className="h-7 w-7" />
              <div>
                <div className="text-sm font-bold">Lincent CMS</div>
                <div className="text-[10px] text-slate-500">網站後台</div>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setNavOpen(false)} aria-label="關閉選單">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <div className="space-y-1 border-t border-slate-200 pt-3">
            <a href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/60">
              <ExternalLink className="h-4 w-4" /> 開啟網站
            </a>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/60">
              <LogOut className="h-4 w-4" /> 登出
            </button>
          </div>
        </aside>
        {navOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setNavOpen(false)} />}

        {/* 主內容 */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/90 px-4 py-3 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setNavOpen(true)} aria-label="開啟選單">
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold">{current.label}</h1>
            </div>
            {'preview' in current && current.preview && (
              <a
                href={current.preview}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
              >
                在前台查看 <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </header>

          {!passwordConfigured && (
            <div className="mx-4 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:mx-8">
              目前使用開發用預設密碼。正式上線前請設定環境變數 <code className="font-mono">ADMIN_PASSWORD</code>，否則正式環境會停用後台登入。
            </div>
          )}

          <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-8">
            {tab === 'overview' && <Overview onNavigate={setTab} />}
            {tab === 'profile' && <ProfileEditor />}
            {tab === 'home' && <HomeEditor />}
            {tab === 'experience' && <ExperienceEditor />}
            {tab === 'about' && <AboutEditor />}
            {tab === 'links' && <LinksEditor />}
            {tab === 'projects' && <ProjectsManager />}
            {tab === 'media' && <MediaLibrary />}
            {tab === 'inquiries' && <InquiriesInbox />}
            {SITE_TABS.includes(tab) && <SiteSaveBar />}
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminApi.auth.login(password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold">登入網站後台</h1>
          <p className="text-xs text-slate-500">輸入管理密碼以編輯網站內容</p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理密碼"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button disabled={loading || !password} className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? '登入中…' : '登入'}
        </button>
      </form>
    </div>
  );
}
