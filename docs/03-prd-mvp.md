# 03 — PRD & MVP Scope (v2)

**Change from v1:** Day-90 beta narrowed from ~10 features to FOUR cores. v1's scope was ~3 releases pretending to be one, with the hardest native work (notifications) buried in the middle. Everything cut is listed, with its new home.

## Day-90 Closed Beta = Four Cores only

### CORE 1 — Prayer Core

- Today screen: five prayer times + sunrise, next-prayer countdown, Hijri + Gregorian date
- Calculation-method selection with **regional recommendation** (not a raw 20-item list — P10)
- High-latitude handling (angle-based / one-seventh / nearest-latitude) with auto-suggestion by latitude and a plain-language "why" explanation
- Manual per-prayer minute adjustments
- Qibla compass (no-movement initialization)
- **Tap-any-time transparency**: every displayed time opens a source card —
  `Fajr 3:41 AM · Calculated on your device · Method: ISNA (15°) · High-latitude rule: One-seventh · Location: Vancouver (manual) · Your adjustment: +2 min · vs your mosque: 6 min earlier`
- Golden-tested against published authority tables (see 08)

### CORE 2 — Notification Core (Notification Assurance System)

- Per-prayer settings: sound (athan/short/silent), vibration, pre-prayer reminder offset
- Test notification with real athan playback
- **Notification Health Check**: onboarding + always-available screen — test-fire, battery-saver/DND/volume/permission risk detection, device-specific fix guidance (Samsung/Xiaomi/Pixel deep links)
- **Assurance status on home screen**:
  - ✅ "Alerts ready — next scheduled: Fajr 4:12 AM"
  - ⚠️ "Action required — Samsung battery settings may block Fajr" 
- Reboot / timezone / DST rescheduling (spike-proven before UI exists — see 06)
- **Local delivery ledger**: scheduled vs fired history, last missed/delayed, "what changed?" prompt after OS updates
- **Shareable diagnostic report** (the support superpower — P5-revised)
- Settings persistence covered by automated regression tests
- iOS sound strategy: compliant ≤30s athan segments by default; NO "full athan guaranteed" claims (Apple caps notification sounds; Critical Alerts entitlement is a separate application, pursued honestly if at all). Android: foreground-service full athan where permissions allow.

### CORE 3 — Trust Core

- **Permission Transparency Centre** (P11): pre-prompt explanations for every permission; manual city entry always available (no location permission required path); "minimum permissions" setup; live permission-health status; what-happens-if-refused shown honestly
- Plain-language calculation explanation pages
- Privacy page: precise promise — "Your location, prayer history, and settings stay on your device. Optional online features clearly show what they send before you use them." — plus the "every network request this app makes" list
- No account required for anything in beta; full offline operation

### CORE 4 — Mosque Sync Lite

- Manually add "My Mosque": name + timetable entry (start times and/or iqamah)
- Personal mosque profile stored locally
- **"App calculation vs my mosque" comparison view with per-prayer difference explanation** (P10's killer feature)
- Iqamah displayed separately from prayer start where entered (P13, manual level)
- NO community submission portal, NO central mosque database, NO verified network in beta (v1.0+ — see 08 for the platform design)

## v1.0 Public Launch (adds to beta)

- One next-prayer widget (iOS home/lock incl. sunrise; Android widget)
- Verified mosque profiles: first 5–10 partner mosques with the full provenance model (source, verified date, effective range — see 08)
- Store-ready polish, localizable strings (EN; TR strings prepared)

## Deferred — with destinations

| Feature | Old slot | New home | Why deferred |
|---|---|---|---|
| Travel mode + qasr guidance | MVP | v1.1 | Pray Watch already has travel mode; ours must be the *transparent* version (status, auto-expiry, timezone audit) — worth doing right; qasr/jam' guidance needs religious review |
| Streaks / tracking | MVP | v1.1 as **tracking-styles menu** (P17): no-streaks, private check-off, weekly view, recovery mode, menstruation/illness/travel statuses | Compassionate design needs care, not rush |
| Apple Watch + complications | v1.1 | v1.1–v1.2 | Platform expectation, not headline; after notification core is bulletproof |
| Quran reader + audio | v1.1 | v1.2 | Content licensing + bundling done properly (08); not our wedge |
| Context Profiles (work/home/headphones) (P15) | — | v1.1 | High-value, on-device, post-launch differentiator |
| End-of-window compassionate reminders (P16) | — | v1.1 | Pairs with tracking styles |
| Public roadmap + voting | MVP | v1.0 (simple page), voting v1.1 | Beta feedback comes from the cohort directly |
| Community timetable submissions | MVP | v1.2 with full provenance/moderation model | Wrong mosque data is worse than none (P14) |
| Qaza planner | Plus tier | Basic count/logging FREE in v1.1; *advanced planning/forecasting* paid in v1.2 | Charging for core qaza contradicted "worship is never monetized"; dedicated qaza apps already exist |
| AI companion (tafsir Q&A) | Plus tier | v2, governed (see 05) | Hallucination/madhhab/privacy/scholar-review overhead; not an early differentiator |
| Memorization coach | Plus tier | v2 | Same governance track |
| Simple Mode / accessibility pack (P18) | — | v1.2; baseline a11y (dynamic type, VoiceOver) in beta | Family-plan lever later; basics day one |
| Ramadan Mode (suhoor/iftar, fasting, Live Activity) | pre-Ramadan | **Production-ready Dec 20, 2026** (hard date; Ramadan starts ~Feb 8, 2027) | Seasonal must-ship |

## Explicitly never (unchanged)

Ads; data sale/sharing; social feed; halal finder; wallpapers/stickers/radio/sleep stories; scraping competitors' data (see 08).

## Quality bars

- Cold start < 1.5s; full offline; settings persistence under automated test
- Notification E2E matrix (physical Pixel + Samsung One UI battery-saver ON + iPhone): reboot, DST, timezone change, permission revoke/restore, force-kill
- Golden calc tests: 20+ cities × 4 seasons vs published tables (Vancouver + Oslo June mandatory)
- Copy tone: compassionate, never guilt-based; religious guidance features flagged for scholar review before shipping
