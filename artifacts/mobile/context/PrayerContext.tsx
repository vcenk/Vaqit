import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setWidgetData } from '@/modules/shared-defaults';
import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
} from 'adhan';
import { PRAYER_DISPLAY_NAMES, formatDateKey } from '@/constants/prayers';

const SETTINGS_KEY = 'vaqit_settings_v1';

export interface PrayerOffsets {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
  highLatitudeRule: string;
  locationName: string;
  latitude: number;
  longitude: number;
  hijriOffset: number;       // -2 to +2 days
  offsets: PrayerOffsets;    // per-prayer minute adjustments
}

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface NextPrayerInfo {
  name: string;
  key: string;
  time: Date;
}

interface PrayerContextValue {
  settings: PrayerSettings;
  updateSettings: (partial: Partial<PrayerSettings>) => Promise<void>;
  todayTimes: PrayerTimesData | null;
  nextPrayer: NextPrayerInfo | null;
  currentPrayerKey: string | null;
  qiblaDirection: number;
  locationLoading: boolean;
  travelAlert: boolean;
  dismissTravelAlert: () => void;
  requestLocation: () => Promise<void>;
  refresh: () => void;
}

const DEFAULT_OFFSETS: PrayerOffsets = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

const DEFAULT_SETTINGS: PrayerSettings = {
  calculationMethod: 'NorthAmerica',
  madhab: 'Shafi',
  highLatitudeRule: 'SeventhOfTheNight',
  locationName: 'New York',
  latitude: 40.7128,
  longitude: -74.006,
  hijriOffset: 0,
  offsets: DEFAULT_OFFSETS,
};

function buildParams(settings: PrayerSettings) {
  let params: ReturnType<typeof CalculationMethod.NorthAmerica>;
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

function applyOffsets(times: PrayerTimesData, offsets: PrayerOffsets): PrayerTimesData {
  const ms = (min: number) => min * 60 * 1000;
  return {
    fajr:    new Date(times.fajr.getTime()    + ms(offsets.fajr)),
    sunrise: times.sunrise,
    dhuhr:   new Date(times.dhuhr.getTime()   + ms(offsets.dhuhr)),
    asr:     new Date(times.asr.getTime()     + ms(offsets.asr)),
    maghrib: new Date(times.maghrib.getTime() + ms(offsets.maghrib)),
    isha:    new Date(times.isha.getTime()    + ms(offsets.isha)),
  };
}

export function computePrayerTimes(settings: PrayerSettings, date: Date): PrayerTimesData | null {
  try {
    const coords = new Coordinates(settings.latitude, settings.longitude);
    const params = buildParams(settings);
    const t = new PrayerTimes(coords, date, params);
    const raw: PrayerTimesData = {
      fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr,
      asr: t.asr, maghrib: t.maghrib, isha: t.isha,
    };
    return applyOffsets(raw, settings.offsets ?? DEFAULT_OFFSETS);
  } catch { return null; }
}

function getNextPrayer(times: PrayerTimesData, settings: PrayerSettings): NextPrayerInfo | null {
  const now = new Date();
  const ordered = [
    { key: 'fajr', time: times.fajr },
    { key: 'dhuhr', time: times.dhuhr },
    { key: 'asr', time: times.asr },
    { key: 'maghrib', time: times.maghrib },
    { key: 'isha', time: times.isha },
  ];
  for (const p of ordered) {
    if (p.time > now) return { key: p.key, name: PRAYER_DISPLAY_NAMES[p.key] ?? p.key, time: p.time };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tTimes = computePrayerTimes(settings, tomorrow);
  if (tTimes) return { key: 'fajr', name: 'Fajr', time: tTimes.fajr };
  return null;
}

function getCurrentPrayerKey(times: PrayerTimesData): string | null {
  const now = new Date();
  if (now >= times.isha)    return 'isha';
  if (now >= times.maghrib) return 'maghrib';
  if (now >= times.asr)     return 'asr';
  if (now >= times.dhuhr)   return 'dhuhr';
  if (now >= times.sunrise) return null;
  if (now >= times.fajr)    return 'fajr';
  return null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const d = (x: number) => (x * Math.PI) / 180;
  const dLat = d(lat2 - lat1);
  const dLon = d(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(d(lat1)) * Math.cos(d(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PrayerContext = createContext<PrayerContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  todayTimes: null,
  nextPrayer: null,
  currentPrayerKey: null,
  qiblaDirection: 0,
  locationLoading: false,
  travelAlert: false,
  dismissTravelAlert: () => {},
  requestLocation: async () => {},
  refresh: () => {},
});

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [todayTimes, setTodayTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [currentPrayerKey, setCurrentPrayerKey] = useState<string | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [travelAlert, setTravelAlert] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load settings
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(val => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as PrayerSettings;
          // Migrate: add fields missing from older saved versions
          if (!parsed.offsets) parsed.offsets = DEFAULT_OFFSETS;
          if (parsed.hijriOffset === undefined) parsed.hijriOffset = 0;
          setSettings(parsed);
        } catch {}
      }
    });
  }, []);

  // Recompute times
  useEffect(() => {
    const compute = () => {
      const times = computePrayerTimes(settings, new Date());
      if (times) {
        setTodayTimes(times);
        setNextPrayer(getNextPrayer(times, settings));
        setCurrentPrayerKey(getCurrentPrayerKey(times));

        // Write to the iOS App Group shared container so the WidgetKit
        // extension can display real prayer times without launching the app.
        // No-ops on Android, web, and in Expo Go.
        if (Platform.OS === 'ios') {
          const now = new Date();
          const pad = (n: number) => String(n).padStart(2, '0');
          const dateKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
          setWidgetData({
            fajr:         times.fajr.toISOString(),
            sunrise:      times.sunrise.toISOString(),
            dhuhr:        times.dhuhr.toISOString(),
            asr:          times.asr.toISOString(),
            maghrib:      times.maghrib.toISOString(),
            isha:         times.isha.toISOString(),
            locationName: settings.locationName,
            date:         dateKey,
          });
        }
      }
      try {
        const coords = new Coordinates(settings.latitude, settings.longitude);
        setQiblaDirection(Qibla(coords));
      } catch {}
    };
    compute();
    const id = setInterval(compute, 30_000);
    return () => clearInterval(id);
  }, [settings, refreshKey]);

  // Travel mode: detect when app foregrounds and user is far from saved location
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', async state => {
      if (state !== 'active') return;
      try {
        const Location = await import('expo-location');
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const dist = haversineKm(
          settings.latitude, settings.longitude,
          loc.coords.latitude, loc.coords.longitude
        );
        if (dist > 50) setTravelAlert(true);
      } catch {}
    });
    return () => sub.remove();
  }, [settings.latitude, settings.longitude]);

  const updateSettings = useCallback(async (partial: Partial<PrayerSettings>) => {
    const updated = {
      ...settings,
      ...partial,
      offsets: { ...settings.offsets, ...(partial.offsets ?? {}) },
    };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'web') {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(async pos => {
            await updateSettings({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              locationName: 'Current Location',
            });
            setTravelAlert(false);
            resolve();
          }, reject, { timeout: 10000 });
        });
      } else {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [place] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const cityName = place?.city ?? place?.subregion ?? place?.region ?? 'Current Location';
        await updateSettings({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, locationName: cityName });
        setTravelAlert(false);
      }
    } catch {}
    finally { setLocationLoading(false); }
  }, [updateSettings]);

  const dismissTravelAlert = useCallback(() => setTravelAlert(false), []);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <PrayerContext.Provider value={{
      settings, updateSettings, todayTimes, nextPrayer, currentPrayerKey,
      qiblaDirection, locationLoading, travelAlert, dismissTravelAlert,
      requestLocation, refresh,
    }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  return useContext(PrayerContext);
}
