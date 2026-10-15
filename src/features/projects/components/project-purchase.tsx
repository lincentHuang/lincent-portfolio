'use client';

import React, { useRef, useState } from 'react';
import { Check, CheckCircle2, Send, ShoppingBag } from 'lucide-react';
import { useI18n } from '../../../i18n';
import type { Project } from '../../../content/types';
import { getShortProjectTitle } from './project-badge-icon';
import { submitInquiryAction } from '../../inquiries/server/actions';
import { LICENSES, PURCHASE_SCOPE, formatNTD, type License, type LicenseId } from '../../inquiries/pricing';

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-all';

/** 作品頁的購買方案：選方案後在原地帶入詢價表單，scope 寫入「購買專案」 */
export const ProjectPurchase: React.FC<{ project: Project }> = ({ project }) => {
  const { lang, isEn } = useI18n();
  const [selected, setSelected] = useState<LicenseId | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const quotes = project.licenseQuotes;
  if (!project.forSale || !quotes) return null;

  const title = getShortProjectTitle(project, lang);
  const priceOf = (l: License) => {
    const q = l.id === 'hosted' ? null : quotes[l.id];
    return q ? `${formatNTD(q.min)} – ${formatNTD(q.max)}` : l.fixedPrice![lang];
  };
  const current = LICENSES.find((l) => l.id === selected);

  const choose = (l: License) => {
    setSelected(l.id);
    setSubmitted(false);
    setErrorMessage('');
    setMessage(
      isEn
        ? `I'm interested in the ${l.name.en} of "${title}" (listed at ${priceOf(l)}).\nWhat I plan to use it for:\nTarget launch date:`
        : `我想了解「${title}」的${l.name.zh}（參考價 ${priceOf(l)}）。\n預計用途：\n希望上線時間：`,
    );
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !name || !email) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await submitInquiryAction({
        name,
        company,
        email,
        scope: PURCHASE_SCOPE,
        budget: `${current.name.zh}｜${title}｜${priceOf(current)}`.slice(0, 100),
        message,
      });
      if (res.success) {
        setSubmitted(true);
      } else if (typeof res.error === 'string') {
        setErrorMessage(res.error);
      } else {
        setErrorMessage(Object.values(res.error || {}).flat()[0] || (isEn ? 'Please check the form.' : '請檢查欄位格式'));
      }
    } catch {
      setErrorMessage(isEn ? 'Failed to send. Please try again later.' : '傳送失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200/90 bg-white p-7 sm:p-10 shadow-xs space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <ShoppingBag className="w-3.5 h-3.5 text-lime-600" />
          <span>{isEn ? '04 / Buy this product' : '04 / 購買此專案'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-sans font-bold text-[#121218] tracking-tight">
          {isEn ? 'Use it, own the code, or take it over' : '直接使用、拿原始碼，或整個買下'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {isEn
            ? 'Prices are ranges; the final quote depends on scope and is confirmed after we talk. Custom changes are billed separately.'
            : '價格為參考區間，實際報價依需求確認；客製修改另外以日費計算。'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label={isEn ? 'Purchase option' : '購買方式'}>
        {LICENSES.map((l) => {
          const active = selected === l.id;
          return (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(l)}
              className={`text-left rounded-[24px] border p-6 transition-all flex flex-col gap-4 ${
                active ? 'border-[#121218] bg-[#121218] text-white shadow-lg' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
              }`}
            >
              <div className="space-y-1">
                <div className="text-lg font-bold tracking-tight">{l.name[lang]}</div>
                <div className={`text-[11px] leading-relaxed ${active ? 'text-white/60' : 'text-slate-500'}`}>{l.desc[lang]}</div>
              </div>
              <div className={`text-base font-bold tracking-tight ${active ? 'text-lime-300' : 'text-[#121218]'}`}>{priceOf(l)}</div>
              <ul className={`space-y-1.5 text-xs ${active ? 'text-white/80' : 'text-slate-600'}`}>
                {l.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${active ? 'text-lime-300' : 'text-lime-600'}`} />
                    <span>{p[lang]}</span>
                  </li>
                ))}
              </ul>
              <span
                className={`mt-auto text-xs font-semibold ${active ? 'text-white' : 'text-slate-500'}`}
              >
                {active ? (isEn ? 'Selected ↓' : '已選擇 ↓') : isEn ? 'Ask about this →' : '詢問這個方案 →'}
              </span>
            </button>
          );
        })}
      </div>

      {current &&
        (submitted ? (
          <div className="p-8 rounded-2xl bg-lime-50 border border-lime-300 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-lime-600 mx-auto" />
            <div className="text-lg font-bold text-slate-900">{isEn ? 'Inquiry sent' : '已收到你的詢問'}</div>
            <p className="text-xs text-slate-600">{isEn ? 'I will reply by email within 24 hours.' : '我會在 24 小時內用 Email 回覆你。'}</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-6 border-t border-slate-100">
            <div className="text-sm font-bold text-slate-900">
              {isEn ? `Inquire: ${current.name.en}` : `詢問：${current.name.zh}`}
              <span className="ml-2 font-mono text-xs font-normal text-slate-500">{priceOf(current)}</span>
            </div>
            {errorMessage && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{errorMessage}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={isEn ? 'Name' : '稱呼'} aria-label={isEn ? 'Name' : '稱呼'} className={inputCls} />
              <input type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" aria-label="Email" className={inputCls} />
              <input type="text" maxLength={200} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={isEn ? 'Company (optional)' : '公司（選填）'} aria-label={isEn ? 'Company' : '公司'} className={inputCls} />
            </div>
            <textarea rows={4} required maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} aria-label={isEn ? 'Message' : '訊息'} className={`${inputCls} resize-none`} />
            <button
              type="submit"
              disabled={isSubmitting || !name || !email}
              className="w-full py-3.5 rounded-full bg-[#121218] text-white font-semibold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isEn ? 'Sending…' : '傳送中…') : isEn ? 'Send inquiry' : '送出詢問'}</span>
            </button>
          </form>
        ))}
    </div>
  );
};
