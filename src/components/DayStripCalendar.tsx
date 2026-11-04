import React from 'react';
import { CalculatedStats } from '../types/trading';
import { DAYS_OF_WEEK_SHORT, DAYS_OF_WEEK_BN } from '../utils/constants';
import { amt, fp } from '../utils/calculations';
import { Calendar, ChevronRight } from 'lucide-react';

interface DayStripCalendarProps {
  stats: CalculatedStats;
  selectedWeek: number; // 0=all, 1..4
  onSelectWeek: (w: number) => void;
  activeDayIdx: number | null;
  onSelectDay: (dayIdx: number) => void;
  lang: 'bn' | 'en';
}

export const DayStripCalendar: React.FC<DayStripCalendarProps> = ({
  stats,
  selectedWeek,
  onSelectWeek,
  activeDayIdx,
  onSelectDay,
  lang,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition">
      
      {/* Header and Week Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {lang === 'bn' ? '২০ দিনের ট্রেডিং ক্যালেন্ডার স্ট্রিপ' : '20-Day Trading Strip'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'যেকোনো দিনে ট্যাপ করে সরাসরি সেই দিনের কার্ডে যান' : 'Tap any day to jump directly to its log'}
            </p>
          </div>
        </div>

        {/* Week Segmented Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => onSelectWeek(0)}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedWeek === 0
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {lang === 'bn' ? 'সব ২০ দিন' : 'All 20 Days'}
          </button>
          {[1, 2, 3, 4].map((w) => (
            <button
              key={w}
              onClick={() => onSelectWeek(w)}
              className={`px-2 py-1 rounded-lg transition ${
                selectedWeek === w
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              W{w}
            </button>
          ))}
        </div>
      </div>

      {/* 20-Day Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-20 gap-1.5 sm:gap-2">
        {stats.res.map((r, i) => {
          const weekdayIdx = i % 5;
          const weekday = lang === 'bn' ? DAYS_OF_WEEK_BN[weekdayIdx] : DAYS_OF_WEEK_SHORT[weekdayIdx];
          const isSelected = activeDayIdx === i;

          let cardStyle = 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-500';
          if (r.has) {
            if (r.tone > 0) {
              cardStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400';
            } else if (r.tone < 0) {
              cardStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400';
            } else {
              cardStyle = 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400';
            }
          }

          if (r.hit) {
            cardStyle += ' ring-2 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900';
          }

          return (
            <button
              key={i}
              onClick={() => onSelectDay(i)}
              className={`flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-all text-center group cursor-pointer hover:scale-105 active:scale-95 ${cardStyle} ${
                isSelected ? 'ring-2 ring-sky-500 shadow-md' : ''
              }`}
              style={{ minHeight: '64px' }}
              title={`Day ${i + 1} (${weekday})`}
            >
              <div className="flex items-center justify-between w-full px-0.5">
                <span className="text-[10px] font-semibold opacity-75">{weekday}</span>
                <span className="text-[11px] font-black">{i + 1}</span>
              </div>

              <div className="my-0.5 text-center">
                {r.any ? (
                  <span className="text-[11px] font-extrabold font-mono block leading-none">
                    {amt(r.net)}
                  </span>
                ) : (
                  <span className="text-[10px] opacity-40 block font-mono">–</span>
                )}

                {r.anyp && (
                  <span className="text-[9px] font-bold font-mono opacity-80 block mt-0.5">
                    {fp(r.pips)}p
                  </span>
                )}
              </div>

              <div className="w-full flex justify-center">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    r.has ? (r.tone > 0 ? 'bg-emerald-500' : r.tone < 0 ? 'bg-rose-500' : 'bg-blue-500') : 'bg-transparent'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Legend */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {lang === 'bn' ? 'লাভের দিন (Profit)' : 'Win Day'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {lang === 'bn' ? 'ক্ষতির দিন (Loss)' : 'Loss Day'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {lang === 'bn' ? 'ট্রেড নেই (Neutral)' : 'Untraded'}
          </span>
        </div>

        <span className="text-[10px] text-slate-400">
          {lang === 'bn' ? 'মোট ২০ ট্রেডিং দিন = ১ পূর্ণ মাস' : '20 Trading Days = 1 Journal Cycle'}
        </span>
      </div>

    </div>
  );
};
