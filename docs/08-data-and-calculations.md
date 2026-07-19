# 08 — Data Sources & Calculations (NEW in v2)

Where every piece of data in the app comes from, how it's computed, licensed, verified, and displayed. This document is the engineering + legal reference for the "explain everything" product promise.

## 1. Prayer times — calculated on-device (System A)

Prayer apps do not download daily times from a central religious database for most locations. Times are **astronomical calculations** from:

- Latitude + longitude (device GPS *or* manual city — both supported; manual requires no permission)
- Date + device timezone
- Calculation convention (Fajr/Isha solar angles or intervals)
- Asr madhhab (Standard/Shafi'i vs Hanafi shadow ratio)
- High-latitude rule
- User's manual per-prayer adjustments

**Engine:** `adhan-js` (MIT license, widely deployed, precise solar astronomy) wrapped in our `prayer-core` package. adhan-js accepts exactly these parameters (angles, intervals, madhhab, high-latitude rule, per-prayer adjustments). No prayer-time API calls; zero network dependency; works offline forever.

```
Location (GPS or manual city)
      ↓
Offline city/timezone lookup (bundled DB)
      ↓
prayer-core: method params + madhhab + high-latitude rule
      ↓
Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
      ↓
SQLite cache → local notification scheduler
```

### Calculation method parameter sets (bundled constants, not APIs)

These are published/used conventions of religious organizations. Apps store the parameters and calculate locally — the organizations do not stream daily times to apps.

| Method | Fajr | Isha | Typical region |
|---|---|---|---|
| Muslim World League (MWL) | 18° | 17° | Europe, Far East, parts of US |
| ISNA | 15° | 15° | North America (our primary default) |
| Umm al-Qura | 18.5° | 90 min after Maghrib (120 in Ramadan) | Saudi Arabia |
| Egyptian General Authority | 19.5° | 17.5° | Africa, Syria, Lebanon |
| Univ. of Islamic Sciences, Karachi | 18° | 18° | Pakistan, Bangladesh, India |
| **Diyanet (Turkey)** | 18° | 17° (with Diyanet-specific temkin adjustments) | Turkey + diaspora (v1.1 default for TR) |
| UOIF/France | 12° | 12° | France (the exact setting Pillars got wrong — regression test) |
| Moonsighting Committee | seasonal rules | seasonal | Increasingly popular in North America |

Asr: Standard (shadow = 1×) vs Hanafi (shadow = 2×) — user choice, explained in plain language.

### High-latitude handling (our accuracy differentiator)

Above ~48° latitude in summer (Vancouver 49°, London 51.5°, Oslo 60°), 18°/15° twilight may never occur — naive calculation breaks. Bundled fallback rules, auto-recommended by latitude, always explained in the UI:

- **Middle of the Night** — Isha/Fajr capped at solar midnight halves
- **One-Seventh of the Night**
- **Angle-Based (Twilight Angle)** — night portioned by angle/60

### Golden test suite (the proof)

`prayer-core` ships with committed reference tables and CI tests:

- 20+ cities × 4 seasons (solstices/equinoxes + DST boundaries), mandatory: Vancouver, Toronto, London, Oslo (June), Istanbul, Mecca, Karachi, Cairo, NYC, Sydney
- Compared against published authority tables (Diyanet's published Istanbul times; ISNA-method tables; London Unified Prayer Timetable; Umm al-Qura for Mecca)
- Tolerance: ±1–2 min (rounding conventions differ); any drift beyond tolerance fails CI
- DST-transition days and timezone-change scenarios explicitly covered

### Per-time transparency card (user-facing output of all the above)

```
Fajr: 3:41 AM
Source: Calculated on your device
Method: ISNA · Fajr angle 15°
High-latitude rule: One-Seventh
Location: Vancouver (manual entry)
Your adjustment: +2 min
Compared with your mosque: 6 minutes earlier — your mosque
uses a seasonal timetable, not angle calculation. [Use mosque times]
```

## 2. How competitors source data (reference)

| App | Model |
|---|---|
| Muslim Pro | Hybrid: local calculation with regional defaults (ISNA for Canada) + a database of mosque/authority-verified schedules shown as "App Recommended" with a verified badge in select regions (submitted by mosques/authorities directly, not individuals) + user manual adjustments |
| MAWAQIT | Mosque-managed platform: admins get a 24/7 web dashboard managing prayer/iqamah times (auto-calculated or annual calendar), Jumu'ah sessions, announcements; consumer app subscribes to the mosque; mosque additions are moderated and non-compliant mosques suspended; distributed to app/TV/watch/Alexa |
| Pray Watch | Authority calculation parameters + device location + user custom angles/adjustments + manual masjid iqamah entry; no global mosque-admin network |
| Pillars | Not publicly documented; behavior consistent with on-device calculation + local scheduling (do not assert specifics) |

**Lesson adopted:** MAWAQIT's mosque-managed + moderated model is the right trust architecture for mosque data; Muslim Pro's verified-badge concept is right but opaque. We add what neither surfaces: per-record provenance, freshness, and diff-vs-calculation explanation.

## 3. Mosque timetable platform (System B — Supabase)

### Data model

```
mosques(id, name, geo, address, city, country, website, contact, created_by, status)
mosque_admins(mosque_id, user_id, role, verified_method, verified_at)
mosque_verifications(id, mosque_id, method[email_domain|website|document], evidence_ref, reviewed_by, decided_at)
calculation_profiles(mosque_id, method, angles, adjustments)          -- if mosque uses calculation
prayer_timetables(id, mosque_id, effective_start, effective_end,
                  source_type[official|verified|community|personal],
                  source_ref, version, created_by, superseded_by)
timetable_entries(timetable_id, date, fajr, sunrise, dhuhr, asr, maghrib, isha)
iqamah_schedules(mosque_id, rule_type[fixed_time|offset|seasonal], data, effective_range, version)
jumuah_sessions(mosque_id, session_no, time, language, notes)
special_events(mosque_id, type[ramadan|eid|other], overrides, effective_range)
announcements(mosque_id, title, body, published_at, expires_at)
correction_reports(id, mosque_id, timetable_id, reporter, description, status)
```

Rules:
- **Every timetable displays**: source type, source link/document, last-verified date, effective range, last-changed-by, version. Expired → visible warning, never silently shown as current.
- Corrections create a **new version**; history is never overwritten.
- Community data is labeled community and **never merged into official** without mosque approval.
- Ramadan schedules are explicit overrides with their own effective range (supersession is visible, not silent — P14).
- RLS: admins write their mosque only; public reads published versions only.

### Mosque onboarding flow

1. Mosque claims profile → 2. Verify via official-domain email, website link-back, or management document → 3. Choose calculated profile or annual timetable upload (CSV/manual) → 4. Month preview shown → 5. Iqamah + Jumu'ah entry → 6. Mosque approves publication → 7. Users receive versioned data → 8. Expiry warnings to admin before schedules lapse.

### User-facing mosque card

```
Iqamah (Fajr): 4:30 AM
Source: Masjid administrator
Verified: July 14, 2026 · Effective until: Aug 31, 2026
Last synced to your phone: 18 minutes ago          [Report an error]
```

App fully caches pinned-mosque data offline; sync sends **mosque ID only** (no user location) per the privacy contract.

## 4. Qibla — no external data

Fixed Kaaba coordinates (21.4225°N, 39.8262°E) + user coordinates + great-circle bearing + device compass. Entirely local; distance-to-Kaaba computed the same way.

## 5. Hijri calendar

Tabular Islamic calendar computed locally (adhan-js/companion algorithms) + user-adjustable offset (±1–2 days) because observed months depend on moon sighting. Regional authority alignment (e.g., Diyanet vs Umm al-Qura day differences) surfaced honestly: "Hijri dates may differ by a day from your local authority — adjust here."

## 6. Quran content (v1.2)

Never hand-typed, never scraped. Options, in preference order:

| Source | What | Model | Notes |
|---|---|---|---|
| **Tanzil** | Verified Arabic text + translations, downloadable | Bundle in app SQLite → fully offline | License requires attribution + text-integrity terms — comply exactly; best fit for the offline/privacy promise |
| **Quran Foundation API** | Text, translations, tafsir, recitations, audio, search | Server-mediated (their guidance: keep credentials on your backend) | Use for audio catalog + tafsir retrieval (AI grounding later) |
| Al Quran Cloud | REST/CDN editions + recitations | API | Requires translator attribution when republishing translations |

Plan: bundle one verified Arabic text (Tanzil) + 2–3 licensed translations (EN Sahih International-class + TR Diyanet translation if licensable) in SQLite; optional reciter audio as downloads (Quran Foundation catalog), cached offline. Every translation screen shows translator attribution.

## 7. Hadith & dua (v1.2+, and AI grounding corpus)

- Sunnah.com developer API for hadith data access (respect their terms; request data-snapshot access through their channel)
- Scholar-reviewed internal dua content or licensed collections
- Every item retains: collection, book, number, grade, Arabic, translation source, provider attribution, version
- **No scraping of random Islamic websites** — provenance is the product

## 8. What we never do (data ethics & durability)

Do not scrape Muslim Pro, MAWAQIT, Pillars, mosque websites without permission, Google results, or unverified Ramadan PDFs. Scraping = licensing risk + silent breakage on redesign + exactly the un-provenance this product exists to fix. Acceptable inputs: our calculation engine, licensed datasets, direct mosque submissions, official authority timetables (attributed), user manual entries.

## 9. Notifications are not data (clarity note)

Once times are calculated/synced, the app schedules **local OS alarms**; nothing is downloaded at fire time and no internet is needed. The hard problem is OS delivery behavior (reboot, battery saver, termination, permission drift, DST/timezone, OS updates) — which is why the Assurance System (04) exists.

## 10. Summary — our data advantage

We likely cannot beat MAWAQIT on mosque count at launch. We can beat everyone on **data transparency**: every displayed time and every mosque record shows its result, source, method, freshness, and confidence — and every alert shows proof it's armed. Competitors provide the number; we provide the number and the receipt.
