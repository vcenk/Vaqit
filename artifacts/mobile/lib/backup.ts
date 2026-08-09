/**
 * On-device backup & restore — the answer to "what happens to my prayer
 * history when I get a new phone?" without adding a database or an account.
 *
 * A backup is a plain JSON snapshot of the app's local storage. The user
 * exports it through the OS share sheet (save to Files, email it to themselves,
 * AirDrop) and pastes it back on a new device. Nothing leaves the phone unless
 * the user chooses to share it — consistent with the privacy promise.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Keys included in a portable backup. Supporter status is intentionally
 * excluded — entitlements come from the store (RevenueCat), never a file a
 * user could edit to unlock Supporter.
 */
export const BACKUP_KEYS = [
  'vaqit_settings_v1',
  'vaqit_tracker_v1',
  'vaqit_tracker_exempt_v1',
  'vaqit_ramadan_v1',
  'vaqit_mosque_v2',
  'vaqit_mosque_v1',
  'vaqit_notif_settings_v1',
  'vaqit_locale_v1',
  'vaqit_onboarding_done',
] as const;

export const BACKUP_MAGIC = 'vaqit-backup';
export const BACKUP_VERSION = 1;

export interface VaqitBackup {
  app: typeof BACKUP_MAGIC;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

/** Gather all backed-up keys into a pretty-printed JSON string. */
export async function buildBackup(nowIso: string): Promise<string> {
  const entries = await AsyncStorage.multiGet(BACKUP_KEYS as unknown as string[]);
  const data: Record<string, string> = {};
  for (const [k, v] of entries) {
    if (v != null) data[k] = v;
  }
  const backup: VaqitBackup = {
    app: BACKUP_MAGIC,
    version: BACKUP_VERSION,
    exportedAt: nowIso,
    data,
  };
  return JSON.stringify(backup, null, 2);
}

export type RestoreError = 'not-json' | 'invalid' | 'empty';

export interface RestoreResult {
  restored: number;
}

/**
 * Validate and write a backup back into local storage. Only known keys are
 * restored; unknown keys in the file are ignored. Throws a RestoreError string
 * on malformed input so the UI can show a specific message.
 */
export async function restoreBackup(json: string): Promise<RestoreResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('not-json' satisfies RestoreError);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalid' satisfies RestoreError);
  }
  const b = parsed as Partial<VaqitBackup>;
  if (b.app !== BACKUP_MAGIC || !b.data || typeof b.data !== 'object') {
    throw new Error('invalid' satisfies RestoreError);
  }
  const source = b.data as Record<string, unknown>;
  const pairs: [string, string][] = [];
  for (const key of BACKUP_KEYS) {
    const val = source[key];
    if (typeof val === 'string') pairs.push([key, val]);
  }
  if (pairs.length === 0) {
    throw new Error('empty' satisfies RestoreError);
  }
  await AsyncStorage.multiSet(pairs);
  return { restored: pairs.length };
}
