import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const SECTIONS = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Everything stays on your device',
    body: 'Your prayer times, location, tracker logs, and settings are stored only in your phone\'s local storage (AsyncStorage). Nothing is uploaded to any server.',
  },
  {
    icon: 'wifi-outline' as const,
    title: 'Network requests we make: none',
    body: 'Vaqit makes zero network requests. Prayer times are calculated on-device using the adhan algorithm. Location is obtained from your phone\'s GPS — it never leaves your device.',
  },
  {
    icon: 'ban-outline' as const,
    title: 'No ads, no tracking, no analytics',
    body: 'We do not use any advertising SDKs, analytics libraries, crash reporters, or third-party data brokers. There is nothing phoning home.',
  },
  {
    icon: 'notifications-outline' as const,
    title: 'Notifications are local',
    body: 'Athan notifications are scheduled locally on your device using expo-notifications. No push notification servers are involved.',
  },
  {
    icon: 'key-outline' as const,
    title: 'No account required',
    body: 'Vaqit does not require or offer accounts, sign-in, or cloud sync. Your data is yours alone.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Location is used only for prayer times',
    body: 'When you grant location permission, your GPS coordinates are used solely to calculate prayer times and Qibla direction. They are stored locally in your settings and never transmitted anywhere.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Delete your data anytime',
    body: 'Uninstalling the app deletes all stored data permanently. There is no server copy to request removal of.',
  },
];

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={s.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Settings</Text>
      </Pressable>

      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Privacy</Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Plain language. No lawyers, no loopholes.
      </Text>

      <View style={[s.summaryCard, { backgroundColor: colors.primary + '18', borderRadius: colors.radius }]}>
        <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        <Text style={[s.summary, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          Vaqit collects no personal data and makes no network requests. Full stop.
        </Text>
      </View>

      {SECTIONS.map(({ icon, title, body }, idx) => (
        <View
          key={title}
          style={[s.section, { backgroundColor: colors.card, borderRadius: colors.radius, marginTop: idx === 0 ? 0 : 8 }]}
        >
          <View style={[s.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[s.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {title}
            </Text>
            <Text style={[s.sectionBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {body}
            </Text>
          </View>
        </View>
      ))}

      <Text style={[s.footer, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Worship is free, private, and always yours.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 20 },
  summaryCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, padding: 16, marginBottom: 16 },
  summary: { flex: 1, fontSize: 15, lineHeight: 22 },
  section: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 16, padding: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 15 },
  sectionBody: { fontSize: 14, lineHeight: 20 },
  footer: { fontSize: 13, textAlign: 'center', marginTop: 24, paddingHorizontal: 32, lineHeight: 20 },
});
