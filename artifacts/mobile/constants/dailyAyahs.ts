/**
 * "Ayah of the day" — one verse each day with a short reflection, delivered by a
 * local daily notification and shown on the Daily Ayah screen. On-device only.
 *
 * Same provenance discipline as Foundations: the Qur'an translation is the
 * widely used Sahih International rendering (attribute on display), and the
 * short reflections are DRAFTS pending scholar review before launch. Selection
 * is deterministic by day-of-year so everyone sees the same ayah on a given day
 * and it rotates through the list across the year.
 */

export interface DailyAyah {
  /** e.g. "Qur'an 2:286". */
  ref: string;
  translator: string;
  translation: string;
  /** Short plain-language reflection — DRAFT, pending scholar review. */
  reflection: string;
}

export const DAILY_AYAHS: DailyAyah[] = [
  {
    ref: 'Qur’an 2:286',
    translator: 'Sahih International',
    translation: 'Allah does not charge a soul except [with that within] its capacity.',
    reflection: 'Whatever you are carrying today, it was given to a soul able to bear it. You were not handed more than you can hold.',
  },
  {
    ref: 'Qur’an 94:5–6',
    translator: 'Sahih International',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    reflection: 'Ease is not promised after the hardship, but with it — travelling alongside the very thing that feels heavy right now.',
  },
  {
    ref: 'Qur’an 65:3',
    translator: 'Sahih International',
    translation: 'And whoever relies upon Allah — then He is sufficient for him.',
    reflection: 'To place your trust in Allah is to lean on the One who never runs short. He is enough.',
  },
  {
    ref: 'Qur’an 13:28',
    translator: 'Sahih International',
    translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    reflection: 'When the heart is restless, its rest is found in remembering Allah — not in doing more, but in turning back.',
  },
  {
    ref: 'Qur’an 2:152',
    translator: 'Sahih International',
    translation: 'So remember Me; I will remember you.',
    reflection: 'A small turning of the heart toward Allah is met by Him remembering you — a nearness offered for the asking.',
  },
  {
    ref: 'Qur’an 39:53',
    translator: 'Sahih International',
    translation: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
    reflection: 'No sin is bigger than His mercy. The door of return stays open, however far you feel you have wandered.',
  },
  {
    ref: 'Qur’an 40:60',
    translator: 'Sahih International',
    translation: 'Call upon Me; I will respond to you.',
    reflection: 'Du‘a is never one-sided. You are invited to ask, with the promise of a response — in His wisdom and timing.',
  },
  {
    ref: 'Qur’an 93:5',
    translator: 'Sahih International',
    translation: 'And your Lord is going to give you, and you will be satisfied.',
    reflection: 'A gentle promise: what is coming from your Lord will leave you content. Hold on.',
  },
  {
    ref: 'Qur’an 8:46',
    translator: 'Sahih International',
    translation: 'And be patient. Indeed, Allah is with the patient.',
    reflection: 'Patience is not passive waiting; it is where Allah’s companionship is promised to be.',
  },
  {
    ref: 'Qur’an 3:139',
    translator: 'Sahih International',
    translation: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
    reflection: 'Faith lifts the head. Setbacks are not the final word for the one whose trust is in Allah.',
  },
  {
    ref: 'Qur’an 14:7',
    translator: 'Sahih International',
    translation: 'If you are grateful, I will surely increase you [in favor].',
    reflection: 'Gratitude is not only good manners — it is a doorway to more. Notice one blessing today and thank Him for it.',
  },
  {
    ref: 'Qur’an 2:186',
    translator: 'Sahih International',
    translation: 'And when My servants ask you concerning Me — indeed I am near.',
    reflection: 'Between you and Allah there is no distance to cross. He is near when you call.',
  },
  {
    ref: 'Qur’an 16:97',
    translator: 'Sahih International',
    translation: 'Whoever does righteousness, whether male or female, while being a believer — We will surely cause him to live a good life.',
    reflection: 'A good life is tied not to circumstance but to sincere, faithful action — open to everyone.',
  },
  {
    ref: 'Qur’an 29:69',
    translator: 'Sahih International',
    translation: 'And those who strive for Us — We will surely guide them to Our ways.',
    reflection: 'Take one sincere step toward Allah and guidance meets you on the road. The striving is yours; the guiding is His.',
  },
  {
    ref: 'Qur’an 20:114',
    translator: 'Sahih International',
    translation: 'My Lord, increase me in knowledge.',
    reflection: 'A du‘a taught by Allah Himself: to keep growing, and to ask Him for it.',
  },
  {
    ref: 'Qur’an 3:173',
    translator: 'Sahih International',
    translation: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.',
    reflection: 'Words to steady a worried heart: hand the outcome to the One who arranges all affairs best.',
  },
  {
    ref: 'Qur’an 55:13',
    translator: 'Sahih International',
    translation: 'So which of the favors of your Lord would you deny?',
    reflection: 'A question repeated to wake us up: look around — the blessings are countless and constant.',
  },
  {
    ref: 'Qur’an 2:45',
    translator: 'Sahih International',
    translation: 'And seek help through patience and prayer.',
    reflection: 'Two tools for hard days, always within reach: steadiness, and standing before Allah.',
  },
  {
    ref: 'Qur’an 24:35',
    translator: 'Sahih International',
    translation: 'Allah is the light of the heavens and the earth.',
    reflection: 'Whatever darkness a day holds, its ultimate source of light is never in doubt.',
  },
  {
    ref: 'Qur’an 3:159',
    translator: 'Sahih International',
    translation: 'And when you have decided, then rely upon Allah.',
    reflection: 'Do your part — think, consult, choose — then trust. Effort and reliance belong together.',
  },
];

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

/** The ayah for a given day — deterministic, rotating through the list. */
export function getDailyAyah(date: Date = new Date()): DailyAyah {
  const idx = dayOfYear(date) % DAILY_AYAHS.length;
  return DAILY_AYAHS[idx] ?? DAILY_AYAHS[0]!;
}
