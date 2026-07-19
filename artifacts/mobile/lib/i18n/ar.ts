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

  'common.done': 'تم',
  'common.cancel': 'إلغاء',
};
