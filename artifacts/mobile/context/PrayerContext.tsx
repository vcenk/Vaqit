import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
  Qibla,
} from 'adhan';
import { PRAYER_DISPLAY_NAMES, formatDateKey } from '@/constants/prayers';

const SETTINGS_KEY = 'vakit_settings_v1';

export interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
  highLatitudeRule: string;
  locationName: string;
  latitude: number;
  longitude: number;
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
  requestLocation: () => Promise<void>;
  refresh: () => void;
}

const DEFAULT_SETTINGS: PrayerSettings = {
  calculationMethod: 'NorthAmerica',
  madhab: 'Shafi',
  highLatitudeRule: 'SeventhOfTheNight',
  locationName: 'New York',
  latitude: 40.7128,
  longitude: -74.006,
};

function buildParams(settings: PrayerSettings) {
  let params;
  switch (settings.calculationMethod) {
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    case 'Tehran':
      params = CalculationMethod.Tehran();
      break;
    default:
      params = CalculationMethod.NorthAmerica();
  }
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  switch (settings.highLatitudeRule) {
    case 'MiddleOfTheNight':
      params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
      break;
    case 'TwilightAngle':
      params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
      break;
    default:
      params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  }
  return params;
}

function computePrayerTimes(settings: PrayerSettings, date: Date): PrayerTimesData | null {
  try {
    const coords = new Coordinates(settings.latitude, settings.longitude);
    const params = buildParams(settings);
    const times = new PrayerTimes(coords, date, params);
    return {
      fajr: times.fajr,
      sunrise: times.sunrise,
      dhuhr: times.dhuhr,
      asr: times.asr,
      maghrib: times.maghrib,
      isha: times.isha,
    };
  } catch {
    return null;
  }
}

function getNextPrayer(times: PrayerTimesData, settings: PrayerSettings): NextPrayerInfo | null {
  const now = new Date();
  const ordered: Array<{ key: string; time: Date }> = [
    { key: 'fajr', time: times.fajr },
    { key: 'dhuhr', time: times.dhuhr },
    { key: 'asr', time: times.asr },
    { key: 'maghrib', time: times.maghrib },
    { key: 'isha', time: times.isha },
  ];
  for (const p of ordered) {
    if (p.time > now) {
      return { key: p.key, name: PRAYER_DISPLAY_NAMES[p.key] ?? p.key, time: p.time };
    }
  }
  // All done — next Fajr tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowTimes = computePrayerTimes(settings, tomorrow);
  if (tomorrowTimes) {
    return { key: 'fajr', name: 'Fajr', time: tomorrowTimes.fajr };
  }
  return null;
}

function getCurrentPrayerKey(times: PrayerTimesData): string | null {
  const now = new Date();
  if (now >= times.isha) return 'isha';
  if (now >= times.maghrib) return 'maghrib';
  if (now >= times.asr) return 'asr';
  if (now >= times.dhuhr) return 'dhuhr';
  if (now >= times.sunrise) return null; // Between sunrise and dhuhr, no active prayer
  if (now >= times.fajr) return 'fajr';
  return null;
}

const PrayerContext = createContext<PrayerContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  todayTimes: null,
  nextPrayer: null,
  currentPrayerKey: null,
  qiblaDirection: 0,
  locationLoading: false,
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Load settings from storage
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as PrayerSettings;
          setSettings(parsed);
        } catch {}
      }
    });
  }, []);

  // Recompute times whenever settings or date changes
  useEffect(() => {
    const compute = () => {
      const times = computePrayerTimes(settings, new Date());
      if (times) {
        setTodayTimes(times);
        setNextPrayer(getNextPrayer(times, settings));
        setCurrentPrayerKey(getCurrentPrayerKey(times));
      }
      try {
        const coords = new Coordinates(settings.latitude, settings.longitude);
        setQiblaDirection(Qibla(coords));
      } catch {}
    };
    compute();
    const interval = setInterval(compute, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [settings, refreshKey]);

  const updateSettings = useCallback(async (partial: Partial<PrayerSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'web') {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await updateSettings({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                locationName: 'Current Location',
              });
              resolve();
            },
            reject,
            { timeout: 10000 }
          );
        });
      } else {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const cityName = place?.city ?? place?.subregion ?? place?.region ?? 'Current Location';
        await updateSettings({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          locationName: cityName,
        });
      }
    } catch {
      // silently fail
    } finally {
      setLocationLoading(false);
    }
  }, [updateSettings]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <PrayerContext.Provider
      value={{
        settings,
        updateSettings,
        todayTimes,
        nextPrayer,
        currentPrayerKey,
        qiblaDirection,
        locationLoading,
        requestLocation,
        refresh,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  return useContext(PrayerContext);
}
