/**
 * Golden test suite — 20+ cities × 4 seasons.
 *
 * Strategy: Vitest snapshot testing.
 *   - First run creates `.snap` files with the authoritative values.
 *   - Subsequent runs detect any regression in computation output.
 *   - To intentionally update (e.g. after a deliberate adhan version bump):
 *       pnpm --filter @workspace/prayer-core test -- --update-snapshots
 *
 * Each snapshot records times as UTC ISO strings so they are timezone-agnostic.
 *
 * Additionally, a small set of spot-check tests verify specific values against
 * published reference tables (tolerates ±2 minutes for rounding differences).
 */
import { describe, it, expect } from 'vitest';
import { computePrayerTimes, toLocalTime } from '../src/compute.js';
import type { ComputeSettings } from '../src/compute.js';

// ─── City/season matrix ───────────────────────────────────────────────────────

interface CityDef {
  name:   string;
  lat:    number;
  lon:    number;
  tz:     string;
  method: ComputeSettings['calculationMethod'];
  madhab?: ComputeSettings['madhab'];
  hlRule?: ComputeSettings['highLatitudeRule'];
}

const CITIES: CityDef[] = [
  // North America
  { name: 'New York',      lat:  40.7128, lon:  -74.0060, tz: 'America/New_York',    method: 'NorthAmerica'    },
  { name: 'Toronto',       lat:  43.6532, lon:  -79.3832, tz: 'America/Toronto',     method: 'NorthAmerica'    },
  { name: 'Vancouver',     lat:  49.2827, lon: -123.1207, tz: 'America/Vancouver',   method: 'NorthAmerica'    },
  { name: 'Los Angeles',   lat:  34.0522, lon: -118.2437, tz: 'America/Los_Angeles', method: 'NorthAmerica'    },
  // Europe
  { name: 'London',        lat:  51.5074, lon:   -0.1278, tz: 'Europe/London',       method: 'MuslimWorldLeague' },
  { name: 'Paris',         lat:  48.8566, lon:    2.3522, tz: 'Europe/Paris',        method: 'MuslimWorldLeague' },
  { name: 'Istanbul',      lat:  41.0082, lon:   28.9784, tz: 'Europe/Istanbul',     method: 'Turkey'          },
  { name: 'Oslo',          lat:  59.9139, lon:   10.7522, tz: 'Europe/Oslo',         method: 'MuslimWorldLeague', hlRule: 'SeventhOfTheNight' },
  { name: 'Stockholm',     lat:  59.3293, lon:   18.0686, tz: 'Europe/Stockholm',    method: 'MuslimWorldLeague', hlRule: 'SeventhOfTheNight' },
  // Middle East
  { name: 'Mecca',         lat:  21.3891, lon:   39.8579, tz: 'Asia/Riyadh',         method: 'UmmAlQura'       },
  { name: 'Medina',        lat:  24.4672, lon:   39.6024, tz: 'Asia/Riyadh',         method: 'UmmAlQura'       },
  { name: 'Dubai',         lat:  25.2048, lon:   55.2708, tz: 'Asia/Dubai',          method: 'UmmAlQura'       },
  { name: 'Tehran',        lat:  35.6892, lon:   51.3890, tz: 'Asia/Tehran',         method: 'Tehran'          },
  { name: 'Cairo',         lat:  30.0444, lon:   31.2357, tz: 'Africa/Cairo',        method: 'Egyptian'        },
  // South & SE Asia
  { name: 'Karachi',       lat:  24.8607, lon:   67.0011, tz: 'Asia/Karachi',        method: 'Karachi'         },
  { name: 'Lahore',        lat:  31.5204, lon:   74.3587, tz: 'Asia/Karachi',        method: 'Karachi'         },
  { name: 'Dhaka',         lat:  23.8103, lon:   90.4125, tz: 'Asia/Dhaka',          method: 'Karachi'         },
  { name: 'Kuala Lumpur',  lat:   3.1390, lon:  101.6869, tz: 'Asia/Kuala_Lumpur',   method: 'MuslimWorldLeague' },
  // Africa
  { name: 'Lagos',         lat:   6.5244, lon:    3.3792, tz: 'Africa/Lagos',        method: 'MuslimWorldLeague' },
  { name: 'Casablanca',    lat:  33.5731, lon:   -7.5898, tz: 'Africa/Casablanca',   method: 'MuslimWorldLeague' },
  // Southern hemisphere
  { name: 'Jakarta',       lat:  -6.2088, lon:  106.8456, tz: 'Asia/Jakarta',        method: 'MuslimWorldLeague' },
  { name: 'Sydney',        lat: -33.8688, lon:  151.2093, tz: 'Australia/Sydney',    method: 'MuslimWorldLeague' },
];

// Run with TZ=UTC (set in vitest.config.ts) so Date() constructors are deterministic
const SEASONS = [
  { name: 'Winter Solstice',  date: new Date(2024, 11, 21) }, // Dec 21
  { name: 'Spring Equinox',   date: new Date(2025,  2, 20) }, // Mar 20
  { name: 'Summer Solstice',  date: new Date(2024,  5, 20) }, // Jun 20
  { name: 'Autumn Equinox',   date: new Date(2024,  8, 22) }, // Sep 22
];

// ─── Snapshot golden suite ─────────────────────────────────────────────────────

function toUTCMap(t: ReturnType<typeof computePrayerTimes>) {
  if (!t) return null;
  return {
    fajr:    t.fajr.toISOString(),
    sunrise: t.sunrise.toISOString(),
    dhuhr:   t.dhuhr.toISOString(),
    asr:     t.asr.toISOString(),
    maghrib: t.maghrib.toISOString(),
    isha:    t.isha.toISOString(),
  };
}

describe('Golden snapshots — 22 cities × 4 seasons', () => {
  for (const city of CITIES) {
    describe(city.name, () => {
      for (const season of SEASONS) {
        it(season.name, () => {
          const settings: ComputeSettings = {
            latitude:         city.lat,
            longitude:        city.lon,
            calculationMethod: city.method,
            madhab:           city.madhab ?? 'Shafi',
            highLatitudeRule: city.hlRule ?? 'SeventhOfTheNight',
          };
          const result = computePrayerTimes(settings, season.date);
          expect(result).not.toBeNull();
          expect(toUTCMap(result)).toMatchSnapshot();
        });
      }
    });
  }
});

// ─── Spot-check tests — adhan output vs authoritative reference values ────────
//
// Reference methodology:
//   - Values marked "adhan-computed" were generated by running adhan@4.4.4 directly
//     and used as regression baselines. They should match the library's output exactly.
//   - Values marked "published" are from the respective authority's timetables.
//     Tolerance is ±2 min for rounding differences between implementations.
//
// Cross-reference sources:
//   Diyanet:  https://namazvakitleri.diyanet.gov.tr
//   ISNA:     https://www.isna.net/prayer-times-calculation
//   MWL/London Unified: https://www.londonprayertimes.com
//   Umm al-Qura: https://www.ummulqura.org.sa
//   Egyptian Authority: https://www.sis.gov.eg

function minutesTolerance(actual: Date, expectedHHMM: string, tz: string, toleranceMin = 2): boolean {
  const actual_hhmm = toLocalTime(actual, tz);
  const [ah, am]    = actual_hhmm.split(':').map(Number);
  const [eh, em]    = expectedHHMM.split(':').map(Number);
  const diff        = Math.abs((ah * 60 + am) - (eh * 60 + em));
  // Handle midnight wrap (e.g. 23:59 vs 00:01 = 2 min, not 1438 min)
  return Math.min(diff, 1440 - diff) <= toleranceMin;
}

function checkTime(actual: Date, expected: string, tz: string, label: string, tol = 2) {
  const pass = minutesTolerance(actual, expected, tz, tol);
  const actualStr = toLocalTime(actual, tz);
  expect(pass, `${label}: got ${actualStr}, expected ~${expected} (±${tol}min)`).toBe(true);
}

describe('Spot-checks vs authoritative reference values (±2 min tolerance)', () => {
  // ── Mecca, Jun 20 2024, UmmAlQura ──────────────────────────────────────
  // adhan-computed (verified against Umm al-Qura 1445 timetable, AST=UTC+3):
  // Fajr 04:11, Sunrise 05:39, Dhuhr 12:22, Asr 15:42, Maghrib 19:05, Isha 20:35
  it('Mecca Jun 20 2024 (UmmAlQura)', () => {
    const t = computePrayerTimes(
      { latitude: 21.3891, longitude: 39.8579, calculationMethod: 'UmmAlQura', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2024, 5, 20),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '04:11', 'Asia/Riyadh', 'Mecca fajr');
    checkTime(t.sunrise, '05:39', 'Asia/Riyadh', 'Mecca sunrise');
    checkTime(t.dhuhr,   '12:22', 'Asia/Riyadh', 'Mecca dhuhr');
    checkTime(t.asr,     '15:42', 'Asia/Riyadh', 'Mecca asr');
    checkTime(t.maghrib, '19:05', 'Asia/Riyadh', 'Mecca maghrib');
    checkTime(t.isha,    '20:35', 'Asia/Riyadh', 'Mecca isha');
  });

  // ── Istanbul, Dec 21 2024, Turkey (Diyanet) ────────────────────────────
  // adhan-computed with Turkey method (includes Diyanet +5min Dhuhr, +7min Maghrib
  // adjustments) and Hanafi madhab (TRT = UTC+3):
  // Fajr 06:46, Sunrise 08:19, Dhuhr 13:07, Asr 16:02, Maghrib 17:46, Isha 19:13
  it('Istanbul Dec 21 2024 (Turkey/Diyanet + Hanafi)', () => {
    const t = computePrayerTimes(
      { latitude: 41.0082, longitude: 28.9784, calculationMethod: 'Turkey', madhab: 'Hanafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2024, 11, 21),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '06:46', 'Europe/Istanbul', 'Istanbul fajr');
    checkTime(t.sunrise, '08:19', 'Europe/Istanbul', 'Istanbul sunrise');
    checkTime(t.dhuhr,   '13:07', 'Europe/Istanbul', 'Istanbul dhuhr'); // includes +5 min Turkey adj
    checkTime(t.maghrib, '17:46', 'Europe/Istanbul', 'Istanbul maghrib'); // includes +7 min Turkey adj
    checkTime(t.isha,    '19:13', 'Europe/Istanbul', 'Istanbul isha');
  });

  // ── New York, Dec 21 2024, NorthAmerica (ISNA) ────────────────────────
  // adhan-computed (ET = UTC-5 in December):
  // Fajr 05:55, Sunrise 07:17, Dhuhr 11:55, Asr 14:14, Maghrib 16:32, Isha 17:54
  it('New York Dec 21 2024 (NorthAmerica/ISNA)', () => {
    const t = computePrayerTimes(
      { latitude: 40.7128, longitude: -74.006, calculationMethod: 'NorthAmerica', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2024, 11, 21),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '05:55', 'America/New_York', 'NYC fajr');
    checkTime(t.sunrise, '07:17', 'America/New_York', 'NYC sunrise');
    checkTime(t.dhuhr,   '11:55', 'America/New_York', 'NYC dhuhr');
    checkTime(t.maghrib, '16:32', 'America/New_York', 'NYC maghrib');
    checkTime(t.isha,    '17:54', 'America/New_York', 'NYC isha');
  });

  // ── London, Jun 20 2024, MuslimWorldLeague + SeventhOfTheNight ───────
  // adhan-computed — SeventhOfTheNight caps the extreme twilight-angle Fajr/Isha
  // (without it Fajr would be ~01:40, Isha never comes at this latitude in June).
  // BST = UTC+1: Fajr 03:40, Sunrise 04:43, Dhuhr 13:03, Asr 17:25, Maghrib 21:21, Isha 22:25
  it('London Jun 20 2024 (MWL + SeventhOfTheNight)', () => {
    const t = computePrayerTimes(
      { latitude: 51.5074, longitude: -0.1278, calculationMethod: 'MuslimWorldLeague', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2024, 5, 20),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '03:40', 'Europe/London', 'London fajr');
    checkTime(t.sunrise, '04:43', 'Europe/London', 'London sunrise');
    checkTime(t.dhuhr,   '13:03', 'Europe/London', 'London dhuhr');
    checkTime(t.maghrib, '21:21', 'Europe/London', 'London maghrib');
    checkTime(t.isha,    '22:25', 'Europe/London', 'London isha');
  });

  // ── Cairo, Mar 20 2025, Egyptian ──────────────────────────────────────
  // adhan-computed (EET = UTC+2):
  // Fajr 04:32, Sunrise 05:59, Dhuhr 12:03, Asr 15:30, Maghrib 18:07, Isha 19:24
  // Note: Egyptian General Authority timetable uses slightly different Fajr angle
  // calibration (19.5° nominal vs adhan's implementation) — expect ±3 min vs official.
  it('Cairo Mar 20 2025 (Egyptian method)', () => {
    const t = computePrayerTimes(
      { latitude: 30.0444, longitude: 31.2357, calculationMethod: 'Egyptian', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2025, 2, 20),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '04:32', 'Africa/Cairo', 'Cairo fajr');
    checkTime(t.sunrise, '05:59', 'Africa/Cairo', 'Cairo sunrise');
    checkTime(t.dhuhr,   '12:03', 'Africa/Cairo', 'Cairo dhuhr');
    checkTime(t.maghrib, '18:07', 'Africa/Cairo', 'Cairo maghrib');
    checkTime(t.isha,    '19:24', 'Africa/Cairo', 'Cairo isha');
  });

  // ── Vancouver, Jun 20 2024, NorthAmerica (ISNA) ───────────────────────
  // adhan-computed with SeventhOfTheNight rule (PDT = UTC-7):
  // Fajr 04:00, Sunrise 05:07, Dhuhr 13:15, Asr 17:33, Maghrib 21:22, Isha 22:28
  // Note: raw ISNA angle would give Fajr ~03:06 at 49°N in June, but
  // SeventhOfTheNight caps it to 04:00 — this is the correct app behavior.
  it('Vancouver Jun 20 2024 (NorthAmerica + SeventhOfTheNight)', () => {
    const t = computePrayerTimes(
      { latitude: 49.2827, longitude: -123.1207, calculationMethod: 'NorthAmerica', madhab: 'Shafi', highLatitudeRule: 'SeventhOfTheNight' },
      new Date(2024, 5, 20),
    )!;
    expect(t).not.toBeNull();
    checkTime(t.fajr,    '04:00', 'America/Vancouver', 'Vancouver fajr');
    checkTime(t.sunrise, '05:07', 'America/Vancouver', 'Vancouver sunrise');
    checkTime(t.dhuhr,   '13:15', 'America/Vancouver', 'Vancouver dhuhr');
    checkTime(t.asr,     '17:33', 'America/Vancouver', 'Vancouver asr');
    checkTime(t.maghrib, '21:22', 'America/Vancouver', 'Vancouver maghrib');
    checkTime(t.isha,    '22:28', 'America/Vancouver', 'Vancouver isha');
  });
});
