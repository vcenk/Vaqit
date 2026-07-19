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

const BENEFITS = [
  { icon: 'heart' as const, title: 'Keep Vaqit ad-free & independent', body: 'No ads, no data selling — your support is what funds that promise.' },
  { icon: 'color-palette-outline' as const, title: 'Supporter themes & widget styles', body: 'Cosmetic extras. Every worship feature stays free for everyone.' },
  { icon: 'download-outline' as const, title: 'Exportable prayer journal', body: 'Export your tracker history any time.' },
  { icon: 'ribbon-outline' as const, title: 'Supporter badge & early access', body: 'A quiet thank-you, plus first look at new features.' },
  { icon: 'chatbubble-ellipses-outline' as const, title: 'Priority support', body: 'Powered by the diagnostic report, so issues get solved fast.' },
];

export default function SupporterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isSupporter, configured, packages, loading, purchase, restore } = useSupporter();
  const [busy, setBusy] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const doPurchase = async (id: string) => {
    if (!configured) {
      Alert.alert('Almost there', 'Supporter checkout isn’t live yet — it opens with our first release. Thank you for wanting to support Vaqit.');
      return;
    }
    setBusy(id);
    const r = await purchase(id);
    setBusy(null);
    if (r.ok && r.isSupporter) {
      Alert.alert('Jazakallahu khayran 🤲', 'You’re now a Vaqit Supporter. Thank you for keeping worship free for everyone.');
    } else if (r.reason === 'error') {
      Alert.alert('Something went wrong', 'The purchase didn’t complete. Please try again.');
    }
  };

  const doRestore = async () => {
    if (!configured) return;
    setBusy('restore');
    const r = await restore();
    setBusy(null);
    Alert.alert(r.isSupporter ? 'Restored' : 'Nothing to restore', r.isSupporter ? 'Your Supporter status is active again.' : 'No previous purchase was found for this account.');
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
        <Text style={[s.heroTitle, { fontFamily: 'Inter_700Bold' }]}>Vaqit Supporter</Text>
        <Text style={[s.heroSub, { fontFamily: 'Inter_400Regular' }]}>
          Worship is free, forever. Supporters fund an ad-free, private, honest prayer app — and unlock a few cosmetic extras as thanks.
        </Text>
      </LinearGradient>

      {isSupporter && (
        <View style={[s.activeCard, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '55', borderRadius: colors.radius }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={[s.activeText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>You’re a Supporter — thank you 🤲</Text>
        </View>
      )}

      {/* Benefits */}
      <View style={s.benefits}>
        {BENEFITS.map(b => (
          <View key={b.title} style={s.benefitRow}>
            <View style={[s.benefitIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name={b.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.benefitTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{b.title}</Text>
              <Text style={[s.benefitBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{b.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Plans */}
      {!isSupporter && (
        <>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>CHOOSE YOUR SUPPORT</Text>
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
                    {p.title}
                    {p.highlight && <Text style={{ color: colors.primary }}>  · best value</Text>}
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
      <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>OR GIVE A ONE-TIME SADAQAH</Text>
      <View style={s.tipRow}>
        {TIP_PACKAGES.map(t => (
          <Pressable
            key={t.id}
            style={[s.tip, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => doPurchase(t.id)}
            disabled={busy !== null}
          >
            <Text style={[s.tipTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{t.title}</Text>
            <Text style={[s.tipPrice, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{t.priceString}</Text>
          </Pressable>
        ))}
      </View>

      {/* Restore + fine print */}
      {configured && (
        <Pressable style={s.restore} onPress={doRestore} disabled={busy !== null}>
          <Text style={[s.restoreText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Restore purchases</Text>
        </Pressable>
      )}
      {!configured && (
        <Text style={[s.preview, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Checkout opens with our first store release. Cancel anytime — no lock-in, ever.
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
