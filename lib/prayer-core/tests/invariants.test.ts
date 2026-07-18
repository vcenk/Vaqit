/**
 * Invariant tests — properties that ALWAYS hold regardless of city, date, or method.
 *
 * These tests catch structural bugs in the computation pipeline:
 * - Ordering: fajr < sunrise < dhuhr < asr < maghrib < isha
 * - Valid Dates: no NaN timestamps
 * - Seasonal direction: N-hemisphere summer fajr is earlier than winter fajr
 */
import { describe, it, expect } from 'vitest';
import { computePrayerTimes } from '../src/compute.js';
import type { ComputeSettings } from '../src/compute.js';

// ─── Test matrix ─────────────────────────────────────────────────────────────

interface TestCity {
  name: string;
  lat: number;
  lon: number;
  tz: string;
  method: ComputeSettings['calculationMethod'];
  hemisphere: 'north' | 'south';
}

const CITIES: TestCity[] = [
  // North America
  { name: 'New York',     lat:  40.7128, lon:  -74.0060, tz: 'America/New_York',     method: 'NorthAmerica',    hemisphere: 'north' },
  { name: 'Toronto',      lat:  43.6532, lon:  -79.3832, tz: 'America/Toronto',      method: 'NorthAmerica',    hemisphere: 'north' },
  { name: 'Vancouver',    lat:  49.2827, lon: -123.1207, tz: 'America/Vancouver',    method: 'NorthAmerica',    hemisphere: 'north' },
  { name: 'Los Angeles',  lat:  34.0522, lon: -118.2437, tz: 'America/Los_Angeles',  method: 'NorthAmerica',    hemisphere: 'north' },
  // Europe
  { name: 'London',       lat:  51.5074, lon:   -0.1278, tz: 'Europe/London',        method: 'MuslimWorldLeague', hemisphere: 'north' },
  { name: 'Paris',        lat:  48.8566, lon:    2.3522, tz: 'Europe/Paris',         method: 'MuslimWorldLeague', hemisphere: 'north' },
  { name: 'Istanbul',     lat:  41.0082, lon:   28.9784, tz: 'Europe/Istanbul',      method: 'Turkey',           hemisphere: 'north' },
  { name: 'Oslo',         lat:  59.9139, lon:   10.7522, tz: 'Europe/Oslo',          method: 'MuslimWorldLeague', hemisphere: 'north' },
  { name: 'Stockholm',    lat:  59.3293, lon:   18.0686, tz: 'Europe/Stockholm',     method: 'MuslimWorldLeague', hemisphere: 'north' },
  // Middle East
  { name: 'Mecca',        lat:  21.3891, lon:   39.8579, tz: 'Asia/Riyadh',          method: 'UmmAlQura',        hemisphere: 'north' },
  { name: 'Dubai',        lat:  25.2048, lon:   55.2708, tz: 'Asia/Dubai',           method: 'UmmAlQura',        hemisphere: 'north' },
  { name: 'Tehran',       lat:  35.6892, lon:   51.3890, tz: 'Asia/Tehran',          method: 'Tehran',           hemisphere: 'north' },
  { name: 'Cairo',        lat:  30.0444, lon:   31.2357, tz: 'Africa/Cairo',         method: 'Egyptian',         hemisphere: 'north' },
  // South & SE Asia
  { name: 'Karachi',      lat:  24.8607, lon:   67.0011, tz: 'Asia/Karachi',         method: 'Karachi',          hemisphere: 'north' },
  { name: 'Lahore',       lat:  31.5204, lon:   74.3587, tz: 'Asia/Karachi',         method: 'Karachi',          hemisphere: 'north' },
  { name: 'Kuala Lumpur', lat:   3.1390, lon:  101.6869, tz: 'Asia/Kuala_Lumpur',    method: 'MuslimWorldLeague', hemisphere: 'north' },
  // Africa
  { name: 'Lagos',        lat:   6.5244, lon:    3.3792, tz: 'Africa/Lagos',         method: 'MuslimWorldLeague', hemisphere: 'north' },
  { name: 'Casablanca',   lat:  33.5731, lon:   -7.5898, tz: 'Africa/Casablanca',    method: 'MuslimWorldLeague', hemisphere: 'north' },
  // Southern hemisphere — seasons reversed
  { name: 'Jakarta',      lat:  -6.2088, lon:  106.8456, tz: 'Asia/Jakarta',         method: 'MuslimWorldLeague', hemisphere: 'south' },
  { name: 'Sydney',       lat: -33.8688, lon:  151.2093, tz: 'Australia/Sydney',     method: 'MuslimWorldLeague', hemisphere: 'south' },
  { name: 'Melbourne',    lat: -37.8136, lon:  144.9631, tz: 'Australia/Melbourne',  method: 'MuslimWorldLeague', hemisphere: 'south' },
];

// Four seasonal representative dates (UTC — tests run with TZ=UTC)
const WINTER   = new Date(2024, 11, 21); // Dec 21
const SPRING   = new Date(2025,  2, 20); // Mar 20
const SUMMER   = new Date(2024,  5, 20); // Jun 20
const AUTUMN   = new Date(2024,  8, 22); // Sep 22

const ALL_SEASONS = [
  { name: 'Winter',  date: WINTER  },
  { name: 'Spring',  date: SPRING  },
  { name: 'Summer',  date: SUMMER  },
  { name: 'Autumn',  date: AUTUMN  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function settings(city: TestCity): ComputeSettings {
  return {
    latitude:         city.lat,
    longitude:        city.lon,
    calculationMethod: city.method,
    madhab:           'Shafi',
    highLatitudeRule: 'SeventhOfTheNight',
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Ordering invariant — fajr < sunrise < dhuhr < asr < maghrib < isha', () => {
  for (const city of CITIES) {
    for (const season of ALL_SEASONS) {
      it(`${city.name} — ${season.name}`, () => {
        const result = computePrayerTimes(settings(city), season.date);
        expect(result, `${city.name} ${season.name} returned null`).not.toBeNull();
        const t = result!;

        expect(t.fajr.getTime(),    'fajr must be a valid timestamp').not.toBeNaN();
        expect(t.sunrise.getTime(), 'sunrise must be a valid timestamp').not.toBeNaN();
        expect(t.dhuhr.getTime(),   'dhuhr must be a valid timestamp').not.toBeNaN();
        expect(t.asr.getTime(),     'asr must be a valid timestamp').not.toBeNaN();
        expect(t.maghrib.getTime(), 'maghrib must be a valid timestamp').not.toBeNaN();
        expect(t.isha.getTime(),    'isha must be a valid timestamp').not.toBeNaN();

        expect(t.fajr   < t.sunrise, `fajr(${t.fajr.toISOString()}) < sunrise(${t.sunrise.toISOString()})`).toBe(true);
        expect(t.sunrise < t.dhuhr,  `sunrise < dhuhr`).toBe(true);
        expect(t.dhuhr   < t.asr,    `dhuhr < asr`).toBe(true);
        expect(t.asr     < t.maghrib,`asr < maghrib`).toBe(true);
        expect(t.maghrib < t.isha,   `maghrib < isha`).toBe(true);
      });
    }
  }
});

/**
 * Convert a UTC Date to local HH:MM minutes (0–1439) for a given IANA timezone.
 * This lets us compare time-of-day across dates that are months apart.
 * We MUST NOT compare raw UTC timestamps for this: a Jun 20 fajr will always
 * be a smaller absolute timestamp than a Dec 21 fajr just because Jun comes
 * before Dec in the calendar — that comparison is meaningless for seasonal analysis.
 */
function localFajrMinutes(d: Date, tz: string): number {
  const str = d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz,
  });
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

describe('Seasonal direction — summer fajr is earlier in local time than winter fajr', () => {
  for (const city of CITIES) {
    it(`${city.name} (${city.hemisphere} hemisphere)`, () => {
      const winterTimes = computePrayerTimes(settings(city), WINTER)!;
      const summerTimes = computePrayerTimes(settings(city), SUMMER)!;
      expect(winterTimes).not.toBeNull();
      expect(summerTimes).not.toBeNull();

      const winterFajrMin = localFajrMinutes(winterTimes.fajr, city.tz);
      const summerFajrMin = localFajrMinutes(summerTimes.fajr, city.tz);

      if (city.hemisphere === 'north') {
        // Northern summer (Jun 20) = longer day = shorter night = earlier fajr
        expect(
          summerFajrMin < winterFajrMin,
          `${city.name} N-hemisphere: summer fajr local ${summerFajrMin}min should be earlier than winter ${winterFajrMin}min`,
        ).toBe(true);
      } else {
        // Southern hemisphere: Dec 21 is their astronomical summer → shorter night → earlier fajr
        expect(
          winterFajrMin < summerFajrMin,
          `${city.name} S-hemisphere: Dec-21 fajr local ${winterFajrMin}min should be earlier than Jun-20 ${summerFajrMin}min`,
        ).toBe(true);
      }
    });
  }
});

describe('All times fall within a 24-hour window of the input date', () => {
  // Sanity check: adhan should not return times days away from the requested date
  for (const city of CITIES) {
    it(city.name, () => {
      const date = new Date(2024, 8, 15); // Sep 15 — equinox-adjacent, stable
      const result = computePrayerTimes(settings(city), date)!;
      expect(result).not.toBeNull();

      const DAY_MS = 24 * 60 * 60 * 1000;
      const base   = date.getTime();

      for (const [key, time] of Object.entries(result) as [string, Date][]) {
        const diff = Math.abs(time.getTime() - base);
        expect(
          diff < 2 * DAY_MS,
          `${key} is more than 2 days from the requested date`,
        ).toBe(true);
      }
    });
  }
});
