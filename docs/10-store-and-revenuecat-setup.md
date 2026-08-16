# 10 — Store & RevenueCat setup (turning on payments)

This is the click-by-click guide to make the Supporter tier, Founding Supporter, and tips actually charge. The app code is already wired to RevenueCat via `artifacts/mobile/lib/billing.ts` — it just needs (1) products created in the stores, (2) a RevenueCat project, and (3) two keys pasted into `app.json`.

**What Claude can't do for you:** log into Apple / Google / RevenueCat, create accounts, or create the products — those need your credentials and happen in the web dashboards. Everything below is your part; the code side is done.

Until real keys are in `app.json → expo.extra`, the paywall stays in **preview mode** (shows prices, taps say "checkout opens with our first release"). Nothing charges by accident. This is per-platform: iOS is live, Android still previews until its key lands.

## Where this stands (Aug 16, 2026)

Bundle ID / package is **`online.vaqit.app`** (`online.vaqit.app` was already taken).

- ✅ Apple Developer + RevenueCat accounts; App Store Connect app created.
- ✅ All 5 products created in App Store Connect (the IAPs sit in "Missing Metadata" — fine for sandbox, needs review screenshots before submission).
- ✅ RevenueCat project "Vaqit", entitlement `supporter`, default offering, App Store app added with the In-App Purchase Key.
- ✅ iOS SDK key in `app.json` (`extra.revenueCatApiKeyIos`), `react-native-purchases` installed and linked into the native build.
- ⬜ **RevenueCat → Product catalog:** import the 5 products; attach `supporter_monthly` / `supporter_annual` / `supporter_lifetime` to the `supporter` entitlement (**not** the tips); add `tip_small` / `tip_medium` to the offering as custom packages.
- ⬜ Sign the **Paid Apps Agreement** (no purchase resolves until this is active).
- ⬜ Sandbox test on a **physical device** (see Step 5).
- ⬜ Android: Play Console ($25) → products → RevenueCat Android app → `goog_…` key into `extra.revenueCatApiKeyAndroid`.
- ⬜ `ios.appleTeamId` in `app.json` — needed for the widget target on device builds.

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

1. **My Apps → +** → New App. Bundle ID: `online.vaqit.app` (matches `app.json`). Register it first under *Certificates, Identifiers & Profiles* if needed.
2. **Subscriptions** → create a Subscription Group (e.g. "Vaqit Supporter") → add `supporter_monthly` and `supporter_annual` with the prices above.
3. **In-App Purchases** → create `supporter_lifetime` (Non-Consumable), `tip_small` and `tip_medium` (Consumable).
4. Fill each product's display name, review screenshot, and description (Apple requires these before review).
5. Create a **Sandbox tester** under *Users and Access → Sandbox* for testing.

## Step 2 — Google Play (Android)

1. **Create app** in Play Console. Package name: `online.vaqit.app`.
2. **Monetize → Subscriptions**: create `supporter_monthly`, `supporter_annual` with base plans + prices.
3. **Monetize → In-app products**: create `supporter_lifetime`, `tip_small`, `tip_medium`.
4. Add a **license tester** (Play Console → Setup → License testing) for sandbox purchases.

## Step 3 — RevenueCat (ties it together)

1. Create a RevenueCat project → add two **apps**: one iOS (App Store) and one Android (Play), each pointing at bundle/package `online.vaqit.app`. Upload the App Store Connect shared secret / Play service-account JSON when prompted.
2. **Entitlements** → create one with identifier **`supporter`**.
3. **Products** → import/add all five product IDs from both stores.
4. Attach `supporter_annual`, `supporter_monthly`, `supporter_lifetime` to the **`supporter`** entitlement. Leave `tip_small` / `tip_medium` **unattached**.
5. **Offerings** → create the `default` (current) offering and add all five as packages. Use the standard package types for the subs and lifetime (`$rc_monthly`, `$rc_annual`, `$rc_lifetime`) and **custom** packages for the two tips. Package identifiers don't have to match the product IDs — `lib/billing.ts` resolves a package by either its identifier or its store product ID, and infers what a package *is* from its package type, falling back to the product ID (anything containing `tip` is treated as a tip and never unlocks anything).
6. Copy the two **public SDK keys**: *Project → API keys* → the Apple key (`appl_…`) and Google key (`goog_…`). These are publishable (safe to ship in the app).

## Step 4 — Put the keys in the app + install the SDK

1. Paste the keys into `artifacts/mobile/app.json`:
   ```json
   "extra": {
     "revenueCatApiKeyIos": "appl_XXXXXXXX",
     "revenueCatApiKeyAndroid": "goog_XXXXXXXX"
   }
   ```
2. Install the SDK (done): `pnpm --filter @workspace/mobile add react-native-purchases`
3. Rebuild the native app — the SDK is a native module, so a JS reload isn't enough:
   ```bash
   cd artifacts/mobile && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios   # and run:android
   ```

That's it — `isBillingConfigured()` flips true, `billing.ts` loads RevenueCat, the paywall shows live prices, and purchases work. No code changes needed; the abstraction already maps offerings → the paywall.

## Step 5 — Test in sandbox before submitting

**The iOS simulator can't do this.** A simulator can't sign into a Sandbox Apple ID, so StoreKit returns no products there — the paywall falls back to hard-coded prices and purchases fail. Sandbox testing needs a real iPhone:

1. Add `"appleTeamId": "<your 10-char Team ID>"` under `expo.ios` in `app.json` (App Store Connect → Membership details). The widget target needs it to sign.
2. Plug the iPhone in and run `LANG=en_US.UTF-8 npx expo run:ios --device` — the first run needs your Apple ID added in Xcode → Settings → Accounts for signing.
3. On the iPhone: *Settings → App Store → Sandbox Account* → sign in as the sandbox tester you created.
4. Open the paywall → buy `supporter_monthly` → confirm the Supporter badge appears, then delete + reinstall and check **Restore purchases**.
5. Verify a **tip** purchase completes but does **not** grant Supporter (it must not unlock the entitlement).
6. Android: with a license tester account → same flow.

Sandbox subscriptions renew on an accelerated clock (a month ≈ 5 minutes), so you can watch a renewal and a cancellation land in the RevenueCat dashboard within one sitting.

## Notes

- **Store review:** Apple/Google both require that "restore purchases" exists (it does), that subscription terms + a privacy policy link are shown, and that nothing essential is paywalled. Worship is free — you're clean here.
- **Founding Supporter** is `supporter_lifetime`; the paywall auto-shows the live price once configured and hides it from the recurring list.
- Pricing rationale and tier strategy: `docs/05-monetization.md`. Do **not** add ads — it breaks the core promise (decided).
