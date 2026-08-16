# 09 — Foundations content plan (the "why" library)

The **Foundations** feature answers the questions people actually ask, each from the Qur'an and Sunnah **with sources shown** (not a Qur'an reader). This doc is the roadmap to scale it to hundreds of topics **responsibly**.

## Non-negotiable rules (why we don't just auto-generate hundreds)

1. **Every claim carries its source** — ayah number + translator, hadith collection/number/**grade**, or named scholar. No unsourced assertions.
2. **Drafts ship as `reviewStatus: 'pending'`** with a visible badge and are **scholar-reviewed before** being presented as authoritative (docs/05 religious-liability gate).
3. **Qur'an text comes from a licensed source** (Tanzil bundle or Quran Foundation API), never typed from memory at scale — hand-typing hundreds of ayahs guarantees citation errors, the exact un-provenance this app exists to fix.
4. **Hadith** are pulled from Sunnah.com with their grade; if the exact number/grade isn't confirmed, cite at collection level and mark for review — never invent a number or grade.
5. **Framing discipline**: state the command + evidence first; label wisdoms/benefits as *secondary*; surface differences of opinion; always offer "ask a qualified scholar". Avoid personalised fatwa.
6. **Sensitive topics** (see list) get scholar sign-off *before* drafting, not after.

## Pipeline to reach hundreds

1. Pick a topic from the catalog below.
2. Pull the cited ayahs from the licensed Qur'an source by reference (script, not by hand).
3. Draft a 2–4 sentence plain-language intro + the "wisdoms/consult" notes.
4. Add hadith from Sunnah.com with grade where relevant.
5. Ship as `pending`; scholar reviews in batches; flip to `reviewed` with `reviewedBy`/`reviewedAt`.
6. Localise per language **as its own reviewed step** (a translation of a ruling is itself sensitive).

## Shipped so far (15 drafts, `pending`)

Belief: purpose of life · hope in Allah's mercy. Worship: five daily prayers · fasting in Ramadan · Hajj. Character: backbiting · honesty · patience. Family: kindness to parents · marriage. Wealth: riba (interest) · zakat · gambling. Food: pork · alcohol.

## Catalog — the backlog (draft these in reviewed batches)

### Belief & God (aqidah)
Who is Allah (tawhid)? · Why does God allow suffering? · What happens after death? · What is the barzakh? · Are angels real, and what do they do? · Why believe in prophets? · Is the Qur'an really preserved unchanged? · What is qadar (divine decree) and do we have free will? · What is the purpose of Iblees/Satan? · Why is shirk the gravest sin? · What is fitrah (the natural disposition)? · Why do Muslims say "InshaAllah"?

### Worship (ibadah)
Why wudu before prayer? · What does Fajr / Dhuhr / Asr / Maghrib / Isha each mean? · Why face the Kaaba? · Why pray in congregation? · What is the Friday prayer (Jumu'ah)? · Why the call to prayer (adhan)? · What is dhikr and why repeat it? · Why recite the Qur'an in Arabic? · What is i'tikaf? · Why the night prayer (tahajjud/qiyam)? · What are the two Eids? · Why sacrifice on Eid al-Adha (udhiyah)?

### Character & ethics (akhlaq)
Why control anger? · Why is arrogance condemned? · Why keep promises? · Why is envy (hasad) harmful? · Why forgive others? · Why is gratitude (shukr) emphasised? · Why guard the tongue? · Why is modesty (haya) praised? · Why help the poor and orphan? · Why is justice central? · Why avoid suspicion and spying? · Why is patience with people part of faith?

### Family & society
Rights of children · rights of neighbours · why maintain family ties (silat ar-rahm)? · why is kindness to spouses stressed? · Islam's view of women's dignity · why the emphasis on community (ummah)? · why greeting with salam? · why visit the sick? · rights of the elderly · why is orphan care rewarded so highly?

### Wealth & work
Why is honest trade honoured? · what makes income halal vs haram? · why is hoarding discouraged? · why sadaqah beyond zakat? · why fulfil contracts and debts? · why is bribery forbidden? · why is cheating in measure/weight condemned? · Islam's view of moderation in spending.

### Food & daily life
Why halal slaughter? · what makes meat halal? · why say Bismillah before eating? · why avoid waste/israf? · why is cleanliness "half of faith"? · Islam's view of animals and mercy to them · why the right hand for eating? · why is intoxication (not just alcohol) the issue?

### Ramadan & the calendar (seasonal — high traffic)
Why does Ramadan move each year? · what is Laylat al-Qadr? · why suhoor and iftar? · who is exempt from fasting? · what breaks the fast? · why fitrana (zakat al-fitr)? · what are the sacred months? · why is the Hijri calendar lunar? · what is Ashura? · what is the month of Dhul-Hijjah?

### Difficult / modern questions (handle with extra care)
Why five prayers and not more or fewer? · Islam and other faiths (People of the Book) · why is interest so strict when banks are everywhere? · Islam's view of mental health and seeking help · grief and loss in Islam · repentance after a major sin · doubt and questioning faith.

## Sensitive topics — scholar sign-off BEFORE drafting

Hijab/modesty rulings · gender roles & rights · jihad (define precisely; counter misuse) · apostasy · Islam vs other religions · music · anything on hudud/punishments · sectarian differences · contested fiqh (where madhhabs differ materially). These are high-misunderstanding, high-liability — do not ship drafts without review.

## Related

Sources & licensing: `docs/08-data-and-calculations.md` (Tanzil, Quran Foundation API, Sunnah.com). Monetisation/liability gate: `docs/05-monetization.md`.
