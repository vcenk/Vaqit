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
  | 'Tehran';

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
    case 'MuslimWorldLeague': params = CalculationMethod.MuslimWorldLeague(); break;
    case 'Egyptian':          params = CalculationMethod.Egyptian();          break;
    case 'Karachi':           params = CalculationMethod.Karachi();           break;
    case 'UmmAlQura':         params = CalculationMethod.UmmAlQura();         break;
    case 'Turkey':            params = CalculationMethod.Turkey();            break;
    case 'Tehran':            params = CalculationMethod.Tehran();            break;
    default:                  params = CalculationMethod.NorthAmerica();
  }

  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  switch (settings.highLatitudeRule) {
    case 'MiddleOfTheNight': params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight; break;
    case 'TwilightAngle':    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;    break;
    default:                 params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  }

  return params;
}

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
