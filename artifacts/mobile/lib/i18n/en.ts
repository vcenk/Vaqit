/**
 * English catalog — the source of truth. Every other locale must provide the
 * same keys (enforced by the `Record<TKey, string>` type on tr/ar).
 *
 * Keys are flat and dotted by surface, e.g. 'today.nextPrayer'. Use {name}
 * placeholders for interpolation; see t() in ./index.ts.
 */
export const en = {
  // Tabs
  'tabs.today': 'Today',
  'tabs.tracker': 'Tracker',
  'tabs.qibla': 'Qibla',
  'tabs.settings': 'Settings',

  // Today
  'today.nextPrayer': 'Next Prayer',
  'today.prayerTimes': 'Prayer Times',
  'today.allComplete': 'All prayers complete',
  'today.fajrTomorrow': 'Fajr tomorrow at dawn',
  'today.tapHint': 'Tap any prayer to see how its time is calculated',
  'today.intervalElapsed': '{pct}% of interval elapsed',
  'today.traveling': 'Traveling?',
  'today.travelBody': 'You appear to be far from your saved location. Update prayer times?',
  'today.update': 'Update',
  'today.estimated': 'Estimated',

  // Assurance banner
  'assurance.ready': 'Alerts ready',
  'assurance.actionRequired': 'Action required',

  // Settings — section headers
  'settings.title': 'Settings',
  'settings.section.notifications': 'Notifications',
  'settings.section.location': 'Location',
  'settings.section.calculation': 'Prayer Calculation',
  'settings.section.fineTune': 'Fine-Tune Times',
  'settings.section.hijri': 'Hijri Calendar',
  'settings.section.privacy': 'Privacy',
  'settings.section.mosque': 'Mosque',
  'settings.section.language': 'Language',
  'settings.section.support': 'Support Vaqit',
  'settings.section.about': 'About',
  'settings.language.title': 'App Language',
  'settings.language.systemDefault': 'System default',

  // Common
  'common.done': 'Done',
  'common.cancel': 'Cancel',
} as const;

export type TKey = keyof typeof en;
