import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  PRAYER_DISPLAY_NAMES,
  TRACKABLE_PRAYERS,
  type PrayerKey,
} from '@/constants/prayers';
import type { PrayerSettings, PrayerTimesData } from '@/context/PrayerContext';
import {
  Coordinates,
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

const NOTIF_SETTINGS_KEY = 'vaqit_notif_settings_v1';

export interface PrayerNotifConfig {
  enabled: boolean;
  preReminder: number; // minutes before; 0 = disabled
}

export interface NotificationSettings {
  fajr: PrayerNotifConfig;
  dhuhr: PrayerNotifConfig;
  asr: PrayerNotifConfig;
  maghrib: PrayerNotifConfig;
  isha: PrayerNotifConfig;
}

const DEFAULT: NotificationSettings = {
  fajr: { enabled: true, preReminder: 0 },
  dhuhr: { enabled: true, preReminder: 0 },
  asr: { enabled: true, preReminder: 0 },
  maghrib: { enabled: true, preReminder: 0 },
  isha: { enabled: true, preReminder: 0 },
};

// Setup notification handler (must be called at module level)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function buildParams(settings: PrayerSettings) {
  let params: ReturnType<typeof CalculationMethod.NorthAmerica>;
  switch (settings.calculationMethod) {
    case 'MuslimWorldLeague': params = CalculationMethod.MuslimWorldLeague(); break;
    case 'Egyptian': params = CalculationMethod.Egyptian(); break;
    case 'Karachi': params = CalculationMethod.Karachi(); break;
    case 'UmmAlQura': params = CalculationMethod.UmmAlQura(); break;
    case 'Turkey': params = CalculationMethod.Turkey(); break;
    case 'Tehran': params = CalculationMethod.Tehran(); break;
    default: params = CalculationMethod.NorthAmerica();
  }
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  switch (settings.highLatitudeRule) {
    case 'MiddleOfTheNight': params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight; break;
    case 'TwilightAngle': params.highLatitudeRule = HighLatitudeRule.TwilightAngle; break;
    default: params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  }
  return params;
}

function computeTimes(settings: PrayerSettings, date: Date): PrayerTimesData | null {
  try {
    const coords = new Coordinates(settings.latitude, settings.longitude);
    const params = buildParams(settings);
    const t = new PrayerTimes(coords, date, params);
    return { fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha };
  } catch { return null; }
}

interface NotifContextValue {
  notifSettings: NotificationSettings;
  updatePrayerNotif: (prayer: PrayerKey, config: Partial<PrayerNotifConfig>) => Promise<void>;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  requestPermission: () => Promise<boolean>;
  scheduleAll: (prayerSettings: PrayerSettings) => Promise<number>;
  sendTestNotification: () => Promise<void>;
  scheduledCount: number;
  refreshScheduledCount: () => Promise<void>;
}

const NotifContext = createContext<NotifContextValue>({
  notifSettings: DEFAULT,
  updatePrayerNotif: async () => {},
  permissionStatus: 'undetermined',
  requestPermission: async () => false,
  scheduleAll: async () => 0,
  sendTestNotification: async () => {},
  scheduledCount: 0,
  refreshScheduledCount: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);

  // Load settings and check permissions
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_SETTINGS_KEY).then(val => {
      if (val) {
        try { setNotifSettings(JSON.parse(val)); } catch {}
      }
    });
    if (Platform.OS !== 'web') {
      Notifications.getPermissionsAsync().then(p => {
        setPermissionStatus(p.granted ? 'granted' : p.status === 'denied' ? 'denied' : 'undetermined');
      });
    }
  }, []);

  const refreshScheduledCount = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      const all = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(all.length);
    } catch {}
  }, []);

  const updatePrayerNotif = useCallback(async (prayer: PrayerKey, config: Partial<PrayerNotifConfig>) => {
    const updated: NotificationSettings = {
      ...notifSettings,
      [prayer]: { ...notifSettings[prayer], ...config },
    };
    setNotifSettings(updated);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(updated));
  }, [notifSettings]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      const { granted } = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
      setPermissionStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch { return false; }
  }, []);

  const scheduleAll = useCallback(async (prayerSettings: PrayerSettings): Promise<number> => {
    if (Platform.OS === 'web') return 0;
    if (permissionStatus !== 'granted') return 0;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      const now = new Date();
      let count = 0;
      const MAX = 60; // safely under iOS 64-notification limit

      for (let dayOffset = 0; dayOffset < 12 && count < MAX; dayOffset++) {
        const d = new Date(now);
        d.setDate(now.getDate() + dayOffset);
        const times = computeTimes(prayerSettings, d);
        if (!times) continue;

        for (const prayer of TRACKABLE_PRAYERS) {
          if (count >= MAX) break;
          const cfg = notifSettings[prayer];
          if (!cfg.enabled) continue;

          const prayerTime = times[prayer as keyof PrayerTimesData] as Date;
          if (prayerTime <= now) continue;

          // Pre-reminder
          if (cfg.preReminder > 0 && count < MAX) {
            const reminderTime = new Date(prayerTime.getTime() - cfg.preReminder * 60 * 1000);
            if (reminderTime > now) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `${PRAYER_DISPLAY_NAMES[prayer]} in ${cfg.preReminder} min`,
                  body: 'Time to prepare for prayer',
                  sound: 'default',
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
              });
              count++;
            }
          }

          // Athan notification
          if (count < MAX) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: PRAYER_DISPLAY_NAMES[prayer] ?? prayer,
                body: 'Prayer time has begun · Allahu Akbar',
                sound: 'default',
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayerTime },
            });
            count++;
          }
        }
      }
      setScheduledCount(count);
      return count;
    } catch { return 0; }
  }, [notifSettings, permissionStatus]);

  const sendTestNotification = useCallback(async () => {
    if (Platform.OS === 'web') return;
    if (permissionStatus !== 'granted') {
      await requestPermission();
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Allahu Akbar — Test Athan',
          body: 'Your Vaqit notifications are working correctly',
          sound: 'default',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
      });
    } catch {}
  }, [permissionStatus, requestPermission]);

  return (
    <NotifContext.Provider value={{
      notifSettings,
      updatePrayerNotif,
      permissionStatus,
      requestPermission,
      scheduleAll,
      sendTestNotification,
      scheduledCount,
      refreshScheduledCount,
    }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotifContext);
}
