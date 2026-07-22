import { toHijri } from './prayers';

/** Ramadan is the 9th month of the Hijri calendar. */
export const RAMADAN_MONTH = 9;

export interface RamadanInfo {
  isRamadan: boolean;
  /** 1–30 during Ramadan, else null. */
  dayOfRamadan: number | null;
  hijriYear: number;
}

/**
 * Detect Ramadan for a given date. The date passed in should already have the
 * user's Hijri offset applied (the tabular calendar can differ from local
 * moon-sighting by a day — same caveat the app shows elsewhere).
 */
export function getRamadanInfo(date: Date): RamadanInfo {
  const h = toHijri(date);
  const isRamadan = h.month === RAMADAN_MONTH;
  return {
    isRamadan,
    dayOfRamadan: isRamadan ? h.day : null,
    hijriYear: h.year,
  };
}
