# Prayer App — Project Docs (v2)

**Verification-first prayer companion** for Muslims in Western and high-latitude cities. Not another all-in-one Islamic app: the confidence layer for prayer — every time explained, every mosque record provenance-labeled, every alert verifiably armed.

v2 incorporates external review: renamed away from "Vakit" (name collisions), retired the unpromisable "never fails you" claim, added MAWAQIT/Pray Watch/Salam to the competitive picture, narrowed the Day-90 beta to four cores, moved the notification feasibility spike to Day 1, corrected Ramadan 2027 to **first fast ~Feb 8** (evening of Feb 7), fixed the free/paid boundary (basic qaza is free), scoped the privacy promise precisely, gated AI behind scholarly governance, and added a full data-sources document.

## Documents

1. **01-product-overview.md** — Naming action item, repositioning ("Prayer alerts you can verify"), corrected competitive snapshot, corrected timeline
2. **02-pain-points-research.md** — P10–P18 added (method confusion, permission anxiety, diagnostics, iqamah logistics, provenance, context alerts, window-closing, compassionate tracking, accessibility); legacy points revised/downgraded; new priority order
3. **03-prd-mvp.md** — Four-core Day-90 beta (Prayer / Notification-Assurance / Trust / Mosque-Sync-Lite); everything deferred listed with destinations
4. **04-technical-architecture.md** — Feasibility spike first, native notification module, two-system data architecture, precise privacy contract with CI-enforced network allowlist
5. **05-monetization.md** — Free core boundary fixed; Supporter tier first (Jan 2027), Plus later; AI governance requirements
6. **06-roadmap-90-days.md** — Aug spike gate → Oct alpha → Nov beta → **Nov 15 launch** → **Dec 20 Ramadan Mode** → Jan stabilization only → **Feb 8 Ramadan**
7. **07-launch-marketing.md** — Proof-based messaging, published reliability stats, mosque provenance pitch (complements, doesn't fight, MAWAQIT), Android-first emphasis
8. **08-data-and-calculations.md** — Where every datum comes from: calculation parameters & golden tests, high-latitude rules, mosque platform data model with verification states, Quran/hadith licensing (Tanzil, Quran Foundation, Sunnah.com), qibla/Hijri math, no-scraping policy

## The one-paragraph thesis (v2)

Prayer apps show a time; they rarely prove why it's correct, whether the user's mosque agrees, or whether the phone will actually deliver the alert. Pillars is polished but opaque and weaker on Android; MAWAQIT owns mosque-managed times but not per-record transparency; Muslim Pro is ad-compromised. The gap is a verification layer: tap any time to see its method and source, see your mosque's diff explained, and see proof your next athan is armed — with a diagnostic when it isn't. Launch free by Nov 15, 2026; Ramadan Mode by Dec 20; monetize gently in January; ride the ~Feb 8 Ramadan surge.

## Immediate next actions

1. Name: shortlist → App Store/trademark/domain clearance → decide (do NOT brand as Vakit)
2. **Aug 1: start the 14-day notification feasibility spike** — nothing else is built until it passes
3. Landing page + waitlist (name-agnostic hero) live during the spike
