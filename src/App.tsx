import React, { useState, useEffect, useMemo } from 'react';
import { AppState, DayLog, MonthData } from './types/trading';
import { 
  loadInitialState, 
  saveState, 
  createBlankMonth 
} from './utils/storage';
import { calcMonth } from './utils/calculations';
import { 
  STORAGE_KEY_TOUR, 
  STORAGE_KEY_THEME, 
  STORAGE_KEY_LANG 
} from './utils/constants';

import { Header } from './components/Header';
import { CapitalRiskCard } from './components/CapitalRiskCard';
import { MonthlyStatsCockpit } from './components/MonthlyStatsCockpit';
import { DayStripCalendar } from './components/DayStripCalendar';
import { MarketSessionsRadar } from './components/MarketSessionsRadar';
import { WeeklyReviewCard } from './components/WeeklyReviewCard';
import { DailyLogCard } from './components/DailyLogCard';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { ExportModal } from './components/ExportModal';

import { HelpCircle, ChevronUp, Layers, CheckCircle } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme) return savedTheme === 'dark';
    } catch {}
    return true; // Default to professional terminal dark mode
  });
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
      if (savedLang === 'en' || savedLang === 'bn') return savedLang;
    } catch {}
    return 'bn'; // Default to Bengali as requested
  });

  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 0 = all, 1..4
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  // Sync lang with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {}
  }, [lang]);

  // Check tour on first load
  useEffect(() => {
    try {
      const tourDone = localStorage.getItem(STORAGE_KEY_TOUR);
      if (!tourDone) {
        setIsTourOpen(true);
      }
    } catch {}
  }, []);

  // Save appState whenever it updates
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Current active month
  const activeMonthIdx = appState.c;
  const activeMonth: MonthData = appState.m[activeMonthIdx] || appState.m[0];

  // Calculated statistics
  const calculatedStats = useMemo(() => {
    return calcMonth(activeMonth);
  }, [activeMonth]);

  // Handlers
  const handleSelectMonth = (idx: number) => {
    if (idx >= 0 && idx < appState.m.length) {
      setAppState((prev) => ({ ...prev, c: idx }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewMonth = () => {
    const endingBal = calculatedStats.bal;
    const newIdx = appState.m.length;
    const newMonth = createBlankMonth(newIdx, endingBal, activeMonth.l || 2);
    setAppState((prev) => ({
      c: newIdx,
      m: [...prev.m, newMonth],
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRenameMonth = (name: string) => {
    setAppState((prev) => {
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = { ...updatedMonths[prev.c], nm: name };
      return { ...prev, m: updatedMonths };
    });
  };

  const handleClearMonth = () => {
    setAppState((prev) => {
      const currentMonth = prev.m[prev.c];
      const clearedMonth = createBlankMonth(prev.c, currentMonth.s, currentMonth.l);
      clearedMonth.nm = currentMonth.nm;
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = clearedMonth;
      return { ...prev, m: updatedMonths };
    });
  };

  const handleUpdateCapital = (balance: number, maxLossPct: number) => {
    setAppState((prev) => {
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = {
        ...updatedMonths[prev.c],
        s: balance,
        l: maxLossPct,
      };
      return { ...prev, m: updatedMonths };
    });
  };

  const handleUpdateDay = (dayIdx: number, updatedDay: DayLog) => {
    setAppState((prev) => {
      const currentMonth = prev.m[prev.c];
      const updatedDays = [...currentMonth.d];
      updatedDays[dayIdx] = updatedDay;
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = { ...currentMonth, d: updatedDays };
      return { ...prev, m: updatedMonths };
    });
  };

  const handleUpdateWeeklyMistake = (weekIdx: number, val: string) => {
    setAppState((prev) => {
      const currentMonth = prev.m[prev.c];
      const updatedWm = [...(currentMonth.wm || ['', '', '', ''])];
      updatedWm[weekIdx] = val;
      const updatedMonths = [...prev.m];
      updatedMonths[prev.c] = { ...currentMonth, wm: updatedWm };
      return { ...prev, m: updatedMonths };
    });
  };

  const handleRestoreState = (restored: AppState) => {
    setAppState(restored);
  };

  const handleSelectDay = (dayIdx: number) => {
    setActiveDayIdx(dayIdx);
    const targetWeek = Math.floor(dayIdx / 5) + 1;
    if (selectedWeek !== 0 && selectedWeek !== targetWeek) {
      setSelectedWeek(0); // Show all days so target is visible
    }
    setTimeout(() => {
      const el = document.getElementById(`day-card-${dayIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Filtered days based on selected week
  const displayedDays = useMemo(() => {
    const all = activeMonth.d || [];
    if (selectedWeek === 0) return all.map((day, idx) => ({ day, idx }));
    const startIdx = (selectedWeek - 1) * 5;
    return all.slice(startIdx, startIdx + 5).map((day, offset) => ({
      day,
      idx: startIdx + offset,
    }));
  }, [activeMonth.d, selectedWeek]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white transition-colors pb-20">
      
      {/* Header */}
      <Header
        appState={appState}
        activeMonth={activeMonth}
        activeMonthIdx={activeMonthIdx}
        onSelectMonth={handleSelectMonth}
        onNewMonth={handleNewMonth}
        onRenameMonth={handleRenameMonth}
        onClearMonth={handleClearMonth}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        
        {/* Top Capital & Risk Section */}
        <CapitalRiskCard
          startingBalance={activeMonth.s}
          maxLossPct={activeMonth.l}
          onUpdateCapital={handleUpdateCapital}
          lang={lang}
        />

        {/* Live Forex Market Sessions Radar */}
        <MarketSessionsRadar lang={lang} />

        {/* Monthly Numbers Cockpit */}
        <MonthlyStatsCockpit stats={calculatedStats} lang={lang} />

        {/* 20-Day Strip Calendar Matrix */}
        <DayStripCalendar
          stats={calculatedStats}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
          activeDayIdx={activeDayIdx}
          onSelectDay={handleSelectDay}
          lang={lang}
        />

        {/* Weekly Review & Mistake Journal */}
        <WeeklyReviewCard
          stats={calculatedStats}
          weeklyMistakes={activeMonth.wm || ['', '', '', '']}
          onUpdateWeeklyMistake={handleUpdateWeeklyMistake}
          lang={lang}
        />

        {/* Daily Logs Section Header */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'দৈনিক ট্রেডিং লগ ও সাইকোলজি' : 'Daily Trading Logs & Psychology'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold">
                  {selectedWeek === 0 ? 'All 20 Days' : `Week ${selectedWeek}`}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'প্রতিদিনের ট্রেড, এন্ট্রির চেকলিস্ট, আবেগ নিয়ন্ত্রণ ও নিয়ম মানার ট্র্যাক রেকর্ড'
                  : 'Log up to 3 trades daily, pre-flight checklists, emotional discipline & mistakes'}
              </p>
            </div>

            {/* Quick week filter pills */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setSelectedWeek(0)}
                className={`px-2.5 py-1 rounded-lg transition font-semibold ${
                  selectedWeek === 0
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? 'সব ২০ দিন' : 'All'}
              </button>
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-2.5 py-1 rounded-lg transition font-semibold ${
                    selectedWeek === w
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  W{w}
                </button>
              ))}
            </div>
          </div>

          {/* Render Days */}
          <div className="grid grid-cols-1 gap-4">
            {displayedDays.map(({ day, idx }) => (
              <DailyLogCard
                key={idx}
                dayIndex={idx}
                day={day}
                calcResult={calculatedStats.res[idx]}
                onUpdateDay={(updated) => handleUpdateDay(idx, updated)}
                lang={lang}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Floating Bottom Navigation Bar / Controls */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsTourOpen(true)}
          title="Onboarding & Help Guide"
          className="w-11 h-11 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-extrabold text-base shadow-lg shadow-sky-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition"
        >
          ?
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        lang={lang}
      />

      {/* Export & Data Backup Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeMonth={activeMonth}
        stats={calculatedStats}
        appState={appState}
        onRestoreState={handleRestoreState}
        lang={lang}
      />

    </div>
  );
}
