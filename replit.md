# Vakit — Muslim Prayer Companion

A prayer app for Muslims in Western countries. Wins on reliability, accuracy, and trust — zero ads, data stays on device, and accurate prayer times at any latitude.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo app (mobile workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo / React Native (expo-router, reanimated, gesture-handler)
- Prayer calculation: `adhan` (pure JS, tested against published timetables)
- Local storage: AsyncStorage (offline-first, no server required)
- API: Express 5 (api-server artifact)
- Payments (future): RevenueCat

## Where things live

```
artifacts/mobile/
├── app/(tabs)/
│   ├── index.tsx       — Today screen (next prayer countdown, all times)
│   ├── tracker.tsx     — Prayer journal (log status, streaks)
│   ├── qibla.tsx       — Qibla compass (expo-sensors magnetometer)
│   └── settings.tsx    — Calculation method, madhab, location, privacy
├── context/
│   ├── PrayerContext.tsx   — Prayer times, settings, qibla direction
│   └── TrackerContext.tsx  — Prayer log storage, streak computation
├── constants/
│   ├── colors.ts       — Islamic palette (dark navy + emerald + gold)
│   └── prayers.ts      — Prayer config, Hijri conversion, status colors
└── components/
    ├── CountdownTimer.tsx  — HH:MM:SS live countdown
    └── PrayerTimeRow.tsx   — Prayer time row with status indicator
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
