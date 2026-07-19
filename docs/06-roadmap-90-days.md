# 06 — Roadmap (v2)

**Changes from v1:** notification feasibility spike moved to Day 1; Day-90 target = four-core closed beta only; entire schedule pulled ~3 weeks earlier because **Ramadan 2027 begins the evening of ~Feb 7, first fast ~Feb 8** (not Feb 17 as v1 assumed — 9 days of runway restored). January is stabilization ONLY — no feature releases.

Assumption: nights/weekends solo build. Clock starts ~Aug 1, 2026.

## Phase 0 — Notification Feasibility Spike (Aug 1–14) — THE GATE

Ugly prototype, zero design. Proves on physical Samsung (One UI, battery saver ON), Pixel, iPhone:

- [ ] Schedules next 5 alerts
- [ ] Survives force-kill and app termination
- [ ] Reschedules after reboot
- [ ] Survives battery saver
- [ ] Handles permission revoke → restore
- [ ] Handles timezone + DST changes
- [ ] Records scheduled-vs-fired to local ledger
- [ ] Plays compliant iOS sound (≤30s) / fuller Android athan (foreground service)

**GATE:** If Android can't demonstrate ≥95% on-time delivery across these scenarios by Day 14, extend the spike — build NOTHING else until it passes or the approach is rethought. This is the product.

Parallel (non-engineering evenings):
- [ ] Name shortlist → clearance (App Store search, trademark, .com/.app) → decide
- [ ] Landing page + waitlist live (name-agnostic hero: "Prayer alerts you can verify")

## Phase 1 — Prayer Core + Foundations (Aug 15 – Sep 7)

- [ ] Monorepo scaffold (dev client, native module packaging)
- [ ] prayer-core: adhan-js wrapper, all method parameter sets incl. Diyanet
- [ ] **Golden test suite**: 20+ cities × 4 seasons vs published authority tables (Vancouver + Oslo June mandatory; details in 08)
- [ ] High-latitude rules + regional auto-recommendation
- [ ] Offline city/timezone lookup DB (no location permission required path)
- [ ] Tap-any-time source card (transparency UI)
- [ ] Design system foundations

**Exit:** golden tests green; times explainable end-to-end.

## Phase 2 — Assurance + Trust Cores (Sep 8 – Oct 5)

- [ ] Productionize spike into native module + TS API
- [ ] Per-prayer notification settings + persistence regression tests
- [ ] Health Check screen (test-fire, risk scan, vendor-specific guided fixes)
- [ ] Home-screen assurance status (✅/⚠️ with specific reason)
- [ ] Delivery ledger + "what changed?" OS-update audit + diagnostic export
- [ ] Permission Transparency Centre (pre-prompt explainers, minimum-permissions path)
- [ ] Privacy/network-request page + CI network allowlist

**Exit (technical alpha, ~Oct 5):** founder daily-driving as only prayer app; 7 consecutive days 100% on-time delivery on 3-device matrix.

## Phase 3 — Mosque Sync Lite + Beta Prep (Oct 6 – Nov 1)

- [ ] My Mosque: manual timetable + iqamah entry, local profile
- [ ] Calculation-vs-mosque comparison with per-prayer difference explanations
- [ ] Onboarding: Prayer-Time Confidence Setup (city → recommended method → mosque compare → decide) in <2 min
- [ ] Baseline accessibility (dynamic type, VoiceOver on worship-critical screens)
- [ ] TestFlight + Play closed track builds
- [ ] Recruit 30–50 beta testers (mosque WhatsApp groups, Turkish community, r/islam thread), skew Android/Samsung
- [ ] Store listings drafted (ASO in 07)

## Phase 4 — Closed Beta (Nov 1–14)

- [ ] Weekly builds; diagnostic reports as primary feedback instrument
- [ ] Fix top delivery issues; verify reliability stats worth publishing
- [ ] Next-prayer widget (iOS + Android) — the one v1.0 addition
- [ ] Onboard first 5–10 verified partner mosques (Lower Mainland) with full provenance records

**Exit:** beta cohort ledger-measured reliability ≥99%; rating-risk issues closed.

## v1.0 Public Launch — ~Nov 15, 2026 (free only)

- [ ] Launch (07 playbook); review-response n8n pipeline ON
- [ ] Simple public roadmap page live
- [ ] Goal by Dec 31: 5–10K downloads, ≥4.7, first published reliability stats

## Ramadan Mode — production-ready Dec 20, 2026 (hard date)

- [ ] Suhoor/iftar times + countdown Live Activity, fasting log, Ramadan dashboard
- [ ] Imsak handling per method/mosque; Ramadan timetable override support with provenance labels (mosque Ramadan schedules supersede normal — P14)
- [ ] Ship as v1.0.x by Dec 20 → real-world soak time before Ramadan

## Supporter tier — early Jan 2027

- [ ] RevenueCat + Supporter tier + gift/sponsored-pool + tip jar
- [ ] No other feature releases in January

## January 2027 — stabilization ONLY

Bug fixes, ASO iteration, mosque onboarding (target 10+), content pipeline ramp, App Store featuring pitch. **No feature launches.**

## Ramadan — first fast ~Feb 8, 2027 (plan for Feb 7 evening)

Marketing surge window; monitor conversion; hotfixes via OTA only.

## Post-Ramadan (v1.1, ~Apr 2027)

Tracking-styles menu (compassionate design), basic qaza (free), Context Profiles, end-of-window reminders, transparent Travel Mode, Turkish localization + Diyanet defaults, Apple Watch. Then v1.2: Quran (licensed, bundled), advanced qaza (paid), community timetables with provenance, Simple Mode.

## Kill / pivot checkpoints

- **Aug 14:** spike gate (above)
- **Oct 5:** if founder can't daily-drive it, no beta invite goes out
- **Nov 14:** beta reliability <99% or D7 retention <25% → delay launch; a bad first cohort of reviews is unrecoverable in this category
- **Ramadan +30:** <1% paid at 50K+ downloads → revisit Supporter/Plus composition before building AI anything
