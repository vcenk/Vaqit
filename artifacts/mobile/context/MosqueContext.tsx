import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerKey } from '@/constants/prayers';

const MOSQUE_KEY = 'vaqit_mosque_v2';
const MOSQUE_KEY_LEGACY = 'vaqit_mosque_v1';

export interface MosqueIqamahOffsets {
  fajr: number;    // minutes after adhan
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

/** Per-prayer mosque adhan START times as "HH:MM" strings (empty = not set). */
export type MosqueStartTimes = Partial<Record<PrayerKey, string>>;

/** Where the mosque timetable came from — drives the provenance label (P14). */
export type MosqueSourceType = 'personal' | 'community' | 'timetable';

export interface MosqueSettings {
  enabled: boolean;
  mosqueName: string;
  offsets: MosqueIqamahOffsets;
  /** Mosque's published start times, when the user has entered them. */
  startTimes: MosqueStartTimes;
  sourceType: MosqueSourceType;
  /** ISO date string, auto-stamped whenever start times are edited. */
  lastUpdated: string | null;
}

const DEFAULT_OFFSETS: MosqueIqamahOffsets = {
  fajr: 20, dhuhr: 15, asr: 15, maghrib: 5, isha: 15,
};

const DEFAULT: MosqueSettings = {
  enabled: false,
  mosqueName: '',
  offsets: DEFAULT_OFFSETS,
  startTimes: {},
  sourceType: 'personal',
  lastUpdated: null,
};

export const SOURCE_TYPE_LABELS: Record<MosqueSourceType, string> = {
  timetable: 'Mosque timetable',
  community: 'Community-entered',
  personal: 'Personal estimate',
};

interface MosqueContextValue {
  mosque: MosqueSettings;
  updateMosque: (partial: Partial<MosqueSettings>) => Promise<void>;
  updateOffset: (prayer: PrayerKey, minutes: number) => Promise<void>;
  /** Set a mosque start time ("HH:MM" or '' to clear); stamps lastUpdated. */
  updateStartTime: (prayer: PrayerKey, hhmm: string) => Promise<void>;
  getIqamahTime: (prayer: PrayerKey, adhanTime: Date) => Date;
  /** Parse the mosque's start time for a prayer onto the given day, or null. */
  getMosqueStart: (prayer: PrayerKey, onDate: Date) => Date | null;
  /** Mosque start minus calculated time, in minutes (negative = earlier), or null. */
  getDiffMinutes: (prayer: PrayerKey, calculated: Date) => number | null;
  hasStartTimes: boolean;
}

const MosqueContext = createContext<MosqueContextValue>({
  mosque: DEFAULT,
  updateMosque: async () => {},
  updateOffset: async () => {},
  updateStartTime: async () => {},
  getIqamahTime: (_p, t) => t,
  getMosqueStart: () => null,
  getDiffMinutes: () => null,
  hasStartTimes: false,
});

/** Parse "HH:MM" → {h,m} or null. Tolerant of "9:5", "09:05", spaces. */
export function parseHHMM(value: string | undefined): { h: number; m: number } | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

export function MosqueProvider({ children }: { children: React.ReactNode }) {
  const [mosque, setMosque] = useState<MosqueSettings>(DEFAULT);

  useEffect(() => {
    (async () => {
      const val = await AsyncStorage.getItem(MOSQUE_KEY);
      if (val) {
        try { setMosque({ ...DEFAULT, ...JSON.parse(val) }); return; } catch {}
      }
      // Migrate a v1 (iqamah-offset-only) record forward.
      const legacy = await AsyncStorage.getItem(MOSQUE_KEY_LEGACY);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          setMosque({ ...DEFAULT, ...parsed });
        } catch {}
      }
    })();
  }, []);

  const persist = useCallback(async (next: MosqueSettings) => {
    setMosque(next);
    await AsyncStorage.setItem(MOSQUE_KEY, JSON.stringify(next));
  }, []);

  const updateMosque = useCallback(async (partial: Partial<MosqueSettings>) => {
    await persist({ ...mosque, ...partial });
  }, [mosque, persist]);

  const updateOffset = useCallback(async (prayer: PrayerKey, minutes: number) => {
    await persist({ ...mosque, offsets: { ...mosque.offsets, [prayer]: minutes } });
  }, [mosque, persist]);

  const updateStartTime = useCallback(async (prayer: PrayerKey, hhmm: string) => {
    const startTimes = { ...mosque.startTimes };
    const trimmed = hhmm.trim();
    if (trimmed === '') {
      delete startTimes[prayer];
    } else {
      startTimes[prayer] = trimmed;
    }
    await persist({
      ...mosque,
      startTimes,
      lastUpdated: new Date().toISOString(),
    });
  }, [mosque, persist]);

  const getIqamahTime = useCallback((prayer: PrayerKey, adhanTime: Date): Date => {
    const offset = mosque.offsets[prayer] ?? 0;
    return new Date(adhanTime.getTime() + offset * 60 * 1000);
  }, [mosque]);

  const getMosqueStart = useCallback((prayer: PrayerKey, onDate: Date): Date | null => {
    const parsed = parseHHMM(mosque.startTimes[prayer]);
    if (!parsed) return null;
    const d = new Date(onDate);
    d.setHours(parsed.h, parsed.m, 0, 0);
    return d;
  }, [mosque]);

  const getDiffMinutes = useCallback((prayer: PrayerKey, calculated: Date): number | null => {
    const start = getMosqueStart(prayer, calculated);
    if (!start) return null;
    return Math.round((start.getTime() - calculated.getTime()) / 60000);
  }, [getMosqueStart]);

  const hasStartTimes = Object.keys(mosque.startTimes).length > 0;

  return (
    <MosqueContext.Provider value={{
      mosque, updateMosque, updateOffset, updateStartTime,
      getIqamahTime, getMosqueStart, getDiffMinutes, hasStartTimes,
    }}>
      {children}
    </MosqueContext.Provider>
  );
}

export function useMosque() {
  return useContext(MosqueContext);
}
