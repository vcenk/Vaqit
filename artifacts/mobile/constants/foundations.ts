/**
 * "Foundations" — short, sourced answers to the questions people actually ask
 * ("why is pork forbidden?", "why five prayers?"). NOT a Qur'an reader: only
 * the specific ayahs a topic cites are shown, always with their reference and
 * translator, in keeping with Vaqit's provenance promise.
 *
 * These are DRAFTS. Every topic ships with reviewStatus 'pending' and must be
 * signed off by a qualified scholar before it is presented as authoritative
 * (see docs/05 religious-liability gate). Qur'an translations here are the
 * widely used Sahih International rendering — attribute on display. Hadith are
 * referenced at the collection level on purpose; exact numbers/grades are to be
 * confirmed in review rather than guessed.
 */

export type SourceKind = 'quran' | 'hadith' | 'scholar';

export interface FoundationSource {
  kind: SourceKind;
  /** Human reference, e.g. "Qur'an 2:173" or "Sahih al-Bukhari & Muslim". */
  ref: string;
  /** Translator/edition for Qur'an, e.g. "Sahih International". */
  translator?: string;
  /** Authentication grade for hadith, when confirmed. */
  grade?: string;
  /** The quoted text (kept short). */
  text: string;
}

export type FoundationCategory = 'worship' | 'wealth' | 'food' | 'beliefs';

export interface FoundationTopic {
  id: string;
  category: FoundationCategory;
  icon: string; // Ionicons name
  question: string;
  summary: string;
  /** Plain-language answer; references named inline. */
  intro: string;
  sources: FoundationSource[];
  /** Secondary "wisdoms sometimes mentioned" — never presented as the cause. */
  wisdoms?: string;
  reviewStatus: 'pending' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: string;
}

export const FOUNDATION_CATEGORY_ICON: Record<FoundationCategory, string> = {
  worship: 'moon-outline',
  wealth: 'cash-outline',
  food: 'restaurant-outline',
  beliefs: 'sparkles-outline',
};

export const FOUNDATION_TOPICS: FoundationTopic[] = [
  {
    id: 'pork',
    category: 'food',
    icon: 'restaurant-outline',
    question: 'Why is pork forbidden?',
    summary: 'The Qur’an forbids it directly — and the basis is the command itself.',
    intro:
      'Pork is one of a few foods the Qur’an names as forbidden. Muslims avoid it first and foremost because Allah commanded it — not because of a proven physical reason. Scholars stress that the ruling rests on the command itself; any “wisdom” behind it is secondary and is not why we obey.',
    sources: [
      {
        kind: 'quran',
        ref: 'Qur’an 2:173',
        translator: 'Sahih International',
        text: 'He has only forbidden to you dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah.',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 5:3',
        translator: 'Sahih International',
        text: 'Prohibited to you are dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah.',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 6:145 · 16:115',
        translator: 'Sahih International',
        text: 'The same prohibition is repeated, underlining that it is a fixed command.',
      },
    ],
    wisdoms:
      'Some writers mention possible wisdoms (such as avoiding harm), but these are not established as the cause. Reducing the ruling to health claims is discouraged, because obedience — not a physical reason — is the basis.',
    reviewStatus: 'pending',
  },
  {
    id: 'five-prayers',
    category: 'worship',
    icon: 'time-outline',
    question: 'Why do Muslims pray five times a day?',
    summary: 'Fixed times keep the heart connected to Allah through the whole day.',
    intro:
      'Prayer (salah) is a direct link between a person and Allah. It is set at fixed times so that remembrance runs through the entire day — from dawn to night — rather than being left to mood. The Qur’an ties prayer to the remembrance of Allah and to specified, appointed times.',
    sources: [
      {
        kind: 'quran',
        ref: 'Qur’an 4:103',
        translator: 'Sahih International',
        text: 'Indeed, prayer has been decreed upon the believers a decree of specified times.',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 20:14',
        translator: 'Sahih International',
        text: 'Indeed, I am Allah… so worship Me and establish prayer for My remembrance.',
      },
      {
        kind: 'hadith',
        ref: 'Sahih al-Bukhari & Muslim (the Night Journey)',
        text: 'The five daily prayers were established for the believers, as narrated in the accounts of the Isra and Mi‘raj.',
      },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'riba',
    category: 'wealth',
    icon: 'cash-outline',
    question: 'Why is interest (riba) forbidden?',
    summary: 'Islam forbids guaranteed gain from lending, favouring real trade and shared risk.',
    intro:
      'Riba — a guaranteed increase charged for lending money, or an unequal exchange of the same commodity — is firmly forbidden. The Qur’an contrasts it with trade: profit earned by sharing real risk is allowed, but income guaranteed simply for the passage of time on a loan is not. The prohibition is tied to justice and to protecting people from exploitation.',
    sources: [
      {
        kind: 'quran',
        ref: 'Qur’an 2:275',
        translator: 'Sahih International',
        text: 'But Allah has permitted trade and has forbidden interest.',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 2:278–279',
        translator: 'Sahih International',
        text: 'O you who have believed, fear Allah and give up what remains of interest, if you should be believers.',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 3:130',
        translator: 'Sahih International',
        text: 'O you who have believed, do not consume usury, doubled and multiplied.',
      },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'fasting',
    category: 'worship',
    icon: 'moon-outline',
    question: 'Why fast in Ramadan?',
    summary: 'Fasting trains God-consciousness (taqwa), gratitude, and empathy.',
    intro:
      'Fasting in Ramadan is prescribed to build taqwa — God-consciousness. By stepping back from food, drink, and desires from dawn to sunset, a person practises self-restraint, grows in gratitude for everyday blessings, and feels the hunger of those with less. The Qur’an states this purpose plainly and ties Ramadan to the revelation of the Qur’an itself.',
    sources: [
      {
        kind: 'quran',
        ref: 'Qur’an 2:183',
        translator: 'Sahih International',
        text: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous (attain taqwa).',
      },
      {
        kind: 'quran',
        ref: 'Qur’an 2:185',
        translator: 'Sahih International',
        text: 'The month of Ramadan [is that] in which was revealed the Qur’an, a guidance for the people.',
      },
    ],
    reviewStatus: 'pending',
  },
];

export function getFoundationTopic(id: string | undefined): FoundationTopic | null {
  if (!id) return null;
  return FOUNDATION_TOPICS.find((t) => t.id === id) ?? null;
}
