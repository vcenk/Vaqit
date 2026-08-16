import React from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useT } from '@/lib/i18n';
import { getDailyAyah } from '@/constants/dailyAyahs';

export default function DailyAyahScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const ayah = getDailyAyah();

  const topPad = Platform.OS === 'web' ? 24 : insets.top + 8;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const share = () => {
    Share.share({ message: `“${ayah.translation}”\n— ${ayah.ref} (${ayah.translator})\n\nvia Vaqit` }).catch(() => {});
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </Pressable>
        <Pressable onPress={share} hitSlop={10} style={s.back}>
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={[s.eyebrow, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>{t('ayah.today').toUpperCase()}</Text>
        <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('ayah.title')}</Text>

        {/* The ayah */}
        <LinearGradient colors={['#1B6B45', '#0D3825']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, { borderRadius: colors.radius + 4 }]}>
          <Ionicons name="book-outline" size={22} color="#FFFFFFAA" />
          <Text style={[s.translation, { fontFamily: 'Inter_600SemiBold' }]}>“{ayah.translation}”</Text>
          <View style={s.refRow}>
            <Text style={[s.ref, { fontFamily: 'Inter_700Bold' }]}>{ayah.ref}</Text>
            <Text style={[s.attr, { fontFamily: 'Inter_400Regular' }]}>{ayah.translator}</Text>
          </View>
        </LinearGradient>

        {/* Reflection — draft, pending review */}
        <View style={s.reflectHead}>
          <Text style={[s.reflectLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('ayah.reflection').toUpperCase()}</Text>
          <View style={[s.pending, { backgroundColor: colors.accent + '22' }]}>
            <Text style={[s.pendingText, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>{t('foundations.pendingBadge')}</Text>
          </View>
        </View>
        <Text style={[s.reflection, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{ayah.reflection}</Text>

        <View style={[s.note, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}>
          <Ionicons name="sunny-outline" size={18} color={colors.primary} />
          <Text style={[s.noteText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{t('ayah.tomorrowNote')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 4 },
  back: { padding: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 1, marginTop: 4 },
  title: { fontSize: 28, marginTop: 4, marginBottom: 16 },
  card: { padding: 24, gap: 14, marginBottom: 20 },
  translation: { color: '#FFFFFF', fontSize: 22, lineHeight: 32, letterSpacing: -0.2 },
  refRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 2 },
  ref: { color: '#FFFFFF', fontSize: 15 },
  attr: { color: '#FFFFFFAA', fontSize: 12.5 },
  reflectHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reflectLabel: { fontSize: 11, letterSpacing: 0.8 },
  pending: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pendingText: { fontSize: 10.5 },
  reflection: { fontSize: 16, lineHeight: 25 },
  note: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 20, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
});
