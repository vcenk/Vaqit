import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDateKey, TRACKABLE_PRAYERS, type PrayerKey } from '@/constants/prayers';

export type PrayerStatus = 'ontime' | 'late' | 'missed' | 'jamaah';

export interface DayLog {
  fajr: PrayerStatus | null;
  dhuhr: PrayerStatus | null;
  asr: PrayerStatus | null;
  maghrib: PrayerStatus | null;
  isha: PrayerStatus | null;
}

const EMPTY_DAY: DayLog = { fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null };

interface TrackerContextValue {
  logs: Record<string, DayLog>;
  logPrayer: (dateKey: string, prayer: PrayerKey, status: PrayerStatus | null) => Promise<void>;
  getDay: (dateKey: string) => DayLog;
  currentStreak: number;
  longestStreak: number;
}

const TrackerContext = createContext<TrackerContextValue>({
  logs: {},
  logPrayer: async () => {},
  getDay: () => ({ ...EMPTY_DAY }),
  currentStreak: 0,
  longestStreak: 0,
});

function computeStreaks(logs: Record<string, DayLog>): { current: number; longest: number } {
  const loggedDays = Object.keys(logs)
    .filter((k) => {
      const d = logs[k];
      return d && TRACKABLE_PRAYERS.some((p) => d[p] !== null);
    })
    .sort();

  if (loggedDays.length === 0) return { current: 0, longest: 0 };

  // Longest streak (consecutive days)
  let longest = 1;
  let temp = 1;
  for (let i = 1; i < loggedDays.length; i++) {
    const prev = new Date(loggedDays[i - 1] + 'T12:00:00');
    const curr = new Date(loggedDays[i] + 'T12:00:00');
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      temp++;
      if (temp > longest) longest = temp;
    } else {
      temp = 1;
    }
  }

  // Current streak (backwards from today)
  const today = formatDateKey(new Date());
  const yesterday = formatDateKey(new Date(Date.now() - 86400000));
  let current = 0;
  const recent = [...loggedDays].reverse();
  if (recent[0] !== today && recent[0] !== yesterday) return { current: 0, longest };

  const startDate = new Date((recent[0] ?? today) + 'T12:00:00');
  for (const day of recent) {
    const expected = formatDateKey(startDate);
    if (day === expected) {
      current++;
      startDate.setDate(startDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('vaqit_tracker_v1').then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as Record<string, DayLog>;
          setLogs(parsed);
          const { current, longest } = computeStreaks(parsed);
          setCurrentStreak(current);
          setLongestStreak(longest);
        } catch {}
      }
    });
  }, []);

  const logPrayer = useCallback(
    async (dateKey: string, prayer: PrayerKey, status: PrayerStatus | null) => {
      const updated = {
        ...logs,
        [dateKey]: {
          ...(logs[dateKey] ?? { ...EMPTY_DAY }),
          [prayer]: status,
        },
      };
      setLogs(updated);
      const { current, longest } = computeStreaks(updated);
      setCurrentStreak(current);
      setLongestStreak(longest);
      await AsyncStorage.setItem('vaqit_tracker_v1', JSON.stringify(updated));
    },
    [logs]
  );

  const getDay = useCallback(
    (dateKey: string): DayLog => logs[dateKey] ?? { ...EMPTY_DAY },
    [logs]
  );

  return (
    <TrackerContext.Provider value={{ logs, logPrayer, getDay, currentStreak, longestStreak }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  return useContext(TrackerContext);
}
