# 02 — Pain Points Research (Evidence Base)

Compiled 2026-07-17 from Trustpilot, App Store / Google Play reviews, Reddit, and press coverage. Each pain point is mapped to the feature that fixes it in `03-prd-mvp.md`.

## P1 — Notification unreliability (SEVERITY: CRITICAL)

The #1 functional failure across ALL incumbents.

- Pillars (Android): users on Pixel 6 and Samsung report athan notification settings getting stuck ("Once I change it to silent I can't change it back"). Battery-saver kills notifications entirely or delivers them all at once. Pillars' own FAQ pushes multi-step troubleshooting onto users.
- Pillars (iOS): athan truncated to "only the first part" due to Apple's notification sound limit — never engineered around.
- Muslim Pro: notification settings not persisting is a recurring review theme.

**Fix:** F1 — Bulletproof Notification Engine (see PRD).

## P2 — Prayer time inaccuracy, especially high latitudes (SEVERITY: CRITICAL)

- Chronic complaint category-wide. Apps literally tell users: "If you feel the app is giving you wrong prayer times... refer to the official Islamic institutions or Mosques in your city."
- Pillars bug: France (UOMF) method applies 18° instead of the correct 12° for Fajr/Isha.
- Canada/UK/Nordics: standard angle methods break at high latitude in summer (Isha/Fajr converge or don't occur). Users are forced into manual adjustments.
- Result: users don't trust any app and cross-check against their mosque's paper timetable.

**Fix:** F2 — Accuracy System + Mosque Timetable Sync.

## P3 — Ads inside worship (SEVERITY: HIGH — emotional rage trigger)

- Muslim Pro Trustpilot: "Worst app in the world!! Constantly spams you with advertisements... Haram prices and horrible advertisements. I had to delete the app."
- Documented case: an ad for Bible teachers shown inside Muslim Pro while user was engaging with Islamic content. User called it "putting doubt in people's hearts."
- Ads interrupting Quran reading is the most emotionally charged complaint in reviews.

**Fix:** Principle — zero ads, ever. Marketing asset, not just a feature.

## P4 — Trust / privacy damage (SEVERITY: HIGH — structural)

- Muslim Pro 2020 scandal: accused of selling user location data via brokers (X-Mode) that reached the US military. Company denied and cut data partners, but reviews still call it "almost spyware" years later.
- Note: Pillars already occupies "privacy-first" positioning (no data collected, per App Store label). Privacy alone is table stakes for us, not differentiation. Differentiation = privacy + reliability + responsiveness.

**Fix:** On-device-first architecture (see 04), provable claims, plain-language privacy page.

## P5 — Developer apathy / no support (SEVERITY: MEDIUM — brand opportunity)

- Muslim Pro: iPad landscape mode and widget sunrise time requested "for years"; user emailed multiple times, no response. "The dev team doesn't really care what the users want."
- Muslim Pro Trustpilot: no findable customer-service contact; "excess of 'Pay me!!!' and the lack of 'If you need us, contact us'."
- Muslim Pro owner responded to a negative review by recommending the user buy Pro.

**Fix:** F8 — Public roadmap + in-app feature voting + review responses (can reuse LoyalLocal Review Responder patterns).

## P6 — Location bugs when traveling (SEVERITY: MEDIUM)

- Pillars: "I recently traveled and my prayer times have changed. When I came back to my original city, the location will not change and now says null."
- No incumbent handles the traveler use case well (auto city switch, qasr guidance, timezone sanity).

**Fix:** F5 — Travel Mode.

## P7 — Paywalling worship / pricing resentment (SEVERITY: MEDIUM)

- Muslim Pro Premium at $12.99/mo (US) is widely called overpriced for content users consider religious essentials ("Haram prices").
- Users accept paying for *extras* (audio downloads, learning tools) but revolt when core worship is gated.

**Fix:** Free-forever core + premium tier limited to genuinely additive tools (see 05-monetization).

## P8 — Widget / platform gaps (SEVERITY: MEDIUM)

- Muslim Pro widget missing sunrise time (needed to plan Fajr wake-ups) — ignored for years despite requests.
- No landscape/iPad support in Muslim Pro.
- Apple Watch support across incumbents is superficial (no complications-first design, no truncation-aware athan).

**Fix:** F6 — Widgets & Watch as first-class surfaces (ties into founder's watchOS research).

## P9 — App bloat and slowness (SEVERITY: LOW-MEDIUM)

- Muslim Pro described as "heavy/slow"; YouVersion-style feature overload noted as "overwhelming" in the adjacent Christian market.
- Athan Pro-type apps ship WhatsApp stickers, wallpapers, radio, sleep stories — clutter that buries the core job.

**Fix:** Ruthless MVP scope; one job done perfectly; extras behind a clean "More" area.

## Severity × effort priority matrix

| # | Pain point | Severity | Fix effort | Priority |
|---|---|---|---|---|
| P1 | Notification failures | Critical | High | **1** |
| P2 | Time inaccuracy / high latitude | Critical | Medium | **2** |
| P3 | Ads in worship | High | Zero (policy) | **3** |
| P4 | Privacy trust | High | Low (architecture) | **4** |
| P5 | Dev apathy | Medium | Low | **5** |
| P6 | Travel bugs | Medium | Medium | 6 |
| P7 | Paywalled worship | Medium | Zero (policy) | 7 |
| P8 | Widgets/Watch | Medium | Medium | 8 |
| P9 | Bloat | Low-Med | Zero (discipline) | 9 |
