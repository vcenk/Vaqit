# 04 — Technical Architecture

## Stack (aligned with existing expertise)

| Layer | Choice | Notes |
|---|---|---|
| Mobile | **Expo / React Native (TypeScript)** | Existing LoyalLocal expertise; monorepo pattern with pnpm workspaces |
| Native modules | Expo dev client + config plugins; custom native code where notifications demand it | Do NOT stay in Expo Go — F1 requires native capability |
| Prayer calc | `adhan-js` (battle-tested, MIT) wrapped in our own tested layer | All methods incl. Diyanet params; unit tests vs published timetables |
| Local storage | SQLite (expo-sqlite) + MMKV for settings | Offline-first; settings persistence bugs killed Pillars — test this layer hard |
| Backend | **Supabase** (minimal!) | Only for: accounts (optional), mosque timetables, roadmap votes, premium entitlements |
| Payments | RevenueCat + App Store / Play Billing | Solo-founder standard; handles receipts, family plans |
| AI features (v1.2) | OpenAI (tafsir Q&A with retrieval over vetted sources), Deepgram (memorization coach) | Existing stack |
| Web (roadmap page + landing) | Next.js on Vercel | Existing stack |
| Automation | n8n (self-hosted) for review-response drafting, social content | Reuse LoyalLocal Review Responder pipeline |

## Architecture principles

### 1. On-device by default (P4 trust)

- Prayer calculation, qibla, tracker, streaks, notification scheduling: 100% local. No account required for the entire free tier.
- Location never leaves the device. City lookup uses an on-device geocoding table (offline city DB) — not a server call.
- Analytics: none by default. Optional opt-in, self-hosted (e.g. PostHog CE on the Hostinger VPS) with no device identifiers. Publish this in a plain-language privacy page: "Here is every network request our app makes."
- App Store privacy label target: "Data Not Collected" (same as Pillars — table stakes).

### 2. Notification engine (F1) — the hard part

**iOS:**
- Schedule 64-notification budget carefully: 5 prayers + pre-reminders ≈ rolling 5–6 days scheduled; re-schedule on app open, background fetch, and BGTaskScheduler.
- Full athan: bundle athan audio ≤30s segments; use Critical Alerts entitlement request rationale OR Live Activity + audio (evaluate both; document Apple's 30s notification-sound cap honestly in-app).
- Live Activities for Ramadan iftar countdown (Pillars ships this; we match it at launch).

**Android:**
- `AlarmManager.setExactAndAllowWhileIdle` + full-screen intent for athan; foreground service to play full athan reliably.
- Vendor whitelist flows: deep-link to Samsung/Xiaomi/Huawei/Pixel battery settings with device-detected instructions (library: autostarter or custom).
- POST_NOTIFICATIONS + SCHEDULE_EXACT_ALARM permission flows handled gracefully on Android 13+.

**Both:**
- Notification Health Check screen: test-fire, detect risk states, guided fixes.
- On-device delivery ledger (scheduled vs fired) to compute reliability locally; user can share a diagnostic report — becomes our support superpower.
- Automated E2E tests (Maestro/Detox) covering: settings persistence, reschedule after reboot, timezone change, DST transition, travel scenario.

### 3. Accuracy layer (F2)

- Own wrapper over adhan-js with a golden-test suite: generated times vs Diyanet, ISNA, London Unified, MWL published tables for 20+ cities across latitudes/seasons (incl. Vancouver, Toronto, London, Oslo in June — the failure cases).
- High-latitude fallback rules auto-suggested by latitude; user-visible explanation ("Why is my Isha calculated this way?") — turning a confusion point into an education/trust point.
- Mosque timetable model (Supabase):
  - `mosques(id, name, geo, city, source)`
  - `timetables(mosque_id, date, fajr, ..., isha, iqamah_*)`
  - Community-submit + moderation flag; cached fully offline once pinned.

### 4. Monorepo layout

```
prayer-app/
  apps/
    mobile/          # Expo app
    web/             # Next.js: landing + roadmap + privacy page
  packages/
    prayer-core/     # calc wrapper + golden tests (pure TS, no RN deps)
    notifications/   # scheduling engine, platform adapters
    ui/              # shared design system
  supabase/          # migrations, edge functions (entitlements, timetable submit)
```

### 5. Testing & release

- prayer-core: 100% unit coverage, golden tables in repo.
- Device matrix for notification E2E: iPhone (current iOS), Pixel, Samsung (One UI battery saver on).
- EAS Build + EAS Update for OTA fixes; phased rollouts; crash reporting via Sentry (self-hosted or PII-scrubbed — must not conflict with privacy story; document it).
- Beta: TestFlight + Play closed track with 30–50 community testers (mosque WhatsApp groups) 4+ weeks before launch — real-device notification reliability data before reviews can hurt us.

## Key risks

| Risk | Mitigation |
|---|---|
| Apple 30s notification-sound cap makes "full athan" claim shaky | Ship honest hybrid (chained segments / open-app full playback); explain in-app; never overclaim |
| Android vendor fragmentation breaks delivery | Health Check + vendor flows + beta matrix; publish reliability stats |
| adhan-js edge cases at extreme latitude | Golden tests + documented fallback rules |
| Privacy story vs crash/analytics tooling | Self-hosted, opt-in, disclosed; "every network request" page |
| Solo-founder bandwidth | MVP scope discipline (see 03); OTA updates for fast fixes |
