---
name: Vaqit build state
description: What is built, what is next, key technical decisions and quirks for the Vaqit prayer app
---

## Built (Sprints 1–3 complete)

### Sprint 1 — Notification Engine + Onboarding
- `context/NotificationContext.tsx` — expo-notifications scheduling (60-slot iOS budget, 12-day rolling window), per-prayer enabled/preReminder config, test notification in 5s, permission flow, NotificationScheduler bridge in _layout
- `app/onboarding.tsx` — 3-step: Welcome → Location+Method → Notifications. Marks `vaqit_onboarding_done` in AsyncStorage. Root _layout redirects on first launch.
- `app/notification-health.tsx` — permission badge, test athan button, scheduled count, reschedule, battery tips
- Settings: per-prayer toggles + pre-reminder pills, Health Check link

### Sprint 2 — Hijri Calendar + Travel Mode + Offsets
- `constants/islamic-dates.ts` — 20 Islamic special dates (Eid, Ashura, Ramadan nights, etc.)
- `app/hijri-calendar.tsx` — month grid with Hijri day overlays, event dots, selected-day detail, upcoming list, prev/next nav
- `context/PrayerContext.tsx` — per-prayer offsets (±30 min), hijriOffset (±2 days), travel mode via AppState + haversine >50km, dismissTravelAlert
- Today screen: tappable Hijri date → /hijri-calendar, travel alert banner
- Settings: fine-tune offsets + Hijri offset sections

### Sprint 3 — Mosque Timetable + Privacy + Roadmap
- `context/MosqueContext.tsx` — mosque name + per-prayer iqamah offsets (min after adhan), `vaqit_mosque_v1` AsyncStorage
- `app/mosque-timetable.tsx` — enable toggle, mosque name, per-prayer offset stepper, live compare table
- `app/privacy.tsx` — 7-section plain-language privacy policy
- Settings: Mosque link, Privacy, Roadmap link, About

## Navigation (Stack routes)
- `/(tabs)` — Today, Tracker, Qibla, Settings
- `/onboarding` — first-launch (gestureEnabled: false)
- `/notification-health`, `/hijri-calendar`, `/mosque-timetable`, `/privacy` — all slide_from_right

## Provider nesting in _layout.tsx
SafeAreaProvider → ErrorBoundary → QueryClientProvider → GestureHandlerRootView → KeyboardProvider
→ TrackerProvider → MosqueProvider → NotificationProvider → PrayerProvider → NotificationScheduler

## Golden test suite — lib/prayer-core (289 tests, all passing)

Run with: `pnpm test` (root) or `pnpm --filter @workspace/prayer-core test`

- **invariants.test.ts** — fajr<sunrise<dhuhr<asr<maghrib<isha for 21 cities × 4 seasons;
  seasonal direction uses LOCAL time-of-day comparison (not UTC timestamps — those are
  months apart and the comparison is meaningless for seasonal analysis)
- **wrapper.test.ts** — our computePrayerTimes == raw adhan, offset application to-the-ms
- **high-lat.test.ts** — Oslo/Vancouver/Reykjavik June: all 3 HighLatitudeRule variants
- **methods.test.ts** — all 7 methods + madhab differentiation; Turkey/Tehran have
  methodAdjustments (+5 Dhuhr/+7 Maghrib for Turkey, +4 Maghrib for Tehran) — these
  make Dhuhr/Maghrib method-dependent, only "pure" methods (ISNA/MWL/Egyptian/Karachi) agree
- **golden.test.ts** — 22 cities × 4 seasons snapshots (88 snapshots in .snap file) +
  6 spot-checks with adhan-computed reference values (Mecca, Istanbul, NYC, London, Cairo, Vancouver)

Key quirk: adhan `new Date(Y,M,D)` reads year/month/day using LOCAL time → tests set TZ=UTC
in vitest.config.ts to make date creation deterministic across hosts.

## Critical bugs fixed

### expo-sensors removed permanently
`expo-sensors@57.0.2` crashes in Expo Go SDK 54: `DeviceSensor.js` (the base class for ALL
sensors — Magnetometer, Accelerometer, etc.) references `PermissionStatus.GRANTED` before the enum
is available. The crash happens during module initialization; no import-path workaround exists.
**Fix: `pnpm remove expo-sensors` from the mobile workspace.**
Qibla compass now uses `expo-location`'s `watchHeadingAsync` instead — CoreLocation sensor-fused
heading (mag + gyro combined), more accurate, no new permissions needed.

### Onboarding layout collapse on native
`ScrollView contentContainerStyle: { alignItems: 'center' }` causes children with `width: '100%'`
to collapse to zero width on React Native native (not on web).
**Fix: remove `alignItems: 'center'` from the scroll content container.** Center icons/text inside
each step using `alignItems: 'center'` on the step container (width is then 100% of the full-width
Animated.View parent).

### HIJRI_MONTH_NAMES rename
`HIJRI_MONTHS` was renamed to `HIJRI_MONTH_NAMES` (export) but the `toHijri()` function inside the
same file still referenced the old name → runtime crash. Always update internal references.

## AsyncStorage keys
- `vaqit_settings_v1` — PrayerSettings (offsets, hijriOffset, lat/lon, method…)
- `vaqit_notif_settings_v1` — per-prayer NotificationSettings
- `vaqit_tracker_v1` — DayLog record
- `vaqit_mosque_v1` — MosqueSettings
- `vaqit_onboarding_done` — 'true' string

## What Expo Go cannot do (needs EAS build)
- Full-length athan audio (iOS 30s hard limit)
- Android foreground service for background athan
- iOS Widgets / WidgetKit, Live Activities
- Vendor battery-whitelist deep links

## Post-MVP roadmap
- iOS Widgets + Live Activity — EAS build
- F7 Quran reader — v1.1
- RevenueCat + Vaqit Plus — v1.1
- F9 Qaza tracker (paid) — v1.1
- F10 AI companion (paid) — v1.2
- F13 Ramadan Mode — before Ramadan 2027 (~Feb 17, 2027)
- Turkish localization, Apple Watch — v1.1
