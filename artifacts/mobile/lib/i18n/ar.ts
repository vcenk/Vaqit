import type { TKey } from './en';

/**
 * Arabic (العربية). RTL. UI-string translations are best-effort and should be
 * reviewed by a native speaker before an Arabic-market launch.
 */
export const ar: Record<TKey, string> = {
  'tabs.today': 'اليوم',
  'tabs.tracker': 'المتابعة',
  'tabs.qibla': 'القبلة',
  'tabs.settings': 'الإعدادات',

  'today.nextPrayer': 'الصلاة القادمة',
  'today.prayerTimes': 'مواقيت الصلاة',
  'today.allComplete': 'اكتملت جميع الصلوات',
  'today.fajrTomorrow': 'الفجر غدًا عند الفجر',
  'today.tapHint': 'اضغط على أي صلاة لمعرفة كيفية حساب وقتها',
  'today.intervalElapsed': 'مضى {pct}٪ من الفترة',
  'today.traveling': 'هل أنت مسافر؟',
  'today.travelBody': 'يبدو أنك بعيد عن موقعك المحفوظ. هل تريد تحديث المواقيت؟',
  'today.update': 'تحديث',
  'today.estimated': 'تقديري',

  'assurance.ready': 'التنبيهات جاهزة',
  'assurance.actionRequired': 'إجراء مطلوب',

  'settings.title': 'الإعدادات',
  'settings.section.notifications': 'الإشعارات',
  'settings.section.location': 'الموقع',
  'settings.section.calculation': 'حساب المواقيت',
  'settings.section.fineTune': 'ضبط المواقيت',
  'settings.section.hijri': 'التقويم الهجري',
  'settings.section.privacy': 'الخصوصية',
  'settings.section.mosque': 'المسجد',
  'settings.section.language': 'اللغة',
  'settings.section.support': 'ادعم Vaqit',
  'settings.section.about': 'حول',
  'settings.language.title': 'لغة التطبيق',
  'settings.language.systemDefault': 'إعداد النظام',

  'tracker.title': 'سجل الصلاة',
  'tracker.dayStreak': 'سلسلة الأيام',
  'tracker.bestStreak': 'أفضل سلسلة',
  'status.ontime': 'في وقتها',
  'status.late': 'متأخرة',
  'status.missed': 'فائتة',
  'status.jamaah': 'جماعة',

  'qibla.subtitle': 'الاتجاه نحو الكعبة',
  'qibla.fromNorth': 'من الشمال',
  'qibla.kmToMecca': 'كم إلى مكة',
  'qibla.noMagnetometer': 'مستشعر البوصلة غير متوفر على هذا الجهاز',
  'qibla.webCompass': 'البوصلة المباشرة تتطلب جهازًا حقيقيًا',

  'onboarding.welcome.subtitle': 'رفيق صلاة للمسلمين مبني على الثقة',
  'onboarding.principle.noAds': 'لا إعلانات أبدًا',
  'onboarding.principle.onDevice': 'بياناتك تبقى على جهازك',
  'onboarding.principle.reliableAthan': 'تنبيهات أذان يمكنك التحقق منها',
  'onboarding.getStarted': 'ابدأ',
  'onboarding.location.title': 'أين تصلي؟',
  'onboarding.location.subtitle': 'تحتاج مواقيت الصلاة الدقيقة إلى موقعك',
  'onboarding.currentLocation': 'الموقع الحالي',
  'onboarding.detecting': 'جارٍ التحديد…',
  'onboarding.calcMethod': 'طريقة الحساب',
  'onboarding.continue': 'متابعة',
  'onboarding.notif.title': 'لا تفوّت صلاة',
  'onboarding.notif.subtitle': 'تنبيهات الأذان الموثوقة هي قلب Vaqit',
  'onboarding.feature.athanEvery': 'أذان في كل وقت صلاة',
  'onboarding.feature.preReminders': 'تذكيرات اختيارية قبل الصلاة',
  'onboarding.feature.perPrayer': 'تحكّم بكل صلاة في الإعدادات',
  'onboarding.enabled': 'تم تفعيل التنبيهات — أنت جاهز',
  'onboarding.enableAthan': 'تفعيل تنبيهات الأذان',
  'onboarding.enabling': 'جارٍ التفعيل…',
  'onboarding.skip': 'تخطٍّ الآن',

  'common.done': 'تم',
  'common.cancel': 'إلغاء',
  'common.today': 'اليوم',
};
