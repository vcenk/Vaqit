import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAMADAN_KEY = 'vaqit_ramadan_v1';

/** Compassionate fasting statuses — no guilt mechanics (docs P17). */
export type FastStatus = 'fasted' | 'missed' | 'traveling' | 'exempt';

export const FAST_STATUS_META: Record<FastStatus, { color: string }> = {
  fasted:    { color: '#4ADE80' },
  missed:    { color: '#F59E0B' },
  traveling: { color: '#60A5FA' },
  exempt:    { color: '#A78BFA' },
};

interface RamadanState {
  /** dateKey (YYYY-MM-DD) → fasting status. */
  fastingLog: Record<string, FastStatus>;
  /** Minutes before Fajr that suhoor should end (imsak caution margin). */
  imsakOffset: number;
}

const DEFAULT: RamadanState = { fastingLog: {}, imsakOffset: 10 };

interface RamadanContextValue extends RamadanState {
  setFasting: (dateKey: string, status: FastStatus | null) => Promise<void>;
  getFasting: (dateKey: string) => FastStatus | null;
  setImsakOffset: (minutes: number) => Promise<void>;
  /** Count of days logged as 'fasted' this Ramadan (by matching keys in range). */
  fastedCount: () => number;
}

const RamadanContext = createContext<RamadanContextValue>({
  ...DEFAULT,
  setFasting: async () => {},
  getFasting: () => null,
  setImsakOffset: async () => {},
  fastedCount: () => 0,
});

export function RamadanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RamadanState>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(RAMADAN_KEY).then(v => {
      if (v) { try { setState({ ...DEFAULT, ...JSON.parse(v) }); } catch {} }
    });
  }, []);

  const persist = useCallback(async (next: RamadanState) => {
    setState(next);
    await AsyncStorage.setItem(RAMADAN_KEY, JSON.stringify(next));
  }, []);

  const setFasting = useCallback(async (dateKey: string, status: FastStatus | null) => {
    const fastingLog = { ...state.fastingLog };
    if (status === null) delete fastingLog[dateKey];
    else fastingLog[dateKey] = status;
    await persist({ ...state, fastingLog });
  }, [state, persist]);

  const getFasting = useCallback((dateKey: string) => state.fastingLog[dateKey] ?? null, [state.fastingLog]);

  const setImsakOffset = useCallback(async (minutes: number) => {
    await persist({ ...state, imsakOffset: Math.max(0, Math.min(30, minutes)) });
  }, [state, persist]);

  const fastedCount = useCallback(() => {
    return Object.values(state.fastingLog).filter(s => s === 'fasted').length;
  }, [state.fastingLog]);

  return (
    <RamadanContext.Provider value={{ ...state, setFasting, getFasting, setImsakOffset, fastedCount }}>
      {children}
    </RamadanContext.Provider>
  );
}

export function useRamadan() {
  return useContext(RamadanContext);
}
