import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/context/NotificationContext';
import { usePrayer } from '@/context/PrayerContext';
import { PRAYER_DISPLAY_NAMES, formatTime } from '@/constants/prayers';
import type { RiskFlag } from '@/lib/notificationAssurance';
import {
  openExactAlarmSettings,
  openBatterySettings,
  openAppNotificationSettings,
} from '@/lib/androidSettings';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function Card({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[card.wrap, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
      {children}
    </Text>
  );
}

export default function NotificationHealthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    permissionStatus,
    requestPermission,
    scheduleAll,
    sendTestNotification,
    scheduledCount,
    refreshScheduledCount,
    ledger,
    fired,
    nextScheduled,
    assurance,
    risks,
    reliability,
    buildDiagnostic,
  } = useNotifications();
  const { settings } = usePrayer();

  const [testSent, setTestSent] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { refreshScheduledCount(); }, []);

  const handleTest = async () => {
    await sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 8000);
  };

  const handleReschedule = async () => {
    setScheduling(true);
    await scheduleAll(settings);
    await refreshScheduledCount();
    setScheduling(false);
  };

  const runFix = (fix: RiskFlag['fix']) => {
    if (fix === 'permission') requestPermission();
    else if (fix === 'reschedule') handleReschedule();
    else if (fix === 'battery') openBatterySettings();
    else openAppNotificationSettings();
  };

  const exportDiagnostic = async () => {
    const text = buildDiagnostic(settings, APP_VERSION);
    try {
      await Share.share({ message: text, title: 'Vaqit Notification Diagnostic' });
    } catch {}
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const statusTint =
    assurance.level === 'ok' ? colors.primary : assurance.level === 'blocked' ? colors.destructive : colors.accent;

  const upcoming = ledger
    .filter(e => new Date(e.time).getTime() > Date.now())
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Settings</Text>
      </Pressable>

      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Notification Health</Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Proof your athan is armed — and a diagnostic when it isn’t
      </Text>

      {/* Overall status */}
      <View style={[s.statusCard, { backgroundColor: statusTint + '18', borderColor: statusTint + '55', borderRadius: colors.radius }]}>
        <Ionicons
          name={assurance.level === 'ok' ? 'checkmark-circle' : assurance.level === 'blocked' ? 'alert-circle' : 'warning'}
          size={26}
          color={statusTint}
        />
        <View style={{ flex: 1 }}>
          <Text style={[s.statusHeadline, { color: statusTint, fontFamily: 'Inter_700Bold' }]}>{assurance.headline}</Text>
          <Text style={[s.statusDetail, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{assurance.detail}</Text>
        </View>
      </View>

      {/* Exact alarms — the Android 12+ reliability lever (can't be read from JS,
          so we guide proactively rather than warn falsely). */}
      {Platform.OS === 'android' && (
        <>
          <SectionLabel>EXACT ALARMS</SectionLabel>
          <Card>
            <View style={[row.wrap, { alignItems: 'flex-start' }]}>
              <View style={[row.icon, { backgroundColor: colors.accent + '22', marginTop: 2 }]}>
                <Ionicons name="alarm-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                  Allow “Alarms &amp; reminders”
                </Text>
                <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 18 }]}>
                  On Android 12+, without this permission the system may deliver the athan minutes — or hours — late, especially overnight for Fajr. Tap to allow exact alarms for Vaqit.
                </Text>
              </View>
            </View>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <Pressable style={[s.actionBtn, { backgroundColor: colors.accent }]} onPress={openExactAlarmSettings}>
              <Ionicons name="alarm" size={18} color="#000000" />
              <Text style={[s.actionBtnText, { color: '#000000', fontFamily: 'Inter_600SemiBold' }]}>Allow Exact Alarms</Text>
            </Pressable>
          </Card>
        </>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <>
          <SectionLabel>ACTION NEEDED</SectionLabel>
          <Card>
            {risks.map((r, idx) => (
              <View key={r.id}>
                <View style={[row.wrap, { alignItems: 'flex-start' }]}>
                  <View style={[row.icon, { backgroundColor: (r.level === 'blocked' ? colors.destructive : colors.accent) + '22', marginTop: 2 }]}>
                    <Ionicons name={r.level === 'blocked' ? 'close-circle' : 'warning'} size={18} color={r.level === 'blocked' ? colors.destructive : colors.accent} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{r.title}</Text>
                    <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 18 }]}>{r.detail}</Text>
                    {r.fix && (
                      <Pressable style={[s.fixBtn, { backgroundColor: colors.primary }]} onPress={() => runFix(r.fix)}>
                        <Text style={[s.fixText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
                          {r.fix === 'permission' ? 'Enable notifications' : r.fix === 'reschedule' ? 'Reschedule now' : 'Open system settings'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                {idx < risks.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Test */}
      <SectionLabel>TEST</SectionLabel>
      <Card>
        <View style={row.wrap}>
          <View style={[row.icon, { backgroundColor: colors.accent + '22' }]}>
            <Ionicons name="alarm-outline" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>Send test athan</Text>
            <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {testSent ? 'Arriving in 5 seconds — stay in the app' : 'Fires a test notification in 5 seconds'}
            </Text>
          </View>
        </View>
        {permissionStatus === 'granted' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <Pressable style={[s.actionBtn, { backgroundColor: testSent ? colors.muted : colors.accent }]} onPress={handleTest} disabled={testSent}>
              <Ionicons name={testSent ? 'checkmark-circle' : 'notifications'} size={18} color={testSent ? colors.mutedForeground : '#000000'} />
              <Text style={[s.actionBtnText, { color: testSent ? colors.mutedForeground : '#000000', fontFamily: 'Inter_600SemiBold' }]}>
                {testSent ? 'Test sent — listen for athan' : 'Send Test Athan'}
              </Text>
            </Pressable>
          </>
        )}
      </Card>

      {/* Armed alerts */}
      <SectionLabel>NEXT ALERTS ARMED</SectionLabel>
      <Card>
        <View style={row.wrap}>
          <View style={[row.icon, { backgroundColor: (scheduledCount > 0 ? colors.primary : colors.mutedForeground) + '22' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={scheduledCount > 0 ? colors.primary : colors.mutedForeground} />
          </View>
          <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold', flex: 1 }]}>
            {scheduledCount > 0 ? `${scheduledCount} notifications armed` : 'Nothing armed yet'}
          </Text>
        </View>
        {upcoming.length > 0 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
        {upcoming.map(e => (
          <View key={`${e.key}-${e.time}-${e.kind}`} style={[row.wrap, { paddingVertical: 10 }]}>
            <View style={[row.icon, { backgroundColor: colors.muted }]}>
              <Ionicons name={e.kind === 'athan' ? 'volume-high-outline' : 'notifications-outline'} size={16} color={colors.mutedForeground} />
            </View>
            <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
              {PRAYER_DISPLAY_NAMES[e.key] ?? e.key}
              {e.kind === 'reminder' ? ' · reminder' : ''}
            </Text>
            <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              {new Date(e.time).toLocaleDateString([], { weekday: 'short' })} {formatTime(new Date(e.time))}
            </Text>
          </View>
        ))}
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <Pressable
          style={[s.actionBtn, { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary }]}
          onPress={handleReschedule}
          disabled={scheduling || permissionStatus !== 'granted'}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={[s.actionBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {scheduling ? 'Rescheduling…' : 'Reschedule All'}
          </Text>
        </Pressable>
      </Card>

      {/* Delivery ledger */}
      <SectionLabel>DELIVERY LEDGER</SectionLabel>
      <Card>
        <View style={row.wrap}>
          <View style={[row.icon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="receipt-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {reliability.confirmed} confirmed of {reliability.expected} due
            </Text>
            <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 17 }]}>
              Confirmed while the app was reachable. Background deliveries may fire without being observed here.
            </Text>
          </View>
        </View>
        {fired.slice(0, 3).map((f, i) => (
          <View key={`${f.firedAt}-${i}`}>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={[row.wrap, { paddingVertical: 10 }]}>
              <View style={[row.icon, { backgroundColor: colors.muted }]}>
                <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]} numberOfLines={1}>{f.title}</Text>
              <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {new Date(f.firedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {formatTime(new Date(f.firedAt))}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Diagnostic export */}
      <SectionLabel>SUPPORT</SectionLabel>
      <Card>
        <View style={row.wrap}>
          <View style={[row.icon, { backgroundColor: colors.muted }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.foreground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Export diagnostic report</Text>
            <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 17 }]}>
              A shareable summary so we can explain exactly why an athan did or didn’t fire.
            </Text>
          </View>
        </View>
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <Pressable style={[s.actionBtn, { backgroundColor: colors.muted }]} onPress={exportDiagnostic}>
          <Ionicons name="share-outline" size={18} color={colors.foreground} />
          <Text style={[s.actionBtnText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Export Diagnostic</Text>
        </Pressable>
      </Card>

      {/* Tips */}
      <SectionLabel>TIPS FOR RELIABILITY</SectionLabel>
      <Card>
        {[
          { icon: 'battery-charging-outline' as const, title: 'Disable battery optimization', body: 'On Android, whitelist Vaqit in battery settings so it can schedule notifications overnight — the main cause of missed Fajr.' },
          { icon: 'moon-outline' as const, title: 'Check Do Not Disturb', body: 'Allow Vaqit to bypass DND, or athan will be silenced during DND hours.' },
          { icon: 'phone-portrait-outline' as const, title: 'Reboot-safe', body: 'Vaqit re-arms your alarms automatically after a restart — no need to reopen the app.' },
        ].map((tip, idx, arr) => (
          <View key={tip.title}>
            <View style={[row.wrap, { alignItems: 'flex-start', paddingVertical: 14 }]}>
              <View style={[row.icon, { backgroundColor: colors.muted, marginTop: 2 }]}>
                <Ionicons name={tip.icon} size={18} color={colors.mutedForeground} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{tip.title}</Text>
                <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', lineHeight: 18 }]}>{tip.body}</Text>
              </View>
            </View>
            {idx < arr.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
        {Platform.OS === 'android' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <Pressable style={[s.actionBtn, { backgroundColor: colors.muted }]} onPress={openBatterySettings}>
              <Ionicons name="battery-charging-outline" size={18} color={colors.foreground} />
              <Text style={[s.actionBtnText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Open Battery Settings</Text>
            </Pressable>
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 8 },
  backText: { fontSize: 16 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 16, lineHeight: 19 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 16, borderWidth: 1 },
  statusHeadline: { fontSize: 16 },
  statusDetail: { fontSize: 14, marginTop: 2 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  fixBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginTop: 6 },
  fixText: { fontSize: 13 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 13, borderRadius: 12 },
  actionBtnText: { fontSize: 15 },
});

const card = StyleSheet.create({ wrap: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' } });
const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15 },
  sub: { fontSize: 13 },
});
