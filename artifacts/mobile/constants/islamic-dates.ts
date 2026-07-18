/** Recurring Islamic special dates by Hijri month (1-indexed) and day. */
export interface IslamicDate {
  month: number;
  day: number;
  name: string;
  nameAr?: string;
  important: boolean; // true = highlighted with accent colour
}

export const ISLAMIC_DATES: IslamicDate[] = [
  { month: 1,  day: 1,  name: 'Islamic New Year',       important: true  },
  { month: 1,  day: 10, name: 'Day of Ashura',           important: true  },
  { month: 3,  day: 12, name: "Mawlid al-Nabi",          important: false },
  { month: 7,  day: 27, name: "Laylat al-Mi'raj",        important: false },
  { month: 8,  day: 15, name: "Laylat al-Bara'ah",       important: false },
  { month: 9,  day: 1,  name: 'Ramadan begins',          important: true  },
  { month: 9,  day: 15, name: 'Mid-Ramadan',             important: false },
  { month: 9,  day: 21, name: "Laylat al-Qadr (21st)",  important: false },
  { month: 9,  day: 23, name: "Laylat al-Qadr (23rd)",  important: false },
  { month: 9,  day: 25, name: "Laylat al-Qadr (25th)",  important: false },
  { month: 9,  day: 27, name: "Laylat al-Qadr (27th)",  important: true  },
  { month: 9,  day: 29, name: "Laylat al-Qadr (29th)",  important: false },
  { month: 10, day: 1,  name: 'Eid al-Fitr',            important: true  },
  { month: 10, day: 2,  name: 'Eid al-Fitr (2nd day)',  important: false },
  { month: 10, day: 3,  name: 'Eid al-Fitr (3rd day)',  important: false },
  { month: 12, day: 8,  name: 'Day of Arafah (eve)',    important: false },
  { month: 12, day: 9,  name: 'Day of Arafah',          important: true  },
  { month: 12, day: 10, name: 'Eid al-Adha',            important: true  },
  { month: 12, day: 11, name: 'Eid al-Adha (2nd day)', important: false },
  { month: 12, day: 12, name: 'Eid al-Adha (3rd day)', important: false },
];

/** Look up any special date for a given Hijri month and day (returns first match or null). */
export function getIslamicDate(hijriMonth: number, hijriDay: number): IslamicDate | null {
  return ISLAMIC_DATES.find(d => d.month === hijriMonth && d.day === hijriDay) ?? null;
}

export const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];
