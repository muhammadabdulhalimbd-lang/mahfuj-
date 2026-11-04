import React, { useState, useEffect } from 'react';
import { MARKET_SESSIONS, TIMEZONE_OPTIONS } from '../utils/constants';
import { Globe, Clock, AlertCircle } from 'lucide-react';

interface MarketSessionsRadarProps {
  lang: 'bn' | 'en';
}

export const MarketSessionsRadar: React.FC<MarketSessionsRadarProps> = ({ lang }) => {
  const [selectedTz, setSelectedTz] = useState<string>('Asia/Dhaka');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Auto-detect browser time zone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setSelectedTz(detected);
      }
    } catch {
      setSelectedTz('Asia/Dhaka');
    }
  }, []);

  // Update clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  function getParts(d: Date, tz: string) {
    const parts: Record<string, number> = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    })
      .formatToParts(d)
      .forEach((x) => {
        parts[x.type] = Number(x.value) || 0;
      });
    return parts;
  }

  function getOffsetMinutes(d: Date, tz: string): number {
    const p = getParts(d, tz);
    return (
      (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) -
        Math.floor(d.getTime() / 60000) * 60000) /
      60000
    );
  }

  function formatMinutesToTime(totalMinutes: number): string {
    const m = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const mi = m % 60;
    const period = h < 12 ? 'am' : 'pm';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(mi).padStart(2, '0')} ${period}`;
  }

  const userOffset = getOffsetMinutes(currentTime, selectedTz);
  const userParts = getParts(currentTime, selectedTz);
  const currentMinuteOfDay = userParts.hour * 60 + userParts.minute;

  // Check if weekend (Forex market is closed Saturday and Sunday UTC)
  const utcDay = currentTime.getUTCDay();
  const isWeekend = utcDay === 0 || (utcDay === 6 && currentTime.getUTCHours() >= 22);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-sm transition">
      
      {/* Title & Timezone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'ফরেক্স মার্কেট সেশন রাডার' : 'Forex Market Sessions Radar'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' 
                ? 'আপনার স্থানীয় সময় অনুযায়ী বিশ্বের ৪টি প্রধান মার্কেট সেশন' 
                : 'Live trading hours for the 4 global forex financial hubs'}
            </p>
          </div>
        </div>

        {/* Timezone picker */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {TIMEZONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {!TIMEZONE_OPTIONS.some((o) => o.value === selectedTz) && (
              <option value={selectedTz}>{selectedTz} (Device Local)</option>
            )}
          </select>
        </div>
      </div>

      {/* 24-Hour Timeline Bar Chart Container */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
        
        {/* Timeline Header Hour Axis */}
        <div className="relative h-6 bg-slate-200/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300">
          {[0, 4, 8, 12, 16, 20].map((h) => {
            const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
            return (
              <span
                key={h}
                className="absolute top-1 transform -translate-x-1/2"
                style={{ left: `${(h / 24) * 100}%` }}
              >
                {label}
              </span>
            );
          })}
          <span className="absolute top-1 right-1 text-[9px] text-slate-400">24h</span>
        </div>

        {/* Timeline Bar Rows */}
        <div className="relative h-36 sm:h-40 p-2">
          
          {/* Vertical grid lines every 2 hours */}
          {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800/60 pointer-events-none"
              style={{ left: `${(h / 24) * 100}%` }}
            />
          ))}

          {/* Current Time Indicator Vertical Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(16,185,129,0.9)]"
            style={{ left: `${(currentMinuteOfDay / 1440) * 100}%` }}
          >
            <div className="w-2 h-2 -ml-[3px] bg-emerald-500 rounded-full" />
          </div>

          {/* 4 Session Bars */}
          {MARKET_SESSIONS.map((session, idx) => {
            const sessionOffset = getOffsetMinutes(currentTime, session.nativeTz);
            const sessionParts = getParts(currentTime, session.nativeTz);

            // Compute UTC start minute
            const startUtc =
              Date.UTC(sessionParts.year, sessionParts.month - 1, sessionParts.day, session.openLocalHour, 0) -
              sessionOffset * 60000;

            const startUserMin = ((Math.floor(startUtc / 60000) + userOffset) % 1440 + 1440) % 1440;
            const durationMin = session.durationHours * 60;

            // Check if open right now
            let isOpen = false;
            if (!isWeekend) {
              for (let k = -1; k <= 0; k++) {
                const checkDate = new Date(
                  Date.UTC(sessionParts.year, sessionParts.month - 1, sessionParts.day + k)
                );
                const dayOfWeek = checkDate.getUTCDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                  const checkStartUtc =
                    Date.UTC(
                      sessionParts.year,
                      sessionParts.month - 1,
                      sessionParts.day + k,
                      session.openLocalHour,
                      0
                    ) -
                    sessionOffset * 60000;
                  if (
                    currentTime.getTime() >= checkStartUtc &&
                    currentTime.getTime() < checkStartUtc + durationMin * 60000
                  ) {
                    isOpen = true;
                  }
                }
              }
            }

            const firstSegmentDuration = Math.min(durationMin, 1440 - startUserMin);
            const wrappedDuration = durationMin - firstSegmentDuration;

            return (
              <div
                key={session.name}
                className="absolute left-2 right-2 h-7 flex items-center"
                style={{ top: `${idx * 34 + 6}px` }}
              >
                {/* Primary Segment */}
                <div
                  className={`absolute top-0 bottom-0 rounded-md border text-[11px] font-bold flex items-center px-2 truncate transition ${
                    isOpen
                      ? 'shadow-sm text-white'
                      : 'opacity-40 text-slate-700 dark:text-slate-300'
                  }`}
                  style={{
                    left: `${(startUserMin / 1440) * 100}%`,
                    width: `${(firstSegmentDuration / 1440) * 100}%`,
                    backgroundColor: isOpen ? session.accentColor : `${session.accentColor}33`,
                    borderColor: session.accentColor,
                  }}
                >
                  <span className="truncate">{session.name}</span>
                </div>

                {/* Wrapped Segment (if session spans past midnight) */}
                {wrappedDuration > 0 && (
                  <div
                    className={`absolute top-0 bottom-0 rounded-md border text-[11px] font-bold flex items-center px-1 truncate transition ${
                      isOpen
                        ? 'shadow-sm text-white'
                        : 'opacity-40 text-slate-700 dark:text-slate-300'
                    }`}
                    style={{
                      left: '0%',
                      width: `${(wrappedDuration / 1440) * 100}%`,
                      backgroundColor: isOpen ? session.accentColor : `${session.accentColor}33`,
                      borderColor: session.accentColor,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Cards List */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
        {MARKET_SESSIONS.map((session) => {
          const sessionOffset = getOffsetMinutes(currentTime, session.nativeTz);
          const sessionParts = getParts(currentTime, session.nativeTz);
          const startUtc =
            Date.UTC(sessionParts.year, sessionParts.month - 1, sessionParts.day, session.openLocalHour, 0) -
            sessionOffset * 60000;
          const startUserMin = ((Math.floor(startUtc / 60000) + userOffset) % 1440 + 1440) % 1440;
          const durationMin = session.durationHours * 60;
          const endUserMin = (startUserMin + durationMin) % 1440;

          // Check if open
          let isOpen = false;
          if (!isWeekend) {
            for (let k = -1; k <= 0; k++) {
              const checkDate = new Date(
                Date.UTC(sessionParts.year, sessionParts.month - 1, sessionParts.day + k)
              );
              const dayOfWeek = checkDate.getUTCDay();
              if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                const checkStartUtc =
                  Date.UTC(
                    sessionParts.year,
                    sessionParts.month - 1,
                    sessionParts.day + k,
                    session.openLocalHour,
                    0
                  ) -
                  sessionOffset * 60000;
                if (
                  currentTime.getTime() >= checkStartUtc &&
                  currentTime.getTime() < checkStartUtc + durationMin * 60000
                ) {
                  isOpen = true;
                }
              }
            }
          }

          return (
            <div
              key={session.name}
              className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between"
              style={{ borderLeftWidth: '4px', borderLeftColor: session.accentColor }}
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>{session.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({lang === 'bn' ? session.cityName : session.nativeTz.split('/')[1]})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {formatMinutesToTime(startUserMin)} – {formatMinutesToTime(endUserMin)}
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOpen
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {isOpen ? (lang === 'bn' ? 'খোলা (Open)' : 'OPEN') : (lang === 'bn' ? 'বন্ধ (Closed)' : 'CLOSED')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Footer Note */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {lang === 'bn' 
              ? 'সবুজ রেখা = বর্তমান সময়। লন্ডন ও নিউ ইয়র্ক সেশন ওভারল্যাপ সবচেয়ে বেশি ভোলাটাইল।' 
              : 'Vertical green line shows real-time clock. London & NY overlap provides highest volatility.'}
          </span>
        </div>

        {isWeekend && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সাপ্তাহিক ছুটি (মার্কেট বন্ধ)' : 'Weekend (Markets Closed)'}</span>
          </div>
        )}
      </div>

    </div>
  );
};
