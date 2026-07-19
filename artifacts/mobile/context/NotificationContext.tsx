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
import {
  computeAssurance,
  computeRisks,
  buildDiagnosticText,
  reliabilityStats,
  type LedgerEntry,
  type FiredEntry,
  type RiskFlag,
  type AssuranceStatus,
} from '@/lib/notificationAssurance';

const NOTIF_SETTINGS_KEY = 'vaqit_notif_settings_v1';
const LEDGER_KEY = 'vaqit_notif_ledger_v1';
const FIRED_KEY = 'vaqit_notif_fired_v1';
const MAX_FIRED_LOG = 100;

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
      shouldShowBanner: true,
      shouldShowList: true,
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
  // ── Assurance ──
  ledger: LedgerEntry[];
  fired: FiredEntry[];
  nextScheduled: { key: string; time: string } | null;
  assurance: AssuranceStatus;
  risks: RiskFlag[];
  reliability: { expected: number; confirmed: number };
  buildDiagnostic: (prayerSettings: PrayerSettings, appVersion: string) => string;
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
  ledger: [],
  fired: [],
  nextScheduled: null,
  assurance: { level: 'warn', headline: 'Action required', detail: 'Not set up yet' },
  risks: [],
  reliability: { expected: 0, confirmed: 0 },
  buildDiagnostic: () => '',
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [fired, setFired] = useState<FiredEntry[]>([]);
  const [channelImportance, setChannelImportance] = useState<number | null>(null);
  const [channelSoundDisabled, setChannelSoundDisabled] = useState(false);

  // Load settings, check permissions, and create Android notification channels
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
    // Android API 26+ requires sounds to be declared at the channel level.
    // Create three channels: full Fajr athan, standard athan, and quiet pre-reminder.
    if (Platform.OS === 'android') {
      Promise.all([
        Notifications.setNotificationChannelAsync('athan_fajr', {
          name: 'Fajr Athan',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'athan_fajr.wav',
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        }),
        Notifications.setNotificationChannelAsync('athan', {
          name: 'Athan',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'athan.wav',
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        }),
        Notifications.setNotificationChannelAsync('reminder', {
          name: 'Prayer Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
          vibrationPattern: [0, 250],
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        }),
      ]).catch(() => {});
    }
  }, []);

  // Load ledger + fired log; subscribe to received notifications; read channel health.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    AsyncStorage.getItem(LEDGER_KEY).then(v => { if (v) { try { setLedger(JSON.parse(v)); } catch {} } });
    AsyncStorage.getItem(FIRED_KEY).then(v => { if (v) { try { setFired(JSON.parse(v)); } catch {} } });

    const sub = Notifications.addNotificationReceivedListener(n => {
      const title = n.request?.content?.title ?? 'Notification';
      const entry: FiredEntry = { firedAt: new Date().toISOString(), title };
      setFired(prev => {
        const next = [entry, ...prev].slice(0, MAX_FIRED_LOG);
        AsyncStorage.setItem(FIRED_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    });

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelAsync('athan_fajr').then(ch => {
        if (ch) {
          setChannelImportance(ch.importance ?? null);
          // We declare the channel with an athan sound; null means the user cleared it.
          setChannelSoundDisabled(ch.sound == null);
        }
      }).catch(() => {});
    }

    return () => sub.remove();
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
      const newLedger: LedgerEntry[] = [];

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

          // Pre-reminder — uses the quiet 'reminder' channel on Android (sound is channel-level on API 26+)
          if (cfg.preReminder > 0 && count < MAX) {
            const reminderTime = new Date(prayerTime.getTime() - cfg.preReminder * 60 * 1000);
            if (reminderTime > now) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: `${PRAYER_DISPLAY_NAMES[prayer]} in ${cfg.preReminder} min`,
                  body: 'Time to prepare for prayer',
                  sound: 'default',
                  // channelId is read by expo-notifications on Android to route to the right channel
                  ...(Platform.OS === 'android' ? { channelId: 'reminder' } : {}),
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
              });
              newLedger.push({ key: prayer, time: reminderTime.toISOString(), kind: 'reminder' });
              count++;
            }
          }

          // Athan notification — Fajr gets the full athan file; all others get the shorter clip.
          // On Android (API 26+) the sound is set at the channel level; channelId routes the
          // notification to the correct channel so the right WAV file plays.
          if (count < MAX) {
            const isFajr = prayer === 'fajr';
            const athanSound = isFajr ? 'athan_fajr.wav' : 'athan.wav';
            const athanChannelId = isFajr ? 'athan_fajr' : 'athan';
            await Notifications.scheduleNotificationAsync({
              content: {
                title: PRAYER_DISPLAY_NAMES[prayer] ?? prayer,
                body: 'Prayer time has begun · Allahu Akbar',
                sound: athanSound,
                ...(Platform.OS === 'android' ? { channelId: athanChannelId } : {}),
              },
              trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayerTime },
            });
            newLedger.push({ key: prayer, time: prayerTime.toISOString(), kind: 'athan' });
            count++;
          }
        }
      }
      setScheduledCount(count);
      setLedger(newLedger);
      await AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(newLedger));
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
          sound: 'athan.wav',
          ...(Platform.OS === 'android' ? { channelId: 'athan' } : {}),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
      });
    } catch {}
  }, [permissionStatus, requestPermission]);

  const nextScheduled = React.useMemo(() => {
    const nowMs = Date.now();
    const upcoming = ledger
      .filter(e => e.kind === 'athan' && new Date(e.time).getTime() > nowMs)
      .sort((a, b) => a.time.localeCompare(b.time));
    return upcoming[0] ? { key: upcoming[0].key, time: upcoming[0].time } : null;
  }, [ledger]);

  const assuranceInputs = {
    permission: permissionStatus,
    scheduledCount,
    nextScheduled,
    channelImportance,
    channelSoundDisabled,
  };

  const assurance = React.useMemo(
    () => computeAssurance(assuranceInputs),
    [permissionStatus, scheduledCount, nextScheduled, channelImportance, channelSoundDisabled],
  );
  const risks = React.useMemo(
    () => computeRisks(assuranceInputs),
    [permissionStatus, scheduledCount, nextScheduled, channelImportance, channelSoundDisabled],
  );
  const reliability = React.useMemo(() => reliabilityStats(ledger, fired), [ledger, fired]);

  const buildDiagnostic = useCallback(
    (prayerSettings: PrayerSettings, appVersion: string): string =>
      buildDiagnosticText({
        permission: permissionStatus,
        scheduledCount,
        nextScheduled,
        channelImportance,
        channelSoundDisabled,
        ledger,
        fired,
        appVersion,
        settingsSummary: {
          location: prayerSettings.locationName,
          method: prayerSettings.calculationMethod,
          madhab: prayerSettings.madhab,
          highLatitudeRule: prayerSettings.highLatitudeRule,
          latitude: prayerSettings.latitude.toFixed(3),
          longitude: prayerSettings.longitude.toFixed(3),
        },
      }),
    [permissionStatus, scheduledCount, nextScheduled, channelImportance, channelSoundDisabled, ledger, fired],
  );

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
      ledger,
      fired,
      nextScheduled,
      assurance,
      risks,
      reliability,
      buildDiagnostic,
    }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotifContext);
}
