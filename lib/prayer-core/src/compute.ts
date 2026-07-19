/**
 * Pure computation layer over adhan-js.
 * No React, no React Native, no AsyncStorage — safe to import in Node tests.
 *
 * This mirrors the logic in artifacts/mobile/context/PrayerContext.tsx so that
 * the golden test suite exercises the exact same code path as the app.
 */
import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
} from 'adhan';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CalcMethodKey =
  | 'NorthAmerica'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Turkey'
  | 'Tehran'
  | 'MoonsightingCommittee'
  | 'France'
  | 'Dubai';

export type MadhabKey = 'Shafi' | 'Hanafi';

export type HighLatRuleKey =
  | 'SeventhOfTheNight'
  | 'MiddleOfTheNight'
  | 'TwilightAngle';

export interface PrayerOffsets {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface ComputeSettings {
  latitude: number;
  longitude: number;
  calculationMethod: CalcMethodKey;
  madhab: MadhabKey;
  highLatitudeRule: HighLatRuleKey;
  offsets?: Partial<PrayerOffsets>;
}

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build adhan CalculationParameters from our settings keys. */
export function buildParams(settings: Pick<ComputeSettings, 'calculationMethod' | 'madhab' | 'highLatitudeRule'>): CalculationParameters {
  let params: CalculationParameters;
  switch (settings.calculationMethod) {
    case 'MuslimWorldLeague':     params = CalculationMethod.MuslimWorldLeague();     break;
    case 'Egyptian':              params = CalculationMethod.Egyptian();              break;
    case 'Karachi':               params = CalculationMethod.Karachi();               break;
    case 'UmmAlQura':             params = CalculationMethod.UmmAlQura();             break;
    case 'Turkey':                params = CalculationMethod.Turkey();                break;
    case 'Tehran':                params = CalculationMethod.Tehran();                break;
    case 'MoonsightingCommittee': params = CalculationMethod.MoonsightingCommittee(); break;
    case 'Dubai':                 params = CalculationMethod.Dubai();                 break;
    // UOIF / France: 12° Fajr and Isha. Not a built-in adhan method — build from
    // Other() and set the angles explicitly. (The exact setting a competitor got
    // wrong; covered by a golden regression test.)
    case 'France':
      params = CalculationMethod.Other();
      params.fajrAngle = 12;
      params.ishaAngle = 12;
      break;
    default:                      params = CalculationMethod.NorthAmerica();
  }

  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  switch (settings.highLatitudeRule) {
    case 'MiddleOfTheNight': params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight; break;
    case 'TwilightAngle':    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;    break;
    default:                 params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  }

  return params;
}

/** The twilight angles / interval a method actually uses, read from adhan. */
export interface MethodAngles {
  /** Fajr solar depression angle in degrees. */
  fajrAngle: number;
  /** Isha solar depression angle in degrees (0 when interval-based). */
  ishaAngle: number;
  /** Minutes after Maghrib for interval-based Isha (0 when angle-based). */
  ishaInterval: number;
}

/**
 * Extract the real angles a method uses, straight from adhan's parameters —
 * so the source card and high-latitude detection never drift from the engine.
 */
export function getMethodAngles(
  settings: Pick<ComputeSettings, 'calculationMethod' | 'madhab' | 'highLatitudeRule'>,
): MethodAngles {
  const p = buildParams(settings);
  return { fajrAngle: p.fajrAngle, ishaAngle: p.ishaAngle, ishaInterval: p.ishaInterval };
}

/** Human-facing metadata for each method: label, region, and Isha description. */
export interface MethodInfo {
  key: CalcMethodKey;
  label: string;
  region: string;
}

export const METHOD_INFO: Record<CalcMethodKey, MethodInfo> = {
  NorthAmerica:         { key: 'NorthAmerica',         label: 'ISNA — North America',              region: 'North America' },
  MuslimWorldLeague:    { key: 'MuslimWorldLeague',    label: 'Muslim World League',               region: 'Europe, Far East' },
  Egyptian:             { key: 'Egyptian',             label: 'Egyptian General Authority',        region: 'Africa, Levant' },
  Karachi:              { key: 'Karachi',              label: 'Univ. of Islamic Sciences, Karachi',region: 'South Asia' },
  UmmAlQura:            { key: 'UmmAlQura',            label: 'Umm al-Qura (Makkah)',              region: 'Saudi Arabia' },
  Turkey:               { key: 'Turkey',               label: 'Diyanet (Turkey)',                  region: 'Turkey, diaspora' },
  Tehran:               { key: 'Tehran',               label: 'Institute of Geophysics, Tehran',   region: 'Iran' },
  MoonsightingCommittee:{ key: 'MoonsightingCommittee',label: 'Moonsighting Committee',            region: 'North America, UK' },
  France:               { key: 'France',               label: 'UOIF — France (12°)',               region: 'France' },
  Dubai:                { key: 'Dubai',                label: 'Dubai / UAE',                        region: 'Gulf' },
};

/** Apply per-prayer minute offsets to a computed result. */
export function applyOffsets(
  times: PrayerTimesResult,
  offsets: Partial<PrayerOffsets>,
): PrayerTimesResult {
  const ms = (min: number) => (min ?? 0) * 60_000;
  return {
    fajr:    new Date(times.fajr.getTime()    + ms(offsets.fajr    ?? 0)),
    sunrise: times.sunrise,                    // offsets don't apply to sunrise
    dhuhr:   new Date(times.dhuhr.getTime()   + ms(offsets.dhuhr   ?? 0)),
    asr:     new Date(times.asr.getTime()     + ms(offsets.asr     ?? 0)),
    maghrib: new Date(times.maghrib.getTime() + ms(offsets.maghrib ?? 0)),
    isha:    new Date(times.isha.getTime()    + ms(offsets.isha    ?? 0)),
  };
}

/**
 * Compute prayer times for a given location, date, and settings.
 *
 * @param settings - Calculation configuration
 * @param date     - The date to compute for (year/month/day read in LOCAL tz)
 * @returns Prayer times or null if computation fails
 */
export function computePrayerTimes(
  settings: ComputeSettings,
  date: Date,
): PrayerTimesResult | null {
  try {
    const coords = new Coordinates(settings.latitude, settings.longitude);
    const params = buildParams(settings);
    const t = new PrayerTimes(coords, date, params);

    const raw: PrayerTimesResult = {
      fajr: t.fajr,
      sunrise: t.sunrise,
      dhuhr: t.dhuhr,
      asr: t.asr,
      maghrib: t.maghrib,
      isha: t.isha,
    };

    return settings.offsets ? applyOffsets(raw, settings.offsets) : raw;
  } catch {
    return null;
  }
}

/**
 * Compute Qibla bearing from a location to Mecca (degrees clockwise from North).
 */
export function computeQibla(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

// ─── Formatting helpers (for test output readability) ─────────────────────

/**
 * Format a UTC Date as HH:MM in the given IANA timezone.
 * Example: toLocalTime(date, 'America/New_York') → '05:47'
 */
export function toLocalTime(date: Date, tz: string): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  });
}

/**
 * Format a UTC Date as HH:MM in UTC.
 */
export function toUTCTime(date: Date): string {
  return date.toISOString().slice(11, 16);
}
