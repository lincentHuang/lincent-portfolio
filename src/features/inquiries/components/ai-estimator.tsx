'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { ESTIMATE_FEATURES, PROJECT_TIERS, formatNTD, type EstimateResult } from '../pricing';

interface AiEstimatorProps {
  /** 把估價結果帶進下一步的需求欄位 */
  onApply: (payload: { budget: string; message: string }) => void;
}

export const AiEstimator: React.FC<AiEstimatorProps> = ({ onApply }) => {
  const { lang, isEn } = useI18n();
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EstimateResult | null>(null);

  const toggle = (id: string) =>
    setFeatures((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const tooShort = description.trim().length < 10;

  const runEstimate = async () => {
    if (tooShort || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, features, lang }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setResult(json.data);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Estimate failed, please try again.' : '估價失敗，請稍後再試'));
    } finally {
      setLoading(false);
    }
  };

  const tier = result ? PROJECT_TIERS.find((t) => t.id === result.tier) : null;
  const range = result ? `${formatNTD(result.min)} – ${formatNTD(result.max)}` : '';

  const apply = () => {
    if (!result || !tier) return;
    const featureLabels = ESTIMATE_FEATURES.filter((f) => features.includes(f.id)).map((f) => f.label[lang]);
    const lines = isEn
      ? [
          `[AI estimate] ${tier.name.en}: ${range}, ${result.weeksMin}–${result.weeksMax} weeks`,
          featureLabels.length ? `Features: ${featureLabels.join(', ')}` : '',
          '',
          description.trim(),
        ]
      : [
          `【AI 初估】${tier.name.zh}：${range}，約 ${result.weeksMin}–${result.weeksMax} 週`,
          featureLabels.length ? `功能：${featureLabels.join('、')}` : '',
          '',
          description.trim(),
        ];
    onApply({ budget: range, message: lines.filter((l, i) => l || i === 2).join('\n') });
  };

  return (
    <div className="rounded-[24px] bg-[#121218] text-white p-6 sm:p-8 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-300 text-[#121218] text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'AI Estimate' : 'AI 估價'}</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isEn ? 'Describe your project, get a ballpark in seconds' : '描述你的專案，幾秒拿到初步報價'}
          </h4>
        </div>
      </div>

      {!result ? (
        <div className="space-y-4">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1500}
            placeholder={
              isEn
                ? 'e.g. A booking site for my yoga studio with member login, online payment and a simple admin to manage classes.'
                : '例：幫瑜伽教室做預約網站，學員可以註冊登入、線上付款，我要有後台可以管理課表。'
            }
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-lime-300 transition-colors resize-none"
          />

          <div className="flex flex-wrap gap-2">
            {ESTIMATE_FEATURES.map((f) => {
              const on = features.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggle(f.id)}
                  aria-pressed={on}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    on
                      ? 'bg-lime-300 border-lime-300 text-[#121218]'
                      : 'bg-transparent border-white/20 text-white/70 hover:border-white/50 hover:text-white'
                  }`}
                >
                  {f.label[lang]}
                </button>
              );
            })}
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs">{error}</div>}

          <button
            type="button"
            onClick={runEstimate}
            disabled={tooShort || loading}
            className="w-full py-3.5 rounded-full bg-white text-[#121218] font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {loading
                ? isEn ? 'Estimating…' : '估價中…'
                : tooShort
                  ? isEn ? 'Describe at least 10 characters' : '至少描述 10 個字'
                  : isEn ? 'Get AI estimate' : '開始 AI 估價'}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2">
            <div className="text-xs font-mono text-lime-300">{tier?.name[lang]}</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">{range}</div>
            <div className="text-xs text-white/60">
              {isEn
                ? `About ${result.weeksMin}–${result.weeksMax} weeks`
                : `預估時程約 ${result.weeksMin}–${result.weeksMax} 週`}
            </div>
            <p className="text-sm text-white/80 leading-relaxed pt-1">{result.summary}</p>
          </div>

          {result.breakdown.length > 0 && (
            <ul className="divide-y divide-white/10 text-sm">
              {result.breakdown.map((b, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-white/80">{b.item}</span>
                  <span className="font-mono text-xs text-white/60 shrink-0">
                    {formatNTD(b.min)} – {formatNTD(b.max)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {result.assumptions.length > 0 && (
            <ul className="space-y-1 text-xs text-white/50 list-disc pl-4">
              {result.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}

          <p className="text-[11px] text-white/40">
            {isEn
              ? 'A preliminary estimate for reference only — the final quote follows a requirements call.'
              : '此為初步估價，僅供參考；正式報價以需求訪談後為準。'}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={apply}
              className="flex-1 py-3 rounded-full bg-lime-300 text-[#121218] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-lime-200 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{isEn ? 'Use this estimate, next' : '用這個估價，下一步'}</span>
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-5 py-3 rounded-full border border-white/20 text-sm text-white/80 flex items-center justify-center gap-2 hover:border-white/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEn ? 'Edit' : '重新估價'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
