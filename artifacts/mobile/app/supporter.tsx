import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSupporter } from '@/context/SupporterContext';
import { TIP_PACKAGES } from '@/lib/billing';
import { useT, type TKey } from '@/lib/i18n';

const BENEFITS = [
  { icon: 'heart' as const, key: 'b1' },
  { icon: 'color-palette-outline' as const, key: 'b2' },
  { icon: 'download-outline' as const, key: 'b3' },
  { icon: 'ribbon-outline' as const, key: 'b4' },
  { icon: 'chatbubble-ellipses-outline' as const, key: 'b5' },
];

export default function SupporterScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { isSupporter, configured, packages, loading, purchase, restore } = useSupporter();
  const [busy, setBusy] = useState<string | null>(null);

  const planTitle = (p: { period: string; title: string }) =>
    p.period === 'annual' ? t('supporter.plan.annual') : p.period === 'monthly' ? t('supporter.plan.monthly') : p.title;
  const tipTitle = (id: string) =>
    id === 'tip_small' ? t('supporter.tip.small') : id === 'tip_medium' ? t('supporter.tip.medium') : id;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const doPurchase = async (id: string) => {
    if (!configured) {
      Alert.alert(t('supporter.alert.soonTitle'), t('supporter.alert.soonBody'));
      return;
    }
    setBusy(id);
    const r = await purchase(id);
    setBusy(null);
    if (r.ok && r.isSupporter) {
      Alert.alert(t('supporter.alert.thanksTitle'), t('supporter.alert.thanksBody'));
    } else if (r.reason === 'error') {
      Alert.alert(t('supporter.alert.errTitle'), t('supporter.alert.errBody'));
    }
  };

  const doRestore = async () => {
    if (!configured) return;
    setBusy('restore');
    const r = await restore();
    setBusy(null);
    Alert.alert(
      r.isSupporter ? t('supporter.alert.restoredTitle') : t('supporter.alert.nothingTitle'),
      r.isSupporter ? t('supporter.alert.restoredBody') : t('supporter.alert.nothingBody'),
    );
  };

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={colors.mutedForeground} />
      </Pressable>

      {/* Hero */}
      <LinearGradient colors={['#1B6B45', '#0D3825']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { borderRadius: colors.radius + 4 }]}>
        <Ionicons name="heart" size={30} color="#FFFFFF" />
        <Text style={[s.heroTitle, { fontFamily: 'Inter_700Bold' }]}>{t('supporter.heroTitle')}</Text>
        <Text style={[s.heroSub, { fontFamily: 'Inter_400Regular' }]}>
          {t('supporter.heroSub')}
        </Text>
      </LinearGradient>

      {isSupporter && (
        <View style={[s.activeCard, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '55', borderRadius: colors.radius }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={[s.activeText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{t('supporter.active')}</Text>
        </View>
      )}

      {/* Benefits */}
      <View style={s.benefits}>
        {BENEFITS.map(b => (
          <View key={b.key} style={s.benefitRow}>
            <View style={[s.benefitIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name={b.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.benefitTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{t(`supporter.${b.key}.title` as TKey)}</Text>
              <Text style={[s.benefitBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t(`supporter.${b.key}.body` as TKey)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Plans */}
      {!isSupporter && (
        <>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('supporter.chooseSupport').toUpperCase()}</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            packages.map(p => (
              <Pressable
                key={p.id}
                style={[s.plan, { backgroundColor: colors.card, borderColor: p.highlight ? colors.primary : colors.border, borderWidth: p.highlight ? 2 : 1, borderRadius: colors.radius }]}
                onPress={() => doPurchase(p.id)}
                disabled={busy !== null}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.planTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                    {planTitle(p)}
                    {p.highlight && <Text style={{ color: colors.primary }}>  · {t('supporter.bestValue')}</Text>}
                  </Text>
                  <Text style={[s.planPrice, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{p.priceString}</Text>
                </View>
                {busy === p.id ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="chevron-forward" size={20} color={colors.primary} />}
              </Pressable>
            ))
          )}
        </>
      )}

      {/* Sadaqah / tips */}
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('supporter.sadaqah').toUpperCase()}</Text>
      <View style={s.tipRow}>
        {TIP_PACKAGES.map(tip => (
          <Pressable
            key={tip.id}
            style={[s.tip, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => doPurchase(tip.id)}
            disabled={busy !== null}
          >
            <Text style={[s.tipTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{tipTitle(tip.id)}</Text>
            <Text style={[s.tipPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{tip.priceString}</Text>
          </Pressable>
        ))}
      </View>

      {/* Restore + fine print */}
      {configured && (
        <Pressable style={s.restore} onPress={doRestore} disabled={busy !== null}>
          <Text style={[s.restoreText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>{t('supporter.restore')}</Text>
        </Pressable>
      )}
      {!configured && (
        <Text style={[s.preview, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {t('supporter.preview')}
        </Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { alignSelf: 'flex-end', padding: 16 },
  hero: { marginHorizontal: 16, padding: 24, alignItems: 'center', gap: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 26 },
  heroSub: { color: '#FFFFFFCC', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  activeCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, padding: 14, borderWidth: 1 },
  activeText: { fontSize: 14 },
  benefits: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  benefitRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  benefitIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontSize: 15 },
  benefitBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  plan: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, padding: 16 },
  planTitle: { fontSize: 16 },
  planPrice: { fontSize: 14, marginTop: 2 },
  tipRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  tip: { flex: 1, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  tipTitle: { fontSize: 14 },
  tipPrice: { fontSize: 18 },
  restore: { alignSelf: 'center', padding: 16, marginTop: 8 },
  restoreText: { fontSize: 14 },
  preview: { fontSize: 12, textAlign: 'center', paddingHorizontal: 32, marginTop: 12, lineHeight: 17 },
});
