/**
 * Prayer-time metadata & high-latitude analysis for the "tap any time to see
 * why" source card — Vaqit's verification differentiator.
 *
 * The twilight math here MIRRORS lib/prayer-core/src/highLatitude.ts, which is
 * the golden-tested source of truth. Keep the two in sync. (The mobile app does
 * not import prayer-core directly because it isn't wired into the Metro bundler
 * as a workspace source dependency.)
 */
import {
  CalculationMethod,
  CalculationParameters,
  HighLatitudeRule,
  Madhab,
} from 'adhan';
import {
  HIGH_LAT_RULE_INFO,
  METHOD_REGIONS,
  PRAYER_DISPLAY_NAMES,
} from '@/constants/prayers';
import { CALCULATION_METHODS } from '@/constants/prayers';
import type { PrayerSettings } from '@/context/PrayerContext';

const DEG = Math.PI / 180;

// ─── Twilight geometry (mirror of prayer-core) ────────────────────────────────

export function solarDeclination(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return 23.45 * Math.sin(DEG * ((360 / 365) * (284 + dayOfYear)));
}

export function maxSolarDepression(latitude: number, date: Date): number {
  const decl = solarDeclination(date);
  const c = Math.cos((latitude + decl) * DEG);
  return Math.asin(Math.max(-1, Math.min(1, c))) / DEG;
}

export interface TwilightAnalysis {
  maxDepression: number;
  fajrApproximated: boolean;
  ishaApproximated: boolean;
}

export function analyzeTwilight(
  latitude: number,
  date: Date,
  fajrAngle: number,
  ishaAngle: number,
  ishaInterval = 0,
): TwilightAnalysis {
  const maxDepression = maxSolarDepression(latitude, date);
  return {
    maxDepression,
    fajrApproximated: fajrAngle > 0 && maxDepression < fajrAngle,
    ishaApproximated: ishaInterval <= 0 && ishaAngle > 0 && maxDepression < ishaAngle,
  };
}

// ─── Method parameters / angles ───────────────────────────────────────────────

/** Mirror of PrayerContext.buildParams — includes the added methods. */
function buildMethodParams(settings: PrayerSettings): CalculationParameters {
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

export interface MethodAngles {
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval: number;
}

export function getMethodAngles(settings: PrayerSettings): MethodAngles {
  const p = buildMethodParams(settings);
  return { fajrAngle: p.fajrAngle, ishaAngle: p.ishaAngle, ishaInterval: p.ishaInterval };
}

export function methodLabel(methodId: string): string {
  return CALCULATION_METHODS.find(m => m.id === methodId)?.label ?? methodId;
}

export function methodRegion(methodId: string): string | null {
  return METHOD_REGIONS[methodId] ?? null;
}

// ─── Day-level analysis (drives the "approximated" badge on the Today screen) ──

export interface DayMeta {
  fajrApproximated: boolean;
  ishaApproximated: boolean;
  maxDepression: number;
  angles: MethodAngles;
}

export function analyzeDay(settings: PrayerSettings, date: Date): DayMeta {
  const angles = getMethodAngles(settings);
  const tw = analyzeTwilight(
    settings.latitude,
    date,
    angles.fajrAngle,
    angles.ishaAngle,
    angles.ishaInterval,
  );
  return {
    fajrApproximated: tw.fajrApproximated,
    ishaApproximated: tw.ishaApproximated,
    maxDepression: tw.maxDepression,
    angles,
  };
}

// ─── Source card (the "tap any time to see why" content) ──────────────────────

export interface PrayerExplanation {
  key: string;
  displayName: string;
  /** One-line description of how this specific time is derived. */
  basisText: string;
  /** True only for Fajr/Isha that had to be approximated at high latitude. */
  approximated: boolean;
  /** Present when approximated: the rule that produced the estimate. */
  ruleLabel: string | null;
  ruleExplanation: string | null;
  /** Extra context line for approximated times. */
  approxNote: string | null;
  methodLabel: string;
  locationName: string;
  /** User's manual per-prayer adjustment, in minutes (0 when none). */
  adjustmentMin: number;
  sourceLine: string;
}

const ORDINAL_ONE = 1;

export function buildPrayerExplanation(
  settings: PrayerSettings,
  prayerKey: string,
  date: Date,
): PrayerExplanation {
  const angles = getMethodAngles(settings);
  const tw = analyzeTwilight(
    settings.latitude,
    date,
    angles.fajrAngle,
    angles.ishaAngle,
    angles.ishaInterval,
  );

  const madhabAsr =
    settings.madhab === 'Hanafi'
      ? 'When an object’s shadow equals twice its length (Hanafi)'
      : 'When an object’s shadow equals its length (Standard)';

  let basisText: string;
  let approximated = false;

  switch (prayerKey) {
    case 'fajr':
      basisText = `Sun ${angles.fajrAngle}° below the horizon before sunrise`;
      approximated = tw.fajrApproximated;
      break;
    case 'sunrise':
      basisText = 'The moment the sun crosses the horizon';
      break;
    case 'dhuhr':
      basisText = 'Just after the sun passes its highest point (solar noon)';
      break;
    case 'asr':
      basisText = madhabAsr;
      break;
    case 'maghrib':
      basisText = 'At sunset';
      break;
    case 'isha':
      basisText =
        angles.ishaInterval > 0
          ? `${angles.ishaInterval} minutes after Maghrib`
          : `Sun ${angles.ishaAngle}° below the horizon after sunset`;
      approximated = tw.ishaApproximated;
      break;
    default:
      basisText = 'Calculated from the sun’s position';
  }

  const ruleInfo = HIGH_LAT_RULE_INFO[settings.highLatitudeRule];
  const adjustmentMin =
    (settings.offsets?.[prayerKey as keyof typeof settings.offsets] as number | undefined) ?? 0;

  return {
    key: prayerKey,
    displayName: PRAYER_DISPLAY_NAMES[prayerKey] ?? prayerKey,
    basisText,
    approximated,
    ruleLabel: approximated ? ruleInfo?.label ?? null : null,
    ruleExplanation: approximated ? ruleInfo?.explanation ?? null : null,
    approxNote: approximated
      ? `At your latitude the sun only reaches about ${tw.maxDepression.toFixed(
          ORDINAL_ONE,
        )}° below the horizon on this date, short of the ${
          prayerKey === 'fajr' ? angles.fajrAngle : angles.ishaAngle
        }° this method needs — so the exact moment can’t be observed and is estimated.`
      : null,
    methodLabel: methodLabel(settings.calculationMethod),
    locationName: settings.locationName,
    adjustmentMin,
    sourceLine: 'Calculated on your device',
  };
}

// ─── Mosque diff explanation (the P10 "why 10 min different?" answer) ──────────

export interface MosqueDiff {
  /** Mosque start minus calculated, in minutes (negative = mosque earlier). */
  diffMin: number;
  /** "same as", "6 min earlier", "11 min later". */
  magnitudeText: string;
  /** Plain-language reason the two differ. */
  explanation: string;
}

/**
 * Explain why the mosque's published start time differs from the calculated one.
 * diffMin < 0 → mosque is earlier; > 0 → mosque is later.
 */
export function explainMosqueDiff(
  prayerKey: string,
  diffMin: number,
  methodId: string,
): MosqueDiff {
  const abs = Math.abs(diffMin);
  const dir = diffMin < 0 ? 'earlier' : 'later';
  const magnitudeText = abs === 0 ? 'same as calculated' : `${abs} min ${dir} than calculated`;

  let explanation: string;
  if (abs === 0) {
    explanation = 'Your mosque matches the calculated time for this prayer.';
  } else if (abs <= 3) {
    explanation =
      'A small difference like this is usually rounding — many mosques round to the nearest 5 minutes on their printed timetable.';
  } else if (prayerKey === 'fajr' || prayerKey === 'isha') {
    explanation =
      `Fajr and Isha depend on a twilight angle, and mosques often use a different angle (or a fixed seasonal timetable) than the ${methodLabel(
        methodId,
      )} calculation — which is the most common reason for a difference this size.`;
  } else {
    explanation =
      'Your mosque likely publishes from a fixed timetable or applies its own safety margin rather than the exact astronomical time.';
  }

  return { diffMin, magnitudeText, explanation };
}
