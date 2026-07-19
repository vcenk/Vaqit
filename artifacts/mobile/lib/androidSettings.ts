/**
 * Precise deep-links into the Android settings screens that silence the athan.
 *
 * This is the actionable half of the Notification Assurance moat: expo-notifications
 * already reschedules on reboot, but on Android 12+ it falls back to *inexact*
 * alarms when the "Alarms & reminders" (SCHEDULE_EXACT_ALARM) permission isn't
 * granted — which is the classic "Fajr fired 40 minutes late" bug. We can't fix
 * that silently; we take the user straight to the switch.
 *
 * Every call falls back to the generic app-settings screen if the specific
 * intent isn't available on a given OEM build.
 */
import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';

const pkg = Application.applicationId ?? 'com.vaqit.app';

async function launch(action: string, params?: IntentLauncher.IntentLauncherParams): Promise<void> {
  if (Platform.OS !== 'android') {
    try { await Linking.openSettings(); } catch {}
    return;
  }
  try {
    await IntentLauncher.startActivityAsync(action, params);
  } catch {
    // OEM without this exact screen → generic app details, then all-settings.
    try {
      await IntentLauncher.startActivityAsync(
        'android.settings.APPLICATION_DETAILS_SETTINGS',
        { data: `package:${pkg}` },
      );
    } catch {
      try { await Linking.openSettings(); } catch {}
    }
  }
}

/** Android 12+ "Alarms & reminders" toggle — the exact-alarm permission. */
export function openExactAlarmSettings(): Promise<void> {
  return launch('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', { data: `package:${pkg}` });
}

/** Battery optimization list — remove Vaqit so it isn't slept overnight. */
export function openBatterySettings(): Promise<void> {
  return launch('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
}

/** This app's notification settings (channels, importance, sound). */
export function openAppNotificationSettings(): Promise<void> {
  return launch('android.settings.APP_NOTIFICATION_SETTINGS', {
    extra: { 'android.provider.extra.APP_PACKAGE': pkg },
  });
}

/** Generic app details screen. */
export function openAppDetails(): Promise<void> {
  return launch('android.settings.APPLICATION_DETAILS_SETTINGS', { data: `package:${pkg}` });
}
