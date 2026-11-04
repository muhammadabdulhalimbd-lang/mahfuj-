import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, BookOpen } from 'lucide-react';
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
    titleBn: 'স্বাগতম মাহফুজ ট্রেডিং লগে! 👋',
    titleEn: 'Welcome to Mahfuj Trading Log! 👋',
    descBn:
      'এটি আপনার ২০ দিনের ট্রেডিং জার্নাল ও শৃঙ্খলার ককপিট। প্রতিটি ট্রেড, নিয়ম মানার ধারাবাহিকতা ও আবেগের অবস্থা লিখে রাখলে নিজের ভুলগুলো সহজে সংশোধন করা যায়। চলুন জেনে নিই কীভাবে এটি ব্যবহার করবেন।',
    descEn:
      'This is your 20-day disciplined trading cockpit. Logging your trades, emotional state, and rule adherence helps you pinpoint leaks and build consistency. Let us take a quick tour.',
    tag: 'Step 1/9 · Overview',
  },
  {
    titleBn: 'মাস বেছে নিন ও পরিবর্তন করুন',
    titleEn: 'Month Switcher & Management',
    descBn:
      'সবার উপরে Month ড্রপডাউন রয়েছে। প্রতি মাসের হিসাব আলাদাভাবে সুরক্ষিত থাকে। মাস শেষে "+ New month" চাপলে নতুন ২০ দিনের ফাঁকা শিট তৈরি হবে এবং আগের মাসের শেষ ব্যালেন্সটি স্বয়ংক্রিয়ভাবে নতুন মাসের শুরুতে চলে আসবে!',
    descEn:
      'The Month dropdown lets you manage individual months. Tapping "+ New Month" creates a fresh 20-day cycle and rolls your closing balance into the next month starting balance automatically.',
    tag: 'Step 2/9 · Months',
  },
  {
    titleBn: 'ব্যালেন্স ও দৈনিক লস সীমা',
    titleEn: 'Capital & Hard Stop Risk Limit',
    descBn:
      'Starting balance এ মূলধন দিন। Max daily loss এ % বা $ যেকোনো একটি দিন—অন্যটি নিজে হিসাব হয়ে যাবে। কোনো দিনে লস এই সীমায় পৌঁছালে সফটওয়্যার লাল অ্যালার্ট দেখিয়ে আপনাকে তৎক্ষণাৎ ট্রেড বন্ধ করার নির্দেশ দেবে।',
    descEn:
      'Enter your Starting Balance and Max Daily Loss (% or $). If any day hits this limit, the system triggers a prominent red alert reminding you to protect capital and stop trading.',
    tag: 'Step 3/9 · Risk Management',
  },
  {
    titleBn: 'পারফরম্যান্স অ্যানালিটিক্স ও ইকুইটি গ্রাফ',
    titleEn: 'Live Analytics & Equity Curve',
    descBn:
      'Monthly numbers সেকশনে আপনার ব্যালেন্স, গ্রাফ, Win Rate, Profit Factor, Max Drawdown এবং Discipline Score স্বয়ংক্রিয়ভাবে রিয়েল-টাইমে ক্যালকুলেট হয়।',
    descEn:
      'The Monthly Analytics Cockpit computes your Win Rate, Profit Factor, Drawdown, Rules Adherence, and renders an interactive equity curve as you log trades.',
    tag: 'Step 4/9 · Analytics',
  },
  {
    titleBn: 'ফরেক্স মার্কেট সেশন রাডার',
    titleEn: 'Global Forex Market Sessions Radar',
    descBn:
      'Sydney, Tokyo, London ও New York সেশন কখন চালু হয় তা আপনার স্থানীয় সময় (যেমন বাংলাদেশ সময়) অনুযায়ী ২৪ ঘণ্টার টাইমলাইনে দেখায়। সবুজ দাগ হলো বর্তমান সময়। শনি ও রবিবার মার্কেট বন্ধ থাকে।',
    descEn:
      'Track real-time Sydney, Tokyo, London, and New York market hours mapped onto your local timezone. Highlights high-volatility session overlaps and weekend closures.',
    tag: 'Step 5/9 · Market Sessions',
  },
  {
    titleBn: 'আবেগ নিয়ন্ত্রণ ও ৬টি ট্রেডিং নিয়ম',
    titleEn: 'Emotion Control & 6 Discipline Rules',
    descBn:
      'প্রতিটি দিনের শুরুতে "Control your emotion" এ ট্যাপ করে আবেগ নিয়ন্ত্রিত কিনা নির্ধারণ করুন। "Rules check" খুলে প্রতি নিয়মে ১ বার ট্যাপ করলে ✓ মানা হয়েছে, ২ বার ট্যাপ করলে ✗ ভাঙা হয়েছে চিহ্নিত হবে।',
    descEn:
      'Use the Emotion Control button to track psychology. Expand the Rules Check to cycle through 6 core discipline rules (✓ Followed / ✗ Broken / – Reset) to calculate your Discipline Score.',
    tag: 'Step 6/9 · Discipline Rules',
  },
  {
    titleBn: 'ট্রেডের আগে চেকলিস্ট (Pre-Trade Checklist)',
    titleEn: 'Pre-Trade Checklist Guard',
    descBn:
      'হায়ার টাইমফ্রেম ট্রেন্ড, সাপোর্ট/রেজিস্ট্যান্স এবং স্টপ লস নিশ্চিত না করে ট্রেড করা নিষিদ্ধ। নিয়ম অনুযায়ী: কোনো বক্স খালি থাকলে সেই দিন কোনো ট্রেড এন্ট্রি নেওয়া যাবে না!',
    descEn:
      'Ensure high-timeframe confirmation, S/R levels, and stop loss before entry. Remember the golden rule: Any unchecked box means NO TRADE is permitted.',
    tag: 'Step 7/9 · Checklist',
  },
  {
    titleBn: 'প্রতিদিনের ৩টি ট্রেড ও দিন শেষের পর্যালোচনা',
    titleEn: 'Daily 3-Trade Slots & Reflections',
    descBn:
      'দিনে সর্বোচ্চ ৩টি ট্রেডের ঘরে Pair (যেমন XAUUSD), Dir (Buy/Sell), A+ সেটআপ, লাভ/ক্ষতি ($) এবং কত পিপস হলো লিখুন। দিন শেষে সবচেয়ে বড় ভুল, আগামীকালের ফোকাস এবং মনের অবস্থা (স্টার) দিন।',
    descEn:
      'Log up to 3 trades per day with Pair, Buy/Sell, A+ Setup quality, Dollar P/L, and Pips. Finish each day by noting your biggest mistake, tomorrow focus, and a 1-5 star psychology rating.',
    tag: 'Step 8/9 · Daily Logs',
  },
  {
    titleBn: 'এক্সপোর্ট, ব্যাকআপ ও রিস্টোর',
    titleEn: 'Instant PDF / Image Export & Backup',
    descBn:
      'উপরের "এক্সপোর্ট ও ব্যাকআপ" বাটনে চাপলে পুরো মাসের রঙিন PDF বা PNG ছবি ডাউনলোড করতে পারবেন। অন্য ফোনে ডেটা নিতে "Backup" ফাইল সংরক্ষণ করুন এবং সেখানে "Restore" বাটনে দিন। শুভ ট্রেডিং! 🚀',
    descEn:
      'Export high-resolution PNG images or multi-page PDF journals. Use full JSON Backup & Restore to seamlessly transfer your journal between devices or browsers without data loss. Good trading! 🚀',
    tag: 'Step 9/9 · Export & Backup',
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl transition">
        
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
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-5 bg-sky-500'
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
