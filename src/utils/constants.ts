import { MarketSession } from '../types/trading';

export const RULES_EN = [
  'Follow your trading plan',
  'Maximum 3 trades per day',
  'Daily max risk 2%',
  'Stop overtrading',
  'No revenge trading',
  'Focus on discipline, not on profit'
];

export const RULES_BN = [
  'ট্রেডিং প্ল্যান মেনে চলুন',
  'দিনে সর্বোচ্চ ৩টি ট্রেড',
  'দৈনিক সর্বোচ্চ রিস্ক ২%',
  'ওভারট্রেডিং বন্ধ করুন',
  'রিভেঞ্জ ট্রেডিং করবেন না',
  'মুনাফা নয়, শৃঙ্খলায় মনোযোগ দিন'
];

export const PRE_CHECK_EN = [
  'Higher-timeframe trend checked',
  'Key support / resistance marked',
  'Setup matches my plan',
  'Stop loss set before entry'
];

export const PRE_CHECK_BN = [
  'হায়ার টাইমফ্রেম ট্রেন্ড যাচাই করা হয়েছে',
  'মূল সাপোর্ট ও রেজিস্ট্যান্স চিহ্নিত করা হয়েছে',
  'সেটআপ আমার নিয়মের সাথে মিলেছে',
  'এন্ট্রির আগেই স্টপ লস নির্ধারণ করা হয়েছে'
];

export const POPULAR_PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'BTCUSD', 'ETHUSD', 'US30', 'NAS100'
];

export const MARKET_SESSIONS: MarketSession[] = [
  { name: 'Sydney', cityName: 'সিডনি', nativeTz: 'Australia/Sydney', openLocalHour: 7, durationHours: 9, accentColor: '#0ea5e9' },
  { name: 'Tokyo', cityName: 'টোকিও', nativeTz: 'Asia/Tokyo', openLocalHour: 9, durationHours: 9, accentColor: '#ec4899' },
  { name: 'London', cityName: 'লন্ডন', nativeTz: 'Europe/London', openLocalHour: 8, durationHours: 9, accentColor: '#3b82f6' },
  { name: 'New York', cityName: 'নিউ ইয়র্ক', nativeTz: 'America/New_York', openLocalHour: 8, durationHours: 9, accentColor: '#10b981' }
];

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Dhaka', label: 'বাংলাদেশ (Dhaka GMT+6)' },
  { value: 'Asia/Kolkata', label: 'ভারত (Kolkata GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'দুবাই / সংযুক্ত আরব আমিরাত (Dubai GMT+4)' },
  { value: 'Asia/Riyadh', label: 'সৌদি আরব (Riyadh GMT+3)' },
  { value: 'Asia/Kuala_Lumpur', label: 'মালয়েশিয়া (Kuala Lumpur GMT+8)' },
  { value: 'Asia/Singapore', label: 'সিঙ্গাপুর (Singapore GMT+8)' },
  { value: 'Europe/London', label: 'লন্ডন (London GMT/BST)' },
  { value: 'America/New_York', label: 'নিউ ইয়র্ক (New York EST/EDT)' },
  { value: 'UTC', label: 'UTC (সার্বজনীন সময়)' }
];

export const DAYS_OF_WEEK_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAYS_OF_WEEK_BN = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'];

export const STORAGE_KEY_V2 = 'mh-trading-log-v2';
export const STORAGE_KEY_V1 = 'mh-trading-log-v1';
export const STORAGE_KEY_TOUR = 'mh-tour-done';
export const STORAGE_KEY_THEME = 'mh-theme-pref';
export const STORAGE_KEY_LANG = 'mh-lang-pref';
