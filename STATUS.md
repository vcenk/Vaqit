# Vaqit — Project Status

> Target: Public launch **December 2026**, ahead of Ramadan 2027.
> Last updated: July 2026

---

## ✅ Done

### 🟢 Differentiators (built Jul 2026 — the "verification" wedge)
- **High-latitude transparency** — `prayer-core` detects when Fajr/Isha are astronomically undefined and labels them **"Estimated"**, naming the rule that produced them (no more silent invention). Golden-tested (Vancouver/London/Oslo). New methods added: Moonsighting Committee, UOIF/France (12°), Dubai.
- **Tap-any-time source card** — tap any prayer on Today → method, angle, on-device source, your adjustment, and an approximation warning with the high-latitude rule explained.
- **Calc-vs-mosque diff (P10)** — enter your mosque's real start times → per-prayer difference vs the calculation with a plain-language "why you differ", plus provenance (source type + last-updated). Surfaced in the mosque screen and the source card.
- **Notification Assurance (JS-first)** — home-screen ✅/⚠️ "Alerts ready — next: Fajr 4:12" banner; Health screen with risk scan (permission/schedule/Android channel), **next-alerts-armed** list, **delivery ledger**, and a **shareable diagnostic export**.
- **Supporter tier rails** — RevenueCat-ready billing abstraction, Supporter paywall + sadaqah/tips, cosmetic-only gating (worship stays free). Activates once store products + RevenueCat keys are added.
- **Health:** 304/304 prayer-core tests pass; mobile + prayer-core typecheck clean.

> ⚠️ **Native notification module still pending** (needs a physical device): boot-completed receiver, foreground service, Android exact-alarm flow, iOS background refresh. Until then, rescheduling happens on app open. This is the docs' "gate" and the deepest moat — verify on Samsung/Pixel/iPhone before launch claims.

### Mobile App (`artifacts/mobile`)
- **Four-tab shell** — Today, Tracker, Qibla, Settings
- **Prayer calculation** — `adhan` library, fully on-device, no network calls
- **iOS notification engine** — 60-slot rolling schedule, 12 days ahead, auto-refreshes
- **Hijri calendar** — displayed on Today screen
- **Travel mode** — shorter Qasr prayer times while travelling
- **Mosque timetable import** — override calculated times with local masjid schedule
- **Onboarding flow** — location permission, notification permission, madhab selection
- **Privacy screen** — blurs app content when switching away (Face ID feel)
- **Notification health check** — warns user if notifications are misconfigured
- **Qibla compass** — uses `expo-location` heading, no gyroscope required
- **Golden test suite** — 289/289 passing in `lib/prayer-core`
- **EAS build config** — `eas.json` with development / preview / production profiles
- **`app.json`** — Bundle IDs, permissions, background modes, Android manifest fully configured
- **WidgetKit extension stub** (`targets/vaqit-widget/`) — `VaqitNextPrayerWidget` (small/medium) and `VaqitAllTimesWidget` (medium/large); placeholder `--:--` data
- **Widget live data** (Task #7) — `modules/shared-defaults` writes real prayer times to iOS App Group UserDefaults so widgets display actual times
- **Real athan audio** (Task #6) — custom athan call plays on iOS and Android builds instead of system ping; `@bacons/apple-targets` integrated
- **Android config plugin** — `plugins/withAthanService.js` declares `VaqitAthanService` with `foregroundServiceType: mediaPlayback`

### Marketing Site (`artifacts/marketing`)
- **Landing page** — hero, three proof pillars (notifications / accuracy / privacy), waitlist signup form, App Store badge placeholders
- **Roadmap page** — public timeline with MVP / v1.1 / Ramadan 2027 tiers
- **Privacy page** — plain-language transparency, cards for zero network / local GPS / no analytics
- **Vaqit logo** — mihrab arch + compass needle SVG mark (time + direction = prayer), used in navbar and footer

### Backend (`artifacts/api-server`)
- **Waitlist API** — `POST /api/waitlist` (email + optional city, deduplicates), `GET /api/waitlist/count`
- **OpenAPI spec** — `lib/api-spec/openapi.yaml` with `joinWaitlist` + `getWaitlistCount` operations
- **Codegen** — Orval generates `useJoinWaitlist` and `useGetWaitlistCount` React Query hooks

---

## 🔜 Proposed (not yet started)

| # | What | Why it matters |
|---|------|----------------|
| 3 | Send confirmation email when someone joins the waitlist | Trust signal; lets users know their spot is reserved |
| 4 | Add OG / social meta tags to the marketing site | Links shared on Reddit, WhatsApp, Twitter show a proper preview card |
| 5 | Persist waitlist signups to the database instead of a JSON file | Signups survive deploys and server restarts |
| 12 | Replace placeholder athan tones with a licensed Mishary Alafasy recording | The current audio is a stand-in; real athan is the core user experience |
| 13 | Let users choose their preferred athan voice in Notification settings | Personalisation — different madhabs and regions prefer different voices |
| 14 | Make athan play at full media volume on Android instead of notification volume | Android notification volume is often muted; athan must wake the user |

---

## ❌ Cancelled (deferred or out of scope for now)

| # | What | Reason |
|---|------|--------|
| 8 | Android foreground service (Kotlin implementation) | Superseded by audio work in Task #6; revisit when Android beta begins |
| 9 | Show tomorrow's Fajr on widget after Isha | Nice-to-have; deferred post-MVP |
| 10 | Lock Screen / Dynamic Island countdown | Deferred to v1.1 |
| 11 | Android home screen widget | Deferred to v1.1 (Android widget API is separate effort) |

---

## 🗺️ Roadmap Milestones

```
MVP (now → Sep 2026)
  ✅ Core prayer calc + notifications
  ✅ iOS WidgetKit (stub → live data)
  ✅ EAS build pipeline
  ✅ Marketing site + waitlist
  🔜 Confirmed waitlist emails (#3)
  🔜 Social sharing (#4)
  🔜 Real athan audio licensed (#12)
  🔜 Athan voice picker (#13)
  🔜 Android full-volume athan (#14)

v1.1 (Oct–Nov 2026)
  Lock Screen / Dynamic Island countdown
  Android home screen widget
  Android foreground service

Ramadan 2027 Launch (Dec 2026 public)
  App Store + Google Play submission
  OTA update pipeline live
```

---

## Infrastructure Notes

- **Monorepo**: pnpm workspaces, TypeScript project references
- **Post-merge script**: `scripts/post-merge.sh` — runs `pnpm install --no-frozen-lockfile` then DB migrations
- **DB**: Drizzle ORM + PostgreSQL (`lib/db`)
- **API codegen**: OpenAPI → Orval → React Query hooks in `lib/api-client-react`
- **Build**: EAS for native builds; Expo Go for dev iteration
