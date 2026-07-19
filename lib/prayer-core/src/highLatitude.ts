/**
 * High-latitude twilight analysis — the "verification" differentiator.
 *
 * At high latitudes in summer the sun may never descend far enough below the
 * horizon to reach the twilight angle a method requires for Fajr/Isha. When
 * that happens the true twilight event does not occur, so the time cannot be
 * calculated astronomically — a fallback ("high-latitude") rule must invent it.
 *
 * Almost every prayer app does this silently, producing a confident-looking
 * time that is actually an estimate. This module DETECTS the condition so the
 * UI can label the time as approximated and name the rule that produced it —
 * "the number and the receipt."
 *
 * Detection uses the sun's maximum depression below the horizon at solar
 * midnight (its lowest point) for the date and latitude:
 *
 *   altitude_at_lower_culmination = arcsin( -cos(latitude + declination) )
 *   maxDepression                 = arcsin(  cos(latitude + declination) )
 *
 * If maxDepression < the method's Fajr/Isha angle, the true twilight never
 * happens on that day and the displayed time is an approximation.
 *
 * NOTE: keep in sync with artifacts/mobile/lib/highLatitude.ts (mobile mirror).
 */

const DEG = Math.PI / 180;

export interface TwilightAnalysis {
  /** Sun's maximum depression below the horizon at solar midnight, in degrees. */
  maxDepression: number;
  /** True when the Fajr twilight angle is never reached (time is approximated). */
  fajrApproximated: boolean;
  /** True when the Isha twilight angle is never reached (time is approximated). */
  ishaApproximated: boolean;
}

/**
 * Approximate solar declination (degrees) for a date, via Cooper's equation.
 * Accurate to well within a degree — more than enough for a yes/no test of
 * whether a twilight angle is ever reached.
 */
export function solarDeclination(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return 23.45 * Math.sin(DEG * ((360 / 365) * (284 + dayOfYear)));
}

/**
 * Maximum depression (degrees) the sun reaches below the horizon at its lowest
 * point (solar midnight) for the given latitude and date.
 *
 * - Positive → the sun goes this many degrees below the horizon at midnight.
 * - Zero or negative → the sun grazes or never sets (polar day / midnight sun);
 *   no twilight event of any depth occurs.
 */
export function maxSolarDepression(latitude: number, date: Date): number {
  const decl = solarDeclination(date);
  const c = Math.cos((latitude + decl) * DEG);
  const clamped = Math.max(-1, Math.min(1, c));
  return Math.asin(clamped) / DEG;
}

/**
 * Determine whether Fajr and/or Isha are astronomically undefined (and thus
 * approximated by a high-latitude rule) for the given location, date, and
 * method angles.
 *
 * @param ishaInterval - minutes after Maghrib for interval-based methods
 *   (e.g. Umm al-Qura). When > 0, Isha is a fixed interval and never depends on
 *   a twilight angle, so it is never "approximated" by this measure.
 */
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
