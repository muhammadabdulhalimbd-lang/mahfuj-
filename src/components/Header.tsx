import React, { useState } from 'react';
import { AppState, MonthData } from '../types/trading';
import { 
  Plus, 
  HelpCircle, 
  FileDown, 
  Moon, 
  Sun, 
  Languages, 
  Edit3, 
  Trash2, 
  Check,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  appState: AppState;
  activeMonth: MonthData;
  activeMonthIdx: number;
  onSelectMonth: (idx: number) => void;
  onNewMonth: () => void;
  onRenameMonth: (name: string) => void;
  onClearMonth: () => void;
  onOpenExportModal: () => void;
  onOpenTour: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  activeMonth,
  activeMonthIdx,
  onSelectMonth,
  onNewMonth,
  onRenameMonth,
  onClearMonth,
  onOpenExportModal,
  onOpenTour,
  isDark,
  onToggleTheme,
  lang,
  onToggleLang,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(activeMonth.nm || `Month ${activeMonthIdx + 1}`);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleNameSave = () => {
    onRenameMonth(tempName.trim() || `Month ${activeMonthIdx + 1}`);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setTempName(activeMonth.nm);
      setIsEditingName(false);
    }
  };

  return (
    <header className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-rose-500 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white font-extrabold text-lg tracking-wider">
                  M
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-rose-500 font-sans">
                    MAHFUJ TRADING LOG
                  </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'bn' ? 'প্রফেশনাল ফরেক্স ডিসিপ্লিন জার্নাল ও সেশন রাডার' : 'Forex Discipline Terminal & Risk Cockpit'}
                </p>
              </div>
            </div>

            {/* Mobile Utility Controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onToggleLang}
                title="Switch Language"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleTheme}
                title="Toggle Theme"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
              <button
                onClick={onOpenTour}
                title="Help & Tour"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls: Month Selector, New Month, Data & Settings */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Month Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-2 uppercase tracking-wider">
                {lang === 'bn' ? 'মাস:' : 'Month:'}
              </span>
              <div className="relative">
                <select
                  value={activeMonthIdx}
                  onChange={(e) => onSelectMonth(Number(e.target.value))}
                  className="appearance-none bg-transparent pr-7 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none"
                >
                  {appState.m.map((month, idx) => (
                    <option key={idx} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {month.nm || `Month ${idx + 1}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Editable Month Name */}
            {isEditingName ? (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-sky-500 rounded-xl px-2 py-1 shadow-sm">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="Enter name"
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none w-28 sm:w-36"
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempName(activeMonth.nm || `Month ${activeMonthIdx + 1}`);
                  setIsEditingName(true);
                }}
                title={lang === 'bn' ? 'মাসের নাম পরিবর্তন করুন' : 'Rename month'}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition"
              >
                <Edit3 className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{activeMonth.nm}</span>
              </button>
            )}

            {/* + New Month */}
            <button
              onClick={onNewMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-blue-600 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '+ নতুন মাস' : '+ New Month'}</span>
            </button>

            {/* Export & Backup */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-500" />
              <span>{lang === 'bn' ? 'এক্সপোর্ট ও ব্যাকআপ' : 'Export & Data'}</span>
            </button>

            {/* Reset / Clear Month */}
            <button
              onClick={() => {
                if (confirmClear) {
                  onClearMonth();
                  setConfirmClear(false);
                } else {
                  setConfirmClear(true);
                  setTimeout(() => setConfirmClear(false), 4000);
                }
              }}
              title={confirmClear ? 'Tap again to reset this month' : 'Clear this month'}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                confirmClear
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 bg-slate-100/60 dark:bg-slate-900/60'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmClear && (
                <span className="text-[11px] font-bold">
                  {lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                </span>
              )}
            </button>

            {/* Desktop Quick Settings */}
            <div className="hidden md:flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={onToggleLang}
                title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
                className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Languages className="w-3.5 h-3.5 text-sky-500" />
                <span>{lang === 'bn' ? 'BN' : 'EN'}</span>
              </button>

              <button
                onClick={onToggleTheme}
                title="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={onOpenTour}
                title="Interactive Guide"
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <HelpCircle className="w-4 h-4 text-sky-500" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
