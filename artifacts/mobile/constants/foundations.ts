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

export type FoundationCategory = 'worship' | 'wealth' | 'food' | 'beliefs' | 'character' | 'family';

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
  character: 'heart-outline',
  family: 'people-outline',
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
  {
    id: 'hajj',
    category: 'worship',
    icon: 'compass-outline',
    question: 'Why perform Hajj?',
    summary: 'A once-in-a-lifetime pilgrimage that gathers Muslims as equals before Allah.',
    intro:
      'Hajj is the pilgrimage to the Kaaba in Makkah, obligatory once for every Muslim who is able. It answers a call that goes back to the Prophet Ibrahim, strips away rank and wealth so all stand equal in simple garments, and renews a person’s devotion to Allah.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 3:97', translator: 'Sahih International', text: 'And [due] to Allah from the people is a pilgrimage to the House — for whoever is able to find thereto a way.' },
      { kind: 'quran', ref: 'Qur’an 22:27', translator: 'Sahih International', text: 'And proclaim to the people the Hajj [pilgrimage]; they will come to you on foot and on every lean camel.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'zakat',
    category: 'wealth',
    icon: 'cash-outline',
    question: 'Why give zakat?',
    summary: 'It purifies wealth and returns a due share to those in need — a right, not a favour.',
    intro:
      'Zakat is a yearly portion of eligible wealth (about 2.5%) given to those entitled to it. It purifies wealth and the heart from greed, and treats a share of what one has as a right owed to the poor rather than charity given as a favour.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 9:103', translator: 'Sahih International', text: 'Take, [O Muhammad], from their wealth a charity by which you purify them and cause them increase.' },
      { kind: 'quran', ref: 'Qur’an 2:110', translator: 'Sahih International', text: 'And establish prayer and give zakah, and whatever good you put forward for yourselves — you will find it with Allah.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'alcohol',
    category: 'food',
    icon: 'wine-outline',
    question: 'Why is alcohol forbidden?',
    summary: 'Intoxicants cloud the mind and turn people from prayer — the Qur’an calls them to be avoided.',
    intro:
      'Intoxicants (khamr) are forbidden because they cloud the mind, turn a person away from prayer and the remembrance of Allah, and breed harm and enmity. The Qur’an names them, together with gambling, as something to be avoided entirely.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 5:90', translator: 'Sahih International', text: 'O you who have believed, indeed, intoxicants, gambling, [sacrificing on] stone altars… are but defilement from the work of Satan, so avoid it.' },
      { kind: 'quran', ref: 'Qur’an 2:219', translator: 'Sahih International', text: 'In them is great sin and [yet, some] benefit for people. But their sin is greater than their benefit.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'gambling',
    category: 'wealth',
    icon: 'dice-outline',
    question: 'Why is gambling forbidden?',
    summary: 'Unearned gain at another’s loss breeds harm and enmity, and distracts from prayer.',
    intro:
      'Gambling (maysir) is forbidden because it seeks gain at another’s loss without real work or shared risk, and it breeds addiction, enmity, and neglect of prayer. The Qur’an pairs it with intoxicants as the work of Satan to be avoided.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 5:90–91', translator: 'Sahih International', text: '…intoxicants and gambling… Satan only wants to cause between you animosity and hatred… and to avert you from the remembrance of Allah and from prayer.' },
      { kind: 'quran', ref: 'Qur’an 2:219', translator: 'Sahih International', text: 'They ask you about wine and gambling. Say, “In them is great sin…”' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'purpose-of-life',
    category: 'beliefs',
    icon: 'sparkles-outline',
    question: 'What is the purpose of life?',
    summary: 'To know and worship Allah — and to be tested in doing what is best.',
    intro:
      'In Islam, the purpose of life is to know Allah and to worship Him — a worship that includes prayer but also honesty, kindness, and every good deed done for His sake. Life is described as a test of who acts best.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 51:56', translator: 'Sahih International', text: 'And I did not create the jinn and mankind except to worship Me.' },
      { kind: 'quran', ref: 'Qur’an 67:2', translator: 'Sahih International', text: '[He] who created death and life to test you [as to] which of you is best in deed.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'hope-in-mercy',
    category: 'beliefs',
    icon: 'heart-circle-outline',
    question: 'Why should I never lose hope in Allah’s mercy?',
    summary: 'The Qur’an tells those who have sinned not to despair — Allah forgives all sins.',
    intro:
      'No matter what a person has done, Islam forbids despair of Allah’s mercy. The door of turning back (tawbah) is always open, and the Qur’an addresses even those who have wronged themselves with reassurance rather than rejection.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 39:53', translator: 'Sahih International', text: 'Say, “O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.”' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'parents',
    category: 'family',
    icon: 'people-outline',
    question: 'Why does Islam stress kindness to parents?',
    summary: 'Right after worshipping Allah, the Qur’an commands good treatment of parents.',
    intro:
      'Honouring one’s parents is placed by the Qur’an directly after the worship of Allah. Even a word of impatience is discouraged; instead a believer is asked to lower the wing of humility and mercy toward them, especially in their old age.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 17:23', translator: 'Sahih International', text: 'And your Lord has decreed that you worship none but Him, and to parents, good treatment…' },
      { kind: 'quran', ref: 'Qur’an 31:14', translator: 'Sahih International', text: 'And We have enjoined upon man [care] for his parents.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'marriage',
    category: 'family',
    icon: 'heart-outline',
    question: 'Why does Islam encourage marriage?',
    summary: 'A bond of tranquillity, affection, and mercy — described as a sign of Allah.',
    intro:
      'Marriage in Islam is a means of tranquillity, companionship, and building a family in a lawful, dignified way. The Qur’an describes the love and mercy placed between spouses as one of the signs of Allah.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 30:21', translator: 'Sahih International', text: 'And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'backbiting',
    category: 'character',
    icon: 'chatbubble-ellipses-outline',
    question: 'Why is backbiting forbidden?',
    summary: 'Speaking ill of an absent person is likened to eating their flesh.',
    intro:
      'Backbiting (gheebah) — saying about someone, in their absence, what they would dislike — is firmly forbidden. The Qur’an gives a striking image to show how ugly it is, and pairs the prohibition with a call to avoid suspicion and spying.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 49:12', translator: 'Sahih International', text: 'And do not backbite one another. Would one of you like to eat the flesh of his dead brother? You would detest it.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'honesty',
    category: 'character',
    icon: 'shield-checkmark-outline',
    question: 'Why does Islam emphasise honesty?',
    summary: 'Truthfulness is commanded, and a believer is asked to stand with the truthful.',
    intro:
      'Truthfulness is a core Muslim trait: in speech, dealings, and promises. The Qur’an ties being conscious of Allah to standing with the truthful and speaking words that are upright.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 9:119', translator: 'Sahih International', text: 'O you who have believed, fear Allah and be with those who are true.' },
      { kind: 'quran', ref: 'Qur’an 33:70', translator: 'Sahih International', text: 'O you who have believed, fear Allah and speak words of appropriate justice.' },
    ],
    reviewStatus: 'pending',
  },
  {
    id: 'patience',
    category: 'character',
    icon: 'hourglass-outline',
    question: 'Why is patience (sabr) so valued?',
    summary: 'Patience and prayer are named as the believer’s source of strength.',
    intro:
      'Patience (sabr) — steadiness through hardship, restraint from wrong, and perseverance in good — is deeply praised in Islam. The Qur’an pairs it with prayer as the way to seek help, and promises that Allah is with the patient.',
    sources: [
      { kind: 'quran', ref: 'Qur’an 2:153', translator: 'Sahih International', text: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' },
    ],
    reviewStatus: 'pending',
  },
];

export function getFoundationTopic(id: string | undefined): FoundationTopic | null {
  if (!id) return null;
  return FOUNDATION_TOPICS.find((t) => t.id === id) ?? null;
}
