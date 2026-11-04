import { MonthData, CalculatedStats } from '../types/trading';
import { RULES_EN, PRE_CHECK_EN, DAYS_OF_WEEK_SHORT } from './constants';
import { money, pct, fp, num } from './calculations';

export interface JournalLine {
  type: 'h1' | 'h2' | 't' | 'b' | 'p' | 'n' | 'gap';
  text: string;
}

export function buildJournalLines(S: MonthData, stats: CalculatedStats): JournalLine[] {
  const lines: JournalLine[] = [];
  lines.push({ type: 'h1', text: `Mahfuj’s Trading Journal – ${S.nm || 'Month'}` });
  lines.push({ type: 'h2', text: 'Monthly Performance Numbers' });

  const summaryRows: [string, string][] = [
    ['Starting balance', money(stats.start)],
    ['Ending balance', money(stats.bal)],
    ['Net P/L', money(stats.net)],
    ['Total pips', stats.res.some((r) => r.anyp) ? `${fp(stats.tp)} pips` : '–'],
    ['Total trades', String(stats.tr)],
    ['Win rate', stats.tr ? pct(stats.w / stats.tr) : '–'],
    ['Avg win', stats.wd ? money(stats.gp / stats.wd) : '–'],
    ['Avg loss', stats.ld ? money(stats.gl / stats.ld) : '–'],
    ['Profit factor', stats.pf],
    ['Max drawdown', stats.tr ? `${money(stats.mdd)} (${pct(stats.mddp)})` : '–'],
    ['Discipline score', pct(stats.disc)],
    ['Max daily loss limit', `${num(S.l) || 0}% (${money(((stats.start * (num(S.l) || 0)) / 100))})`],
    ['A+ Setups', (stats.apY + stats.apN) ? `${stats.apY} of ${stats.apY + stats.apN} (${pct(stats.apY / (stats.apY + stats.apN))})` : '–'],
    ['A+ Win rate', stats.apY ? pct(stats.apW / stats.apY) : '–'],
  ];

  summaryRows.forEach(([label, val]) => {
    lines.push({ type: 't', text: `${label}: ${val}` });
  });

  lines.push({ type: 'h2', text: 'Weekly Review' });
  stats.wk.forEach((x, i) => {
    lines.push({
      type: 't',
      text: `Week ${i + 1}: ${x.t} trades, ${x.w} wins (${x.t ? pct(x.w / x.t) : '–'}), Net: ${money(x.n)}, Pips: ${fp(x.p)}`,
    });
    if (S.wm && S.wm[i]) {
      lines.push({ type: 't', text: `   Biggest Mistake: ${S.wm[i]}` });
    }
  });

  lines.push({ type: 'h2', text: 'Daily Trading Logs' });
  let hasEntries = false;

  (S.d || []).forEach((day, i) => {
    const r = stats.res[i];
    const rulesFollowed = (day.r || [])
      .map((x, k) => (x ? `${k + 1}. ${RULES_EN[k]} ${x === 1 ? '✓' : '✗'}` : ''))
      .filter(Boolean);

    const checkCount = (day.c || []).slice(0, PRE_CHECK_EN.length).filter(Boolean).length;
    const tradeLines = (day.t || [])
      .map((t, k) =>
        t.p || t.d || t.ap || t.pl || t.pp
          ? `Trade ${k + 1}: ${t.p || 'Pair'} [${t.d || '-'}] ${t.ap ? `(A+: ${t.ap})` : ''} | P/L: ${t.pl ? `$${t.pl}` : '–'} | Pips: ${t.pp ? `${t.pp}p` : '–'}`
          : ''
      )
      .filter(Boolean);

    const moodVal = num(day.m) || 0;
    const hasAnyContent =
      r?.any ||
      rulesFollowed.length > 0 ||
      checkCount > 0 ||
      tradeLines.length > 0 ||
      moodVal > 0 ||
      day.mk ||
      day.nf ||
      day.n ||
      day.ce;

    if (!hasAnyContent) return;
    hasEntries = true;

    const weekday = DAYS_OF_WEEK_SHORT[i % 5];
    const dayHeader = `${weekday} · Day ${i + 1}${r?.any ? `  |  Net: ${money(r.net)}  |  Bal: ${money(r.bal)}` : ''}${r?.anyp ? `  |  ${fp(r.pips)} pips` : ''}`;
    lines.push({ type: r?.has ? (r.tone < 0 ? 'n' : 'p') : 'b', text: dayHeader });

    tradeLines.forEach((tl) => lines.push({ type: 't', text: tl }));
    rulesFollowed.forEach((rf) => lines.push({ type: 't', text: `Rule: ${rf}` }));

    if (checkCount > 0) {
      lines.push({ type: 't', text: `Pre-trade checklist: ${checkCount}/${PRE_CHECK_EN.length} ✓` });
    }
    if (day.ce) {
      lines.push({
        type: 't',
        text: day.ce === 1 ? '✓ Emotion Controlled' : '✗ Emotional Tilt / Disrupted',
      });
    }
    if (moodVal > 0) {
      lines.push({ type: 't', text: `Mood: ${'★'.repeat(moodVal)}${'☆'.repeat(5 - moodVal)}` });
    }
    if (day.mk) lines.push({ type: 't', text: `Mistake: ${day.mk}` });
    if (day.nf) lines.push({ type: 't', text: `Next Focus: ${day.nf}` });
    if (day.n) lines.push({ type: 't', text: `Notes: ${day.n}` });
    lines.push({ type: 'gap', text: '' });
  });

  if (!hasEntries) {
    lines.push({ type: 't', text: 'No trades recorded yet for this month.' });
  }

  return lines;
}

export function generateJournalCanvas(S: MonthData, stats: CalculatedStats): HTMLCanvasElement {
  const lines = buildJournalLines(S, stats);
  const W = 960;
  const pad = 36;
  const cv = document.createElement('canvas');
  const x = cv.getContext('2d')!;
  const F = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

  const styles: Record<JournalLine['type'], [number, string, string]> = {
    h1: [24, 'bold', '#0284c7'],
    h2: [18, 'bold', '#0f172a'],
    t: [14, '', '#334155'],
    b: [15, 'bold', '#0f172a'],
    p: [15, 'bold', '#059669'],
    n: [15, 'bold', '#dc2626'],
    gap: [8, '', '#000000'],
  };

  function wrapText(t: string, font: string, maxW: number): string[] {
    x.font = font;
    const out: string[] = [];
    let cur = '';
    const words = String(t).split(' ');
    for (const w of words) {
      const candidate = cur ? `${cur} ${w}` : w;
      if (x.measureText(candidate).width > maxW && cur) {
        out.push(cur);
        cur = w;
      } else {
        cur = candidate;
      }
    }
    if (cur) out.push(cur);
    return out.length ? out : [''];
  }

  interface RenderItem {
    text: string;
    font: string;
    color: string;
    y: number;
    underlineY?: number;
  }

  const items: RenderItem[] = [];
  let curY = pad;

  lines.forEach((l) => {
    const s = styles[l.type];
    const font = `${s[1] ? s[1] + ' ' : ''}${s[0]}px ${F}`;
    const lh = Math.round(s[0] * 1.55);
    const wrapped = l.type === 'gap' ? [''] : wrapText(l.text, font, W - 2 * pad);

    if (l.type === 'h2') curY += 16;
    if (l.type === 'h1') curY += 8;

    wrapped.forEach((w, j) => {
      items.push({
        text: w,
        font,
        color: s[2],
        y: curY + Math.round(lh * 0.75),
        underlineY: l.type === 'h2' && j === wrapped.length - 1 ? curY + lh + 2 : undefined,
      });
      curY += lh;
    });
  });

  const H = curY + pad;
  cv.width = W;
  cv.height = H;

  // Render background & items
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, W, H);

  // Decorative top bar
  const grad = x.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(1, '#e11d48');
  x.fillStyle = grad;
  x.fillRect(0, 0, W, 6);

  items.forEach((it) => {
    x.font = it.font;
    x.fillStyle = it.color;
    x.fillText(it.text, pad, it.y);
    if (it.underlineY) {
      x.fillStyle = '#e2e8f0';
      x.fillRect(pad, it.underlineY, W - 2 * pad, 1.5);
    }
  });

  return cv;
}

export function generateImageBlob(S: MonthData, stats: CalculatedStats): Promise<Blob | null> {
  return new Promise((resolve) => {
    const cv = generateJournalCanvas(S, stats);
    cv.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export function generatePdfBlob(S: MonthData, stats: CalculatedStats): Promise<Blob | null> {
  return new Promise((resolve) => {
    const cv = generateJournalCanvas(S, stats);
    const W = cv.width;
    const PH = Math.round(W * 1.4142); // A4 ratio
    const n = Math.max(1, Math.ceil(cv.height / PH));
    const pages: { bytes: Uint8Array; w: number; h: number }[] = [];

    for (let k = 0; k < n; k++) {
      const pc = document.createElement('canvas');
      pc.width = W;
      pc.height = PH;
      const px = pc.getContext('2d')!;
      px.fillStyle = '#ffffff';
      px.fillRect(0, 0, W, PH);
      px.drawImage(cv, 0, k * PH, W, PH, 0, 0, W, PH);

      const base64 = pc.toDataURL('image/jpeg', 0.92).split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      pages.push({ bytes, w: W, h: PH });
    }

    const pdfBlob = createRawPdfFromPages(pages);
    resolve(pdfBlob);
  });
}

function createRawPdfFromPages(pages: { bytes: Uint8Array; w: number; h: number }[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const off: number[] = [];
  let len = 0;
  const np = pages.length;
  const pw = 595; // standard pt width for A4

  function put(x: string | Uint8Array) {
    const b = typeof x === 'string' ? enc.encode(x) : x;
    chunks.push(b);
    len += b.length;
  }

  function obj(n: number, body: string) {
    off[n] = len;
    put(`${n} 0 obj\n${body}\nendobj\n`);
  }

  put('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  const kids: string[] = [];
  for (let k = 0; k < np; k++) {
    kids.push(`${3 + 3 * k} 0 R`);
  }
  obj(2, `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${np} >>`);

  pages.forEach((p, k) => {
    const ph = Math.round((pw * p.h) / p.w);
    const cs = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    obj(
      3 + 3 * k,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${5 + 3 * k} 0 R >> >> /Contents ${4 + 3 * k} 0 R >>`
    );
    obj(4 + 3 * k, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    off[5 + 3 * k] = len;
    put(
      `${5 + 3 * k} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`
    );
    put(p.bytes);
    put('\nendstream\nendobj\n');
  });

  const xr = len;
  const total = 3 + 3 * np;
  let xTable = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let n = 1; n < total; n++) {
    xTable += `${('0000000000' + off[n]).slice(-10)} 00000 n \n`;
  }
  put(`${xTable}trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);

  return new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
