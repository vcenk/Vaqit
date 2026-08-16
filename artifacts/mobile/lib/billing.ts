/**
 * Billing abstraction for the Vaqit Supporter tier.
 *
 * Worship is free forever — this only ever unlocks cosmetic/supporter extras.
 *
 * The app talks to this interface, not to a store SDK directly, so the UI works
 * in every environment (web preview, Expo Go, dev client, production) and the
 * real payment provider can be swapped without touching screens.
 *
 * ── ACTIVATION ────────────────────────────────────────────────────────────────
 * Done: `react-native-purchases` is installed and the iOS key is in app.json
 * (`extra.revenueCatApiKeyIos`). Android needs `extra.revenueCatApiKeyAndroid`
 * (`goog_…`) once the Play app exists. A platform without a key stays in
 * preview mode: `isBillingConfigured()` is false and the paywall says checkout
 * isn't live yet — nothing charges by accident. Store-side setup (products,
 * entitlement, offering) lives in docs/10-store-and-revenuecat-setup.md.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const SUPPORTER_ENTITLEMENT = 'supporter';

/** A purchasable option, shown on the paywall. */
export interface BillingPackage {
  id: string;              // RevenueCat package identifier (what we purchase by)
  productId: string;       // store product ID (supporter_annual, tip_small, …) — stable
  title: string;
  priceString: string;    // display price (live when configured, else fallback)
  period: 'monthly' | 'annual' | 'lifetime' | 'tip';
  highlight?: boolean;
}

/** Fallback pricing shown before/while live offerings load (docs: 05-monetization). */
export const FALLBACK_PACKAGES: BillingPackage[] = [
  { id: 'supporter_annual',  productId: 'supporter_annual',  title: 'Yearly',  priceString: '$24.99 / yr', period: 'annual', highlight: true },
  { id: 'supporter_monthly', productId: 'supporter_monthly', title: 'Monthly', priceString: '$3.99 / mo',  period: 'monthly' },
];

/**
 * One-time "Founding Supporter" — pay once, Supporter for life. A launch lever
 * to bank early goodwill cash and reward superfans (docs: 05-monetization).
 * When the store is configured, the live lifetime package overrides this.
 */
export const FOUNDING_PACKAGE: BillingPackage = {
  id: 'supporter_lifetime',
  productId: 'supporter_lifetime',
  title: 'Founding Supporter',
  priceString: '$49.99',
  period: 'lifetime',
  highlight: true,
};

/** One-time sadaqah / tip options (no entitlement — pure support). */
export const TIP_PACKAGES: BillingPackage[] = [
  { id: 'tip_small',  productId: 'tip_small',  title: 'Small tip',    priceString: '$2.99', period: 'tip' },
  { id: 'tip_medium', productId: 'tip_medium', title: 'Generous tip', priceString: '$9.99', period: 'tip' },
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
    // RevenueCat's debug log names the exact store misconfiguration (missing
    // product, unsigned agreement) behind an empty offering — worth having
    // while the store side is still being wired up.
    if (__DEV__ && mod?.LOG_LEVEL?.DEBUG) {
      try { await Purchases.setLogLevel(mod.LOG_LEVEL.DEBUG); } catch {}
    }
    await Purchases.configure({ apiKey: apiKey()! });
    return Purchases;
  } catch {
    return null;
  }
}

function entitlementActive(customerInfo: any): boolean {
  return Boolean(customerInfo?.entitlements?.active?.[SUPPORTER_ENTITLEMENT]);
}

/**
 * What kind of option this is. Standard RevenueCat package types answer it
 * directly; tips are CUSTOM packages, so fall back to the product IDs we
 * created in the stores (docs: 10-store-and-revenuecat-setup).
 */
function periodOf(pkg: any): BillingPackage['period'] {
  switch (String(pkg?.packageType ?? '').toUpperCase()) {
    case 'ANNUAL': return 'annual';
    case 'MONTHLY': return 'monthly';
    case 'LIFETIME': return 'lifetime';
  }
  const id = `${pkg?.product?.identifier ?? pkg?.identifier ?? ''}`.toLowerCase();
  if (id.includes('tip')) return 'tip';
  if (id.includes('lifetime')) return 'lifetime';
  if (id.includes('annual') || id.includes('year')) return 'annual';
  // Unknown: treat as a recurring plan — never as the Founding card or a tip,
  // where a mislabelled package would misrepresent what the tap does.
  return 'monthly';
}

function toBillingPackage(pkg: any): BillingPackage {
  const period = periodOf(pkg);
  return {
    id: pkg?.identifier,
    productId: pkg?.product?.identifier ?? pkg?.identifier,
    title: pkg?.product?.title ?? pkg?.identifier,
    priceString: pkg?.product?.priceString ?? '',
    period,
    highlight: period === 'annual',
  };
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
        return pkgs.map(toBillingPackage);
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
        // Match on the package identifier or the store product ID, so the
        // hard-coded fallback IDs still resolve whatever the offering names its
        // packages ($rc_annual, custom tip packages, …).
        const pkg = (offerings?.current?.availablePackages ?? []).find(
          (p: any) => p.identifier === packageId || p.product?.identifier === packageId,
        );
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
