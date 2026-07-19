/**
 * Twilight / high-latitude analysis tests — the "verification" differentiator.
 *
 * These prove that Vaqit can DETECT when Fajr/Isha are astronomically undefined
 * (and therefore approximated by a high-latitude rule), instead of silently
 * showing an invented time like most apps. Also covers the newly added
 * calculation methods (Moonsighting, UOIF/France 12°, Dubai).
 */
import { describe, it, expect } from 'vitest';
import {
  computePrayerTimes,
  getMethodAngles,
  METHOD_INFO,
} from '../src/compute.js';
import type { CalcMethodKey, ComputeSettings } from '../src/compute.js';
import {
  solarDeclination,
  maxSolarDepression,
  analyzeTwilight,
} from '../src/highLatitude.js';

const JUNE_21 = new Date(2024, 5, 21); // summer solstice — hardest case
const DEC_21  = new Date(2024, 11, 21); // winter solstice — proper night everywhere

function cfg(method: CalcMethodKey, lat: number, lon: number): ComputeSettings {
  return {
    latitude: lat,
    longitude: lon,
    calculationMethod: method,
    madhab: 'Shafi',
    highLatitudeRule: 'SeventhOfTheNight',
  };
}

// ─── Solar geometry ───────────────────────────────────────────────────────────

describe('solarDeclination approximates the solstices', () => {
  it('is near +23.4° at the June solstice', () => {
    expect(solarDeclination(JUNE_21)).toBeGreaterThan(23);
    expect(solarDeclination(JUNE_21)).toBeLessThan(23.5);
  });
  it('is near -23.4° at the December solstice', () => {
    expect(solarDeclination(DEC_21)).toBeLessThan(-23);
    expect(solarDeclination(DEC_21)).toBeGreaterThan(-23.5);
  });
});

describe('maxSolarDepression matches known high-latitude behaviour', () => {
  // London: ~15.2° max depression at solstice — this is exactly why 18° methods
  // break in the UK summer but 15° (ISNA) is borderline usable.
  it('London (51.5°N) reaches ~15° at the June solstice', () => {
    const d = maxSolarDepression(51.5074, JUNE_21);
    expect(d).toBeGreaterThan(14);
    expect(d).toBeLessThan(16);
  });
  // Mecca: deep night year-round — no approximation ever needed.
  it('Mecca (21.4°N) reaches a deep depression at the June solstice', () => {
    expect(maxSolarDepression(21.4225, JUNE_21)).toBeGreaterThan(40);
  });
  // Oslo: the sun barely dips — very shallow depression.
  it('Oslo (59.9°N) barely dips below the horizon at the June solstice', () => {
    expect(maxSolarDepression(59.9139, JUNE_21)).toBeLessThan(10);
  });
});

// ─── Approximation detection ──────────────────────────────────────────────────

describe('analyzeTwilight flags approximated Fajr/Isha at high latitude', () => {
  it('London + MWL (18°) → both Fajr and Isha are approximated in June', () => {
    const a = getMethodAngles(cfg('MuslimWorldLeague', 51.5074, -0.1278));
    const r = analyzeTwilight(51.5074, JUNE_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    expect(r.fajrApproximated).toBe(true);
    expect(r.ishaApproximated).toBe(true);
  });

  it('Vancouver + ISNA (15°) → NOT approximated (15° is reached in June)', () => {
    const a = getMethodAngles(cfg('NorthAmerica', 49.2827, -123.1207));
    const r = analyzeTwilight(49.2827, JUNE_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    expect(r.fajrApproximated).toBe(false);
    expect(r.ishaApproximated).toBe(false);
  });

  it('Vancouver + MWL → Fajr (18°) approximated, Isha (17°) not — max depression ~17.3°', () => {
    const a = getMethodAngles(cfg('MuslimWorldLeague', 49.2827, -123.1207));
    expect(a.fajrAngle).toBe(18);
    expect(a.ishaAngle).toBe(17);
    const r = analyzeTwilight(49.2827, JUNE_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    // Sun reaches ~17.3° depression: past 17° (Isha ok) but short of 18° (Fajr invented).
    expect(r.fajrApproximated).toBe(true);
    expect(r.ishaApproximated).toBe(false);
  });

  it('Mecca → never approximated, even in June', () => {
    const a = getMethodAngles(cfg('UmmAlQura', 21.4225, 39.8262));
    const r = analyzeTwilight(21.4225, JUNE_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    expect(r.fajrApproximated).toBe(false);
    expect(r.ishaApproximated).toBe(false);
  });

  it('London in December → nothing approximated (proper night)', () => {
    const a = getMethodAngles(cfg('MuslimWorldLeague', 51.5074, -0.1278));
    const r = analyzeTwilight(51.5074, DEC_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    expect(r.fajrApproximated).toBe(false);
    expect(r.ishaApproximated).toBe(false);
  });

  it('interval-based Isha (Umm al-Qura) is never flagged approximated', () => {
    const a = getMethodAngles(cfg('UmmAlQura', 59.9139, 10.7522)); // Oslo
    expect(a.ishaInterval).toBeGreaterThan(0);
    const r = analyzeTwilight(59.9139, JUNE_21, a.fajrAngle, a.ishaAngle, a.ishaInterval);
    expect(r.ishaApproximated).toBe(false); // interval never depends on twilight angle
  });
});

// ─── New calculation methods ──────────────────────────────────────────────────

describe('newly added calculation methods', () => {
  it('UOIF / France uses 12° for both Fajr and Isha', () => {
    const a = getMethodAngles(cfg('France', 48.8566, 2.3522)); // Paris
    expect(a.fajrAngle).toBe(12);
    expect(a.ishaAngle).toBe(12);
  });

  it('Moonsighting Committee produces valid, ordered times (Toronto)', () => {
    const t = computePrayerTimes(cfg('MoonsightingCommittee', 43.6532, -79.3832), JUNE_21)!;
    expect(t).not.toBeNull();
    expect(t.fajr < t.sunrise).toBe(true);
    expect(t.maghrib < t.isha).toBe(true);
  });

  it('Dubai produces valid, ordered times', () => {
    const t = computePrayerTimes(cfg('Dubai', 25.2048, 55.2708), JUNE_21)!;
    expect(t).not.toBeNull();
    expect(t.fajr < t.sunrise).toBe(true);
    expect(t.maghrib < t.isha).toBe(true);
  });

  it('METHOD_INFO has an entry for every method key', () => {
    const keys: CalcMethodKey[] = [
      'NorthAmerica', 'MuslimWorldLeague', 'Egyptian', 'Karachi', 'UmmAlQura',
      'Turkey', 'Tehran', 'MoonsightingCommittee', 'France', 'Dubai',
    ];
    for (const k of keys) {
      expect(METHOD_INFO[k], `missing METHOD_INFO for ${k}`).toBeDefined();
      expect(METHOD_INFO[k].label.length).toBeGreaterThan(0);
    }
  });
});
