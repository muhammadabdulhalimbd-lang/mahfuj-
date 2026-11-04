import React from 'react';
import { CalculatedStats } from '../types/trading';
import { money, pct, fp } from '../utils/calculations';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  CheckCircle2, 
  Flame, 
  Activity, 
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MonthlyStatsCockpitProps {
  stats: CalculatedStats;
  lang: 'bn' | 'en';
}

export const MonthlyStatsCockpit: React.FC<MonthlyStatsCockpitProps> = ({ stats, lang }) => {
  // Build SVG sparkline coordinates
  const balancePoints = [stats.start];
  stats.res.forEach((r) => {
    if (r.any) balancePoints.push(r.bal);
  });

  const width = 360;
  const height = 80;
  const minBal = Math.min(...balancePoints);
  const maxBal = Math.max(...balancePoints);
  const range = maxBal - minBal || 1;

  let sparklinePath = '';
  let sparklineArea = '';

  if (balancePoints.length > 1) {
    const coords = balancePoints.map((val, idx) => {
      const x = (idx / (balancePoints.length - 1)) * width;
      const y = height - 10 - ((val - minBal) / range) * (height - 24);
      return [x, y];
    });

    const pathData = coords
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`)
      .join(' ');

    sparklinePath = pathData;
    sparklineArea = `${pathData} L ${width} ${height} L 0 ${height} Z`;
  }

  const isNetPositive = stats.net >= 0;

  return (
    <section className="space-y-3">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl shadow-slate-950/40">
        
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400/90">
                {lang === 'bn' ? 'চলতি ব্যালেন্স ও ইকুইটি' : 'Account Balance & Equity'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {lang === 'bn' ? 'শুরু: ' : 'Start: '}{money(stats.start)}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {money(stats.bal)}
              </h2>

              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  isNetPositive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isNetPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{stats.net >= 0 ? '+' : ''}{money(stats.net)}</span>
                <span className="opacity-75">·</span>
                <span>{stats.start ? pct(stats.net / stats.start) : '0%'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {stats.tr > 0
                ? (lang === 'bn' 
                    ? `${stats.tr}টি ট্রেড সম্পন্ন · উইন রেট ${pct(stats.w / stats.tr)}` 
                    : `${stats.tr} closed trades · ${pct(stats.w / stats.tr)} win rate`)
                : (lang === 'bn' ? 'এখনো কোনো ট্রেড যুক্ত হয়নি' : 'No trades logged yet')}
            </p>
          </div>

          {/* SVG Sparkline Graph */}
          {balancePoints.length > 1 && (
            <div className="w-full md:w-64 h-16 sm:h-20 shrink-0">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={sparklineArea} fill="url(#equityGrad)" />
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Key Metric Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Win Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-sky-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'উইন রেট' : 'Win Rate'}</span>
            <Target className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            {stats.tr ? pct(stats.w / stats.tr) : '–'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            {stats.w}W / {stats.l}L ({stats.tr} trades)
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'প্রফিট ফ্যাক্টর' : 'Profit Factor'}</span>
            <Flame className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.pf}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            {stats.gl === 0 ? 'No losses yet' : `Gross win/loss`}
          </div>
        </div>

        {/* Avg Win vs Avg Loss */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'গড় লাভ / ক্ষতি' : 'Avg Win / Loss'}</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400">
              {stats.wd ? money(stats.gp / stats.wd) : '–'}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 dark:text-rose-400">
              {stats.ld ? money(stats.gl / stats.ld) : '–'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            R:R {stats.ld && stats.wd ? (Math.abs((stats.gp / stats.wd) / (stats.gl / stats.ld))).toFixed(2) : '–'}
          </div>
        </div>

        {/* Discipline Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'ডিসিপ্লিন স্কোর' : 'Discipline'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-amber-500">
            {isNaN(stats.disc) ? '–' : pct(stats.disc)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            {lang === 'bn' ? 'নিয়ম অনুসরণের হার' : 'Rules adherence'}
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'ম্যাক্স ড্রডাউন' : 'Max Drawdown'}</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            {stats.tr ? money(stats.mdd) : '–'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium font-mono">
            {stats.tr ? `(${pct(stats.mddp)})` : '–'}
          </div>
        </div>

        {/* A+ Setup Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-3 shadow-sm hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span className="font-semibold">{lang === 'bn' ? 'A+ সেটআপ' : 'A+ Setups'}</span>
            <Award className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {stats.apY}
            <span className="text-xs text-slate-400 font-normal"> / {stats.apY + stats.apN}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Win: {stats.apY ? pct(stats.apW / stats.apY) : '–'}
          </div>
        </div>

      </div>

      {/* Secondary Pips summary row */}
      {stats.res.some((r) => r.anyp) && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-sans font-medium">
              {lang === 'bn' ? 'মোট পিপস (Total Pips):' : 'Net Pips:'}
            </span>
            <span className={`font-bold ${stats.tp >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {fp(stats.tp)} pips
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>+{Math.round(stats.pw * 10) / 10}p won</span>
            <span>·</span>
            <span>{Math.round(stats.pls * 10) / 10}p lost</span>
          </div>
        </div>
      )}
    </section>
  );
};
