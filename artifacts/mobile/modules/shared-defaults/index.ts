import { Platform } from 'react-native';

// Loaded lazily so Expo Go / web don't crash when the native module is absent.
let _module: { setWidgetData: (json: string) => void } | null = null;

function getModule() {
  if (_module) return _module;
  if (Platform.OS !== 'ios') return null;
  try {
    // requireOptionalNativeModule returns null instead of throwing when the
    // module is not registered (e.g. Expo Go, simulator without EAS build).
    const { requireOptionalNativeModule } = require('expo-modules-core');
    _module = requireOptionalNativeModule('SharedDefaults');
  } catch {
    // silently ignore — unavailable in Expo Go
  }
  return _module;
}

export interface WidgetPrayerData {
  fajr: string;    // ISO date strings (UTC)
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  locationName: string;
  date: string;    // YYYY-MM-DD local date (for staleness checks in widget)
}

/**
 * Serialises today's prayer times to the shared App Group UserDefaults so
 * the iOS WidgetKit extension can display real data without launching the app.
 *
 * Silently no-ops in Expo Go, on Android, and on web.
 */
export function setWidgetData(data: WidgetPrayerData): void {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.setWidgetData(JSON.stringify(data));
  } catch {
    // never crash the main app because of widget bookkeeping
  }
}
