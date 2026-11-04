import React, { useState } from 'react';
import { DayLog, DayCalcResult, Trade } from '../types/trading';
import { 
  RULES_EN, 
  RULES_BN, 
  PRE_CHECK_EN, 
  PRE_CHECK_BN, 
  DAYS_OF_WEEK_SHORT, 
  DAYS_OF_WEEK_BN,
  POPULAR_PAIRS 
} from '../utils/constants';
import { money, fp, num } from '../utils/calculations';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Target
} from 'lucide-react';

interface DailyLogCardProps {
  dayIndex: number;
  day: DayLog;
  calcResult?: DayCalcResult;
  onUpdateDay: (updated: DayLog) => void;
  lang: 'bn' | 'en';
}

const MOTIVATIONAL_QUOTES_EN = [
  "Dream big, stay disciplined.",
  "Protect capital first, profits will follow.",
  "Follow your system, not your emotions.",
  "Patience pays higher than speed.",
  "Every loss is a lesson in risk management.",
  "Cut losers quickly, let winners breathe.",
  "Discipline creates freedom.",
  "Master your psychology, master the charts.",
  "Execution over anticipation.",
  "Trading is a marathon, not a sprint."
];

const MOTIVATIONAL_QUOTES_BN = [
  "স্বপ্ন বড় রাখুন, কিন্তু শৃঙ্খলায় অটল থাকুন।",
  "আগে মূলধন রক্ষা করুন, মুনাফা নিজ থেকেই আসবে।",
  "আবেগ নয়, নিজের ট্রেডিং সিস্টেম অনুসরণ করুন।",
  "দ্রুত ধনবান হওয়ার চেয়ে ধৈর্য বেশি লাভ এনে দেয়।",
  "প্রতিটি ক্ষতি ঝুঁকি নিয়ন্ত্রণের একটি অমূল্য শিক্ষা।",
  "ছোট লসেই ট্রেড কাটুন, লাভকে নিজের গতিতে বাড়তে দিন।",
  "শৃঙ্খলাহীন ট্রেডিং কেবল জুয়া খেলার নামান্তর।",
  "মনকে শান্ত রাখুন, চার্ট আপনাকে পথ দেখাবে।",
  "অনুমান নয়, সুনির্দিষ্ট সেটআপ আসলেই এন্ট্রি নিন।",
  "ট্রেডিং একটি দীর্ঘমেয়াদী দৌড়, এক রাতের খেলা নয়।"
];

export const DailyLogCard: React.FC<DailyLogCardProps> = ({
  dayIndex,
  day,
  calcResult,
  onUpdateDay,
  lang,
}) => {
  const [showRules, setShowRules] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const rulesList = lang === 'bn' ? RULES_BN : RULES_EN;
  const preCheckList = lang === 'bn' ? PRE_CHECK_BN : PRE_CHECK_EN;

  const weekdayIdx = dayIndex % 5;
  const weekday = lang === 'bn' ? DAYS_OF_WEEK_BN[weekdayIdx] : DAYS_OF_WEEK_SHORT[weekdayIdx];
  const quote = lang === 'bn' 
    ? MOTIVATIONAL_QUOTES_BN[dayIndex % MOTIVATIONAL_QUOTES_BN.length] 
    : MOTIVATIONAL_QUOTES_EN[dayIndex % MOTIVATIONAL_QUOTES_EN.length];

  // Emotion toggle (0 -> 1 -> 2 -> 0)
  const handleCycleEmotion = () => {
    const current = Number(day.ce) || 0;
    const next = (current + 1) % 3;
    onUpdateDay({ ...day, ce: next });
  };

  // Rule toggle (0 -> 1 -> 2 -> 0)
  const handleToggleRule = (ruleIdx: number) => {
    const newRules = [...(day.r || [0, 0, 0, 0, 0, 0])];
    newRules[ruleIdx] = (newRules[ruleIdx] + 1) % 3;
    onUpdateDay({ ...day, r: newRules });
  };

  // Pre-trade checklist 3-state cycling: 0 (unset) -> 1 (followed ✓) -> 2 (not followed ❌) -> 0
  const handleToggleCheck = (checkIdx: number) => {
    const newChecks = [...(day.c || [0, 0, 0, 0])];
    const currentVal = Number(newChecks[checkIdx]) || 0;
    newChecks[checkIdx] = (currentVal + 1) % 3;
    onUpdateDay({ ...day, c: newChecks });
  };

  // Trade fields update
  const handleTradeChange = (tradeIdx: number, field: keyof Trade, val: string) => {
    const newTrades = [...day.t];
    newTrades[tradeIdx] = { ...newTrades[tradeIdx], [field]: val };
    onUpdateDay({ ...day, t: newTrades });
  };

  // A+ toggle
  const handleToggleAp = (tradeIdx: number) => {
    const current = day.t[tradeIdx].ap;
    const next = current === 'Yes' ? 'No' : current === 'No' ? '' : 'Yes';
    handleTradeChange(tradeIdx, 'ap', next);
  };

  // Mood toggle
  const handleSetMood = (starNum: number) => {
    const current = day.m === String(starNum) ? '' : String(starNum);
    onUpdateDay({ ...day, m: current });
  };

  // Counts for summary
  const rules = day.r || [0, 0, 0, 0, 0, 0];
  const rulesFollowed = rules.filter((r) => r === 1).length;
  const rulesBroken = rules.filter((r) => r === 2).length;

  const checks = day.c || [0, 0, 0, 0];
  const checksFollowed = checks.filter((v) => Number(v) === 1).length;
  const checksBroken = checks.filter((v) => Number(v) === 2).length;

  const netProfit = calcResult?.net ?? 0;
  const hasTrades = calcResult?.any || calcResult?.anyp;
  const isLoss = calcResult?.tone ? calcResult.tone < 0 : false;
  const isWin = calcResult?.tone ? calcResult.tone > 0 : false;
  const isTargetHit = calcResult?.hitTarget;

  let cardBorder = 'border-slate-200 dark:border-slate-800';
  let cardBg = 'bg-white dark:bg-slate-900';

  if (hasTrades) {
    if (isWin) {
      cardBorder = 'border-emerald-500/50 dark:border-emerald-500/40';
      cardBg = 'bg-emerald-500/[0.02] dark:bg-emerald-950/20';
    } else if (isLoss) {
      cardBorder = 'border-rose-500/50 dark:border-rose-500/40';
      cardBg = 'bg-rose-500/[0.02] dark:bg-rose-950/20';
    }
  }

  if (calcResult?.hit) {
    cardBorder = 'border-rose-600 ring-2 ring-rose-500/30';
  }

  return (
    <div
      id={`day-card-${dayIndex}`}
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 ${cardBg} ${cardBorder}`}
    >
      {/* Top Mantra / Quote */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
        <span className="italic flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          {quote}
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold">
          {lang === 'bn' ? `সপ্তাহ ${Math.floor(dayIndex / 5) + 1}` : `Week ${Math.floor(dayIndex / 5) + 1}`}
        </span>
      </div>

      {/* Control Emotion Button (Signature feature) */}
      <button
        onClick={handleCycleEmotion}
        className={`w-full py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mb-3.5 transition ${
          day.ce === 1
            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
            : day.ce === 2
            ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 shadow-sm'
            : 'bg-transparent border-dashed border-amber-500/70 text-slate-700 dark:text-slate-300 hover:bg-amber-500/5'
        }`}
      >
        <span>
          {day.ce === 1 ? '✅' : day.ce === 2 ? '❌' : '⬜'}
        </span>
        <span>
          {day.ce === 1
            ? (lang === 'bn' ? 'আবেগ নিয়ন্ত্রণে রেখেছি (Emotion Under Control)' : 'Emotion Controlled & Disciplined')
            : day.ce === 2
            ? (lang === 'bn' ? 'আবেগ নিয়ন্ত্রণ হারালাম / টিল্টেড (Tilted / Emotional)' : 'Did Not Control Emotion / Revenge')
            : (lang === 'bn' ? 'আবেগ নিয়ন্ত্রণ করুন (Control your emotion - Tap to toggle)' : 'Control Your Emotion (Tap to log state)')}
        </span>
      </button>

      {/* Day Header Banner: Day Number, Net P/L, Balance */}
      <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800/80 mb-3.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            {weekday} · {lang === 'bn' ? `দিন ${dayIndex + 1}` : `Day ${dayIndex + 1}`}
          </span>
          <span className="text-xs text-slate-400">
            (#{dayIndex + 1}/20)
          </span>
        </div>

        <div className="text-right font-mono">
          {calcResult?.any ? (
            <div className="flex items-center gap-2">
              {isTargetHit && (
                <span title="Daily target achieved!" className="text-emerald-500 text-base">
                  🎯
                </span>
              )}
              <span
                className={`text-sm sm:text-base font-extrabold ${
                  netProfit > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : netProfit < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {money(netProfit)}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500">
                {money(calcResult.bal)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-sans">
              {lang === 'bn' ? 'কোনো এন্ট্রি নেই' : 'No trades logged'}
            </span>
          )}

          {calcResult?.anyp && (
            <div
              className={`text-xs font-bold ${
                calcResult.pips > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : calcResult.pips < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {fp(calcResult.pips)} pips
            </div>
          )}
        </div>
      </div>

      {/* Hard Stop / Daily Loss Limit Breached Warning */}
      {calcResult?.hit && (
        <div className="bg-rose-600 text-white p-3 rounded-xl mb-3.5 flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-md animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            {lang === 'bn' 
              ? '⚠️ দৈনিক লস সীমা অতিক্রম করেছে! শৃঙ্খলা বজায় রাখুন এবং আজকের জন্য স্ক্রিন বন্ধ করে ট্রেড থামান।' 
              : '⚠️ Daily loss limit hit! Protect your capital — stop trading for the remainder of today.'}
          </span>
        </div>
      )}

      {/* Accordion 1: Rules Check (6 Golden Discipline Rules) */}
      <div className="mb-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-2">
            <span>{lang === 'bn' ? 'নিয়ম চেকলিস্ট (Rules Check)' : 'Rules Check'}</span>
            {(rulesFollowed > 0 || rulesBroken > 0) && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{rulesFollowed}✓</span>{' '}
                <span className="text-rose-600 dark:text-rose-400 font-bold">{rulesBroken}✗</span>
              </span>
            )}
          </div>
          {showRules ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showRules && (
          <div className="p-3 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              {lang === 'bn' 
                ? '১ম ট্যাপ = ✓ মেনেছি, ২য় ট্যাপ = ✗ ভেঙেছি, ৩য় ট্যাপ = রিসেট' 
                : 'Tap rule to cycle: 1st tap = ✓ Followed, 2nd tap = ✗ Broken, 3rd tap = Reset'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {rulesList.map((ruleText, idx) => {
                const val = rules[idx] || 0;
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleRule(idx)}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition ${
                      val === 1
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : val === 2
                        ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate pr-2">{idx + 1}. {ruleText}</span>
                    <span className="font-mono font-bold shrink-0 text-xs">
                      {val === 1 ? '✓ Followed' : val === 2 ? '✗ Broken' : '–'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Pre-Trade Checklist (3-state: 0=unset, 1=✓ on, 2=❌ no) */}
      <div className="mb-3.5 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-2">
            <span>{lang === 'bn' ? 'ট্রেডের আগে চেকলিস্ট (Pre-Trade Checklist)' : 'Pre-Trade Checklist'}</span>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded font-bold ${
                checksFollowed === preCheckList.length
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {checksFollowed}/{preCheckList.length}
              {checksBroken > 0 && ` · ${checksBroken}❌`}
              {checksFollowed === preCheckList.length && ' ✓'}
            </span>
          </div>
          {showChecklist ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showChecklist && (
          <div className="p-3 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
              {lang === 'bn' 
                ? '⚠️ ১ বার ট্যাপ = ✓ মেনেছি, ২ বার ট্যাপ = ❌ মানিনি। কোনো বক্স খালি বা ❌ থাকলে ট্রেড করা নিষিদ্ধ।' 
                : '⚠️ 1st tap = ✓ Followed, 2nd tap = ❌ Not followed. Any empty box or ❌ = NO TRADE permitted.'}
            </div>
            <div className="space-y-1.5">
              {preCheckList.map((checkText, idx) => {
                const checkState = Number(checks[idx]) || 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleCheck(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-left transition border ${
                      checkState === 1
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        : checkState === 2
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition ${
                          checkState === 1
                            ? 'bg-emerald-500 border-emerald-500 text-white font-bold'
                            : checkState === 2
                            ? 'border-rose-500 bg-rose-500 text-white font-bold'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {checkState === 1 ? '✓' : checkState === 2 ? '❌' : ''}
                      </div>
                      <span>{checkText}</span>
                    </div>

                    <span className="font-mono text-[11px] font-bold">
                      {checkState === 1 ? '✓ Followed' : checkState === 2 ? '❌ Not Followed' : '–'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3 Dedicated Trade Rows */}
      <div className="space-y-2.5 mb-4">
        {day.t.map((trade, tIdx) => {
          const isProfitable = num(trade.pl) > 0 || (!num(trade.pl) && num(trade.pp) > 0);
          const isUnprofitable = num(trade.pl) < 0 || (!num(trade.pl) && num(trade.pp) < 0);

          return (
            <div
              key={tIdx}
              className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2.5 transition"
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                
                {/* Trade Pair */}
                <div className="col-span-6 sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'bn' ? `ট্রেড ${tIdx + 1} পেয়ার` : `Trade ${tIdx + 1} Pair`}
                  </label>
                  <input
                    type="text"
                    value={trade.p}
                    onChange={(e) => handleTradeChange(tIdx, 'p', e.target.value.toUpperCase())}
                    placeholder="e.g. XAUUSD"
                    list={`pairs-${dayIndex}-${tIdx}`}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <datalist id={`pairs-${dayIndex}-${tIdx}`}>
                    {POPULAR_PAIRS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>

                {/* Direction: Buy or Sell */}
                <div className="col-span-3 sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'bn' ? 'দিক' : 'Dir.'}
                  </label>
                  <select
                    value={trade.d}
                    onChange={(e) => handleTradeChange(tIdx, 'd', e.target.value as 'B' | 'S' | '')}
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none ${
                      trade.d === 'B'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : trade.d === 'S'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <option value="">–</option>
                    <option value="B">Buy (B)</option>
                    <option value="S">Sell (S)</option>
                  </select>
                </div>

                {/* A+ Setup */}
                <div className="col-span-3 sm:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'bn' ? 'A+ সেটআপ' : 'A+ Set'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleAp(tIdx)}
                    className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
                      trade.ap === 'Yes'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300'
                        : trade.ap === 'No'
                        ? 'bg-slate-200/60 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{trade.ap ? (trade.ap === 'Yes' ? '⭐ Yes' : 'No') : '–'}</span>
                  </button>
                </div>

              </div>

              {/* P/L ($) and Pips (+/-) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'bn' ? 'লাভ/ক্ষতি ($)' : 'P/L ($)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={trade.pl}
                    onChange={(e) => handleTradeChange(tIdx, 'pl', e.target.value)}
                    placeholder="e.g. 45 or -20"
                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none ${
                      isProfitable
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isUnprofitable
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'bn' ? 'পিপস (+/-)' : 'Pips (+/-)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={trade.pp}
                    onChange={(e) => handleTradeChange(tIdx, 'pp', e.target.value)}
                    placeholder="e.g. 25 or -12"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Reflections: Biggest Mistake & Next Day Focus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'আজকের সবচেয়ে বড় ভুল:' : 'Biggest mistake today:'}
          </label>
          <input
            type="text"
            value={day.mk || ''}
            onChange={(e) => onUpdateDay({ ...day, mk: e.target.value })}
            placeholder={lang === 'bn' ? 'আজ কোন ভুলটি করেছেন?' : 'Write your biggest mistake...'}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'আগামীকালের প্রধান লক্ষ্য / ফোকাস:' : 'Next day focus:'}
          </label>
          <input
            type="text"
            value={day.nf || ''}
            onChange={(e) => onUpdateDay({ ...day, nf: e.target.value })}
            placeholder={lang === 'bn' ? 'কাল কোন বিষয়ে মনোযোগ দেবেন?' : 'What will you focus on tomorrow?'}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Mood & Notes Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
        
        {/* Mood Stars Rating */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'মানসিক অবস্থা (Mood):' : 'Psychology / Mood:'}
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const currentMood = num(day.m) || 0;
              const isActive = starVal <= currentMood;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => handleSetMood(starVal)}
                  title={`${starVal} Star`}
                  className={`p-1 text-lg leading-none transition hover:scale-125 ${
                    isActive ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  ★
                </button>
              );
            })}
            <span className="text-[10px] text-slate-400 font-medium ml-1">
              {day.m === '1'
                ? (lang === 'bn' ? 'টিলিটেড/রাগ' : 'Tilted')
                : day.m === '5'
                ? (lang === 'bn' ? 'শান্ত ও ফোকাসড' : 'Calm & Focused')
                : ''}
            </span>
          </div>
        </div>

        {/* General Notes */}
        <div className="sm:col-span-7">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'সংক্ষিপ্ত নোট / মন্তব্য:' : 'Daily Notes:'}
          </label>
          <input
            type="text"
            value={day.n || ''}
            onChange={(e) => onUpdateDay({ ...day, n: e.target.value })}
            placeholder={lang === 'bn' ? 'ট্রেডের পেছনের যুক্তি বা অনুভূতি...' : 'Trade notes, market observations...'}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

      </div>

    </div>
  );
};
