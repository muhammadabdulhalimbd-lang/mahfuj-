import React, { useState, useRef } from 'react';
import { MonthData, CalculatedStats, AppState } from '../types/trading';
import { 
  generateImageBlob, 
  generatePdfBlob, 
  downloadBlob 
} from '../utils/exportEngine';
import { 
  exportBackupJson, 
  validateAndParseBackup 
} from '../utils/storage';
import { 
  X, 
  FileText, 
  Image, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle,
  Database,
  Sparkles
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMonth: MonthData;
  stats: CalculatedStats;
  appState: AppState;
  onRestoreState: (restored: AppState) => void;
  lang: 'bn' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeMonth,
  stats,
  appState,
  onRestoreState,
  lang,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AppState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const monthSlug = (activeMonth.nm || 'month')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  const todayDate = new Date().toISOString().slice(0, 10);

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const blob = await generatePdfBlob(activeMonth, stats);
      if (blob) {
        downloadBlob(blob, `journal-${monthSlug}-${todayDate}.pdf`);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const blob = await generateImageBlob(activeMonth, stats);
      if (blob) {
        downloadBlob(blob, `journal-${monthSlug}-${todayDate}.png`);
      }
    } catch (err) {
      console.error('PNG generation error:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleBackupDownload = () => {
    const jsonStr = exportBackupJson(appState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `mahfuj-trading-backup-${todayDate}.json`);
  };

  const handleCopyBackup = () => {
    const jsonStr = exportBackupJson(appState);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 3000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestoreSuccess(null);
    setPendingRestore(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = validateAndParseBackup(text);
        if (parsed) {
          setPendingRestore(parsed);
        } else {
          setRestoreError(
            lang === 'bn' 
              ? 'অকার্যকর ব্যাকআপ ফাইল! সঠিক ট্রেডিং লগ ব্যাকআপ JSON ফাইল আপলোড করুন।' 
              : 'Invalid backup file! Please select a valid Mahfuj Trading Log JSON file.'
          );
        }
      } catch {
        setRestoreError(lang === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে।' : 'Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (pendingRestore) {
      onRestoreState(pendingRestore);
      setRestoreSuccess(
        lang === 'bn'
          ? `সফলভাবে ${pendingRestore.m.length}টি মাসের ডেটা রিস্টোর হয়েছে! ✓`
          : `Successfully restored ${pendingRestore.m.length} month(s) of trading data! ✓`
      );
      setPendingRestore(null);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
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

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'bn' ? 'এক্সপোর্ট ও ডেটা ব্যাকআপ কেন্দ্র' : 'Export & Data Hub'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'জার্নাল ডাউনলোড করুন এবং যেকোনো ডিভাইসে ডেটা নিন' : 'Download documents and sync across all devices'}
            </p>
          </div>
        </div>

        {/* Section 1: Visual Exports (PDF & PNG) */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {lang === 'bn' ? 'চলতি মাসের রিপোর্ট ডাউনলোড' : 'Current Month Reports'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800/50 flex items-center gap-3 text-left transition group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {isExportingPdf ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating PDF...') : (lang === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF')}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {lang === 'bn' ? 'সব টেবিল ও লগ সহ ফাইল' : 'Multi-page complete report'}
                </span>
              </div>
            </button>

            {/* PNG Image Button */}
            <button
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 dark:hover:bg-slate-800/50 flex items-center gap-3 text-left transition group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {isExportingPng ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating Image...') : (lang === 'bn' ? 'PNG ছবি ডাউনলোড' : 'Download PNG')}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {lang === 'bn' ? 'উচ্চ রেজুলিউশন গ্রাফিক্স' : 'High-res image overview'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Backup & Restore (Full multi-month JSON) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {lang === 'bn' ? 'সম্পূর্ণ ডেটা ব্যাকআপ ও রিস্টোর' : 'Full Data Backup & Restore'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download JSON Backup */}
            <button
              onClick={handleBackupDownload}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-400 dark:text-sky-600" />
              <span>{lang === 'bn' ? 'ব্যাকআপ ফাইল নিন (.json)' : 'Download Backup (.json)'}</span>
            </button>

            {/* Copy JSON */}
            <button
              onClick={handleCopyBackup}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {copiedBackup ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {lang === 'bn' ? 'কপি হয়েছে ✓' : 'Copied to Clipboard ✓'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>{lang === 'bn' ? 'ব্যাকআপ টেক্সট কপি করুন' : 'Copy Backup Text'}</span>
                </>
              )}
            </button>
          </div>

          {/* Restore file picker */}
          <div className="mt-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-sky-400 dark:border-sky-600 bg-sky-500/5 hover:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-sky-500" />
              <span>
                {lang === 'bn' 
                  ? 'রিস্টোর করুন (ব্যাকআপ ফাইল নির্বাচন করুন)' 
                  : 'Restore from Backup File (.json)'}
              </span>
            </button>
          </div>

          {/* Pending Restore Confirmation Banner */}
          {pendingRestore && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? `ফাইলে ${pendingRestore.m.length}টি মাসের রেকর্ড পাওয়া গেছে।`
                    : `Backup contains ${pendingRestore.m.length} month(s) of records.`}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {lang === 'bn'
                  ? 'রিস্টোর করলে বর্তমানের স্থানীয় ডেটা প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?'
                  : 'Restoring will replace the current local journal with the backup file data.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleConfirmRestore}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition"
                >
                  {lang === 'bn' ? 'হ্যাঁ, রিস্টোর নিশ্চিত করুন' : 'Yes, Confirm Restore'}
                </button>
                <button
                  onClick={() => setPendingRestore(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-300 transition"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {restoreError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {restoreSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{restoreSuccess}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
