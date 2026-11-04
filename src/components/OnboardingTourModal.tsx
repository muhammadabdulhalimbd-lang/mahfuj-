import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { STORAGE_KEY_TOUR } from '../utils/constants';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

interface StepItem {
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  tag: string;
}

const TOUR_STEPS: StepItem[] = [
  {
    titleBn: 'স্বাগতম! 👋',
    titleEn: 'Welcome! 👋',
    descBn:
      'এটা আপনার ২০ দিনের ট্রেডিং জার্নাল। প্রতিদিনের ট্রেড, নিয়ম মানা আর মনের অবস্থা লিখে রাখলে নিজের ভুল ধরা সহজ হয়। চলুন ছোট করে দেখে নিই কোথায় কী আছে।',
    descEn:
      'This is your 20-day trading journal. Tracking daily trades, discipline adherence, and psychology helps you spot mistakes and build consistency. Let us take a quick walkthrough.',
    tag: 'Step 1/10 · Welcome',
  },
  {
    titleBn: 'মাস বেছে নিন',
    titleEn: 'Month Switcher & Cycle',
    descBn:
      'সবার উপরে Month ঘর। প্রতি মাসের আলাদা লগ থাকে। মাস শেষে "+ New month" চাপলে নতুন ২০ দিনের লগ খুলবে, আর আগের মাসের শেষ ব্যালেন্স নিজে থেকে নতুন মাসে চলে আসবে। মাসের নাম বদলাতেও পারবেন।',
    descEn:
      'The Month dropdown manages separate monthly journals. "+ New month" opens a new 20-day cycle, carrying over your closing balance automatically.',
    tag: 'Step 2/10 · Month Management',
  },
  {
    titleBn: 'ব্যালেন্স, লস সীমা ও প্রফিট টার্গেট',
    titleEn: 'Capital, Hard Stop & Profit Targets',
    descBn:
      'Starting balance এ আপনার ব্যালেন্স দিন। Max daily loss % বা $ যেকোনোটায় দিতে পারেন, অন্যটা নিজে হিসাব হবে। কোনো দিনের লস এই সীমায় পৌঁছালে সেই দিনের কার্ড লাল হয়ে সতর্ক করবে। Daily / Total profit target ঘরে টার্গেট লিখুন—টার্গেট ছুঁলে দিনের পাশে 🎯 আসবে আর ব্যালেন্স কার্ডে অগ্রগতির বার দেখাবে।',
    descEn:
      'Enter Starting balance and Max daily loss (% or $). Reaching daily loss highlights the day card red. Set Daily / Total profit targets to see a progress bar and 🎯 achievement badge.',
    tag: 'Step 3/10 · Risk & Objectives',
  },
  {
    titleBn: 'নম্বর ও ক্যালেন্ডার',
    titleEn: 'Monthly Analytics & Calendar',
    descBn:
      'Monthly numbers এ ব্যালেন্স, গ্রাফ, Win rate, Profit factor সব নিজে নিজে হিসাব হয়। ২০ দিনের ক্যালেন্ডারে প্রফিটের দিন সবুজ, লসের দিন লাল, আর ঘরে ট্যাপ করলে সেই দিনের কার্ডে চলে যাবেন।',
    descEn:
      'Monthly analytics automatically calculate your Win rate, Profit factor, and Equity curve. Green indicates win days, red indicates loss days, and tapping any day scrolls to its card.',
    tag: 'Step 4/10 · Analytics',
  },
  {
    titleBn: 'মার্কেট সেশন রাডার',
    titleEn: 'Forex Market Sessions Radar',
    descBn:
      'ফরেক্স মার্কেট সেশন অংশে Sydney, Tokyo, London ও New York বাজার কখন খোলা তা আপনার সময় অনুযায়ী দেখায়। সবুজ রেখা = এখনকার সময়, গাঢ় বার = সেশন খোলা। উপরের ঘর থেকে আপনার দেশের সময় বেছে নিন।',
    descEn:
      'Track real-time Sydney, Tokyo, London, and New York market hours in your local timezone. Highlights open sessions, timeline status, and weekend closures.',
    tag: 'Step 5/10 · Market Radar',
  },
  {
    titleBn: '🧮 লট সাইজ ক্যালকুলেটর',
    titleEn: '🧮 Lot Size Calculator',
    descBn:
      'কয়টা ট্রেড নেবেন, Stop loss (pips) লিখে একটা রিস্ক মোড (Safe / Medium Risk / High Risk) বাছলে (এমাউন্ট ও ঝুঁকি % নিজে থেকে Starting balance ও Max daily loss (%) থেকে আসবে), প্রতি ট্রেডে কত লট নেওয়া ভালো তা বলে দেবে। লাইভ ক্যাপিটাল ও প্রপ ফার্ম মোড বেছে নিতে পারবেন।',
    descEn:
      'Enter daily trade count and Stop loss pips, select a Risk Mode (Safe / Medium / High), and the calculator outputs the exact lot size per trade with Live Capital or Prop Firm challenge planning.',
    tag: 'Step 6/10 · Lot Calculator',
  },
  {
    titleBn: 'দিনের কার্ড: আবেগ নিয়ন্ত্রণ ও নিয়ম',
    titleEn: 'Daily Card: Emotion & Rules',
    descBn:
      'প্রতিদিনের কার্ডে উপর থেকে: "Control your emotion" আবেগ ধরে রাখতে পারলে ট্যাপ করুন ✅। "Rules check" খুলে প্রতিটা নিয়মে একবার ট্যাপ = ✓ মেনেছি, দুবার = ✗ ভেঙেছি। ৩য় ট্যাপে রিসেট হবে।',
    descEn:
      'Use "Control your emotion" to log emotional calmness (✅) or tilt (❌). Rules check cycles 1 tap = ✓ Followed, 2 taps = ✗ Broken, 3 taps = Clear.',
    tag: 'Step 7/10 · Emotional Discipline',
  },
  {
    titleBn: 'ট্রেডের আগে চেকলিস্ট',
    titleEn: 'Pre-Trade Checklist Guard',
    descBn:
      'Pre-trade checklist ট্রেডের আগে মিলিয়ে নিন: একবার ট্যাপ = ✓ মেনেছি, দুবার = ❌ মানিনি। ফাঁকা বা ❌ থাকলে ট্রেড করা সম্পূর্ণ নিষিদ্ধ।',
    descEn:
      'Check conditions before trade entry: 1 tap = ✓ Followed, 2 taps = ❌ Not followed. Any empty box or ❌ means NO TRADE allowed.',
    tag: 'Step 8/10 · Checklist Guard',
  },
  {
    titleBn: 'ট্রেড এন্ট্রি ও দিন শেষের পর্যালোচনা',
    titleEn: 'Trade Logging & Reflections',
    descBn:
      'ট্রেডের ঘরে Pair (যেমন XAUUSD), Dir. এ B = কিনেছি, S = বিক্রি। A+ Set এ সেরা সেটআপ হলে Yes। P/L ($) এ লাভ/লস এবং Pips এ পিপস লিখুন। দিনে সর্বোচ্চ ৩টি ট্রেড। দিন শেষে সবচেয়ে বড় ভুল ও কালকের ফোকাস লিখুন।',
    descEn:
      'Log up to 3 trades per day with Pair, Direction (Buy/Sell), A+ Setup quality, Dollar P/L, and Pips. Finish each day noting biggest mistake, tomorrow focus, and star mood rating.',
    tag: 'Step 9/10 · Daily Logging',
  },
  {
    titleBn: 'জার্নাল সেভ, ব্যাকআপ ও রিস্টোর',
    titleEn: 'Export, Backup & Restore',
    descBn:
      'Download PDF ও Download image বাটনে চাপলে পুরো মাসের জার্নাল সেভ হবে। অন্য ফোনে ডেটা নিতে Backup ফাইলে নিন এবং সেখানে Restore চাপুন। যেকোনো সময় "?" বাটনে এই গাইড দেখতে পারবেন। শুভ ট্রেডিং! 🚀',
    descEn:
      'Export complete PDF or PNG reports. Use full JSON Backup & Restore to synchronize across phones or browsers without losing logs. Good trading! 🚀',
    tag: 'Step 10/10 · Export & Backup',
  },
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem(STORAGE_KEY_TOUR, '1');
      } catch {}
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(STORAGE_KEY_TOUR, '1');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl transition max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Tag & Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono">
            {step.tag}
          </span>
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-4 bg-sky-500'
                    : idx < currentStep
                    ? 'bg-slate-300 dark:bg-slate-700'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="my-4">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
            {lang === 'bn' ? step.titleBn : step.titleEn}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {lang === 'bn' ? step.descBn : step.descEn}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            {lang === 'bn' ? 'বাদ দিন (Skip)' : 'Skip Tour'}
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'আগেরটি' : 'Previous'}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/20 hover:from-sky-500 hover:to-blue-600 transition flex items-center gap-1.5"
            >
              <span>{isLast ? (lang === 'bn' ? 'শুরু করি 🚀' : 'Get Started 🚀') : (lang === 'bn' ? 'পরের ধাপ' : 'Next Step')}</span>
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
