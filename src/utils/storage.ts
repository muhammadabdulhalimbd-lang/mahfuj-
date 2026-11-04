import { AppState, MonthData, DayLog, Trade } from '../types/trading';
import { STORAGE_KEY_V2, STORAGE_KEY_V1 } from './constants';

export function createBlankTrade(): Trade {
  return { p: '', d: '', ap: '', pl: '', pp: '' };
}

export function createBlankDay(): DayLog {
  return {
    r: [0, 0, 0, 0, 0, 0],
    t: [createBlankTrade(), createBlankTrade(), createBlankTrade()],
    m: '',
    n: '',
    c: [0, 0, 0, 0],
    ce: 0,
    mk: '',
    nf: '',
  };
}

export function createBlankMonth(
  monthIndex: number = 0,
  startingBalance: number = 1000,
  maxLossPct: number = 2,
  dt: string = '',
  mt: string = ''
): MonthData {
  const d: DayLog[] = [];
  for (let i = 0; i < 20; i++) {
    d.push(createBlankDay());
  }
  return {
    s: startingBalance,
    l: maxLossPct,
    dt: dt || '',
    mt: mt || '',
    nm: `Month ${monthIndex + 1}`,
    d,
    wm: ['', '', '', ''],
    lot: {
      t: '3',
      s: '20',
      i: 'eurusd',
      p: '',
      n: '',
      m: 'medium',
      a: 'live',
      ph: '1',
      o: '10',
    },
    snap: {},
  };
}

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    const old = localStorage.getItem(STORAGE_KEY_V1);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.m) && parsed.m.length > 0) {
        parsed.m = parsed.m.map((month: MonthData, mIdx: number) => {
          if (!month.nm) month.nm = `Month ${mIdx + 1}`;
          if (!month.wm) month.wm = ['', '', '', ''];
          if (month.dt === undefined) month.dt = '';
          if (month.mt === undefined) month.mt = '';
          if (!month.lot) {
            month.lot = {
              t: '3',
              s: '20',
              i: 'eurusd',
              p: '',
              n: '',
              m: 'medium',
              a: 'live',
              ph: '1',
              o: '10',
            };
          }
          if (!month.snap) month.snap = {};

          if (!Array.isArray(month.d) || month.d.length !== 20) {
            const blank = createBlankMonth(mIdx, month.s || 1000, month.l || 2, month.dt, month.mt);
            month.d = blank.d;
          } else {
            month.d = month.d.map((day) => ({
              ...createBlankDay(),
              ...day,
              t: Array.isArray(day.t) && day.t.length === 3
                ? day.t.map((t) => ({ ...createBlankTrade(), ...t }))
                : [createBlankTrade(), createBlankTrade(), createBlankTrade()],
              r: Array.isArray(day.r) && day.r.length === 6 ? day.r : [0, 0, 0, 0, 0, 0],
              c: Array.isArray(day.c) && day.c.length === 4 ? day.c : [0, 0, 0, 0],
            }));
          }
          return month;
        });

        const c = typeof parsed.c === 'number' && parsed.c >= 0 && parsed.c < parsed.m.length ? parsed.c : 0;
        return { c, m: parsed.m };
      }
    } else if (old) {
      const p = JSON.parse(old);
      if (p && Array.isArray(p.d) && p.d.length === 20) {
        p.nm = 'Month 1';
        p.wm = ['', '', '', ''];
        p.dt = '';
        p.mt = '';
        return { c: 0, m: [p] };
      }
    }
  } catch (err) {
    console.error('Failed to load trading state from localStorage:', err);
  }

  return {
    c: 0,
    m: [createBlankMonth(0, 1000, 2)],
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save trading state to localStorage:', err);
  }
}

export function exportBackupJson(state: AppState): string {
  return JSON.stringify(
    {
      app: 'mahfuj-trading-log',
      version: 2,
      savedAt: new Date().toISOString(),
      data: state,
    },
    null,
    2
  );
}

export function validateAndParseBackup(jsonString: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonString);
    const candidate = parsed && parsed.data ? parsed.data : parsed;
    if (
      candidate &&
      Array.isArray(candidate.m) &&
      candidate.m.length > 0 &&
      candidate.m.every(
        (m: MonthData) => m && Array.isArray(m.d) && m.d.length === 20
      )
    ) {
      const c = typeof candidate.c === 'number' && candidate.c >= 0 && candidate.c < candidate.m.length ? candidate.c : 0;
      return { c, m: candidate.m };
    }
  } catch {
    return null;
  }
  return null;
}
