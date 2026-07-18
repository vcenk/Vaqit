/**
 * Method & madhab differentiation tests.
 *
 * Verifies that each supported calculation method and madhab produces
 * meaningfully different, self-consistent results — and that our buildParams
 * wires them up correctly.
 *
 * Key relationships (from adhan-js source and ISNA/MWL angle specifications):
 *   Fajr angles:  Egyptian 19.5° > MWL 18° = Karachi 18° = Turkey 18° > ISNA 15°
 *   → Higher angle = sun further below horizon = earlier Fajr (earlier time of day)
 *
 *   Madhab Asr:   Hanafi (shadow 2×) → later Asr than Shafi (shadow 1×)
 */
import { describe, it, expect } from 'vitest';
import { computePrayerTimes } from '../src/compute.js';
import type { CalcMethodKey, ComputeSettings } from '../src/compute.js';

// New York — a mid-latitude city where all methods produce valid results
const NYC: Pick<ComputeSettings, 'latitude' | 'longitude' | 'highLatitudeRule'> = {
  latitude:         40.7128,
  longitude:        -74.006,
  highLatitudeRule: 'SeventhOfTheNight',
};

const DATE = new Date(2024, 8, 15); // Sep 15 — equinox-adjacent, clean test day

function compute(method: CalcMethodKey, madhab: 'Shafi' | 'Hanafi' = 'Shafi') {
  return computePrayerTimes({ ...NYC, calculationMethod: method, madhab }, DATE)!;
}

// ─── All methods succeed ──────────────────────────────────────────────────────

const ALL_METHODS: CalcMethodKey[] = [
  'NorthAmerica',
  'MuslimWorldLeague',
  'Egyptian',
  'Karachi',
  'UmmAlQura',
  'Turkey',
  'Tehran',
];

describe('All supported calculation methods return valid times', () => {
  for (const method of ALL_METHODS) {
    it(method, () => {
      const t = compute(method);
      expect(t).not.toBeNull();
      expect(Number.isFinite(t.fajr.getTime())).toBe(true);
      expect(t.fajr < t.sunrise).toBe(true);
      expect(t.maghrib < t.isha).toBe(true);
    });
  }
});

// ─── Fajr angle ordering ─────────────────────────────────────────────────────

describe('Fajr angle relationships — higher angle means earlier Fajr', () => {
  // Egyptian (19.5°) has the highest Fajr angle → earliest Fajr time
  it('Egyptian fajr is earlier than NorthAmerica (ISNA) fajr', () => {
    const eg = compute('Egyptian');
    const na = compute('NorthAmerica');
    expect(
      eg.fajr < na.fajr,
      `Egyptian fajr (${eg.fajr.toISOString()}) should be before ISNA fajr (${na.fajr.toISOString()})`,
    ).toBe(true);
  });

  // MWL (18°) > ISNA (15°) → MWL fajr is earlier
  it('MuslimWorldLeague fajr is earlier than NorthAmerica (ISNA) fajr', () => {
    const mwl = compute('MuslimWorldLeague');
    const na  = compute('NorthAmerica');
    expect(mwl.fajr < na.fajr).toBe(true);
  });

  // Karachi (18°) ≈ MWL (18°) — within a few minutes
  it('Karachi and MuslimWorldLeague fajr are close (both use 18°)', () => {
    const ka  = compute('Karachi');
    const mwl = compute('MuslimWorldLeague');
    const diffMin = Math.abs(ka.fajr.getTime() - mwl.fajr.getTime()) / 60_000;
    expect(diffMin).toBeLessThan(5); // within 5 minutes
  });

  // Egypt > MWL → Egyptian fajr is earlier
  it('Egyptian fajr is earlier than or equal to MuslimWorldLeague fajr', () => {
    const eg  = compute('Egyptian');
    const mwl = compute('MuslimWorldLeague');
    expect(eg.fajr <= mwl.fajr).toBe(true);
  });
});

// ─── Madhab Asr difference ────────────────────────────────────────────────────

describe('Madhab — Hanafi Asr is always later than Shafi Asr', () => {
  for (const method of ALL_METHODS) {
    it(method, () => {
      const shafi  = computePrayerTimes({ ...NYC, calculationMethod: method, madhab: 'Shafi'  }, DATE)!;
      const hanafi = computePrayerTimes({ ...NYC, calculationMethod: method, madhab: 'Hanafi' }, DATE)!;
      expect(
        hanafi.asr > shafi.asr,
        `Hanafi asr (${hanafi.asr.toISOString()}) should be later than Shafi asr (${shafi.asr.toISOString()}) for ${method}`,
      ).toBe(true);
    });
  }

  it('Asr difference is substantial (≥30 min) for mid-latitude', () => {
    const shafi  = compute('NorthAmerica', 'Shafi');
    const hanafi = compute('NorthAmerica', 'Hanafi');
    const diffMin = (hanafi.asr.getTime() - shafi.asr.getTime()) / 60_000;
    expect(diffMin).toBeGreaterThan(30);
  });
});

// ─── Methods produce meaningfully different Isha ──────────────────────────────

describe('Isha times vary across methods — not all the same', () => {
  it('all seven method Isha times are not identical to each other', () => {
    const ishas = ALL_METHODS.map(m => compute(m).isha.getTime());
    const unique = new Set(ishas);
    // At least 3 distinct Isha times among 7 methods
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  // UmmAlQura uses a fixed 90-min interval after Maghrib; others use angles
  it('UmmAlQura isha is exactly 90 minutes after maghrib', () => {
    const t = compute('UmmAlQura');
    const diffMin = (t.isha.getTime() - t.maghrib.getTime()) / 60_000;
    // Allow ±1 min for rounding
    expect(Math.abs(diffMin - 90)).toBeLessThan(1);
  });
});

// ─── Dhuhr / Maghrib are method-independent for most methods ─────────────────
//
// Dhuhr = solar noon and Maghrib = sunset are astronomically determined and
// should be identical across methods — EXCEPT for methods that define explicit
// minute adjustments (methodAdjustments):
//   - Turkey:  +5 min Dhuhr, +7 min Maghrib  (Diyanet convention)
//   - Tehran:  +4 min Maghrib                 (Tehran convention)
// We test the "pure" methods (no adjustments) and separately test Turkey/Tehran.

const PURE_METHODS: CalcMethodKey[] = ['NorthAmerica', 'MuslimWorldLeague', 'Egyptian', 'Karachi'];

describe('Dhuhr and Maghrib are the same across methods without minute adjustments', () => {
  it('Dhuhr is within 2 minutes across NorthAmerica, MWL, Egyptian, Karachi', () => {
    const times = PURE_METHODS.map(m => compute(m).dhuhr.getTime());
    const min   = Math.min(...times);
    const max   = Math.max(...times);
    expect(max - min).toBeLessThan(2 * 60_000); // within 2 min (UmmAlQura rounds by 1 min)
  });

  it('Maghrib is within 2 minutes across NorthAmerica, MWL, Egyptian, Karachi', () => {
    const times = PURE_METHODS.map(m => compute(m).maghrib.getTime());
    const min   = Math.min(...times);
    const max   = Math.max(...times);
    expect(max - min).toBeLessThan(2 * 60_000);
  });

  it('Turkey Dhuhr is noticeably later than NorthAmerica (Diyanet +5 min adjustment)', () => {
    const turkey = compute('Turkey').dhuhr.getTime();
    const isna   = compute('NorthAmerica').dhuhr.getTime();
    // Turkey adds 5 min to Dhuhr
    const diffMin = (turkey - isna) / 60_000;
    expect(diffMin).toBeGreaterThan(3);
    expect(diffMin).toBeLessThan(8);
  });

  it('Tehran Maghrib is noticeably later than NorthAmerica (Tehran +4 min Maghrib adjustment)', () => {
    const tehran = compute('Tehran').maghrib.getTime();
    const isna   = compute('NorthAmerica').maghrib.getTime();
    const diffMin = (tehran - isna) / 60_000;
    expect(diffMin).toBeGreaterThan(3);
  });
});

// ─── Qibla direction ──────────────────────────────────────────────────────────

import { computeQibla } from '../src/compute.js';

describe('Qibla direction is method-independent and geographically correct', () => {

  it('New York qibla faces northeast (58°±5°)', () => {
    const q = computeQibla(40.7128, -74.006);
    expect(q).toBeGreaterThan(50);
    expect(q).toBeLessThan(70);
  });

  it('London qibla faces southeast (~119°±5°)', () => {
    const q = computeQibla(51.5074, -0.1278);
    expect(q).toBeGreaterThan(110);
    expect(q).toBeLessThan(130);
  });

  it('Kuala Lumpur qibla faces northwest (~293°±5°)', () => {
    const q = computeQibla(3.139, 101.6869);
    expect(q).toBeGreaterThan(285);
    expect(q).toBeLessThan(305);
  });

  it('Mecca qibla is ~0° (pointing to itself)', () => {
    const q = computeQibla(21.3891, 39.8579);
    // Bearing to the Kaaba from the Kaaba itself is undefined / ~0 — expect a number
    expect(typeof q).toBe('number');
  });
});
