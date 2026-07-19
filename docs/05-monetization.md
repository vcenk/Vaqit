# 05 — Monetization (v2)

**Changes from v1:** basic qaza moved to FREE (charging for the whole tracker contradicted "worship is never monetized"); launch monetization reframed as a **Supporter tier first**, utility premium second; AI demoted from launch differentiator to governed v2 feature; qaza niche assumption corrected (dedicated qaza apps already exist).

## Rule zero (unchanged, boundary corrected)

**Worship is never monetized.** Free forever, no ads, no limits:

- Athan + all notification features incl. Health Check / Assurance status
- Prayer times, ALL calculation methods, high-latitude handling, explanations
- Qibla
- Mosque comparison + pinned mosque timetables
- Basic prayer tracker (log, daily/weekly view)
- **Basic qaza: count + manual logging** (moved from paid — this is worship accounting)
- Ramadan essentials (suhoor/iftar times, fasting log, Live Activity)
- Functional widgets (next prayer, all times, sunrise)
- Permission Transparency Centre, privacy features, diagnostics

## Phase 1 monetization (early Jan 2027): **Supporter tier**

$3.99/mo or $24.99/yr — framed as supporting an ad-free, tracker-free app, not unlocking worship.

Includes (all genuinely additive):
- Supporter badge + early access to new features
- Extra visual themes + premium widget styles (cosmetic only)
- Exportable prayer journal
- Priority support (powered by the diagnostic report)

Rationale: earn trust and reviews before making a hard utility paywall or AI the argument. Hallow-style goodwill + YouVersion-style non-pushiness, with a real (small) price.

## Phase 2 (v1.2, post-Ramadan): **Plus tier** ($3.99/mo | $29.99/yr; Supporters grandfathered)

- **Advanced qaza planning**: forecasting, completion-date estimates, madhhab-aware schedules, progress analytics (basic count/log stays free). Note: dedicated qaza apps already do debt calculation + charts — we must be *better via integration* with daily prayer flow and religiously reviewed, or we don't lead with it.
- **Encrypted multi-device backup/sync** (explicitly opt-in; the one case prayer history leaves the device — clearly explained per the privacy contract)
- Long-term tracker analytics + trends
- Family sync (v1.3: Family Plan $59.99/yr up to 6 — includes Simple Mode remote setup for parents)
- Expanded offline reciter library (once Quran ships, v1.2)

## Phase 3 (v2): AI features — governed, never an "Islamic authority"

AI tafsir Q&A and memorization coach are potentially valuable but carry: hallucination risk on religious content, madhhab/interpretive differences, privacy-message complications (API calls ≠ on-device), and scholar-review overhead. Therefore:

**Governance requirements before any AI feature ships:**
1. Answers ONLY from an approved, licensed source library (retrieval-grounded; see 08 for sources)
2. Exact sources displayed with every response
3. Distinguishes translation vs tafsir vs legal opinion
4. Refuses personalized fatwa-style rulings; offers "consult a qualified scholar" path
5. Identifies differences of opinion where they exist
6. Reviewed by a small scholarly advisory group pre-release
7. Per-feature data disclosure before first use ("your question text is sent to [provider]; not used for training by default, but provider-side retention applies")

Same review gate applies to qasr/jam' travel guidance and qaza planning rules — these are religious rulings, not just math.

## Sadaqah mechanics (unchanged — ship with Phase 1)

- Gift a subscription; sponsored pool (donate subs; anyone may request a free year, no questions)
- One-time tip jar

## Never

Ads; data sale; gating athan/times/methods/functional widgets/basic qaza; dark-pattern trials; hard-to-cancel flows (RevenueCat + honest cancel).

## Projections (dates corrected, conservative)

| Stage | Downloads (cum.) | Paying | MRR |
|---|---|---|---|
| Launch → Ramadan (Nov 15 – Feb 8) | 30K | 1.5–2% Supporter | ~$1.5–2K |
| Ramadan +90 (May 2027) | 100K | 3% blended | ~$9–12K |
| Month 12 | 250K | 3.5% | ~$25–30K |

Benchmark: Hallow ~$40M net 2025 proves faith-app willingness to pay; Ramadan is our Lent-equivalent conversion spike. Our fair-price positioning ($3.99 vs Muslim Pro's $12.99) is deliberate goodwill arbitrage.

## Future B2B (unchanged, v2+): mosque portal

Free for mosques initially (timetables, announcements to pinned users); later paid tier (events, donation links). Distribution + retention moat. MAWAQIT precedent proves mosques will adopt free tools — our differentiation is per-record provenance and the calculation-diff explanation MAWAQIT doesn't surface.
