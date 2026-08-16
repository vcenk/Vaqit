# 10 — Store & RevenueCat setup (turning on payments)

This is the click-by-click guide to make the Supporter tier, Founding Supporter, and tips actually charge. The app code is already wired to RevenueCat via `artifacts/mobile/lib/billing.ts` — it just needs (1) products created in the stores, (2) a RevenueCat project, and (3) two keys pasted into `app.json`.

**What Claude can't do for you:** log into Apple / Google / RevenueCat, create accounts, or create the products — those need your credentials and happen in the web dashboards. Everything below is your part; the code side is done.

Until real keys are in `app.json → expo.extra`, the paywall stays in **preview mode** (shows prices, taps say "checkout opens with our first release"). Nothing charges by accident.

## The exact IDs the app expects

Create these product IDs **exactly** (the app matches on them). Entitlement that unlocks Supporter status is called **`supporter`**.

| Product ID | Type | Store product kind | Price (from docs/05) | Grants `supporter`? |
|---|---|---|---|---|
| `supporter_annual` | Subscription | Auto-renewable (yearly) | $24.99 / yr | ✅ |
| `supporter_monthly` | Subscription | Auto-renewable (monthly) | $3.99 / mo | ✅ |
| `supporter_lifetime` | One-time | Non-consumable | $49.99 | ✅ |
| `tip_small` | One-time | **Consumable** | $2.99 | ❌ (pure sadaqah) |
| `tip_medium` | One-time | **Consumable** | $9.99 | ❌ (pure sadaqah) |

> Tips are **consumable** (can be given repeatedly) and grant nothing. The two subs + lifetime all unlock the same `supporter` entitlement.

## Step 1 — App Store Connect (iOS)

1. **My Apps → +** → New App. Bundle ID: `com.vaqit.app` (matches `app.json`). Register it first under *Certificates, Identifiers & Profiles* if needed.
2. **Subscriptions** → create a Subscription Group (e.g. "Vaqit Supporter") → add `supporter_monthly` and `supporter_annual` with the prices above.
3. **In-App Purchases** → create `supporter_lifetime` (Non-Consumable), `tip_small` and `tip_medium` (Consumable).
4. Fill each product's display name, review screenshot, and description (Apple requires these before review).
5. Create a **Sandbox tester** under *Users and Access → Sandbox* for testing.

## Step 2 — Google Play (Android)

1. **Create app** in Play Console. Package name: `com.vaqit.app`.
2. **Monetize → Subscriptions**: create `supporter_monthly`, `supporter_annual` with base plans + prices.
3. **Monetize → In-app products**: create `supporter_lifetime`, `tip_small`, `tip_medium`.
4. Add a **license tester** (Play Console → Setup → License testing) for sandbox purchases.

## Step 3 — RevenueCat (ties it together)

1. Create a RevenueCat project → add two **apps**: one iOS (App Store) and one Android (Play), each pointing at bundle/package `com.vaqit.app`. Upload the App Store Connect shared secret / Play service-account JSON when prompted.
2. **Entitlements** → create one with identifier **`supporter`**.
3. **Products** → import/add all five product IDs from both stores.
4. Attach `supporter_annual`, `supporter_monthly`, `supporter_lifetime` to the **`supporter`** entitlement. Leave `tip_small` / `tip_medium` **unattached**.
5. **Offerings** → create the `default` (current) offering. Add packages whose **identifiers match the product IDs above** (`supporter_annual`, `supporter_monthly`, `supporter_lifetime`, `tip_small`, `tip_medium`) — the app looks packages up by these identifiers (`lib/billing.ts`, `getPackages`/`purchase`).
6. Copy the two **public SDK keys**: *Project → API keys* → the Apple key (`appl_…`) and Google key (`goog_…`). These are publishable (safe to ship in the app).

## Step 4 — Put the keys in the app + install the SDK

1. Paste the keys into `artifacts/mobile/app.json`:
   ```json
   "extra": {
     "revenueCatApiKeyIos": "appl_XXXXXXXX",
     "revenueCatApiKeyAndroid": "goog_XXXXXXXX"
   }
   ```
2. Install the SDK:
   ```bash
   pnpm --filter @workspace/mobile add react-native-purchases
   ```
3. Rebuild the native app (the SDK is a native module):
   ```bash
   cd artifacts/mobile && LANG=en_US.UTF-8 npx expo run:ios   # and run:android
   ```

That's it — `isBillingConfigured()` flips true, `billing.ts` loads RevenueCat, the paywall shows live prices, and purchases work. No code changes needed; the abstraction already maps offerings → the paywall.

## Step 5 — Test in sandbox before submitting

- iOS: run on a device signed into your Sandbox tester Apple ID → open the paywall → buy `supporter_monthly` → confirm the Supporter badge appears and **Restore purchases** works.
- Android: with a license tester account → same flow.
- Verify a **tip** purchase completes but does **not** grant Supporter (it shouldn't unlock the entitlement).

## Notes

- **Store review:** Apple/Google both require that "restore purchases" exists (it does), that subscription terms + a privacy policy link are shown, and that nothing essential is paywalled. Worship is free — you're clean here.
- **Founding Supporter** is `supporter_lifetime`; the paywall auto-shows the live price once configured and hides it from the recurring list.
- Pricing rationale and tier strategy: `docs/05-monetization.md`. Do **not** add ads — it breaks the core promise (decided).
