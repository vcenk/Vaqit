# Vaqit — Muslim Prayer Companion

A prayer app for Muslims in Western countries. Wins on reliability, accuracy, and trust — zero ads, data stays on device, and accurate prayer times at any latitude.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo app (mobile workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm test` — run the golden prayer-time test suite (lib/prayer-core)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo / React Native (expo-router, reanimated, gesture-handler)
- Prayer calculation: `adhan` (pure JS, tested against published timetables)
- Local storage: AsyncStorage (offline-first, no server required)
- API: Express 5 (api-server artifact)
- Payments (future): RevenueCat

## Where things live

```
artifacts/mobile/          — Expo/React Native app
├── app/(tabs)/
│   ├── index.tsx          — Today screen (countdown, all times, Hijri)
│   ├── tracker.tsx        — Prayer journal (log status, streaks)
│   ├── qibla.tsx          — Qibla compass (expo-location heading)
│   └── settings.tsx       — Method, madhab, offsets, notifications, mosque
├── context/
│   ├── PrayerContext.tsx       — Prayer times, GPS, qibla, travel mode
│   ├── TrackerContext.tsx      — Prayer log storage, streak computation
│   ├── NotificationContext.tsx — Athan scheduling (12-day rolling, 60 slots)
│   └── MosqueContext.tsx       — Mosque name + iqamah offsets
├── constants/
│   ├── colors.ts              — Islamic palette (dark navy + emerald + gold)
│   ├── prayers.ts             — Prayer config, Hijri conversion, status colors
│   └── islamic-dates.ts       — 20 Islamic special dates (Eid, Ramadan nights…)
└── components/
    ├── CountdownTimer.tsx     — HH:MM:SS live countdown
    └── PrayerTimeRow.tsx      — Prayer time row with status indicator

lib/prayer-core/           — Pure-TS computation engine + golden test suite
├── src/compute.ts         — computePrayerTimes, buildParams, applyOffsets, computeQibla
└── tests/
    ├── invariants.test.ts — fajr<sunrise<dhuhr<asr<maghrib<isha, seasonal ordering (84 cases)
    ├── wrapper.test.ts    — Our wrapper vs raw adhan, offset application precision
    ├── high-lat.test.ts   — Oslo/Vancouver/Reykjavik June edge cases (all 3 rules × 7 cities)
    ├── methods.test.ts    — All 7 methods + madhab differentiation, Qibla bearings
    └── golden.test.ts     — 22 cities × 4 seasons snapshot suite + 6 spot-checks
```

## Architecture decisions

- **Frontend-only by default**: All prayer calculation, tracking, and settings use AsyncStorage + `adhan` locally. No server required for MVP.
- **Dark theme**: Deep navy (#0C1422) as default — prayer apps are used pre-dawn (Fajr), dark is respectful and readable.
- **adhan library**: Pure JS wrapper over battle-tested prayer calculation. Wraps it in PrayerContext with full settings (method, madhab, highLatRule).
- **Hijri date**: Computed on-device with Julian Day Number algorithm in `constants/prayers.ts`.
- **Timezone note**: In web preview (Replit) prayer times display in UTC. On real device (Expo Go), they display correctly in the user's local timezone — this is expected behavior.

## Product

- **Today screen**: Next prayer countdown, Hijri + Gregorian date, location, all 6 prayer times with "Next" badge
- **Tracker screen**: 1-tap prayer logging (on time / late / missed / jamaah), streak tracking, 7-day calendar strip
- **Qibla screen**: Live compass via expo-sensors magnetometer, distance to Mecca in km, bearing in degrees
- **Settings screen**: GPS location, 8 calculation methods, Hanafi/Shafi, high-latitude rules, privacy pledge

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Prayer times in web preview appear shifted (UTC). Test on real device via Expo Go for correct local times.
- expo-sensors version warning on start: `expo-sensors@57.0.2` vs expected `~15.0.8`. This is a version mismatch from the SDK — app still works correctly.
- Never use `npx expo start` directly; use the WorkflowsRestart tool.
- Never create app.config.ts/js — use app.json only (required for Expo Launch publishing).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `attached_assets/` for full product docs (PRD, architecture, monetization, roadmap)
