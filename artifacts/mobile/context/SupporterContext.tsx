import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createBilling,
  FALLBACK_PACKAGES,
  type BillingApi,
  type BillingPackage,
  type PurchaseResult,
} from '@/lib/billing';

const CACHE_KEY = 'vaqit_supporter_v1';

interface SupporterContextValue {
  /** True when the user has an active Supporter entitlement. */
  isSupporter: boolean;
  /** True when a real store SDK + keys are wired up (else paywall is preview-only). */
  configured: boolean;
  packages: BillingPackage[];
  loading: boolean;
  purchase: (packageId: string) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  refresh: () => Promise<void>;
}

const SupporterContext = createContext<SupporterContextValue>({
  isSupporter: false,
  configured: false,
  packages: FALLBACK_PACKAGES,
  loading: true,
  purchase: async () => ({ ok: false, isSupporter: false, reason: 'not-configured' }),
  restore: async () => ({ ok: false, isSupporter: false, reason: 'not-configured' }),
  refresh: async () => {},
});

export function SupporterProvider({ children }: { children: React.ReactNode }) {
  const billingRef = useRef<BillingApi | null>(null);
  const [isSupporter, setIsSupporter] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [packages, setPackages] = useState<BillingPackage[]>(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);

  // Optimistically load the last known entitlement so gated UI doesn't flicker.
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY).then(v => { if (v === '1') setIsSupporter(true); });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const billing = await createBilling();
      if (cancelled) return;
      billingRef.current = billing;
      setConfigured(billing.configured);
      try {
        const [pkgs, supporter] = await Promise.all([billing.getPackages(), billing.isSupporter()]);
        if (cancelled) return;
        setPackages(pkgs);
        setIsSupporter(supporter);
        AsyncStorage.setItem(CACHE_KEY, supporter ? '1' : '0').catch(() => {});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyResult = useCallback((r: PurchaseResult) => {
    if (r.ok) {
      setIsSupporter(r.isSupporter);
      AsyncStorage.setItem(CACHE_KEY, r.isSupporter ? '1' : '0').catch(() => {});
    }
    return r;
  }, []);

  const purchase = useCallback(async (packageId: string) => {
    if (!billingRef.current) return { ok: false, isSupporter: false, reason: 'not-configured' as const };
    return applyResult(await billingRef.current.purchase(packageId));
  }, [applyResult]);

  const restore = useCallback(async () => {
    if (!billingRef.current) return { ok: false, isSupporter: false, reason: 'not-configured' as const };
    return applyResult(await billingRef.current.restore());
  }, [applyResult]);

  const refresh = useCallback(async () => {
    if (!billingRef.current) return;
    const supporter = await billingRef.current.isSupporter();
    setIsSupporter(supporter);
    AsyncStorage.setItem(CACHE_KEY, supporter ? '1' : '0').catch(() => {});
  }, []);

  return (
    <SupporterContext.Provider value={{ isSupporter, configured, packages, loading, purchase, restore, refresh }}>
      {children}
    </SupporterContext.Provider>
  );
}

export function useSupporter() {
  return useContext(SupporterContext);
}
