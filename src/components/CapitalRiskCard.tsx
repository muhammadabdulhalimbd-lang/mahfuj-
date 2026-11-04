import React, { useState, useEffect } from 'react';
import { ShieldAlert, DollarSign, Percent, TrendingDown } from 'lucide-react';
import { num } from '../utils/calculations';

interface CapitalRiskCardProps {
  startingBalance: number;
  maxLossPct: number;
  onUpdateCapital: (balance: number, maxLossPct: number) => void;
  lang: 'bn' | 'en';
}

export const CapitalRiskCard: React.FC<CapitalRiskCardProps> = ({
  startingBalance,
  maxLossPct,
  onUpdateCapital,
  lang,
}) => {
  const [balanceInput, setBalanceInput] = useState<string>(String(startingBalance || '1000'));
  const [pctInput, setPctInput] = useState<string>(String(maxLossPct || '2'));
  const [dollarInput, setDollarInput] = useState<string>('');

  useEffect(() => {
    setBalanceInput(String(startingBalance || ''));
  }, [startingBalance]);

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
    onUpdateCapital(s, isNaN(p) ? 2 : p);
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
    onUpdateCapital(s, isNaN(p) ? 0 : p);
  };

  const handleDollarChange = (val: string) => {
    setDollarInput(val);
    const s = num(balanceInput) || 0;
    const d = num(val);
    if (!isNaN(d) && s > 0) {
      const calculatedPct = Number(((d / s) * 100).toFixed(2));
      setPctInput(String(calculatedPct));
      onUpdateCapital(s, calculatedPct);
    } else {
      setPctInput('');
      onUpdateCapital(s, 0);
    }
  };

  const maxLossDollar = ((num(balanceInput) || 0) * (num(pctInput) || 0)) / 100;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {lang === 'bn' ? 'মূলধন ও ঝুঁকি ব্যবস্থাপনা' : 'Capital & Risk Safeguards'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'প্রতিদিনের সর্বোচ্চ লস সীমা নির্ধারণ করুন' : 'Lock in your daily max risk threshold'}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Starting Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-sky-500" />
            {lang === 'bn' ? 'শুরুর ব্যালেন্স ($)' : 'Starting Balance ($)'}
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
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {lang === 'bn' 
            ? '💡 কোনো দিনে লস এই সীমায় পৌঁছালে সফটওয়্যার লাল অ্যালার্ট দেবে এবং ট্রেড বন্ধ রাখার পরামর্শ দেবে।' 
            : '💡 Reaching this loss on any single day highlights the card red to enforce your hard stop.'}
        </span>
        <span className="font-semibold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
          {pctInput}% = {maxLossDollar ? `$${maxLossDollar.toFixed(2)}` : '$0'}
        </span>
      </div>
    </div>
  );
};
