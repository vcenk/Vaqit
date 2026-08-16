import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/context/NotificationContext';
import { useT, type TKey } from '@/lib/i18n';

const MONTH_SHORT = Array.from({ length: 12 }, (_, i) =>
  new Date(2001, i, 1).toLocaleDateString(undefined, { month: 'short' }),
);
const daysInMonth = (month1: number) => new Date(2001, month1, 0).getDate();

const ZAKAT_KEY = 'vaqit_zakat_v1';
const ZAKAT_RATE = 0.025;
const NISAB_GRAMS = { gold: 87.48, silver: 612.36 } as const;

type Basis = 'gold' | 'silver';

interface ZakatState {
  basis: Basis;
  pricePerGram: string;
  cash: string;
  metals: string;
  investments: string;
  receivables: string;
  business: string;
  debts: string;
}

const EMPTY: ZakatState = {
  basis: 'silver',
  pricePerGram: '',
  cash: '',
  metals: '',
  investments: '',
  receivables: '',
  business: '',
  debts: '',
};

const num = (s: string): number => {
  const n = parseFloat((s || '').replace(/,/g, '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n: number): string =>
  n.toLocaleString(undefined, { maximumFractionDigits: 2 });

function MoneyRow({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[mr.row, { borderBottomColor: colors.border }]}>
      <Text style={[mr.label, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]} numberOfLines={2}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.mutedForeground}
        style={[mr.input, { color: colors.foreground, backgroundColor: colors.muted, fontFamily: 'Inter_600SemiBold' }]}
      />
    </View>
  );
}

export default function ZakatScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const [st, setSt] = useState<ZakatState>(EMPTY);
  const { zakatReminder, updateZakatReminder, requestPermission, permissionStatus } = useNotifications();

  useEffect(() => {
    AsyncStorage.getItem(ZAKAT_KEY).then((v) => {
      if (v) { try { setSt({ ...EMPTY, ...JSON.parse(v) }); } catch {} }
    });
  }, []);

  const reminderDate = new Date(2001, zakatReminder.month - 1, zakatReminder.day)
    .toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  const toggleReminder = async (val: boolean) => {
    if (val) {
      if (permissionStatus !== 'granted') {
        const ok = await requestPermission();
        if (!ok) return;
      }
      const today = new Date();
      await updateZakatReminder({ enabled: true, month: today.getMonth() + 1, day: today.getDate() });
    } else {
      await updateZakatReminder({ enabled: false });
    }
  };

  const pickMonth = (m1: number) => {
    updateZakatReminder({ month: m1, day: Math.min(zakatReminder.day, daysInMonth(m1)) });
  };

  const update = (patch: Partial<ZakatState>) => {
    setSt((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(ZAKAT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const calc = useMemo(() => {
    const assets = num(st.cash) + num(st.metals) + num(st.investments) + num(st.receivables) + num(st.business);
    const net = Math.max(0, assets - num(st.debts));
    const price = num(st.pricePerGram);
    const nisab = price > 0 ? NISAB_GRAMS[st.basis] * price : 0;
    const aboveNisab = price > 0 ? net >= nisab : null; // null = unknown until price entered
    const due = net * ZAKAT_RATE;
    return { assets, net, nisab, aboveNisab, due, hasPrice: price > 0 };
  }, [st]);

  const topPad = Platform.OS === 'web' ? 24 : insets.top + 8;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const metalName = t(st.basis === 'gold' ? 'zakat.nisab.gold' : 'zakat.nisab.silver');

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.back}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </Pressable>
        <Pressable onPress={() => update(EMPTY)} hitSlop={10}>
          <Text style={[s.reset, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.reset')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('zakat.title')}</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('zakat.subtitle')}</Text>

        {/* Result hero */}
        <LinearGradient colors={['#1B6B45', '#0D3825']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { borderRadius: colors.radius + 4 }]}>
          <Text style={[s.heroLabel, { fontFamily: 'Inter_500Medium' }]}>{t('zakat.result.due').toUpperCase()}</Text>
          <Text style={[s.heroValue, { fontFamily: 'Inter_700Bold' }]}>{fmt(calc.due)}</Text>
          <View style={s.heroMetaRow}>
            <Text style={[s.heroMeta, { fontFamily: 'Inter_400Regular' }]}>
              {t('zakat.result.net')}: {fmt(calc.net)}
            </Text>
          </View>
          {calc.aboveNisab === false && (
            <View style={s.heroBadge}>
              <Ionicons name="information-circle-outline" size={14} color="#FFFFFF" />
              <Text style={[s.heroBadgeText, { fontFamily: 'Inter_500Medium' }]}>{t('zakat.result.below')}</Text>
            </View>
          )}
          {calc.aboveNisab === true && (
            <View style={s.heroBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#4ADE80" />
              <Text style={[s.heroBadgeText, { color: '#4ADE80', fontFamily: 'Inter_500Medium' }]}>{t('zakat.result.above')}</Text>
            </View>
          )}
        </LinearGradient>

        <Text style={[s.currencyNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {t('zakat.currencyNote')}
        </Text>

        {/* Nisab */}
        <Text style={[s.section, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.section.nisab').toUpperCase()}</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={s.basisRow}>
            {(['silver', 'gold'] as Basis[]).map((b) => {
              const active = st.basis === b;
              return (
                <Pressable
                  key={b}
                  onPress={() => update({ basis: b })}
                  style={[s.basisBtn, { backgroundColor: active ? colors.primary : colors.muted, borderRadius: colors.radius - 6 }]}
                >
                  <Text style={[s.basisText, { color: active ? colors.primaryForeground : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                    {t(b === 'gold' ? 'zakat.nisab.gold' : 'zakat.nisab.silver')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <MoneyRow label={t('zakat.nisab.priceLabel', { metal: metalName })} value={st.pricePerGram} onChange={(v) => update({ pricePerGram: v })} colors={colors} />
          <View style={s.nisabInfo}>
            <Ionicons name="pricetag-outline" size={15} color={colors.accent} />
            <Text style={[s.nisabInfoText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {calc.hasPrice ? t('zakat.nisab.value', { value: fmt(calc.nisab) }) : t('zakat.nisab.enterPrice')}
            </Text>
          </View>
          {st.basis === 'silver' && (
            <Text style={[s.hint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('zakat.nisab.silverHint')}</Text>
          )}
        </View>

        {/* Assets */}
        <Text style={[s.section, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.section.assets').toUpperCase()}</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <MoneyRow label={t('zakat.asset.cash')} value={st.cash} onChange={(v) => update({ cash: v })} colors={colors} />
          <MoneyRow label={t('zakat.asset.metals')} value={st.metals} onChange={(v) => update({ metals: v })} colors={colors} />
          <MoneyRow label={t('zakat.asset.investments')} value={st.investments} onChange={(v) => update({ investments: v })} colors={colors} />
          <MoneyRow label={t('zakat.asset.receivables')} value={st.receivables} onChange={(v) => update({ receivables: v })} colors={colors} />
          <MoneyRow label={t('zakat.asset.business')} value={st.business} onChange={(v) => update({ business: v })} colors={colors} />
        </View>

        {/* Liabilities */}
        <Text style={[s.section, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.section.liabilities').toUpperCase()}</Text>
        <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <MoneyRow label={t('zakat.liability.debts')} value={st.debts} onChange={(v) => update({ debts: v })} colors={colors} />
        </View>

        {/* Disclaimer */}
        <View style={[s.disclaimer, { backgroundColor: colors.accent + '18', borderRadius: colors.radius - 4 }]}>
          <Ionicons name="book-outline" size={18} color={colors.accent} />
          <Text style={[s.disclaimerText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{t('zakat.disclaimer')}</Text>
        </View>

        {/* Yearly reminder — remember your zakat */}
        <View style={[s.reminderCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={s.reminderHead}>
            <View style={[s.reminderIcon, { backgroundColor: colors.accent + '22' }]}>
              <Ionicons name="notifications-outline" size={18} color={colors.accent} />
            </View>
            <Text style={[s.reminderTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('zakat.reminder.title')}</Text>
            <Switch value={zakatReminder.enabled} onValueChange={toggleReminder} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFFFFF" />
          </View>
          <Text style={[s.reminderBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('zakat.reminder.body')}</Text>
          {zakatReminder.enabled && (
            <>
              <Text style={[s.reminderOn, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.reminder.on', { date: reminderDate })}</Text>
              <Text style={[s.reminderPickLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{t('zakat.reminder.pickMonth')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                {MONTH_SHORT.map((mLabel, i) => {
                  const m1 = i + 1;
                  const active = zakatReminder.month === m1;
                  return (
                    <Pressable key={m1} onPress={() => pickMonth(m1)} style={[s.monthPill, { backgroundColor: active ? colors.primary + '22' : colors.muted, borderColor: active ? colors.primary : 'transparent', borderWidth: 1.5 }]}>
                      <Text style={[s.monthPillText, { color: active ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>{mLabel}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        {/* Sadaqah funnel — keep it ethically separate from zakat */}
        <View style={[s.givingCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={s.givingHead}>
            <View style={[s.givingIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name="heart" size={18} color={colors.primary} />
            </View>
            <Text style={[s.givingTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('zakat.giving.title')}</Text>
          </View>
          <Text style={[s.givingBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('zakat.giving.body')}</Text>
          <Pressable style={[s.givingPrimary, { backgroundColor: colors.primary }]} onPress={() => router.push('/supporter')}>
            <Ionicons name="gift-outline" size={17} color={colors.primaryForeground} />
            <Text style={[s.givingPrimaryText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>{t('zakat.giving.sadaqah')}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/supporter')}>
            <Text style={[s.givingSecondary, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>{t('zakat.giving.supporter')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 4 },
  back: { padding: 4 },
  reset: { fontSize: 14, paddingHorizontal: 8 },
  title: { fontSize: 28, marginTop: 4 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  hero: { padding: 22, marginBottom: 12 },
  heroLabel: { color: '#FFFFFF99', fontSize: 11, letterSpacing: 1 },
  heroValue: { color: '#FFFFFF', fontSize: 40, letterSpacing: -0.5, marginTop: 4 },
  heroMetaRow: { marginTop: 6 },
  heroMeta: { color: '#FFFFFFCC', fontSize: 13 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#FFFFFF1A', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  heroBadgeText: { color: '#FFFFFF', fontSize: 12 },
  currencyNote: { fontSize: 12.5, marginBottom: 16, paddingHorizontal: 4 },
  section: { fontSize: 11, letterSpacing: 0.8, paddingHorizontal: 6, marginTop: 8, marginBottom: 8 },
  card: { overflow: 'hidden', marginBottom: 8, paddingHorizontal: 14 },
  basisRow: { flexDirection: 'row', gap: 8, paddingVertical: 12 },
  basisBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  basisText: { fontSize: 13 },
  nisabInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  nisabInfoText: { fontSize: 14, flex: 1 },
  hint: { fontSize: 12, lineHeight: 17, paddingBottom: 12 },
  disclaimer: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 8, marginBottom: 16, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  reminderCard: { padding: 18, marginBottom: 12 },
  reminderHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  reminderIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 15.5, flex: 1 },
  reminderBody: { fontSize: 13, lineHeight: 19 },
  reminderOn: { fontSize: 13.5, marginTop: 12 },
  reminderPickLabel: { fontSize: 12, marginTop: 12, marginBottom: 8 },
  monthPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, minWidth: 46, alignItems: 'center' },
  monthPillText: { fontSize: 12.5 },
  givingCard: { padding: 18 },
  givingHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  givingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  givingTitle: { fontSize: 16, flex: 1 },
  givingBody: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  givingPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  givingPrimaryText: { fontSize: 15 },
  givingSecondary: { fontSize: 13.5, textAlign: 'center', paddingVertical: 14 },
});

const mr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  label: { flex: 1, fontSize: 14.5 },
  input: { minWidth: 96, maxWidth: 140, textAlign: 'right', fontSize: 15, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
});
