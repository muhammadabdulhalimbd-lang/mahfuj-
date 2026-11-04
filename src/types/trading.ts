export interface Trade {
  p: string;   // Pair (e.g., XAUUSD, EURUSD)
  d: 'B' | 'S' | ''; // Direction: Buy or Sell
  ap: 'Yes' | 'No' | ''; // A+ Setup
  pl: string;  // P/L in $
  pp: string;  // Pips (+/-)
}

export interface DayLog {
  r: number[];    // 6 rules: 0=unset, 1=followed (y), 2=broken (n)
  t: Trade[];     // 3 trades
  m: string;      // Mood (1-5)
  n: string;      // Notes
  c?: number[];   // Pre-trade checklist items: 0=unset, 1=followed (✓), 2=not followed (❌)
  ce?: number;    // Control emotion: 0=unset, 1=controlled, 2=broken
  mk?: string;    // Biggest mistake today
  nf?: string;    // Next day focus
}

export interface LotSettings {
  t: string;      // Trades per day (e.g. "3")
  s: string;      // Stop loss in pips (e.g. "20")
  i: string;      // Instrument (e.g. "eurusd", "xauusd", "custom")
  p: string;      // Custom pip value
  n: string;      // Custom instrument name
  m: 'safe' | 'medium' | 'high'; // Risk mode
  a: 'live' | 'prop';           // Account type
  ph: '1' | '2' | 'live';       // Prop phase
  o: '8' | '10';                // Prop target option (8% or 10%)
}

export interface AccountSnapshot {
  s: string;      // Starting balance
  dt: string;     // Daily target
  mt: string;     // Monthly target
  l: string;      // Max loss %
}

export interface MonthData {
  s: number;      // Starting balance ($)
  l: number;      // Max daily loss (%)
  dt?: string;    // Daily profit target ($)
  mt?: string;    // Total / Monthly profit target ($)
  nm: string;     // Month name (e.g., "Month 1", "March 2026")
  d: DayLog[];    // 20 trading days
  wm?: string[];  // 4 weekly biggest mistakes
  lot?: Partial<LotSettings>; // Lot size calculator settings
  snap?: {
    live?: AccountSnapshot;
    prop?: AccountSnapshot;
  };
}

export interface AppState {
  c: number;          // Current active month index
  m: MonthData[];     // All months
}

export interface DayCalcResult {
  any: boolean;
  net: number;
  bal: number;
  hit: boolean;       // Hit max daily loss limit
  hitTarget: boolean; // Hit daily profit target
  anyp: boolean;
  pips: number;
  has: boolean;
  tone: number;       // >0 positive, <0 negative, 0 neutral
}

export interface WeekCalcResult {
  t: number;          // Trades
  w: number;          // Wins
  n: number;          // Net P/L
  p: number;          // Net pips
}

export interface CalculatedStats {
  start: number;
  bal: number;
  net: number;
  tr: number;
  w: number;
  l: number;
  gp: number;
  gl: number;
  wd: number;
  ld: number;
  tp: number;
  pw: number;
  pls: number;
  mdd: number;
  mddp: number;
  disc: number;
  pf: string;
  apY: number;
  apN: number;
  apW: number;
  dailyTargetHitDays: number;
  monthlyTarget: number;
  dailyTarget: number;
  remainingToTarget: number;
  res: DayCalcResult[];
  wk: WeekCalcResult[];
}

export interface MarketSession {
  name: string;
  nativeTz: string;
  openLocalHour: number; // 24h
  durationHours: number;
  accentColor: string;
  cityName: string;
}
