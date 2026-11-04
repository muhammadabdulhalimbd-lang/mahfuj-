import React from 'react';
import { CalculatedStats } from '../types/trading';
import { money, pct, fp } from '../utils/calculations';
import { BarChart3, AlertOctagon } from 'lucide-react';

interface WeeklyReviewCardProps {
  stats: CalculatedStats;
  weeklyMistakes: string[];
  onUpdateWeeklyMistake: (weekIdx: number, val: string) => void;
  lang: 'bn' | 'en';
}

export const WeeklyReviewCard: React.FC<WeeklyReviewCardProps> = ({
  stats,
  weeklyMistakes,
  onUpdateWeeklyMistake,
  lang,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-4">
      
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {lang === 'bn' ? 'সাপ্তাহিক ট্রেডিং পর্যালোচনা' : 'Weekly Performance Review'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'সপ্তাহভিত্তিক ট্রেড, উইন রেট ও সবচেয়ে বড় ভুলের বিশ্লেষণ' : 'Week-by-week metrics breakdown & lesson reflections'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs sm:text-sm font-sans">
          <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-2.5 px-3">{lang === 'bn' ? 'সপ্তাহ' : 'Week'}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'ট্রেড' : 'Trades'}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'জয়' : 'Wins'}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'উইন %' : 'Win %'}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'নেট লাভ/ক্ষতি' : 'Net P/L'}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'পিপস' : 'Pips'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
            {stats.wk.map((x, i) => {
              const isProfit = x.n > 0;
              const isLoss = x.n < 0;
              return (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'bn' ? `সপ্তাহ ${i + 1}` : `Week ${i + 1}`}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    {x.t}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                    {x.w}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 font-bold">
                    {x.t ? pct(x.w / x.t) : '–'}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isProfit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isLoss
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {money(x.n)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      x.p > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : x.p < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {x.p ? `${fp(x.p)}p` : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly Biggest Mistake inputs */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'bn' ? 'সাপ্তাহিক প্রধান ভুল ও পুনরাবৃত্তি রোধ' : 'Weekly Biggest Mistakes (Mistake Journal)'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((w) => (
            <div key={w}>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'bn' ? `সপ্তাহ ${w + 1} – সবচেয়ে বড় ভুল:` : `Week ${w + 1} – Biggest Mistake:`}
              </label>
              <input
                type="text"
                value={weeklyMistakes[w] || ''}
                onChange={(e) => onUpdateWeeklyMistake(w, e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: স্টপ লস সরিয়ে দেওয়া, ওভারট্রেডিং...' : 'e.g., Moved stop loss, FOMO entry...'}
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
