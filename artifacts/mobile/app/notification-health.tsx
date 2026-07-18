import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/context/NotificationContext';
import { usePrayer } from '@/context/PrayerContext';

function StatusBadge({ status }: { status: 'granted' | 'denied' | 'undetermined' }) {
  const colors = useColors();
  const configs = {
    granted:       { icon: 'checkmark-circle' as const, label: 'Enabled',     bg: colors.primary + '22',  fg: colors.primary },
    denied:        { icon: 'close-circle' as const,     label: 'Blocked',     bg: colors.destructive + '22', fg: colors.destructive },
    undetermined:  { icon: 'help-circle' as const,      label: 'Not set',     bg: colors.muted,           fg: colors.mutedForeground },
  };
  const c = configs[status];
  return (
    <View style={[badge.wrap, { backgroundColor: c.bg, borderRadius: colors.radius }]}>
      <Ionicons name={c.icon} size={20} color={c.fg} />
      <Text style={[badge.label, { color: c.fg, fontFamily: 'Inter_600SemiBold' }]}>{c.label}</Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[card.wrap, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      {children}
    </View>
  );
}

function Row({
  icon,
  iconColor,
  label,
  sublabel,
  right,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [row.wrap, { backgroundColor: pressed && onPress ? colors.muted : 'transparent' }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[row.icon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
        {sublabel && <Text style={[row.sub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{sublabel}</Text>}
      </View>
      {right}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
    </Pressable>
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
  } = useNotifications();
  const { settings } = usePrayer();

  const [testSent, setTestSent] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    refreshScheduledCount();
  }, []);

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

  const openSettings = () => {
    if (Platform.OS !== 'web') {
      Linking.openSettings();
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Settings</Text>
      </Pressable>

      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Notification Health
      </Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Make sure your athan is reliable
      </Text>

      {/* Permission status */}
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        PERMISSION
      </Text>
      <Card>
        <View style={row.wrap}>
          <View style={[row.icon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[row.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
            Notification permission
          </Text>
          <StatusBadge status={permissionStatus} />
        </View>

        {permissionStatus !== 'granted' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <Pressable
              style={[s.actionBtn, { backgroundColor: colors.primary }]}
              onPress={permissionStatus === 'denied' ? openSettings : requestPermission}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.primaryForeground} />
              <Text style={[s.actionBtnText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
                {permissionStatus === 'denied' ? 'Open System Settings' : 'Enable Notifications'}
              </Text>
            </Pressable>
          </>
        )}
      </Card>

      {/* Test notification */}
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        TEST
      </Text>
      <Card>
        <Row
          icon="alarm-outline"
          iconColor={colors.accent}
          label="Send test athan"
          sublabel={testSent ? 'Arriving in 5 seconds — stay in the app' : 'Fires a test notification in 5 seconds'}
        />
        {permissionStatus === 'granted' && (
          <>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <Pressable
              style={[s.actionBtn, { backgroundColor: testSent ? colors.muted : colors.accent }]}
              onPress={handleTest}
              disabled={testSent}
            >
              <Ionicons name={testSent ? 'checkmark-circle' : 'notifications'} size={18} color={testSent ? colors.mutedForeground : '#000000'} />
              <Text style={[s.actionBtnText, { color: testSent ? colors.mutedForeground : '#000000', fontFamily: 'Inter_600SemiBold' }]}>
                {testSent ? 'Test sent — listen for athan' : 'Send Test Athan'}
              </Text>
            </Pressable>
          </>
        )}
      </Card>

      {/* Schedule status */}
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        SCHEDULE
      </Text>
      <Card>
        <Row
          icon="calendar-outline"
          iconColor={scheduledCount > 0 ? colors.primary : colors.mutedForeground}
          label={scheduledCount > 0 ? `${scheduledCount} notifications scheduled` : 'No notifications scheduled'}
          sublabel={scheduledCount > 0 ? 'Covering the next several days' : 'Tap below to reschedule'}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <Pressable
          style={[s.actionBtn, { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary }]}
          onPress={handleReschedule}
          disabled={scheduling || permissionStatus !== 'granted'}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={[s.actionBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {scheduling ? 'Rescheduling…' : 'Reschedule All Notifications'}
          </Text>
        </Pressable>
      </Card>

      {/* Tips */}
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        TIPS FOR RELIABILITY
      </Text>
      <Card>
        {[
          { icon: 'battery-charging-outline' as const, title: 'Disable battery optimization', body: 'On Android, whitelist Vaqit in battery settings so it can schedule notifications.' },
          { icon: 'moon-outline' as const, title: 'Check Do Not Disturb', body: 'Allow Vaqit to bypass DND, or athan will be silenced during DND hours.' },
          { icon: 'phone-portrait-outline' as const, title: 'Open the app daily', body: 'Opening Vaqit daily lets it refresh your notification schedule for the next 12 days.' },
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
            <Pressable style={[s.actionBtn, { backgroundColor: colors.muted }]} onPress={openSettings}>
              <Ionicons name="settings-outline" size={18} color={colors.foreground} />
              <Text style={[s.actionBtnText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Open Battery Settings
              </Text>
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
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 12,
    paddingVertical: 13,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 15 },
});

const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  label: { fontSize: 13 },
});

const card = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' },
});

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15 },
  sub: { fontSize: 13 },
});
