'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '../../../i18n';
import { submitInquiryAction } from '../server/actions';
import { CONTACT_OPTIONS, PRICING_ENABLED, PROJECT_TIERS, ADD_ONS, formatNTD, type EngagementId } from '../pricing';
import { AiEstimator } from './ai-estimator';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';

const ICONS: Record<EngagementId, React.ElementType> = {
  fulltime: Briefcase,
  contract: CalendarClock,
  project: Layers,
  other: MessageCircle,
};

type Step = 'type' | 'estimate' | 'details' | 'contact' | 'done';

/** 只有開啟報價時，接案才多一步 AI 估價 */
const hasEstimate = (id: EngagementId | null) => PRICING_ENABLED && id === 'project';

/**
 * 聯繫頁的分步驟流程：一次只問一件事
 * 合作方式 →（接案才有）估價 → 需求內容 → 聯絡方式 → 完成
 */
export function ContactWizard({ initialType }: { initialType?: EngagementId }) {
  const { lang, isEn } = useI18n();

  const [engagement, setEngagement] = useState<EngagementId | null>(initialType ?? null);
  const [step, setStep] = useState<Step>(initialType ? (hasEstimate(initialType) ? 'estimate' : 'details') : 'type');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [showPrices, setShowPrices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const steps: Step[] = hasEstimate(engagement) ? ['type', 'estimate', 'details', 'contact'] : ['type', 'details', 'contact'];
  const stepIndex = steps.indexOf(step);
  const current = CONTACT_OPTIONS.find((e) => e.id === engagement);

  const go = (next: Step) => {
    setStep(next);
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => go(steps[Math.max(0, stepIndex - 1)]);

  const pick = (id: EngagementId) => {
    setEngagement(id);
    go(hasEstimate(id) ? 'estimate' : 'details');
  };

  const applyEstimate = (p: { budget: string; message: string }) => {
    setBudget(p.budget);
    setMessage(p.message);
    go('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !current) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await submitInquiryAction({ name, company, email, scope: current.scope, budget, message });
      if (res.success) {
        go('done');
      } else if (typeof res.error === 'string') {
        setErrorMessage(res.error);
      } else if (res.error) {
        const firstErr = Object.values(res.error).flat()[0];
        setErrorMessage(firstErr || (isEn ? 'Submission failed. Please check form fields.' : '提交失敗，請檢查欄位格式'));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || (isEn ? 'Failed to send. Please try again later.' : '傳送失敗，請稍後再試'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const restart = () => {
    setEngagement(null);
    setName('');
    setCompany('');
    setEmail('');
    setBudget('');
    setMessage('');
    go('type');
  };

  const inputCls =
    'w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-all';

  const stepLabels: Record<Exclude<Step, 'done'>, string> = {
    type: isEn ? 'Type' : '合作方式',
    estimate: isEn ? 'Estimate' : '估價',
    details: isEn ? 'Details' : '需求',
    contact: isEn ? 'Contact' : '聯絡方式',
  };

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-8 max-w-3xl mx-auto">
      {/* 進度條 */}
      {step !== 'done' && (
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-xs">
            {stepIndex > 0 ? (
              <button onClick={back} className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-3.5 h-3.5" />
                {isEn ? 'Back' : '上一步'}
              </button>
            ) : (
              <Link href="/" className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-3.5 h-3.5" />
                {isEn ? 'Home' : '回首頁'}
              </Link>
            )}
            <span className="font-mono text-slate-500">
              {stepIndex + 1} / {steps.length} · {stepLabels[step]}
            </span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= stepIndex ? 'bg-[#121218]' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div key={step} className="animate-step-in">
        {/* 1. 合作方式 */}
        {step === 'type' && (
          <div className="space-y-8">
            <StepTitle
              title={isEn ? 'How would you like to work together?' : '想用什麼方式合作？'}
              desc={isEn ? 'Pick one — every inquiry gets a reply within 24 hours.' : '選一個就好，每則詢問都會在 24 小時內回覆。'}
            />
            <div className="space-y-3" role="radiogroup" aria-label={isEn ? 'Engagement type' : '合作方式'}>
              {CONTACT_OPTIONS.map((e) => {
                const Icon = ICONS[e.id];
                const active = engagement === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => pick(e.id)}
                    className={`group w-full text-left rounded-[20px] border p-5 sm:p-6 flex items-center gap-4 transition-all ${
                      active ? 'border-[#121218] bg-[#121218] text-white' : 'border-slate-200 bg-white hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        active ? 'bg-lime-300 text-[#121218]' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold tracking-tight">{e.name[lang]}</div>
                      <div className={`text-xs mt-0.5 ${active ? 'text-white/60' : 'text-slate-500'}`}>{e.points[0][lang]}</div>
                    </div>
                    {PRICING_ENABLED && (
                      <div className={`hidden sm:block text-sm font-bold text-right ${active ? 'text-lime-300' : 'text-[#121218]'}`}>
                        {e.price[lang]}
                      </div>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? 'text-lime-300' : 'text-slate-400'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. 接案估價（可跳過） */}
        {step === 'estimate' && (
          <div className="space-y-6">
            <StepTitle
              title={isEn ? 'Want a quick ballpark first?' : '先拿個初步報價？'}
              desc={
                isEn
                  ? 'Describe your project and AI gives a price range. Totally optional.'
                  : '簡單描述專案，AI 幫你估個價格區間。不想估也可以直接下一步。'
              }
            />
            <AiEstimator onApply={applyEstimate} />

            <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPrices((v) => !v)}
                aria-expanded={showPrices}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-800"
              >
                {isEn ? 'Or see the price guide' : '或直接看報價表'}
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showPrices ? 'rotate-180' : ''}`} />
              </button>
              {showPrices && (
                <div className="divide-y divide-slate-200 border-t border-slate-200">
                  {PROJECT_TIERS.map((tier) => (
                    <div key={tier.id} className="px-5 py-4 space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-sm font-bold text-slate-900">{tier.name[lang]}</span>
                        <span className="text-sm font-bold text-[#121218]">
                          {formatNTD(tier.min)} – {formatNTD(tier.max)}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                        <span>{tier.desc[lang]}</span>
                        <span className="font-mono">
                          {isEn ? `${tier.weeks[0]}–${tier.weeks[1]} wks` : `${tier.weeks[0]}–${tier.weeks[1]} 週`}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-4 bg-slate-50 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700">{isEn ? 'Add-ons' : '加價項目'}</div>
                    {ADD_ONS.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-600">
                        <span>{a.name[lang]}</span>
                        <span className="font-mono">{a.price[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => go('details')}
              className="w-full py-3.5 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:border-slate-800 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
            >
              {isEn ? 'Skip, describe my needs' : '跳過，直接說明需求'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. 需求內容 */}
        {step === 'details' && current && (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) go('contact');
            }}
          >
            <StepTitle
              title={
                engagement === 'fulltime'
                  ? isEn ? 'Tell me about the role' : '說說這個職缺'
                  : PRICING_ENABLED
                    ? isEn ? 'What do you need?' : '想做什麼？'
                    : isEn ? 'What would you like to talk about?' : '想聊什麼？'
              }
              desc={
                engagement === 'fulltime'
                  ? isEn ? 'Team, responsibilities, tech stack — whatever you can share.' : '團隊、職責、技術棧，能分享的都可以。'
                  : isEn ? 'A few sentences is enough. Details can wait for the call.' : '幾句話就好，細節可以之後通話再聊。'
              }
            />
            <div className="space-y-1.5">
              <label htmlFor="cw-message" className="text-xs font-medium text-slate-700">
                {isEn ? 'Message' : '內容'}
              </label>
              <textarea
                id="cw-message"
                rows={6}
                required
                autoFocus
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  engagement === 'fulltime'
                    ? isEn ? 'e.g. We are a 10-person fintech team looking for a senior frontend lead…' : '例：我們是 10 人的金融科技團隊，在找資深前端負責人…'
                    : PRICING_ENABLED
                      ? isEn ? 'e.g. A booking site for my studio with online payment…' : '例：想做一個可以線上預約、付款的工作室網站…'
                      : isEn ? 'e.g. I saw one of your projects and wanted to ask…' : '例：看到你的某個作品，想問問…'
                }
                className={`${inputCls} resize-none`}
              />
            </div>
            {PRICING_ENABLED && (
              <div className="space-y-1.5">
                <label htmlFor="cw-budget" className="text-xs font-medium text-slate-700">
                  {engagement === 'fulltime' ? (isEn ? 'Salary range (optional)' : '薪資範圍（選填）') : isEn ? 'Budget (optional)' : '預算（選填）'}
                </label>
                <input
                  id="cw-budget"
                  type="text"
                  maxLength={100}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={current.price[lang]}
                  className={inputCls}
                />
              </div>
            )}
            <NextButton disabled={!message.trim()}>{isEn ? 'Next' : '下一步'}</NextButton>
          </form>
        )}

        {/* 4. 聯絡方式 */}
        {step === 'contact' && current && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <StepTitle
              title={isEn ? 'How can I reach you?' : '要怎麼聯絡你？'}
              desc={isEn ? 'Last step. I will reply by email within 24 hours.' : '最後一步，我會在 24 小時內用 Email 回覆你。'}
            />
            {errorMessage && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{errorMessage}</div>}
            <div className="space-y-1.5">
              <label htmlFor="cw-name" className="text-xs font-medium text-slate-700">
                {isEn ? 'Name' : '稱呼'}
              </label>
              <input
                id="cw-name"
                type="text"
                required
                autoFocus
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? 'Your name' : '怎麼稱呼你'}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cw-email" className="text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                id="cw-email"
                type="email"
                required
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cw-company" className="text-xs font-medium text-slate-700">
                {isEn ? 'Company (optional)' : '公司（選填）'}
              </label>
              <input
                id="cw-company"
                type="text"
                maxLength={200}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* 送出前的摘要，讓對方確認 */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
              <div>
                <span className="text-slate-400">{isEn ? 'Type: ' : '合作方式：'}</span>
                <span className="font-semibold text-slate-800">{current.name[lang]}</span>
                {budget && <span className="text-slate-500"> · {budget}</span>}
              </div>
              <div className="line-clamp-2 whitespace-pre-line">{message}</div>
            </div>

            <NextButton disabled={isSubmitting || !name || !email}>
              <Send className="w-4 h-4" />
              {isSubmitting ? (isEn ? 'Sending…' : '傳送中…') : isEn ? 'Send inquiry' : '送出'}
            </NextButton>
          </form>
        )}

        {/* 完成 */}
        {step === 'done' && (
          <div className="py-10 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-lime-600 mx-auto" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isEn ? 'Got it, thank you!' : '收到了，謝謝你！'}
            </h1>
            <p className="text-sm text-slate-600">
              {isEn ? 'I will reply to ' : '我會在 24 小時內回信到 '}
              <span className="font-semibold text-slate-800">{email}</span>
              {isEn ? ' within 24 hours.' : '。'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-4">
              <Link
                href="/projects"
                className="px-6 py-3 rounded-full bg-[#121218] text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                {isEn ? 'Browse projects' : '繼續看作品'}
              </Link>
              <button
                onClick={restart}
                className="px-6 py-3 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:border-slate-800"
              >
                {isEn ? 'Send another' : '再送一則'}
              </button>
            </div>
          </div>
        )}
      </div>

      {step !== 'done' && (
        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Mail className="w-3.5 h-3.5" />
          {isEn ? 'Prefer email?' : '習慣用 Email？'}
          <a href="mailto:lincent.work@gmail.com" className="font-semibold text-slate-800 hover:underline">
            lincent.work@gmail.com
          </a>
        </p>
      )}
    </section>
  );
}

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function NextButton({ disabled, children }: { disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-4 rounded-full bg-[#121218] text-white font-semibold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40"
    >
      {children}
    </button>
  );
}
