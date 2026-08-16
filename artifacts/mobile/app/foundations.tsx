import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useT, type TKey } from '@/lib/i18n';
import {
  FOUNDATION_TOPICS,
  type FoundationCategory,
  type FoundationTopic,
} from '@/constants/foundations';

const CATEGORY_ORDER: FoundationCategory[] = ['beliefs', 'worship', 'character', 'family', 'wealth', 'food'];

export default function FoundationsScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 24 : insets.top + 8;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    topics: FOUNDATION_TOPICS.filter((x) => x.category === cat),
  })).filter((g) => g.topics.length > 0);

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
        <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('foundations.title')}</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('foundations.subtitle')}</Text>

        {/* Honest draft/review disclaimer — provenance is the brand */}
        <View style={[s.reviewBanner, { backgroundColor: colors.accent + '18', borderRadius: colors.radius - 4 }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          <Text style={[s.reviewText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{t('foundations.pendingBanner')}</Text>
        </View>

        {grouped.map(({ cat, topics }) => (
          <View key={cat}>
            <Text style={[s.section, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {t(`foundations.cat.${cat}` as TKey).toUpperCase()}
            </Text>
            <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
              {topics.map((topic, idx) => (
                <TopicRow key={topic.id} topic={topic} last={idx === topics.length - 1} colors={colors} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function TopicRow({ topic, last, colors }: { topic: FoundationTopic; last: boolean; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        row.row,
        { backgroundColor: pressed ? colors.muted : 'transparent', borderBottomColor: colors.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
      ]}
      onPress={() => router.push({ pathname: '/foundation', params: { id: topic.id } })}
    >
      <View style={[row.iconWrap, { backgroundColor: colors.primary + '18' }]}>
        <Ionicons name={topic.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[row.q, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{topic.question}</Text>
        <Text style={[row.sum, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>{topic.summary}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 4 },
  back: { padding: 4 },
  title: { fontSize: 28, marginTop: 4 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  reviewBanner: { flexDirection: 'row', gap: 10, padding: 14, marginBottom: 8, alignItems: 'flex-start' },
  reviewText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  section: { fontSize: 11, letterSpacing: 0.8, paddingHorizontal: 6, marginTop: 16, marginBottom: 8 },
  card: { overflow: 'hidden' },
});

const row = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  q: { fontSize: 15 },
  sum: { fontSize: 12.5, marginTop: 2, lineHeight: 17 },
});
