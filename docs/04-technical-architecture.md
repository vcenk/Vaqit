# 04 — Technical Architecture (v2)

**Changes from v1:** notification feasibility spike moved to Day 1 (before any UI); notification package elevated to native product module; privacy promise scoped precisely; data-source architecture split into two systems (details in 08).

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | Expo / React Native (TypeScript), **dev client + config plugins from day one** | Expo Go is insufficient; notifications need native Swift/Kotlin modules |
| Notifications | **Custom native module** (Swift + Kotlin) wrapped for RN | Treated as a native product, not an Expo feature; see below |
| Prayer calc | `adhan-js` wrapped in our `prayer-core` package | Pure TS, zero RN deps, golden-tested (08) |
| Local storage | SQLite (expo-sqlite) + MMKV (settings) | Settings persistence under regression test — a documented competitor failure mode |
| Backend | Supabase — mosque platform + entitlements ONLY | Nothing else server-side; no prayer-time API dependency |
| Payments | RevenueCat + store billing | v1.1+, Supporter tier first |
| Web | Next.js on Vercel: landing, privacy/network-request page, roadmap, mosque admin portal (later) | Existing stack |
| Automation | n8n: review-response drafting, content batching | Reuse LoyalLocal pipelines |
| AI (v2, governed) | OpenAI API (retrieval over approved sources), Deepgram | See 05 governance; explicitly outside the on-device promise |
| Crash/analytics | Sentry (PII-scrubbed) + optional opt-in self-hosted PostHog CE | Both disclosed on the network-request page |

## Two-system data architecture (summary — full detail in 08)

**System A — Local calculation (on-device, offline, private):**
GPS or manual city → offline city/timezone lookup → prayer-core (method params + madhhab + high-latitude rule) → times → SQLite cache → local notification scheduler. No prayer-time API calls, ever. Qibla = fixed Kaaba coordinates + local bearing math + compass.

**System B — Mosque timetable platform (Supabase, versioned, verified):**
Mosque admin → web portal → calculated profile or uploaded annual timetable + iqamah/Jumu'ah + effective dates → versioned records → user pins mosque → app downloads and fully caches offline. Community submissions (v1.2+) always labeled, never merged into official without mosque approval.

## The precise privacy promise (engineering contract)

> "Your location, prayer history, and settings stay on your device. Optional online features clearly show what they send before you use them."

What this means concretely:

| Data | Leaves device? | Condition |
|---|---|---|
| Location / coordinates | **Never** | City lookup is an offline bundled DB |
| Prayer history, streaks, qaza log | **Never** (until user opts into encrypted backup, a paid feature, clearly explained) | |
| Calculation settings | Never | |
| Pinned-mosque timetable fetch | Yes — mosque ID only | Disclosed at pin time |
| Purchases | Yes — store receipt via RevenueCat | Disclosed |
| Crash reports | Yes — PII-scrubbed | Disclosed, listed on network page |
| Analytics | Only if opted in | Self-hosted, no device identifiers |
| AI features (v2) | Yes — the question text sent to API | Explicit per-feature disclosure BEFORE first use; OpenAI API data not used for training by default but API-side retention exists — say so plainly |

The web privacy page lists **every network request the app can make**, kept in sync via a CI check against an allowlist in code (a request to a non-allowlisted host fails the build).

## Notification native module (the product)

### Phase 0 feasibility spike — BEFORE any UI (Days 1–14)

Ugly prototype proving ONLY:
1. Schedules next 5 alerts
2. Survives app termination and force-kill
3. Reschedules after reboot
4. Survives battery saver (Samsung One UI aggressive mode)
5. Handles permission revoke → restore
6. Handles timezone + DST change
7. Records scheduled-vs-fired to a local ledger
8. Plays compliant sound iOS (≤30s segment) / fuller athan Android (foreground service)

Physical devices: Samsung (One UI), Pixel, iPhone. **Gate: no polished design work until this passes.**

### iOS specifics

- 64-notification budget manager: 5 prayers + reminders ≈ rolling 5–6 days; reschedule on app open, background refresh, BGTaskScheduler
- Sound: bundled ≤30s athan segments (Apple's cap on notification sounds — never marketed around); optional full athan playback on notification tap / app open; Critical Alerts = separate Apple entitlement application, evaluate honestly, never assumed
- Live Activities: Ramadan iftar/suhoor countdown (parity with Pillars/MAWAQIT), prayer countdown
- Delivery detection: `UNUserNotificationCenter` delivered-notification checks + app-open reconciliation into the ledger

### Android specifics

- `AlarmManager.setExactAndAllowWhileIdle` + `SCHEDULE_EXACT_ALARM` (denied by default on many fresh installs — request flow with pre-prompt explanation per P11)
- Full-screen intent: restricted to approved alarm use cases; declare properly, handle denial gracefully
- Foreground service for athan playback; `POST_NOTIFICATIONS` (13+) flows
- Vendor battery flows: device-detected deep links + instructions (Samsung/Xiaomi/Huawei/Pixel)
- Boot-completed receiver rescheduling; WorkManager fallback checks

### Assurance system (both platforms)

- Home-screen status: ✅ "Alerts ready — next: Fajr 4:12 AM" / ⚠️ "Action required — [specific risk]"
- Health Check screen: test-fire, risk scan (battery saver, DND, volume, permissions, exact-alarm status, sound file integrity), guided fixes
- Local reliability history; "What changed?" audit after OS version change
- Shareable diagnostic report (JSON + human-readable) — support can actually answer "why did Fajr not fire"

## Monorepo

```
prayer-app/
  apps/
    mobile/               # Expo (dev client)
    web/                  # Next.js: landing, privacy, roadmap; mosque portal later
  packages/
    prayer-core/          # calc wrapper + golden tables + tests (pure TS)
    notifications/        # TS API over native modules
    native/
      ios/                # Swift notification module
      android/            # Kotlin notification module
    ui/                   # design system
  supabase/               # migrations, RLS, edge functions (entitlements, mosque platform)
  tooling/network-allowlist/  # CI privacy check
```

## Testing & release

- prayer-core: golden tables in repo (see 08), 100% branch coverage on method/latitude logic
- Notification E2E (Maestro + native instrumentation): the 8 spike scenarios as permanent regression suite
- EAS Build + Update (OTA fixes), phased rollouts
- Beta: TestFlight + Play closed track, 30–50 testers via mosque WhatsApp groups, ≥4 weeks pre-launch; diagnostic reports as the feedback instrument

## Risks (v2)

| Risk | Mitigation |
|---|---|
| Apple sound cap / delivery non-guarantee makes marketing overreach tempting | Positioning is "verify," never "never fails"; all claims audit against OS docs |
| Android exact-alarm denial on fresh installs | Pre-prompt explanation flow; graceful degraded mode with visible ⚠️ status (honesty beats silent failure) |
| Competitors (Pillars/MAWAQIT) fix reliability before our launch | Moat = assurance/diagnostics/explainability systems, not their bugs |
| Wrong mosque data poisons trust | Provenance model (08); no unverified data shown as official; expiry warnings |
| Privacy promise vs cloud features contradiction | Two-system architecture + precise promise + CI-enforced network allowlist |
| Religious-guidance liability (qasr, qaza, AI) | Scholar review gate before any such feature ships (05) |
| Solo bandwidth | Four-core beta; spike gate at Day 14; kill criteria in 06 |
