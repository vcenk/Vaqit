import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useT, type TKey } from '@/lib/i18n';

const SECTION_ICONS: React.ComponentProps<typeof Ionicons>['name'][] = [
  'phone-portrait-outline',
  'wifi-outline',
  'ban-outline',
  'notifications-outline',
  'key-outline',
  'eye-off-outline',
  'trash-outline',
];

export default function PrivacyScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const sections = SECTION_ICONS.map((icon, i) => ({
    icon,
    title: t(`privacy.s${i + 1}.title` as TKey),
    body: t(`privacy.s${i + 1}.body` as TKey),
  }));
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
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{t('tabs.settings')}</Text>
      </Pressable>

      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('privacy.title')}</Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {t('privacy.subtitle')}
      </Text>

      <View style={[s.summaryCard, { backgroundColor: colors.primary + '18', borderRadius: colors.radius }]}>
        <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
        <Text style={[s.summary, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          {t('privacy.summary')}
        </Text>
      </View>

      {sections.map(({ icon, title, body }, idx) => (
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
        {t('privacy.footer')}
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
