# 01 — Product Overview (v2)

**Project codename:** SalahCheck (placeholder only — see Naming below; do NOT brand as "Vakit")
**Owner:** Cenk
**Status:** Pre-MVP planning, revised after external review
**Last updated:** 2026-07-17
**Changelog v2:** Repositioned from "reliability claims" to "verification & transparency"; added MAWAQIT/Pray Watch/Salam to competitive set; corrected Ramadan 2027 to Feb 7–8; narrowed MVP; renamed away from Vakit.

## Naming (action item #1)

"Vakit" is NOT usable: multiple existing prayer apps use the name (incl. "Vakit: Muslim Prayer Times" and "Vakti App"), some with the same privacy/no-ads promise. Search confusion + weak trademark = dead on arrival.

Naming criteria: pronounceable in English AND Turkish, distinctive in App Store search, .com/.app available, no existing prayer app collision, ideally evokes verification/confidence/time. Candidate directions to explore (all require clearance checks): Miqat-derived coinages, "Sahih"-adjacent words (careful: religious weight), invented blends (e.g., "Salatra", "Athanly", "Vaktia" — check each), or an English trust word + Arabic root.

## One-liner

**Prayer alerts you can verify.** The app that shows you *why* each prayer time is what it is, whether your mosque agrees, and proof that your athan is actually scheduled to fire.

## The repositioning (important)

v1 positioning ("the prayer app that never fails you") is retired for two reasons:

1. **It's an impossible promise.** Apple explicitly does not guarantee notification delivery; custom notification sounds are capped (~30s); Android denies exact-alarm access by default on many fresh installs and restricts full-screen intents. We can engineer toward 99%+, but we cannot market an absolute.
2. **"Reliable + private + no ads" is no longer empty space.** Pillars (4.8 iOS, actively shipping fixes, widgets, Watch, streaks, Ramadan Live Activities), MAWAQIT (nonprofit, ad-free, mosque-managed exact times in 130+ countries), Pray Watch, and Salam App all claim parts of it. Competitors fix bugs; positioning built on their bugs expires.

**Durable position: the confidence layer for prayer.** Nobody answers, in-product:
- Is this time correct, and where did it come from?
- Does my mosque agree, and why do we differ?
- Is that timetable current and verified?
- Is my next athan actually scheduled? Can my phone block it?
- What happened when one failed?

Verification, explainability, and diagnostics are process capabilities — hard to copy with a bug-fix release.

## Positioning statement

For Muslims in Western and high-latitude cities who are tired of *questioning* their prayer app, **[Name]** verifies notification readiness, explains how every time was calculated, and shows whether it matches your local mosque — without ads or invasive tracking.

## Core principles (non-negotiable, revised)

1. **Worship is free forever.** Prayer times, all calculation methods, athan + notifications, qibla, mosque comparison, basic tracker, basic qaza logging, Ramadan essentials, functional widgets. Never paywalled, never ad-interrupted.
2. **No ads. Ever.** (Table stakes now, not differentiation — but still absolute.)
3. **Precise privacy promise:** "Your location, prayer history, and settings stay on your device. Optional online features clearly show what they send before you use them." (NOT "nothing ever leaves your phone" — that conflicts with mosque sync, payments, and future AI. Honesty is the brand.)
4. **Verify, don't just claim.** Every displayed time is tappable → shows source, method, angles, adjustments, mosque diff. Every notification state is inspectable → scheduled proof, delivery ledger, risk warnings.
5. **Minimum permissions + explained permissions.** Manual city entry always available; every OS prompt preceded by a plain-language explanation of what it does and doesn't grant.
6. **Compassionate by design.** No guilt mechanics, no sad mascots, menstruation/illness/travel handled with dignity. Prayer is not a fitness challenge.

## Target market (unchanged, sharpened)

**Primary:** Practicing Muslims 18–45 in Canada/US/UK, especially high-latitude cities (Vancouver, Toronto, London, northern Europe) where calculation ambiguity is worst and our explainability matters most. **Android is the softer flank**: Pillars' Android rating (≈4.3, notification complaints persist) lags its iOS (≈4.8); Android battery fragmentation is where our diagnostic tooling shines.

**Secondary (v1.1):** Turkish diaspora + Turkey via Turkish localization and Diyanet method defaults.

**Persona update:** same 28-year-old Vancouver/London professional — but the sharpest moment of need is: *"My app says Fajr 3:41, my mosque says 4:30. Which is right, and why?"* No current app answers this in-product.

## Competitive snapshot (v2 — corrected)

| App | Model | Strengths | Our opening |
|---|---|---|---|
| Muslim Pro (~180M dl) | Freemium + ads | Scale, content breadth, verified-timetable badges in some regions | Ads in worship, trust scandal legacy, $12.99/mo, support opacity |
| Pillars | Free, privacy-first | 4.8 iOS, design, Watch, streaks, Live Activities, active dev | Android reliability gap (4.3), no diagnostics, no mosque network, no explainability |
| **MAWAQIT** | Nonprofit, free | Imam-set exact/iqamah times, 130+ countries, moderated mosque onboarding, TV/Watch/Alexa | Mosque-first not user-first: weak where no participating mosque exists; calculation fallback is opaque; no verification UX per-time; nonprofit pace |
| Pray Watch | Free/IAP | 20+ methods, iqamah entry, travel mode, Watch complications | Method overload without guidance; no mosque network; no diagnostics |
| Salam App | Free, ad-free | Broad free bundle (13 methods, Quran, trackers, backups) | Breadth over depth; no verification story |
| Athan (10M+ Android) | Ad-supported content | Content volume | Ads, clutter |
| Dedicated qaza apps | Niche paid | Focused qaza tools | Fragmented; not integrated with daily prayer flow |

**Strategic implication:** We do not out-mosque MAWAQIT or out-polish Pillars at launch. We win the user who wants to *understand and trust* their times and alerts — then grow the mosque layer with a transparency model MAWAQIT doesn't offer (per-record provenance, freshness, and diff explanation vs calculation).

## Success metrics (dates corrected)

| Milestone | Target |
|---|---|
| Notification feasibility spike passes | Aug 2026 (gate for everything else) |
| Technical alpha | Oct 2026 |
| Closed beta (mosque/community) | Early Nov 2026 |
| Public free launch | ~Nov 15, 2026 |
| Ramadan Mode production-ready | Dec 20, 2026 |
| Supporter/Plus tier live | Early Jan 2027 |
| **Ramadan 2027 first fast** | **~Feb 8, 2027** (evening of Feb 7; moon-sighting dependent — plan for the EARLY date) |
| Ramadan window | 25–50K downloads, ≥4.7 rating, D30 ≥35% |
