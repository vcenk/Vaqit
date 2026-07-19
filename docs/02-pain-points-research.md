# 02 — Pain Points Research (v2)

Compiled 2026-07-17 from Trustpilot, App Store/Google Play reviews, Reddit, and press. Revised after external review: added P10–P18, downgraded/reframed P3–P8, corrected competitor status.

## Competitive correction (read first)

The 2026 market is more crowded than v1 assumed. "No ads + privacy + accuracy" is now claimed by Pillars, MAWAQIT, Pray Watch, Salam, and others. Pillars ships actively (4.8 iOS; notification-persistence, location, and compass fixes in release notes) though Android (≈4.3) still shows notification complaints. MAWAQIT provides imam-set exact and iqamah times from moderated mosque-managed dashboards across 130+ countries, free and ad-free, and recently improved notification reliability incl. pre-Fajr alerts.

**Conclusion: position on verification, explainability, and diagnostics — capabilities, not competitors' bugs.**

## CRITICAL tier

### P12 — Notification uncertainty & diagnostic opacity (evolution of old P1)

Old P1 (notifications fail) remains real — especially Android (battery savers, vendor kill-lists, stuck settings documented in Pillars reviews; Apple's ~30s sound cap truncates athans on iOS). But competitors are fixing delivery bugs. The *durable* pain:

> "I don't know whether my next athan is actually armed, and when yesterday's didn't fire, nobody — including support — could tell me why."

No app offers: scheduled-proof ("next 5 alerts armed"), a delivery ledger, risk detection (battery saver, DND, volume, permission drift after OS updates), or a shareable diagnostic. Support across the category is blind.

**Fix:** F1 Notification Assurance System (see PRD) — health status on the home screen, test-fire, ledger, "what changed?" after OS updates, diagnostic export.

### P10 — Calculation-method confusion & mosque disagreement (NEW)

Apps compete on method *count* (Pray Watch: 20+; Salam: 13). But ordinary users don't know what ISNA vs MWL vs 15° means. Their real question:

> "Why is this app 10 minutes different from my mosque, and which one should I trust?"

Method lists create decision anxiety, not confidence. The chronic accuracy complaints (apps telling users to "refer to your local mosque") are a *symptom* of this. High-latitude cases (Vancouver/London Fajr-Isha in summer) make it worse.

**Fix:** F2 Prayer-Time Confidence Setup — recommend a regional method, compare against the user's mosque, explain every difference in plain language ("Fajr is 11 min earlier than Masjid Al-Salaam because your mosque uses a seasonal timetable rather than 15° calculation"), let the user choose mosque times / calculated / manual — and record the decision.

## HIGH tier

### P11 — Permission anxiety (NEW)

The paradox: reliable athan needs notifications + exact alarms + (optionally) location + battery exemption — the exact permission set that looks like tracking to the privacy-conscious user who chose us *because* they distrust tracking. Current Pillars Android reviews literally question why a privacy app needs persistent location and battery-optimization exemptions.

**Fix:** F3 Permission Transparency Centre — explain each permission BEFORE the OS prompt ("Exact alarm permission lets alerts fire at the requested minute. It does not give us your location or access to other apps"), always offer manual-city / minimum-permissions setup, show what degrades when refused, show live permission-health status.

### P13 — Prayer start vs jama'ah/iqamah logistics (NEW)

Calculation apps answer "when does the prayer window open?" Many users actually need "when is iqamah at my mosque and when must I leave?" MAWAQIT owns official iqamah where mosques participate; Pray Watch allows manual iqamah entry. Nobody solves the full attendance workflow (multiple mosques, per-prayer preferences, multiple Jumu'ah sessions, leave-by reminders with travel buffer).

**Fix:** F6 — start time + iqamah shown separately; "Leave by 12:58 PM" reminders; multi-Jumu'ah support. (Phased: manual entry MVP, verified network later.)

### P14 — Mosque data provenance & freshness (NEW)

Getting a timetable is not the pain; *trusting* it is. Failure modes: mosque changed times, Ramadan schedule superseded normal one, DST, wrong community entry, old PDF source, seasonal iqamah intervals. A wrong "mosque time" damages trust worse than a wrong calculation.

**Fix:** every timetable record carries visible status (Official / Verified-by-mosque / Community / Personal / Expired), source link, last-verified date, effective date range, version history, report-error action. Never silently merge community data into official. (Full model in 08.)

### P4 (revised) — Privacy trust

Muslim Pro's 2020 data-selling scandal created the category's trust deficit and it persists in reviews ("almost spyware"). BUT multiple competitors now make privacy claims — it's a requirement, not a differentiator. Our edge: *minimal permissions + visible explanations + verifiable on-device behavior + honest scoping* (see precise promise in 01/04).

## MEDIUM-HIGH tier

### P15 — Workplace/school notification friction (NEW)

Western-professional persona reality: full athan is wrong in a meeting, on car Bluetooth, with headphones, at school. Users want full athan at home, discreet vibration at work, escalating alarm for Fajr.

**Fix:** F7 Context Profiles (Home/Work/Mosque/Sleep/Headphones/Travel), fully on-device; optional work-calendar-hours discretion (opt-in — calendar access is itself a permission-anxiety topic).

### P16 — "Prayer window closing" anxiety (NEW)

Apps notify at the start; a person rebuilding consistency more urgently needs "you haven't prayed Dhuhr and Asr is in 25 minutes."

**Fix:** optional end-of-window reminders, prep reminders, snooze-until, auto-silenced once the prayer is logged, fully optional quiet mode.

### P1/P6 legacy items — Android fragmentation & travel bugs

Still real (Samsung/Xiaomi battery kill-lists; Pillars' documented "location shows null after travel"). Pray Watch already advertises travel mode, so it's not unique — our differentiation is *transparent* travel handling: explicit home/temporary status, auto-expiry, timezone audit, no silent switches.

## MEDIUM tier

### P17 — Guilt-heavy streak design (NEW, elevates old "tone" note)

Streaks/rings/goals are spreading (Pillars streaks + menstruation pause; Athan daily goals; Muslim Pro tracking cards). A broken streak can crush someone returning to salah. Also religiously distasteful to many.

**Fix:** F8 tracking styles menu — no-streaks mode, private check-off, weekly consistency view, gentle recovery, menstruation/illness/travel statuses, "returning to prayer" onboarding. Language: "You completed 4 prayers today. Next opportunity: Isha" — never "You broke your 7-day streak."

### P18 — Accessibility & older-parent usability (NEW)

MAWAQIT added screen-reader + font-scaling improvements; Muslim Pro promotes XL Quran type. Rising bar, and a family-plan lever.

**Fix:** Simple Mode — huge next-prayer countdown, high contrast, spoken times, minimal settings, remote setup export ("set up mom's phone"), EN/TR/AR.

### P5 (revised) — from "developer apathy" to "support & diagnostic failure"

Muslim Pro's unresponsiveness (years-ignored widget/sunrise/landscape requests, no contact channel, "buy Pro" replies to complaints) is real. But Pillars/MAWAQIT ship actively — "devs don't care" won't age well. Durable version: **support cannot explain failures**. Our diagnostic report makes support *able* — that's the differentiator, review-responding is just hygiene.

## DOWNGRADED (still true, no longer headline)

- **P3 Ads in worship:** disqualifies Muslim Pro/Athan; but Pillars/MAWAQIT/Pray Watch/Salam are ad-free. Requirement, not positioning.
- **P8 Widgets/Watch:** platform expectations now (all major challengers have them). Must-have, not headline.
- **P7 Paywalled worship:** solved by our free-core policy; note dedicated qaza apps already exist with debt calculation, charts, madhhab handling — qaza is NOT an empty premium niche (see 05).
- **P9 Bloat:** discipline requirement; MAWAQIT/Salam are adding breadth — we stay narrow deliberately.

## Revised priority order

1. P12 Notification uncertainty & diagnostics
2. P10 Method confusion & mosque disagreement
3. P11 Permission anxiety
4. P14 Mosque data verification & freshness
5. P13 Iqamah/Jumu'ah logistics
6. Android battery/vendor fragmentation
7. P15 Context-sensitive alerts
8. P17 Compassionate tracking
9. Travel/timezone transparency
10. P18 Accessibility/Simple Mode
11. Ads (hygiene)
12. Widgets/Watch (hygiene)
13. Generic privacy claims (hygiene)
14. Content breadth (explicitly deprioritized)

## The one-sentence market gap

> Prayer apps show users a time, but rarely prove why it's correct, whether it matches their mosque, or whether the phone is actually prepared to deliver the alert.

We are the confidence layer: result + source + method + freshness + delivery proof.
