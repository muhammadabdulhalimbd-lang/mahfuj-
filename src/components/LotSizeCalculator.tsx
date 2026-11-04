import React, { useState, useEffect } from 'react';
import { LotSettings, MonthData } from '../types/trading';
import { num, money } from '../utils/calculations';
import { Calculator, AlertTriangle, ShieldCheck, Info, Flame, Shield } from 'lucide-react';

interface LotSizeCalculatorProps {
  startingBalance: number;
  maxLossPct: number;
  dailyLossDollar: number;
  monthlyTarget: string;
  dailyTarget: string;
  lotSettings: Partial<LotSettings>;
  onUpdateLotSettings: (settings: LotSettings) => void;
  onApplyPropTargets: (mt: string, dt: string, maxLossPct: number) => void;
  onSwitchAccountType: (accountType: 'live' | 'prop') => void;
  lang: 'bn' | 'en';
}

const INSTRUMENT_PIP_VALUES: Record<string, number> = {
  eurusd: 10,
  gbpusd: 10,
  audusd: 10,
  nzdusd: 10,
  xauusd: 10, // 0.10 move = 1 pip
  usdjpy: 6.5,
  gbpjpy: 6.5,
  eurjpy: 6.5,
  usdcad: 7.4,
  usdchf: 11,
  btcusd: 1,
  us30: 1,
  nas100: 1,
};

const RISK_MODES = {
  safe: { s: 1 / 3, labelEn: 'Safe', labelBn: 'নিরাপদ (Safe)' },
  medium: { s: 2 / 3, labelEn: 'Medium Risk', labelBn: 'মাঝারি (Medium Risk)' },
  high: { s: 1, labelEn: 'High Risk', labelBn: 'উচ্চ ঝুঁকি (High Risk)' },
};

const PROP_DAILY_BASE = {
  '8': { '1': 80, '2': 60 },
  '10': { '1': 100, '2': 50 },
};

export const LotSizeCalculator: React.FC<LotSizeCalculatorProps> = ({
  startingBalance,
  maxLossPct,
  dailyLossDollar,
  monthlyTarget,
  dailyTarget,
  lotSettings,
  onUpdateLotSettings,
  onApplyPropTargets,
  onSwitchAccountType,
  lang,
}) => {
  const [tradesInput, setTradesInput] = useState<string>(lotSettings.t || '3');
  const [slInput, setSlInput] = useState<string>(lotSettings.s || '20');
  const [instrument, setInstrument] = useState<string>(lotSettings.i || 'eurusd');
  const [customPipVal, setCustomPipVal] = useState<string>(lotSettings.p || '10');
  const [customName, setCustomName] = useState<string>(lotSettings.n || '');
  const [riskMode, setRiskMode] = useState<'safe' | 'medium' | 'high'>(lotSettings.m || 'medium');
  const [accountType, setAccountType] = useState<'live' | 'prop'>(lotSettings.a || 'live');
  const [propPhase, setPropPhase] = useState<'1' | '2' | 'live'>(lotSettings.ph || '1');
  const [propOption, setPropOption] = useState<'8' | '10'>(lotSettings.o || '10');

  useEffect(() => {
    if (lotSettings.t !== undefined) setTradesInput(lotSettings.t);
    if (lotSettings.s !== undefined) setSlInput(lotSettings.s);
    if (lotSettings.i !== undefined) setInstrument(lotSettings.i);
    if (lotSettings.p !== undefined) setCustomPipVal(lotSettings.p);
    if (lotSettings.n !== undefined) setCustomName(lotSettings.n);
    if (lotSettings.m !== undefined) setRiskMode(lotSettings.m);
    if (lotSettings.a !== undefined) setAccountType(lotSettings.a);
    if (lotSettings.ph !== undefined) setPropPhase(lotSettings.ph);
    if (lotSettings.o !== undefined) setPropOption(lotSettings.o);
  }, [lotSettings]);

  const saveSettings = (newVals: Partial<LotSettings>) => {
    const merged: LotSettings = {
      t: newVals.t ?? tradesInput,
      s: newVals.s ?? slInput,
      i: newVals.i ?? instrument,
      p: newVals.p ?? customPipVal,
      n: newVals.n ?? customName,
      m: newVals.m ?? riskMode,
      a: newVals.a ?? accountType,
      ph: newVals.ph ?? propPhase,
      o: newVals.o ?? propOption,
    };
    onUpdateLotSettings(merged);
  };

  const getPipValue = (): number => {
    if (instrument === 'custom') {
      return num(customPipVal) || 10;
    }
    return INSTRUMENT_PIP_VALUES[instrument] || 10;
  };

  // Switch between Live Capital and Prop Firm
  const handleAccountTypeChange = (newType: 'live' | 'prop') => {
    setAccountType(newType);
    saveSettings({ a: newType });
    onSwitchAccountType(newType);

    if (newType === 'prop') {
      applyPropTargetsLogic(propPhase, propOption, startingBalance || 10000);
    }
  };

  // Switch Prop Phase
  const handlePhaseChange = (phase: '1' | '2' | 'live') => {
    setPropPhase(phase);
    saveSettings({ ph: phase });
    applyPropTargetsLogic(phase, propOption, startingBalance);
  };

  // Prop targets calculation logic
  const applyPropTargetsLogic = (phase: '1' | '2' | 'live', option: '8' | '10', balance: number) => {
    const b = balance > 0 ? balance : 10000;
    if (phase === 'live') {
      const T = Math.round(b * 0.05 * 100) / 100; // 5%
      const d = Math.round((T / 20) * 100) / 100; // 20 trading days
      const lossPct = b > 0 ? Number(((d / b) * 100).toFixed(2)) : 2;
      onApplyPropTargets(String(T), String(d), lossPct);
    } else {
      const targetPct = option === '8' ? 0.08 : 0.10;
      const T = Math.round(b * targetPct * 100) / 100;
      const baseDaily = PROP_DAILY_BASE[option][phase];
      const d = Math.round(baseDaily * (b / 10000) * 100) / 100;
      const lossPct = b > 0 ? Number(((d / b) * 100).toFixed(2)) : 2;
      onApplyPropTargets(String(T), String(d), lossPct);
    }
  };

  // Lot size math
  const b = startingBalance > 0 ? startingBalance : 0;
  const t = num(tradesInput) || 0;
  const sl = num(slInput) || 0;
  const pv = getPipValue();
  const mp = RISK_MODES[riskMode];

  const dayCap = dailyLossDollar > 0 ? dailyLossDollar : (maxLossPct > 0 && b > 0 ? (b * maxLossPct) / 100 : 0);
  const r = b > 0 && dayCap > 0 ? ((dayCap * mp.s) / b) * 100 : 0;

  const totRisk = b > 0 ? (b * r) / 100 : 0;
  const perTradeRisk = t > 0 ? totRisk / t : 0;
  const rawLot = sl > 0 && pv > 0 ? perTradeRisk / (sl * pv) : 0;
  const calculatedLot = Math.floor(rawLot * 100 + 1e-9) / 100;
  const useLot = calculatedLot >= 0.01 ? calculatedLot : 0.01;
  const actualRiskOnTrade = useLot * sl * pv;
  const reward1to2 = actualRiskOnTrade * 2;

  const isConfigured = b > 0 && t > 0 && r > 0 && sl > 0 && pv > 0;

  // Prop firm info box metrics
  const propTarget = num(monthlyTarget);
  const isTargetHigherThanMaxLoss = dailyLossDollar > 0 && num(dailyTarget) > dailyLossDollar;

  let estimatedDays = 0;
  if (propPhase === 'live') {
    estimatedDays = 20;
  } else if (propTarget > 0 && num(dailyTarget) > 0) {
    estimatedDays = Math.ceil(propTarget / num(dailyTarget));
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{lang === 'bn' ? '🧮 লট সাইজ ক্যালকুলেটর' : '🧮 Lot Size Calculator'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'স্টপ লস ও ঝুঁকি অনুযায়ী আদর্শ লট সাইজ নির্ধারণ করুন' : 'Calculate mathematically safe lot sizes based on your daily risk'}
            </p>
          </div>
        </div>

        {isConfigured && (
          <span className="hidden sm:inline-block text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            {useLot.toFixed(2)} Lot / Trade
          </span>
        )}
      </div>

      {/* Row 1: Trades per day, Stop loss pips, Instrument */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Trades per day */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'প্রতিদিনের ট্রেড সংখ্যা' : 'Trades per day'}
          </label>
          <input
            type="number"
            inputMode="numeric"
            step="1"
            value={tradesInput}
            onChange={(e) => {
              setTradesInput(e.target.value);
              saveSettings({ t: e.target.value });
            }}
            placeholder="3"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Stop loss pips */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'স্টপ লস (Pips)' : 'Stop loss (pips)'}
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={slInput}
            onChange={(e) => {
              setSlInput(e.target.value);
              saveSettings({ s: e.target.value });
            }}
            placeholder="20"
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Instrument dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {lang === 'bn' ? 'ট্রেডিং ইন্সট্রুমেন্ট' : 'Instrument'}
          </label>
          <select
            value={instrument}
            onChange={(e) => {
              setInstrument(e.target.value);
              saveSettings({ i: e.target.value });
            }}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="eurusd">EURUSD ($10/pip)</option>
            <option value="gbpusd">GBPUSD ($10/pip)</option>
            <option value="xauusd">XAUUSD - Gold ($10/pip / 0.10)</option>
            <option value="usdjpy">USDJPY ($6.5/pip)</option>
            <option value="gbpjpy">GBPJPY ($6.5/pip)</option>
            <option value="eurjpy">EURJPY ($6.5/pip)</option>
            <option value="audusd">AUDUSD ($10/pip)</option>
            <option value="nzdusd">NZDUSD ($10/pip)</option>
            <option value="usdcad">USDCAD ($7.4/pip)</option>
            <option value="usdchf">USDCHF ($11/pip)</option>
            <option value="btcusd">BTCUSD ($1/pt)</option>
            <option value="us30">US30 Dow Jones ($1/pt)</option>
            <option value="nas100">NAS100 Nasdaq ($1/pt)</option>
            <option value="custom">Other (Custom Pip Value)</option>
          </select>
        </div>
      </div>

      {/* Custom instrument inputs if custom selected */}
      {instrument === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {lang === 'bn' ? 'ইন্সট্রুমেন্ট এর নাম' : 'Instrument name'}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                saveSettings({ n: e.target.value });
              }}
              placeholder="e.g. GER40"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {lang === 'bn' ? 'পিপ ভ্যালু ($ প্রতি ১ লটে)' : 'Pip value ($ per 1 lot)'}
            </label>
            <input
              type="number"
              step="any"
              value={customPipVal}
              onChange={(e) => {
                setCustomPipVal(e.target.value);
                saveSettings({ p: e.target.value });
              }}
              placeholder="10"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Account Type Toggle: Live Capital vs Prop Firm */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>{lang === 'bn' ? 'অ্যাকাউন্টের ধরন:' : 'Account Type:'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAccountTypeChange('live')}
            className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              accountType === 'live'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'bn' ? 'লাইভ ক্যাপিটাল (Live Capital)' : 'Live Capital'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAccountTypeChange('prop')}
            className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              accountType === 'prop'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{lang === 'bn' ? 'প্রপ ফার্ম চ্যালেঞ্জ (Prop Firm)' : 'Prop Firm Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Prop Firm Phase Selector */}
      {accountType === 'prop' && (
        <div className="space-y-2.5 p-3 bg-amber-500/5 border border-amber-500/30 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>{lang === 'bn' ? 'প্রপ ফার্মের ধাপ (Phase):' : 'Prop Firm Phase:'}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setPropOption('8');
                  saveSettings({ o: '8' });
                  applyPropTargetsLogic(propPhase, '8', startingBalance);
                }}
                className={`px-2 py-0.5 text-[11px] rounded font-bold transition ${
                  propOption === '8'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                8% Target
              </button>
              <button
                type="button"
                onClick={() => {
                  setPropOption('10');
                  saveSettings({ o: '10' });
                  applyPropTargetsLogic(propPhase, '10', startingBalance);
                }}
                className={`px-2 py-0.5 text-[11px] rounded font-bold transition ${
                  propOption === '10'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                10% Target
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '1', label: 'Phase 1' },
              { id: '2', label: 'Phase 2' },
              { id: 'live', label: 'Prop Live' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePhaseChange(p.id as '1' | '2' | 'live')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                  propPhase === p.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Prop Strategy Card */}
          <div className="pt-2 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
            {propPhase === 'live' ? (
              <>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  <b>Prop Live</b> · {lang === 'bn' ? 'মাসিক টার্গেট' : 'Monthly Target'}{' '}
                  <b>{money(propTarget)}</b> (5% of balance)
                </div>
                <div>
                  {lang === 'bn' ? 'দৈনিক লক্ষ্য' : 'Daily Target'}{' '}
                  <b>{money(num(dailyTarget))}</b> (২০ ট্রেডিং দিনে / 20 days)
                </div>
                <div className="text-[11px] text-slate-500">
                  {lang === 'bn'
                    ? 'ফান্ডেড অ্যাকাউন্ট সুরক্ষিত রাখতে দৈনিক টার্গেটের বেশি ট্রেড করবেন না এবং লস সীমা বাড়াবেন না।'
                    : 'To keep funded accounts safe, do not trade beyond target and maintain strict discipline.'}
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  <b>Phase {propPhase}</b> · {lang === 'bn' ? 'টার্গেট' : 'Target'}{' '}
                  <b>{money(propTarget)}</b> ({propOption}%)
                </div>
                <div>
                  {lang === 'bn' ? 'দৈনিক টার্গেট' : 'Daily Target'}{' '}
                  <b>{money(num(dailyTarget))}</b> →{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {lang === 'bn' ? `প্রায় ${estimatedDays} দিনে পূরণ সম্ভব` : `approx ${estimatedDays} trading days to pass`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {lang === 'bn'
                    ? 'দৈনিক টার্গেট ছোঁয়ার পর সেদিনের ট্রেড থামান। প্রপ ফার্মগুলোতে সর্বনিম্ন ট্রেডিং দিন (সাধারণত ৪ দিন) থাকে।'
                    : 'Stop trading once daily target is achieved. Note minimum required trading days (typically 4).'}
                </div>
              </>
            )}

            {isTargetHigherThanMaxLoss && (
              <div className="text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? '⚠️ দৈনিক টার্গেট আপনার সর্বোচ্চ দৈনিক লস থেকে বেশি। সময় বাড়িয়ে নিন।'
                    : '⚠️ Daily target exceeds your Max daily loss. Extend your timeframe.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Modes: Safe / Medium Risk / High Risk */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          {lang === 'bn' ? 'ঝুঁকির মাত্রা (Risk Mode):' : 'Risk Mode:'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['safe', 'medium', 'high'] as const).map((modeKey) => {
            const mData = RISK_MODES[modeKey];
            const isSelected = riskMode === modeKey;
            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => {
                  setRiskMode(modeKey);
                  saveSettings({ m: modeKey });
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{lang === 'bn' ? mData.labelBn : mData.labelEn}</span>
                <span className="text-[10px] font-normal opacity-75">
                  {Math.round(mData.s * 100)}% {lang === 'bn' ? 'লস সীমা' : 'of Max Loss'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lot Size Calculation Output Display */}
      {isConfigured ? (
        <div className="pt-2 space-y-3">
          
          {/* Big Output Banner */}
          <div className="bg-slate-100 dark:bg-slate-950/80 rounded-2xl p-4 text-center border border-slate-200 dark:border-slate-800 shadow-inner">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              {lang === 'bn' ? 'প্রতি ট্রেডে প্রস্তাবিত লট সাইজ' : 'Lot Size Per Trade'}
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100 leading-none py-1">
              {useLot.toFixed(2)}
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono block mt-1">
              {tradesInput} {lang === 'bn' ? 'টি ট্রেড, প্রতিটিতে সমান লট' : 'trades, each'}
            </span>
          </div>

          {/* Breakdown bullets */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>{lang === 'bn' ? 'ঝুঁকি মোড ও দৈনিক বরাদ্দ:' : 'Risk mode & daily budget:'}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {money(totRisk)} → {lang === 'bn' ? 'প্রতি ট্রেডে' : 'per trade'} {money(perTradeRisk)}
              </span>
            </div>

            {dayCap > 0 && (
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span>{lang === 'bn' ? 'সর্বোচ্চ দৈনিক লস সীমা:' : 'Max daily loss threshold:'}</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {money(dayCap)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>
                {slInput} pips SL ({lang === 'bn' ? '১টি ট্রেডে লস' : '1 trade loss'}):
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                -{money(actualRiskOnTrade)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span>
                1:2 Target ({Number(slInput) * 2} pips TP {lang === 'bn' ? 'লাভ' : 'profit'}):
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{money(reward1to2)}
              </span>
            </div>
          </div>

          {/* Warning if calculated lot was < 0.01 */}
          {calculatedLot < 0.01 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {lang === 'bn'
                  ? `⚠️ এই ব্যালেন্সে হিসাবকৃত লট ০.০১ এর নিচে। ব্রোকারের সর্বনিম্ন লট ০.০১ ব্যবহার করলে রিস্ক হবে $${(0.01 * sl * pv).toFixed(2)}, যা আপনার নির্ধারিত $${perTradeRisk.toFixed(2)} এর চেয়ে বেশি। ট্রেড সংখ্যা কমান বা স্টপ লস ছোট করুন।`
                  : `⚠️ Calculated lot is below 0.01. Using 0.01 makes the actual trade risk $${(0.01 * sl * pv).toFixed(2)}, exceeding your set risk of $${perTradeRisk.toFixed(2)}. Consider taking fewer trades or a smaller stop loss.`}
              </span>
            </div>
          )}

          {/* Balance comparison table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl mt-2">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3">{lang === 'bn' ? 'অ্যাকাউন্ট ব্যালেন্স' : 'Account Balance'}</th>
                  <th className="py-2 px-3 text-right">{lang === 'bn' ? 'রিস্ক/ট্রেড' : 'Risk/Trade'}</th>
                  <th className="py-2 px-3 text-right">{lang === 'bn' ? 'লট/ট্রেড' : 'Lot/Trade'}</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr className="bg-sky-50/50 dark:bg-sky-950/20 font-bold">
                  <td className="py-2 px-3 text-sky-700 dark:text-sky-300">
                    {money(b)} {lang === 'bn' ? '← আপনার ব্যালেন্স' : '← your account'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800 dark:text-slate-200">
                    {money(perTradeRisk)}
                  </td>
                  <td className="py-2 px-3 text-right text-sky-600 dark:text-sky-400">
                    {calculatedLot >= 0.01 ? calculatedLot.toFixed(2) : '<0.01 (0.01 min)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 text-center">
          {lang === 'bn'
            ? 'Starting Balance, Trades, Stop loss এবং Instrument সেট করলে লট সাইজ দেখা যাবে।'
            : 'Enter Starting balance, Trades per day, Stop loss pips, and Instrument to view calculated lot size.'}
        </div>
      )}

      {/* Bottom Disclaimer */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
        {lang === 'bn'
          ? 'এটি একটি গাণিতিক হিসাব এবং কোনো বিনিয়োগ পরামর্শ নয়। গোল্ডের ক্ষেত্রে প্রতি ০.১০ মুভমেন্টকে ১ পিপ হিসেবে ধরা হয়েছে। ব্রোকারের স্প্রেড ও লিভারেজ অনুযায়ী কিছুটা তারতম্য হতে পারে।'
          : 'Estimates for educational risk management, not financial advice. For Gold, 1 pip is assumed to be a 0.10 move. Check exact broker contract specifications before execution.'}
      </p>

    </div>
  );
};
