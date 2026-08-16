import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useT, type TKey } from '@/lib/i18n';
import { getFoundationTopic, type FoundationSource, type SourceKind } from '@/constants/foundations';

const KIND_META: Record<SourceKind, { icon: React.ComponentProps<typeof Ionicons>['name']; labelKey: TKey }> = {
  quran: { icon: 'book-outline', labelKey: 'foundation.quran' },
  hadith: { icon: 'chatbubbles-outline', labelKey: 'foundation.hadith' },
  scholar: { icon: 'school-outline', labelKey: 'foundation.scholar' },
};

export default function FoundationScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = getFoundationTopic(id);

  const topPad = Platform.OS === 'web' ? 24 : insets.top + 8;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  if (!topic) {
    return (
      <View style={[s.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </Pressable>
      </View>
    );
  }

  const reportIssue = () => {
    Linking.openURL(
      `mailto:hello@vaqit.online?subject=${encodeURIComponent(`Foundations feedback: ${topic.id}`)}`,
    ).catch(() => {});
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.category, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
          {t(`foundations.cat.${topic.category}` as TKey).toUpperCase()}
        </Text>
        <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{topic.question}</Text>

        {topic.reviewStatus === 'pending' && (
          <View style={[s.pendingBadge, { backgroundColor: colors.accent + '22' }]}>
            <Ionicons name="time-outline" size={13} color={colors.accent} />
            <Text style={[s.pendingText, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>{t('foundations.pendingBadge')}</Text>
          </View>
        )}

        <Text style={[s.intro, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{topic.intro}</Text>

        {/* Sources — every claim shows where it comes from */}
        <Text style={[s.section, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('foundations.sources').toUpperCase()}</Text>
        {topic.sources.map((src, i) => (
          <SourceCard key={i} src={src} colors={colors} t={t} />
        ))}

        {topic.wisdoms && (
          <View style={[s.wisdoms, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Text style={[s.wisdomsLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('foundations.wisdoms').toUpperCase()}</Text>
            <Text style={[s.wisdomsBody, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{topic.wisdoms}</Text>
          </View>
        )}

        {/* Always: differences of opinion + consult a scholar */}
        <View style={[s.consult, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[s.consultText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{t('foundations.consultNote')}</Text>
        </View>

        <Pressable style={s.report} onPress={reportIssue}>
          <Ionicons name="flag-outline" size={15} color={colors.mutedForeground} />
          <Text style={[s.reportText, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{t('foundations.reportIssue')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SourceCard({ src, colors, t }: { src: FoundationSource; colors: ReturnType<typeof useColors>; t: (k: TKey) => string }) {
  const meta = KIND_META[src.kind];
  const attribution = [src.translator, src.grade].filter(Boolean).join(' · ');
  return (
    <View style={[sc.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <View style={sc.head}>
        <View style={[sc.kind, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name={meta.icon} size={13} color={colors.primary} />
          <Text style={[sc.kindText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{t(meta.labelKey)}</Text>
        </View>
        <Text style={[sc.ref, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{src.ref}</Text>
      </View>
      <Text style={[sc.text, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>“{src.text}”</Text>
      {!!attribution && (
        <Text style={[sc.attr, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{attribution}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 4 },
  back: { padding: 4 },
  category: { fontSize: 11, letterSpacing: 1, marginTop: 4 },
  title: { fontSize: 25, marginTop: 6, lineHeight: 32 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pendingText: { fontSize: 11.5 },
  intro: { fontSize: 15, lineHeight: 23, marginTop: 16 },
  section: { fontSize: 11, letterSpacing: 0.8, paddingHorizontal: 2, marginTop: 24, marginBottom: 10 },
  wisdoms: { padding: 16, marginTop: 12 },
  wisdomsLabel: { fontSize: 11, letterSpacing: 0.6, marginBottom: 8 },
  wisdomsBody: { fontSize: 13.5, lineHeight: 20 },
  consult: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 16, alignItems: 'flex-start' },
  consultText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  report: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  reportText: { fontSize: 13 },
});

const sc = StyleSheet.create({
  card: { padding: 16, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  kindText: { fontSize: 11 },
  ref: { fontSize: 13.5, flex: 1 },
  text: { fontSize: 15, lineHeight: 23 },
  attr: { fontSize: 12, marginTop: 8 },
});
