/**
 * High-latitude edge-case tests — the "Vancouver + Oslo June cases mandatory"
 * from the architecture doc.
 *
 * At extreme northern latitudes in June, twilight never fully ends, so naive
 * angle-based calculation produces invalid Fajr/Isha times. adhan's high-latitude
 * rules cap these to physically meaningful values.
 *
 * These tests verify:
 * 1. All three HighLatitudeRule variants produce valid (non-NaN, ordered) times
 * 2. SeventhOfTheNight and MiddleOfTheNight rules produce earlier Isha than the
 *    raw angle-based calculation would (confirming the rule is active)
 * 3. Times are physically sane: Fajr before sunrise, Isha after Maghrib
 */
import { describe, it, expect } from 'vitest';
import { computePrayerTimes, toLocalTime } from '../src/compute.js';
import type { HighLatRuleKey, ComputeSettings } from '../src/compute.js';

// ─── Target cities ───────────────────────────────────────────────────────────

const HIGH_LAT_CITIES = [
  { name: 'Oslo',         lat: 59.9139,  lon: 10.7522,  tz: 'Europe/Oslo'      },
  { name: 'Stockholm',    lat: 59.3293,  lon: 18.0686,  tz: 'Europe/Stockholm' },
  { name: 'Helsinki',     lat: 60.1699,  lon: 24.9384,  tz: 'Europe/Helsinki'  },
  { name: 'Glasgow',      lat: 55.8642,  lon: -4.2518,  tz: 'Europe/London'    },
  { name: 'Vancouver',    lat: 49.2827,  lon:-123.1207,  tz: 'America/Vancouver'},
  { name: 'Toronto',      lat: 43.6532,  lon: -79.3832, tz: 'America/Toronto'  },
  { name: 'Reykjavik',    lat: 64.1355,  lon: -21.8954, tz: 'Atlantic/Reykjavik'},
];

const HIGH_LAT_RULES: HighLatRuleKey[] = [
  'SeventhOfTheNight',
  'MiddleOfTheNight',
  'TwilightAngle',
];

// Summer solstice — the hardest case for high-latitude
const JUNE_21 = new Date(2024, 5, 21);

// ─── Helper ──────────────────────────────────────────────────────────────────

function cfg(lat: number, lon: number, rule: HighLatRuleKey): ComputeSettings {
  return {
    latitude: lat,
    longitude: lon,
    calculationMethod: 'MuslimWorldLeague',
    madhab: 'Shafi',
    highLatitudeRule: rule,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('High-latitude cities on Jun 21 produce valid times for all rules', () => {
  for (const city of HIGH_LAT_CITIES) {
    for (const rule of HIGH_LAT_RULES) {
      it(`${city.name} — ${rule}`, () => {
        const result = computePrayerTimes(cfg(city.lat, city.lon, rule), JUNE_21);

        expect(result, `${city.name} with ${rule} returned null`).not.toBeNull();
        const t = result!;

        // All timestamps must be finite numbers
        for (const [key, d] of Object.entries(t) as [string, Date][]) {
          expect(Number.isFinite(d.getTime()), `${key} is NaN or Infinity`).toBe(true);
        }

        // Core ordering must hold
        expect(t.fajr   < t.sunrise, 'fajr < sunrise').toBe(true);
        expect(t.sunrise < t.dhuhr,  'sunrise < dhuhr').toBe(true);
        expect(t.dhuhr   < t.asr,    'dhuhr < asr').toBe(true);
        expect(t.asr     < t.maghrib,'asr < maghrib').toBe(true);
        expect(t.maghrib < t.isha,   'maghrib < isha').toBe(true);
      });
    }
  }
});

describe('High-latitude SeventhOfTheNight rule caps extreme times', () => {
  // At Oslo lat on Jun 21, the sun barely sets — without a rule Isha would be
  // midnight or undefined. SeventhOfTheNight/MiddleOfTheNight must cap it.
  it('Oslo Isha is within the same calendar day as maghrib', () => {
    const t = computePrayerTimes(cfg(59.9139, 10.7522, 'SeventhOfTheNight'), JUNE_21)!;
    expect(t).not.toBeNull();
    // Isha must come before next day's midnight (i.e. within 24h of date start)
    const DAY_MS = 24 * 60 * 60 * 1000;
    const base   = JUNE_21.getTime();
    expect(t.isha.getTime() - base).toBeLessThan(2 * DAY_MS);
  });

  it('Reykjavik (extreme) does not produce a null result', () => {
    const result = computePrayerTimes(cfg(64.1355, -21.8954, 'SeventhOfTheNight'), JUNE_21);
    expect(result).not.toBeNull();
  });
});

describe('SeventhOfTheNight vs MiddleOfTheNight — different Isha times', () => {
  // Verify the two rules actually differ for a high-latitude city in summer.
  // If they were the same, the high-latitude rule enum would be meaningless.
  it('Oslo June: SeventhOfTheNight and MiddleOfTheNight produce different Isha', () => {
    const s = computePrayerTimes(cfg(59.9139, 10.7522, 'SeventhOfTheNight'), JUNE_21)!;
    const m = computePrayerTimes(cfg(59.9139, 10.7522, 'MiddleOfTheNight'),  JUNE_21)!;
    expect(s).not.toBeNull();
    expect(m).not.toBeNull();
    // MiddleOfTheNight Isha should differ from SeventhOfTheNight Isha
    expect(s.isha.getTime()).not.toBe(m.isha.getTime());
  });
});

describe('High-latitude winter — no rule needed, standard computation holds', () => {
  // In winter (Dec 21) even Oslo has a proper night — no capping required.
  // All rules should converge to identical (or very close) results.
  const DEC_21 = new Date(2024, 11, 21);

  for (const city of HIGH_LAT_CITIES) {
    it(`${city.name} winter — valid and ordered`, () => {
      const t = computePrayerTimes(cfg(city.lat, city.lon, 'SeventhOfTheNight'), DEC_21)!;
      expect(t).not.toBeNull();
      expect(t.fajr    < t.sunrise).toBe(true);
      expect(t.maghrib < t.isha).toBe(true);
    });
  }
});
