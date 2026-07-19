import React, { useCallback, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LocaleContext,
  LOCALE_STORAGE_KEY,
  detectDeviceLocale,
  isRTL,
  translate,
  type LocaleCode,
  type TKey,
} from '@/lib/i18n';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en');
  const [isSystemDefault, setIsSystemDefault] = useState(true);

  const applyRTL = useCallback((code: LocaleCode) => {
    try {
      I18nManager.allowRTL(true);
      // Full RTL re-layout only takes effect after an app reload; we set the
      // flag so a subsequent launch renders right-to-left.
      if (I18nManager.isRTL !== isRTL(code)) {
        I18nManager.forceRTL(isRTL(code));
      }
    } catch {}
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then(saved => {
      if (saved === 'en' || saved === 'tr' || saved === 'ar') {
        setLocaleState(saved);
        setIsSystemDefault(false);
        applyRTL(saved);
      } else {
        const detected = detectDeviceLocale();
        setLocaleState(detected);
        setIsSystemDefault(true);
        applyRTL(detected);
      }
    });
  }, [applyRTL]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    setIsSystemDefault(false);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, code).catch(() => {});
    applyRTL(code);
  }, [applyRTL]);

  const clearOverride = useCallback(() => {
    AsyncStorage.removeItem(LOCALE_STORAGE_KEY).catch(() => {});
    const detected = detectDeviceLocale();
    setLocaleState(detected);
    setIsSystemDefault(true);
    applyRTL(detected);
  }, [applyRTL]);

  const t = useCallback(
    (key: TKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isSystemDefault, clearOverride, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
