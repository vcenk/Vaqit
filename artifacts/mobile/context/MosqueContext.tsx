import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerKey } from '@/constants/prayers';

const MOSQUE_KEY = 'vaqit_mosque_v1';

export interface MosqueIqamahOffsets {
  fajr: number;    // minutes after adhan
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface MosqueSettings {
  enabled: boolean;
  mosqueName: string;
  offsets: MosqueIqamahOffsets;
}

const DEFAULT_OFFSETS: MosqueIqamahOffsets = {
  fajr: 20, dhuhr: 15, asr: 15, maghrib: 5, isha: 15,
};

const DEFAULT: MosqueSettings = {
  enabled: false,
  mosqueName: '',
  offsets: DEFAULT_OFFSETS,
};

interface MosqueContextValue {
  mosque: MosqueSettings;
  updateMosque: (partial: Partial<MosqueSettings>) => Promise<void>;
  updateOffset: (prayer: PrayerKey, minutes: number) => Promise<void>;
  getIqamahTime: (prayer: PrayerKey, adhanTime: Date) => Date;
}

const MosqueContext = createContext<MosqueContextValue>({
  mosque: DEFAULT,
  updateMosque: async () => {},
  updateOffset: async () => {},
  getIqamahTime: (_p, t) => t,
});

export function MosqueProvider({ children }: { children: React.ReactNode }) {
  const [mosque, setMosque] = useState<MosqueSettings>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(MOSQUE_KEY).then(val => {
      if (val) {
        try { setMosque(JSON.parse(val)); } catch {}
      }
    });
  }, []);

  const updateMosque = useCallback(async (partial: Partial<MosqueSettings>) => {
    const updated = { ...mosque, ...partial };
    setMosque(updated);
    await AsyncStorage.setItem(MOSQUE_KEY, JSON.stringify(updated));
  }, [mosque]);

  const updateOffset = useCallback(async (prayer: PrayerKey, minutes: number) => {
    const updated: MosqueSettings = {
      ...mosque,
      offsets: { ...mosque.offsets, [prayer]: minutes },
    };
    setMosque(updated);
    await AsyncStorage.setItem(MOSQUE_KEY, JSON.stringify(updated));
  }, [mosque]);

  const getIqamahTime = useCallback((prayer: PrayerKey, adhanTime: Date): Date => {
    const offset = mosque.offsets[prayer] ?? 0;
    return new Date(adhanTime.getTime() + offset * 60 * 1000);
  }, [mosque]);

  return (
    <MosqueContext.Provider value={{ mosque, updateMosque, updateOffset, getIqamahTime }}>
      {children}
    </MosqueContext.Provider>
  );
}

export function useMosque() {
  return useContext(MosqueContext);
}
