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

  // Tracker
  'tracker.title': 'Prayer Journal',
  'tracker.dayStreak': 'Day Streak',
  'tracker.bestStreak': 'Best Streak',
  'status.ontime': 'On Time',
  'status.late': 'Late',
  'status.missed': 'Missed',
  'status.jamaah': 'Jama’ah',

  // Qibla
  'qibla.subtitle': 'Direction toward the Kaaba',
  'qibla.fromNorth': 'from North',
  'qibla.kmToMecca': 'km to Mecca',
  'qibla.noMagnetometer': 'Magnetometer not available on this device',
  'qibla.webCompass': 'Live compass requires a real device',

  // Onboarding
  'onboarding.welcome.subtitle': 'A Muslim prayer companion built on trust',
  'onboarding.principle.noAds': 'No ads — ever',
  'onboarding.principle.onDevice': 'Your data stays on your device',
  'onboarding.principle.reliableAthan': 'Athan alerts you can verify',
  'onboarding.getStarted': 'Get Started',
  'onboarding.location.title': 'Where are you praying?',
  'onboarding.location.subtitle': 'Accurate prayer times need your location',
  'onboarding.currentLocation': 'Current location',
  'onboarding.detecting': 'Detecting…',
  'onboarding.calcMethod': 'Calculation method',
  'onboarding.continue': 'Continue',
  'onboarding.notif.title': 'Never miss a prayer',
  'onboarding.notif.subtitle': 'Reliable athan notifications are the heart of Vaqit',
  'onboarding.feature.athanEvery': 'Athan at every prayer time',
  'onboarding.feature.preReminders': 'Optional pre-prayer reminders',
  'onboarding.feature.perPrayer': 'Per-prayer control in settings',
  'onboarding.enabled': 'Notifications enabled — you’re all set',
  'onboarding.enableAthan': 'Enable Athan Notifications',
  'onboarding.enabling': 'Enabling…',
  'onboarding.skip': 'Skip for now',

  // Common
  'common.done': 'Done',
  'common.cancel': 'Cancel',
  'common.today': 'Today',
} as const;

export type TKey = keyof typeof en;
