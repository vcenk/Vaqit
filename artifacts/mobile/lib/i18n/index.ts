/**
 * Lightweight i18n for Vaqit — no extra native dependency.
 *
 * - Device language is auto-detected on first launch (via Intl), then the user
 *   can override it in Settings; the choice persists on-device.
 * - Catalogs are flat dotted-key maps; English is the source of truth and other
 *   locales are type-checked for completeness.
 * - Arabic sets RTL (full RTL layout applies after an app reload).
 */
import { createContext, useCallback, useContext } from 'react';
import { en, type TKey } from './en';
import { tr } from './tr';
import { ar } from './ar';

export type LocaleCode = 'en' | 'tr' | 'ar';

export const SUPPORTED_LOCALES: { code: LocaleCode; label: string; rtl: boolean }[] = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'tr', label: 'Türkçe', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
];

const CATALOGS: Record<LocaleCode, Record<TKey, string>> = { en, tr, ar };

export const LOCALE_STORAGE_KEY = 'vaqit_locale_v1';

export function isRTL(locale: LocaleCode): boolean {
  return SUPPORTED_LOCALES.find(l => l.code === locale)?.rtl ?? false;
}

/** Best-effort device-language detection with a safe English fallback. */
export function detectDeviceLocale(): LocaleCode {
  try {
    const resolved = (Intl as any)?.DateTimeFormat?.().resolvedOptions?.().locale ?? 'en';
    const lang = String(resolved).slice(0, 2).toLowerCase();
    return SUPPORTED_LOCALES.some(l => l.code === lang) ? (lang as LocaleCode) : 'en';
  } catch {
    return 'en';
  }
}

/** Translate a key, interpolating {placeholder} params. */
export function translate(
  locale: LocaleCode,
  key: TKey,
  params?: Record<string, string | number>,
): string {
  const catalog = CATALOGS[locale] ?? en;
  let value = catalog[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return value;
}

export interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  /** True when the user hasn't picked a language (following the system). */
  isSystemDefault: boolean;
  clearOverride: () => void;
  t: (key: TKey, params?: Record<string, string | number>) => string;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  isSystemDefault: true,
  clearOverride: () => {},
  t: (key) => en[key] ?? key,
});

/** Access the current locale + translator. */
export function useLocale() {
  return useContext(LocaleContext);
}

/** Convenience hook when you only need the translator. */
export function useT() {
  const { t } = useContext(LocaleContext);
  return useCallback(t, [t]);
}

export type { TKey };
