import { MonthData, CalculatedStats, DayCalcResult, WeekCalcResult } from '../types/trading';

export function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return NaN;
  const x = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(x) ? NaN : x;
}

export function money(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  const prefix = x < 0 ? '-' : '';
  return prefix + '$' + Math.abs(x).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fp(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  return (x > 0 ? '+' : '') + (Math.round(x * 10) / 10).toFixed(1);
}

export function pct(x: number | null | undefined): string {
  if (x === null || x === undefined || isNaN(x)) return '–';
  return (x * 100).toFixed(1) + '%';
}

export function amt(x: number): string {
  const a = Math.abs(x);
  const s = x > 0 ? '+' : x < 0 ? '-' : '';
  if (a >= 1000) {
    return s + '$' + (a / 1000).toFixed(1) + 'k';
  }
  return s + '$' + a.toFixed(a % 1 !== 0 ? 1 : 0);
}

export function calcMonth(S: MonthData): CalculatedStats {
  const start = num(S.s) || 0;
  const lim = ((num(S.l) || 0) / 100) * start;
  let bal = start;
  let peak = start;
  let mdd = 0;
  let mddp = 0;

  let tr = 0;
  let w = 0;
  let l = 0;
  let gp = 0;
  let gl = 0;
  let wd = 0;
  let ld = 0;
  let tp = 0;
  let pw = 0;
  let pls = 0;
  let y = 0;
  let yn = 0;

  let apY = 0;
  let apN = 0;
  let apW = 0;

  const res: DayCalcResult[] = [];
  const wk: WeekCalcResult[] = [0, 1, 2, 3].map(() => ({ t: 0, w: 0, n: 0, p: 0 }));

  (S.d || []).forEach((day, i) => {
    let dayNet = 0;
    let any = false;
    let dayPips = 0;
    let anyp = false;
    const k = Math.min(3, Math.floor(i / 5));

    (day.t || []).forEach((t) => {
      const v = num(t.pl);
      const p = num(t.pp);
      const hv = !isNaN(v);
      const hp = !isNaN(p);

      if (t.ap === 'Yes') {
        apY++;
        const checkWin = hv ? v > 0 : hp && p > 0;
        if (checkWin) apW++;
      } else if (t.ap === 'No') {
        apN++;
      }

      if (!hv && !hp) return;

      tr++;
      wk[k].t++;
      const primaryMetric = hv ? v : p;
      if (primaryMetric > 0) {
        w++;
        wk[k].w++;
      } else if (primaryMetric < 0) {
        l++;
      }

      if (hv) {
        any = true;
        dayNet += v;
        if (v > 0) {
          gp += v;
          wd++;
        } else if (v < 0) {
          gl += v;
          ld++;
        }
      }

      if (hp) {
        anyp = true;
        dayPips += p;
        tp += p;
        if (p > 0) pw += p;
        else if (p < 0) pls += p;
        wk[k].p += p;
      }
    });

    (day.r || []).forEach((r) => {
      if (r) {
        yn++;
        if (r === 1) y++;
      }
    });

    if (any) {
      bal += dayNet;
      wk[k].n += dayNet;
      if (bal > peak) peak = bal;
      const dd = peak - bal;
      if (dd > mdd) mdd = dd;
      if (peak > 0 && dd / peak > mddp) mddp = dd / peak;
    }

    const hit = any && lim > 0 && dayNet <= -lim;
    const tone = any ? dayNet : anyp ? dayPips : 0;
    res.push({
      any,
      net: dayNet,
      bal,
      hit,
      anyp,
      pips: dayPips,
      has: any || anyp,
      tone,
    });
  });

  const pf = gl === 0 ? (gp === 0 ? '–' : '∞') : (gp / Math.abs(gl)).toFixed(2);
  const net = bal - start;
  const disc = yn ? y / yn : NaN;

  return {
    start,
    bal,
    net,
    tr,
    w,
    l,
    gp,
    gl,
    wd,
    ld,
    tp,
    pw,
    pls,
    mdd,
    mddp,
    disc,
    pf,
    apY,
    apN,
    apW,
    res,
    wk,
  };
}
