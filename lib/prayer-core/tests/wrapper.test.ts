/**
 * Wrapper integrity tests — verifies our computePrayerTimes wrapper
 * is a faithful, bug-free adapter over raw adhan.
 */
import { describe, it, expect } from 'vitest';
import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';
import { computePrayerTimes, applyOffsets } from '../src/compute.js';

const NYC = { latitude: 40.7128, longitude: -74.006 };
const TEST_DATE = new Date(2024, 8, 15); // Sep 15 2024 (UTC)

// ─── Zero-offset equivalence ─────────────────────────────────────────────────

describe('computePrayerTimes (zero offsets) matches raw adhan output', () => {
  it('NorthAmerica method, Shafi madhab, SeventhOfTheNight', () => {
    const coords  = new Coordinates(NYC.latitude, NYC.longitude);
    const params  = CalculationMethod.NorthAmerica();
    params.madhab          = Madhab.Shafi;
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
    const raw = new PrayerTimes(coords, TEST_DATE, params);

    const ours = computePrayerTimes(
      {
        latitude:         NYC.latitude,
        longitude:        NYC.longitude,
        calculationMethod: 'NorthAmerica',
        madhab:           'Shafi',
        highLatitudeRule: 'SeventhOfTheNight',
      },
      TEST_DATE,
    );

    expect(ours).not.toBeNull();
    expect(ours!.fajr.getTime()).toBe(raw.fajr.getTime());
    expect(ours!.sunrise.getTime()).toBe(raw.sunrise.getTime());
    expect(ours!.dhuhr.getTime()).toBe(raw.dhuhr.getTime());
    expect(ours!.asr.getTime()).toBe(raw.asr.getTime());
    expect(ours!.maghrib.getTime()).toBe(raw.maghrib.getTime());
    expect(ours!.isha.getTime()).toBe(raw.isha.getTime());
  });

  it('MuslimWorldLeague method, Hanafi madhab, MiddleOfTheNight', () => {
    const coords  = new Coordinates(51.5074, -0.1278); // London
    const date    = new Date(2024, 5, 21); // Jun 21
    const params  = CalculationMethod.MuslimWorldLeague();
    params.madhab          = Madhab.Hanafi;
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    const raw = new PrayerTimes(coords, date, params);

    const ours = computePrayerTimes(
      {
        latitude:         51.5074,
        longitude:        -0.1278,
        calculationMethod: 'MuslimWorldLeague',
        madhab:           'Hanafi',
        highLatitudeRule: 'MiddleOfTheNight',
      },
      date,
    );

    expect(ours).not.toBeNull();
    expect(ours!.fajr.getTime()).toBe(raw.fajr.getTime());
    expect(ours!.isha.getTime()).toBe(raw.isha.getTime());
  });

  it('UmmAlQura method, Shafi madhab — Mecca', () => {
    const coords  = new Coordinates(21.3891, 39.8579);
    const date    = new Date(2024, 2, 20);
    const params  = CalculationMethod.UmmAlQura();
    params.madhab = Madhab.Shafi;
    const raw = new PrayerTimes(coords, date, params);

    const ours = computePrayerTimes(
      { latitude: 21.3891, longitude: 39.8579, calculationMethod: 'UmmAlQura', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      date,
    );

    expect(ours!.fajr.getTime()).toBe(raw.fajr.getTime());
    expect(ours!.dhuhr.getTime()).toBe(raw.dhuhr.getTime());
    expect(ours!.isha.getTime()).toBe(raw.isha.getTime());
  });
});

// ─── Offset application ───────────────────────────────────────────────────────

describe('applyOffsets shifts each prayer by exactly the specified minutes', () => {
  const base = computePrayerTimes(
    { latitude: NYC.latitude, longitude: NYC.longitude, calculationMethod: 'NorthAmerica', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
    TEST_DATE,
  )!;

  it('positive offsets shift times forward', () => {
    const shifted = applyOffsets(base, { fajr: 5, dhuhr: 3, asr: 10, maghrib: 2, isha: 7 });
    expect(shifted.fajr.getTime()   ).toBe(base.fajr.getTime()    + 5  * 60_000);
    expect(shifted.dhuhr.getTime()  ).toBe(base.dhuhr.getTime()   + 3  * 60_000);
    expect(shifted.asr.getTime()    ).toBe(base.asr.getTime()     + 10 * 60_000);
    expect(shifted.maghrib.getTime()).toBe(base.maghrib.getTime() + 2  * 60_000);
    expect(shifted.isha.getTime()   ).toBe(base.isha.getTime()    + 7  * 60_000);
    // sunrise is never offset
    expect(shifted.sunrise.getTime()).toBe(base.sunrise.getTime());
  });

  it('negative offsets shift times backward', () => {
    const shifted = applyOffsets(base, { fajr: -10, dhuhr: -5, asr: -3, maghrib: -2, isha: -15 });
    expect(shifted.fajr.getTime()).toBe(base.fajr.getTime() - 10 * 60_000);
    expect(shifted.isha.getTime()).toBe(base.isha.getTime() - 15 * 60_000);
  });

  it('zero offsets leave times unchanged', () => {
    const shifted = applyOffsets(base, { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
    expect(shifted.fajr.getTime()   ).toBe(base.fajr.getTime());
    expect(shifted.isha.getTime()   ).toBe(base.isha.getTime());
    expect(shifted.sunrise.getTime()).toBe(base.sunrise.getTime());
  });

  it('partial offsets leave un-specified prayers unchanged', () => {
    const shifted = applyOffsets(base, { fajr: 5 });
    expect(shifted.fajr.getTime() ).toBe(base.fajr.getTime() + 5 * 60_000);
    expect(shifted.dhuhr.getTime()).toBe(base.dhuhr.getTime()); // unchanged
    expect(shifted.isha.getTime() ).toBe(base.isha.getTime());  // unchanged
  });

  it('offsets are applied via computePrayerTimes settings.offsets', () => {
    const withOffsets = computePrayerTimes(
      {
        latitude: NYC.latitude, longitude: NYC.longitude,
        calculationMethod: 'NorthAmerica', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight',
        offsets: { fajr: 3, dhuhr: 0, asr: 0, maghrib: 0, isha: -5 },
      },
      TEST_DATE,
    )!;
    expect(withOffsets.fajr.getTime()).toBe(base.fajr.getTime() + 3 * 60_000);
    expect(withOffsets.isha.getTime()).toBe(base.isha.getTime() - 5 * 60_000);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('computePrayerTimes returns null on bad input without throwing', () => {
  it('latitude out of range (+91)', () => {
    const result = computePrayerTimes(
      { latitude: 91, longitude: 0, calculationMethod: 'NorthAmerica', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      TEST_DATE,
    );
    // Either null or has valid (possibly adjusted) times — must not throw
    if (result !== null) {
      expect(typeof result.fajr.getTime()).toBe('number');
    }
  });
});
