import React, { useState, useEffect } from 'react';
import { ShieldAlert, DollarSign, Percent, TrendingDown, Target, Flag } from 'lucide-react';
import { num } from '../utils/calculations';

interface CapitalRiskCardProps {
  startingBalance: number;
  maxLossPct: number;
  dailyTarget: string;
  monthlyTarget: string;
  isPropMode?: boolean;
  propOption?: '8' | '10';
  propPhase?: '1' | '2' | 'live';
  onUpdateCapital: (balance: number, maxLossPct: number, dt: string, mt: string) => void;
  lang: 'bn' | 'en';
}

export const CapitalRiskCard: React.FC<CapitalRiskCardProps> = ({
  startingBalance,
  maxLossPct,
  dailyTarget,
  monthlyTarget,
  isPropMode = false,
  propOption = '10',
  propPhase = '1',
  onUpdateCapital,
  lang,
}) => {
  const [balanceInput, setBalanceInput] = useState<string>(String(startingBalance || '1000'));
  const [pctInput, setPctInput] = useState<string>(String(maxLossPct || '2'));
  const [dollarInput, setDollarInput] = useState<string>('');
  const [dtInput, setDtInput] = useState<string>(dailyTarget || '');
  const [mtInput, setMtInput] = useState<string>(monthlyTarget || '');
  const [showPick, setShowPick] = useState(false);

  useEffect(() => {
    setBalanceInput(String(startingBalance || ''));
  }, [startingBalance]);

  useEffect(() => {
    setDtInput(dailyTarget || '');
  }, [dailyTarget]);

  useEffect(() => {
    setMtInput(monthlyTarget || '');
  }, [monthlyTarget]);

  useEffect(() => {
    setPctInput(String(maxLossPct ?? ''));
    const s = num(startingBalance) || 0;
    const p = num(maxLossPct);
    if (!isNaN(p) && s > 0) {
      setDollarInput(((s * p) / 100).toFixed(2));
    } else {
      setDollarInput('');
    }
  }, [maxLossPct, startingBalance]);

  const handleBalanceChange = (val: string) => {
    setBalanceInput(val);
    const s = num(val) || 0;
    const p = num(pctInput);
    if (!isNaN(p) && s > 0) {
      setDollarInput(((s * p) / 100).toFixed(2));
    }
    onUpdateCapital(s, isNaN(p) ? 2 : p, dtInput, mtInput);
  };

  const handlePctChange = (val: string) => {
    setPctInput(val);
    const s = num(balanceInput) || 0;
    const p = num(val);
    if (!isNaN(p) && s > 0) {
      setDollarInput(((s * p) / 100).toFixed(2));
    } else {
      setDollarInput('');
    }
    onUpdateCapital(s, isNaN(p) ? 0 : p, dtInput, mtInput);
  };

  const handleDollarChange = (val: string) => {
    setDollarInput(val);
    const s = num(balanceInput) || 0;
    const d = num(val);
    if (!isNaN(d) && s > 0) {
      const calculatedPct = Number(((d / s) * 100).toFixed(2));
      setPctInput(String(calculatedPct));
      onUpdateCapital(s, calculatedPct, dtInput, mtInput);
    } else {
      setPctInput('');
      onUpdateCapital(s, 0, dtInput, mtInput);
    }
  };

  const handleDtChange = (val: string) => {
    setDtInput(val);
    const s = num(balanceInput) || 0;
    const p = num(pctInput);
    onUpdateCapital(s, isNaN(p) ? 2 : p, val, mtInput);
  };

  const handleMtChange = (val: string) => {
    setMtInput(val);
    const s = num(balanceInput) || 0;
    const p = num(pctInput);
    onUpdateCapital(s, isNaN(p) ? 2 : p, dtInput, val);
  };

  const handlePickTarget = (pctVal: number) => {
    const s = num(balanceInput) || 0;
    const targetVal = String(Math.round((s * pctVal) / 100));
    setMtInput(targetVal);
    setShowPick(false);
    const p = num(pctInput);
    onUpdateCapital(s, isNaN(p) ? 2 : p, dtInput, targetVal);
  };

  const maxLossDollar = ((num(balanceInput) || 0) * (num(pctInput) || 0)) / 100;
  const balNum = num(balanceInput) || 0;
  const startK = balNum >= 1000 ? `= ${(balNum / 1000).toFixed(balNum % 1000 === 0 ? 0 : 2)}k` : '';

  let tpctLabel = '';
  if (isPropMode) {
    tpctLabel = propPhase === 'live' ? '= 5%' : `= ${propOption}%`;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{lang === 'bn' ? 'মূলধন, ঝুঁকি ও প্রফিট টার্গেট' : 'Capital, Risk & Profit Targets'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'শুরুর ব্যালেন্স, সর্বোচ্চ দৈনিক লস ও লাভের লক্ষ্য' : 'Lock in starting capital, daily hard stop & profit objectives'}
            </p>
          </div>
        </div>

        {maxLossDollar > 0 && (
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {lang === 'bn' ? 'দৈনিক সর্বোচ্চ স্টপ' : 'Daily Hard Stop'}
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
              -${maxLossDollar.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Starting Balance with k badge */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-sky-500" />
              {lang === 'bn' ? 'শুরুর ব্যালেন্স ($)' : 'Starting Balance ($)'}
            </span>
            {startK && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {startK}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => handleBalanceChange(e.target.value)}
              placeholder="1000"
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* Max Daily Loss % */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-rose-500" />
            {lang === 'bn' ? 'সর্বোচ্চ দৈনিক লস (%)' : 'Max Daily Loss (%)'}
          </label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={pctInput}
            onChange={(e) => handlePctChange(e.target.value)}
            placeholder="2.0"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
          />
        </div>

        {/* Max Daily Loss $ */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            {lang === 'bn' ? 'সর্বোচ্চ দৈনিক লস ($)' : 'Max Daily Loss ($)'}
          </label>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={dollarInput}
            onChange={(e) => handleDollarChange(e.target.value)}
            placeholder="20.00"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
          />
        </div>

        {/* Daily Profit Target ($) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            {lang === 'bn' ? 'দৈনিক প্রফিট টার্গেট ($)' : 'Daily Profit Target ($)'}
          </label>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={dtInput}
            onChange={(e) => handleDtChange(e.target.value)}
            placeholder="e.g. 20"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
          />
        </div>

        {/* Total Profit Target ($) */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-indigo-500" />
              {lang === 'bn' ? 'মোট প্রফিট টার্গেট ($)' : 'Total Profit Target ($)'}
            </span>
            {tpctLabel && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {tpctLabel}
              </span>
            )}
          </label>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={mtInput}
            onChange={(e) => handleMtChange(e.target.value)}
            onFocus={() => isPropMode && setShowPick(true)}
            placeholder="e.g. 400"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          />

          {/* Quick pick for Prop Firm */}
          {showPick && isPropMode && balNum > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-20 grid grid-cols-2 gap-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
              <button
                type="button"
                onClick={() => handlePickTarget(8)}
                className="py-1 px-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition"
              >
                ${Math.round(balNum * 0.08)} (8%)
              </button>
              <button
                type="button"
                onClick={() => handlePickTarget(10)}
                className="py-1 px-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-sky-500 hover:text-white transition"
              >
                ${Math.round(balNum * 0.10)} (10%)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <span>
          {lang === 'bn' 
            ? '💡 টার্গেট নির্ধারণ করলে ব্যালেন্স কার্ডে প্রগ্রেস বার দেখাবে এবং টার্গেট ছোঁয়ার দিনে 🎯 ব্যাজ যুক্ত হবে।' 
            : '💡 Setting profit targets displays a live progress bar on your balance card and tags winning target days with 🎯.'}
        </span>
        <span className="font-semibold text-sky-600 dark:text-sky-400 shrink-0">
          {pctInput}% = {maxLossDollar ? `$${maxLossDollar.toFixed(2)}` : '$0'}
        </span>
      </div>
    </div>
  );
};
