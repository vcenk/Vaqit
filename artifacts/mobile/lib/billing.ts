/**
 * Billing abstraction for the Vaqit Supporter tier.
 *
 * Worship is free forever — this only ever unlocks cosmetic/supporter extras.
 *
 * The app talks to this interface, not to a store SDK directly, so the UI works
 * in every environment (web preview, Expo Go, dev client, production) and the
 * real payment provider can be swapped without touching screens.
 *
 * ── ACTIVATION (when you're ready to charge) ──────────────────────────────────
 * 1. `pnpm --filter @workspace/mobile add react-native-purchases`
 * 2. Create products in App Store Connect + Google Play, then a RevenueCat
 *    project; put the public SDK keys in app.json:
 *      "extra": { "revenueCatApiKeyIos": "appl_xxx", "revenueCatApiKeyAndroid": "goog_xxx" }
 * 3. Replace the body of `loadRevenueCat()` below with a real static import:
 *      import Purchases from 'react-native-purchases';
 *    and map offerings/entitlements to the shapes here.
 * Until then, `isConfigured` is false and the paywall explains it's coming soon.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const SUPPORTER_ENTITLEMENT = 'supporter';

/** A purchasable option, shown on the paywall. */
export interface BillingPackage {
  id: string;              // RevenueCat package identifier
  title: string;
  priceString: string;    // display price (live when configured, else fallback)
  period: 'monthly' | 'annual' | 'lifetime' | 'tip';
  highlight?: boolean;
}

/** Fallback pricing shown before/while live offerings load (docs: 05-monetization). */
export const FALLBACK_PACKAGES: BillingPackage[] = [
  { id: 'supporter_annual',  title: 'Yearly',   priceString: '$24.99 / yr', period: 'annual', highlight: true },
  { id: 'supporter_monthly', title: 'Monthly',  priceString: '$3.99 / mo',  period: 'monthly' },
];

/** One-time sadaqah / tip options (no entitlement — pure support). */
export const TIP_PACKAGES: BillingPackage[] = [
  { id: 'tip_small',  title: 'Small tip',   priceString: '$2.99',  period: 'tip' },
  { id: 'tip_medium', title: 'Generous tip', priceString: '$9.99', period: 'tip' },
];

export interface PurchaseResult {
  ok: boolean;
  isSupporter: boolean;
  reason?: 'not-configured' | 'cancelled' | 'error';
}

function apiKey(): string | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const key = Platform.OS === 'ios' ? extra.revenueCatApiKeyIos : extra.revenueCatApiKeyAndroid;
  return key && key.length > 0 ? key : null;
}

/** True when a real store SDK + key are wired up. */
export function isBillingConfigured(): boolean {
  return Platform.OS !== 'web' && apiKey() !== null;
}

/**
 * Attempt to load the RevenueCat SDK. Uses an indirect specifier so the build
 * doesn't hard-require the optional dependency until you install it. Returns
 * null when the SDK isn't present — the UI degrades gracefully.
 */
async function loadRevenueCat(): Promise<any | null> {
  if (!isBillingConfigured()) return null;
  try {
    const specifier = 'react-native-purchases';
    const mod: any = await import(specifier);
    const Purchases = mod?.default ?? mod;
    await Purchases.configure({ apiKey: apiKey()! });
    return Purchases;
  } catch {
    return null;
  }
}

function entitlementActive(customerInfo: any): boolean {
  return Boolean(customerInfo?.entitlements?.active?.[SUPPORTER_ENTITLEMENT]);
}

export interface BillingApi {
  configured: boolean;
  getPackages: () => Promise<BillingPackage[]>;
  isSupporter: () => Promise<boolean>;
  purchase: (packageId: string) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
}

export async function createBilling(): Promise<BillingApi> {
  const Purchases = await loadRevenueCat();

  if (!Purchases) {
    // Unconfigured mode: UI-complete, no real charges.
    return {
      configured: false,
      getPackages: async () => FALLBACK_PACKAGES,
      isSupporter: async () => false,
      purchase: async () => ({ ok: false, isSupporter: false, reason: 'not-configured' }),
      restore: async () => ({ ok: false, isSupporter: false, reason: 'not-configured' }),
    };
  }

  return {
    configured: true,
    getPackages: async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const pkgs = offerings?.current?.availablePackages ?? [];
        if (pkgs.length === 0) return FALLBACK_PACKAGES;
        return pkgs.map((p: any): BillingPackage => ({
          id: p.identifier,
          title: p.product?.title ?? p.identifier,
          priceString: p.product?.priceString ?? '',
          period: p.packageType === 'ANNUAL' ? 'annual' : p.packageType === 'MONTHLY' ? 'monthly' : 'lifetime',
          highlight: p.packageType === 'ANNUAL',
        }));
      } catch {
        return FALLBACK_PACKAGES;
      }
    },
    isSupporter: async () => {
      try { return entitlementActive(await Purchases.getCustomerInfo()); } catch { return false; }
    },
    purchase: async (packageId: string) => {
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = (offerings?.current?.availablePackages ?? []).find((p: any) => p.identifier === packageId);
        if (!pkg) return { ok: false, isSupporter: false, reason: 'error' };
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return { ok: true, isSupporter: entitlementActive(customerInfo) };
      } catch (e: any) {
        return { ok: false, isSupporter: false, reason: e?.userCancelled ? 'cancelled' : 'error' };
      }
    },
    restore: async () => {
      try {
        const customerInfo = await Purchases.restorePurchases();
        return { ok: true, isSupporter: entitlementActive(customerInfo) };
      } catch {
        return { ok: false, isSupporter: false, reason: 'error' };
      }
    },
  };
}
