---
name: Vaqit build state
description: What is built, what is next, key technical decisions and quirks for the Vaqit prayer app
---

## Built (Sprints 1–3 complete)

### Sprint 1 — Notification Engine + Onboarding
- `context/NotificationContext.tsx` — expo-notifications scheduling (60-slot iOS budget, 12-day rolling window), per-prayer enabled/preReminder config, test notification in 5s, permission flow, NotificationScheduler bridge in _layout
- `app/onboarding.tsx` — 3-step: Welcome → Location+Method (GPS + calculation method picker) → Notifications (enable + explain). Marks `vaqit_onboarding_done` in AsyncStorage. Root _layout redirects on first launch.
- `app/notification-health.tsx` — permission badge, test athan button (5s), scheduled count, reschedule button, battery tips, Linking.openSettings()
- Settings: per-prayer notification toggles + pre-reminder pills (0/5/10/15/30 min), Health Check link

### Sprint 2 — Hijri Calendar + Travel Mode + Offsets
- `constants/islamic-dates.ts` — 20 Islamic special dates (Eid, Ashura, Ramadan nights, Arafah, etc.)
- `app/hijri-calendar.tsx` — month grid (Gregorian months, Hijri day overlays), event dot badges, selected-day detail, upcoming dates list, prev/next navigation
- `context/PrayerContext.tsx` — per-prayer offsets (±30 min, applied after adhan calc), hijriOffset (±2 days), travel mode via AppState + haversine >50km, dismissTravelAlert, settings migration guard
- Today screen: tappable Hijri date → /hijri-calendar, travel alert banner (Update / dismiss)
- Settings: per-prayer fine-tune offsets section + Hijri calendar offset section

### Sprint 3 — Mosque Timetable + Privacy + Roadmap
- `context/MosqueContext.tsx` — mosque name + per-prayer iqamah offsets (minutes after adhan), `vaqit_mosque_v1` AsyncStorage
- `app/mosque-timetable.tsx` — enable toggle, mosque name input, per-prayer offset stepper (+5/−5), live compare view (Adhan | Iqamah | Diff)
- `app/privacy.tsx` — 7-section plain-language privacy policy ("no network requests", "no analytics", local-only, uninstall = delete)
- Settings: Mosque Timetable link (shows enabled state), Privacy Policy link, Public Roadmap link, About section

## Navigation map (Stack routes)
- `/(tabs)` — main tab bar (Today, Tracker, Qibla, Settings)
- `/onboarding` — first-launch flow (gestureEnabled: false)
- `/notification-health` — slide_from_right
- `/hijri-calendar` — slide_from_right (linked from Today's tappable Hijri date)
- `/mosque-timetable` — slide_from_right (linked from Settings)
- `/privacy` — slide_from_right (linked from Settings)

## Key quirks / lessons
- `HIJRI_MONTH_NAMES` must be exported from prayers.ts AND referenced by the new name inside `toHijri()` — renaming without updating the internal usage causes a `ReferenceError` at runtime (caught and fixed).
- Prayer times display shifted in web preview (Replit server = UTC). Correct on device. Not a bug.
- `expo-notifications` version mismatch warning (`57.0.5` vs `~0.32.17`). Works fine; ignore.
- NotificationScheduler component in _layout.tsx bridges PrayerProvider ↔ NotificationProvider (can't call each other directly — circular dep).
- Travel mode uses AppState 'active' event + `getForegroundPermissionsAsync` (NOT request). Only checks if permission already granted.
- Settings screen needs `useMosque()` hook imported — `mosque` variable from context (not from prayer settings).

## AsyncStorage keys
- `vaqit_settings_v1` — PrayerSettings (includes offsets, hijriOffset)
- `vaqit_notif_settings_v1` — NotificationSettings per prayer
- `vaqit_tracker_v1` — DayLog record
- `vaqit_mosque_v1` — MosqueSettings (enabled, name, offsets)
- `vaqit_onboarding_done` — 'true' string

## Provider nesting order in _layout.tsx
SafeAreaProvider → ErrorBoundary → QueryClientProvider → GestureHandlerRootView → KeyboardProvider
→ TrackerProvider → MosqueProvider → NotificationProvider → PrayerProvider → NotificationScheduler

## What Expo Go cannot do (needs EAS build)
- Full-length athan audio (iOS 30s hard limit without Critical Alerts entitlement)
- Android foreground service for background athan
- iOS Widgets / WidgetKit
- Live Activities (pre-Fajr / iftar)
- Vendor battery-whitelist deep links (can only Linking.openSettings())

## Still to build (post-MVP / roadmap)
- iOS Widgets + Live Activity — needs EAS dev build
- Android foreground service — needs EAS dev build
- F7 Quran reader — v1.1
- RevenueCat + Vaqit Plus — v1.1 (launch free-only first)
- F9 Qaza tracker (paid) — v1.1
- F10 AI companion / tafsir Q&A (paid) — v1.2
- F13 Ramadan Mode — must ship before Ramadan 2027 (~Feb 17, 2027)
- Turkish localization — v1.1
- Apple Watch — v1.1
- Golden test suite (20+ cities × 4 seasons vs published tables)
- TestFlight + Play closed beta track
- Store listing assets (screenshots, ASO)
