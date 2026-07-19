/**
 * Notification Assurance — Vaqit's core moat.
 *
 * Competitors show a notification toggle and hope. Vaqit proves the athan is
 * actually armed, records what fired, detects the conditions that silence it,
 * and can export a diagnostic so a failure is explainable instead of a mystery.
 *
 * This module holds the pure logic (types, risk scoring, status text, diagnostic
 * assembly). Platform I/O (scheduling, channels, storage) lives in
 * NotificationContext, which feeds this module plain data.
 */
import { Platform } from 'react-native';

/** One future alert we have committed to the OS scheduler. */
export interface LedgerEntry {
  key: string;         // prayer key
  time: string;        // ISO timestamp of the scheduled fire
  kind: 'athan' | 'reminder';
}

/** One notification we actually observed firing (best-effort; foreground/reachable). */
export interface FiredEntry {
  firedAt: string;     // ISO
  title: string;
}

export type RiskLevel = 'ok' | 'warn' | 'blocked';

export interface RiskFlag {
  id: string;
  level: Exclude<RiskLevel, 'ok'>;
  title: string;
  detail: string;
  /** Which fix affordance the UI should offer. */
  fix?: 'permission' | 'reschedule' | 'system-settings' | 'battery';
}

export interface AssuranceInputs {
  permission: 'granted' | 'denied' | 'undetermined';
  scheduledCount: number;
  nextScheduled: { key: string; time: string } | null;
  /** Android athan channel importance, if known (expo AndroidImportance enum). */
  channelImportance?: number | null;
  /** True when the athan channel exists but its sound was cleared/disabled. */
  channelSoundDisabled?: boolean;
}

export interface AssuranceStatus {
  level: RiskLevel;
  headline: string;
  detail: string;
}

// Expo AndroidImportance.HIGH === 4. Below that, heads-up + sound aren't guaranteed.
const ANDROID_IMPORTANCE_HIGH = 4;

/** Compute the actionable risks from observable state. */
export function computeRisks(input: AssuranceInputs): RiskFlag[] {
  const risks: RiskFlag[] = [];

  if (input.permission === 'denied') {
    risks.push({
      id: 'permission-denied',
      level: 'blocked',
      title: 'Notifications are blocked',
      detail: 'The system is blocking Vaqit from sending alerts. No athan can fire until this is enabled.',
      fix: 'system-settings',
    });
  } else if (input.permission === 'undetermined') {
    risks.push({
      id: 'permission-undetermined',
      level: 'warn',
      title: 'Notification permission not granted yet',
      detail: 'Grant permission so Vaqit can schedule your athan.',
      fix: 'permission',
    });
  }

  if (input.permission === 'granted' && input.scheduledCount === 0) {
    risks.push({
      id: 'none-scheduled',
      level: 'warn',
      title: 'No alerts are scheduled',
      detail: 'Nothing is currently armed. Reschedule to arm your upcoming prayers.',
      fix: 'reschedule',
    });
  }

  if (
    Platform.OS === 'android' &&
    input.permission === 'granted' &&
    typeof input.channelImportance === 'number' &&
    input.channelImportance < ANDROID_IMPORTANCE_HIGH
  ) {
    risks.push({
      id: 'channel-importance-low',
      level: 'warn',
      title: 'Athan alerts are set to a quiet importance',
      detail: 'Android has this notification category below “High”, so the athan may not sound or appear as a heads-up alert.',
      fix: 'system-settings',
    });
  }

  if (Platform.OS === 'android' && input.channelSoundDisabled) {
    risks.push({
      id: 'channel-sound-disabled',
      level: 'warn',
      title: 'Athan sound is turned off for this category',
      detail: 'The athan notification category has no sound set in Android settings.',
      fix: 'system-settings',
    });
  }

  return risks;
}

/** Roll risks + schedule into a single home-screen status line. */
export function computeAssurance(input: AssuranceInputs): AssuranceStatus {
  const risks = computeRisks(input);
  const blocked = risks.find(r => r.level === 'blocked');
  if (blocked) {
    return { level: 'blocked', headline: 'Action required', detail: blocked.title };
  }
  const warn = risks[0];
  if (warn) {
    return { level: 'warn', headline: 'Action required', detail: warn.title };
  }
  if (input.nextScheduled) {
    return {
      level: 'ok',
      headline: 'Alerts ready',
      detail: `Next: ${prayerLabel(input.nextScheduled.key)} ${formatClock(input.nextScheduled.time)}`,
    };
  }
  return { level: 'warn', headline: 'Action required', detail: 'No upcoming alert scheduled' };
}

function prayerLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Diagnostic report (the support superpower) ───────────────────────────────

export interface DiagnosticInputs extends AssuranceInputs {
  ledger: LedgerEntry[];
  fired: FiredEntry[];
  settingsSummary: Record<string, string | number>;
  appVersion: string;
}

/** How many past-due scheduled athans we can confirm actually fired. */
export function reliabilityStats(ledger: LedgerEntry[], fired: FiredEntry[], now = new Date()) {
  const elapsedAthans = ledger.filter(e => e.kind === 'athan' && new Date(e.time) < now);
  const confirmed = fired.length;
  return {
    expected: elapsedAthans.length,
    confirmed,
  };
}

/** Build a human-readable diagnostic report for support / self-check. */
export function buildDiagnosticText(input: DiagnosticInputs, now = new Date()): string {
  const stats = reliabilityStats(input.ledger, input.fired, now);
  const risks = computeRisks(input);
  const next5 = input.ledger
    .filter(e => new Date(e.time) >= now)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  const lines: string[] = [];
  lines.push('VAQIT — NOTIFICATION DIAGNOSTIC');
  lines.push(`Generated: ${now.toISOString()}`);
  lines.push(`App version: ${input.appVersion}`);
  lines.push(`Platform: ${Platform.OS} ${Platform.Version}`);
  lines.push('');
  lines.push('PERMISSION & SCHEDULE');
  lines.push(`  Permission: ${input.permission}`);
  lines.push(`  Scheduled (total): ${input.scheduledCount}`);
  if (Platform.OS === 'android') {
    lines.push(`  Athan channel importance: ${input.channelImportance ?? 'unknown'} (High = 4)`);
    lines.push(`  Athan channel sound disabled: ${input.channelSoundDisabled ? 'yes' : 'no'}`);
  }
  lines.push('');
  lines.push('NEXT 5 ARMED ALERTS');
  if (next5.length === 0) {
    lines.push('  (none)');
  } else {
    for (const e of next5) {
      lines.push(`  ${prayerLabel(e.key)} [${e.kind}] — ${new Date(e.time).toLocaleString()}`);
    }
  }
  lines.push('');
  lines.push('DELIVERY LEDGER');
  lines.push(`  Past-due athans expected: ${stats.expected}`);
  lines.push(`  Confirmed fired (observed by app): ${stats.confirmed}`);
  lines.push('  Note: background deliveries may fire without the app observing them;');
  lines.push('  "confirmed" counts only alerts the app could verify while reachable.');
  lines.push('');
  lines.push('RISKS DETECTED');
  if (risks.length === 0) {
    lines.push('  None — configuration looks healthy.');
  } else {
    for (const r of risks) {
      lines.push(`  [${r.level.toUpperCase()}] ${r.title} — ${r.detail}`);
    }
  }
  lines.push('');
  lines.push('SETTINGS');
  for (const [k, v] of Object.entries(input.settingsSummary)) {
    lines.push(`  ${k}: ${v}`);
  }
  return lines.join('\n');
}
