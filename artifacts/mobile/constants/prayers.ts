export const PRAYER_DISPLAY_NAMES: Record<string, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PRAYER_ICONS: Record<string, string> = {
  fajr: 'moon-outline',
  sunrise: 'sunny-outline',
  dhuhr: 'sunny',
  asr: 'partly-sunny-outline',
  maghrib: 'cloudy-night-outline',
  isha: 'moon',
};

export const CALCULATION_METHODS = [
  { id: 'NorthAmerica', label: 'ISNA – North America' },
  { id: 'MuslimWorldLeague', label: 'Muslim World League' },
  { id: 'Egyptian', label: 'Egyptian General Authority' },
  { id: 'Karachi', label: 'Univ. of Islamic Sciences, Karachi' },
  { id: 'UmmAlQura', label: 'Umm al-Qura (Makkah)' },
  { id: 'Turkey', label: 'Turkey (Diyanet)' },
  { id: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { id: 'Other', label: 'Other / Custom' },
];

export const HIGH_LAT_RULES = [
  { id: 'MiddleOfTheNight', label: 'Middle of the Night' },
  { id: 'SeventhOfTheNight', label: 'Seventh of the Night' },
  { id: 'TwilightAngle', label: 'Twilight Angle' },
];

export const MADHABS = [
  { id: 'Shafi', label: 'Shafi (Standard)' },
  { id: 'Hanafi', label: 'Hanafi' },
];

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];

function julianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function toHijri(date: Date): {
  day: number;
  month: number;
  year: number;
  monthName: string;
} {
  const JD = julianDay(date);
  const l = JD - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[(month - 1) % 12] ?? '',
  };
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export const TRACKABLE_PRAYERS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const STATUS_COLORS: Record<string, string> = {
  ontime: '#4ADE80',
  late: '#F59E0B',
  missed: '#EF4444',
  jamaah: '#60A5FA',
};

export const STATUS_LABELS: Record<string, string> = {
  ontime: 'On Time',
  late: 'Late',
  missed: 'Missed',
  jamaah: "Jama'ah",
};
