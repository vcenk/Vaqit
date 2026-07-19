import React, { useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  useMosque,
  SOURCE_TYPE_LABELS,
  type MosqueSourceType,
} from '@/context/MosqueContext';
import { usePrayer } from '@/context/PrayerContext';
import { explainMosqueDiff } from '@/lib/prayerMeta';
import {
  PRAYER_DISPLAY_NAMES,
  PRAYER_ICONS,
  TRACKABLE_PRAYERS,
  formatTime,
  type PrayerKey,
} from '@/constants/prayers';

const MIN_LIMITS = { min: 0, max: 90 };
const SOURCE_TYPES: MosqueSourceType[] = ['timetable', 'community', 'personal'];

// ── Mosque start-time entry (HH:MM) ──────────────────────────────────────────
function StartTimeRow({ prayer }: { prayer: PrayerKey }) {
  const colors = useColors();
  const { mosque, updateStartTime } = useMosque();
  const { todayTimes } = usePrayer();
  const icon = (PRAYER_ICONS[prayer] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];

  const [text, setText] = useState(mosque.startTimes[prayer] ?? '');
  const calc = todayTimes?.[prayer] as Date | undefined;

  const commit = () => updateStartTime(prayer, text);

  return (
    <View style={[row.wrap, { borderBottomColor: colors.border }]}>
      <View style={[row.icon, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[row.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {PRAYER_DISPLAY_NAMES[prayer]}
        </Text>
        {calc && (
          <Text style={[row.time, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Calculated: {formatTime(calc)}
          </Text>
        )}
      </View>
      <TextInput
        style={[startInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted, fontFamily: 'Inter_600SemiBold' }]}
        value={text}
        onChangeText={setText}
        onBlur={commit}
        onSubmitEditing={commit}
        placeholder="HH:MM"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        returnKeyType="done"
        accessibilityLabel={`${PRAYER_DISPLAY_NAMES[prayer]} mosque start time`}
      />
    </View>
  );
}

// ── Iqamah offset entry ──────────────────────────────────────────────────────
function OffsetRow({ prayer }: { prayer: PrayerKey }) {
  const colors = useColors();
  const { mosque, updateOffset, getIqamahTime } = useMosque();
  const { todayTimes } = usePrayer();

  const offset = mosque.offsets[prayer] ?? 0;
  const adhanTime = todayTimes?.[prayer] as Date | undefined;
  const iqamahTime = adhanTime ? getIqamahTime(prayer, adhanTime) : null;
  const icon = (PRAYER_ICONS[prayer] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];

  const change = (delta: number) => {
    const next = Math.min(MIN_LIMITS.max, Math.max(MIN_LIMITS.min, offset + delta));
    updateOffset(prayer, next);
  };

  return (
    <View style={[row.wrap, { borderBottomColor: colors.border }]}>
      <View style={[row.icon, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[row.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {PRAYER_DISPLAY_NAMES[prayer]}
        </Text>
        {iqamahTime && (
          <Text style={[row.time, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Adhan {adhanTime ? formatTime(adhanTime) : '—'} → Iqamah {formatTime(iqamahTime)}
          </Text>
        )}
      </View>
      <Pressable style={[row.btn, { backgroundColor: colors.muted }]} onPress={() => change(-5)}>
        <Ionicons name="remove" size={16} color={colors.foreground} />
      </Pressable>
      <Text style={[row.offset, { color: offset > 0 ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_700Bold', minWidth: 42, textAlign: 'center' }]}>
        +{offset}m
      </Text>
      <Pressable style={[row.btn, { backgroundColor: colors.muted }]} onPress={() => change(5)}>
        <Ionicons name="add" size={16} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

// ── Calculated vs mosque comparison ──────────────────────────────────────────
function ComparisonSection() {
  const colors = useColors();
  const { mosque, getMosqueStart, getDiffMinutes } = useMosque();
  const { todayTimes, settings } = usePrayer();

  // Rows that have a mosque start time entered
  const rows = useMemo(() => {
    if (!todayTimes) return [];
    return TRACKABLE_PRAYERS.map(p => {
      const calc = todayTimes[p] as Date;
      const start = getMosqueStart(p, calc);
      const diff = getDiffMinutes(p, calc);
      return { p, calc, start, diff };
    }).filter(r => r.start !== null);
  }, [todayTimes, getMosqueStart, getDiffMinutes]);

  if (rows.length === 0) return null;

  // Pick the largest absolute difference to explain in plain language
  const biggest = rows.reduce((a, b) => (Math.abs(b.diff ?? 0) > Math.abs(a.diff ?? 0) ? b : a));
  const explanation =
    biggest.diff !== null
      ? explainMosqueDiff(biggest.p, biggest.diff, settings.calculationMethod)
      : null;

  return (
    <>
      <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        CALCULATED VS YOUR MOSQUE
      </Text>
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius, padding: 16 }]}>
        <View style={s.compareHeader}>
          <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', flex: 1.2 }]}>Prayer</Text>
          <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>Calculated</Text>
          <Text style={[s.compareCol, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Mosque</Text>
          <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>Diff</Text>
        </View>
        <View style={[s.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
        {rows.map(({ p, calc, start, diff }) => {
          const diffColor = diff === null || diff === 0 ? colors.mutedForeground : Math.abs(diff) > 5 ? colors.accent : colors.foreground;
          const diffText = diff === null ? '—' : diff === 0 ? '0' : `${diff > 0 ? '+' : ''}${diff}m`;
          return (
            <View key={p} style={s.compareRow}>
              <Text style={[s.compareCol, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1.2 }]}>
                {PRAYER_DISPLAY_NAMES[p]}
              </Text>
              <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {formatTime(calc)}
              </Text>
              <Text style={[s.compareCol, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {start ? formatTime(start) : '—'}
              </Text>
              <Text style={[s.compareCol, { color: diffColor, fontFamily: 'Inter_600SemiBold' }]}>
                {diffText}
              </Text>
            </View>
          );
        })}

        {explanation && Math.abs(biggest.diff ?? 0) > 0 && (
          <View style={[s.explainBox, { backgroundColor: colors.background }]}>
            <Ionicons name="bulb-outline" size={16} color={colors.accent} style={{ marginTop: 1 }} />
            <Text style={[s.explainText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{PRAYER_DISPLAY_NAMES[biggest.p]}</Text>{' '}
              is {explanation.magnitudeText}. {explanation.explanation}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export default function MosqueTimetableScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mosque, updateMosque } = useMosque();
  const [name, setName] = useState(mosque.mosqueName);

  const saveName = () => updateMosque({ mosqueName: name.trim() });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const lastUpdatedText = mosque.lastUpdated
    ? new Date(mosque.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Settings</Text>
      </Pressable>

      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        My Mosque
      </Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Compare your mosque’s times with the calculation — and understand any difference
      </Text>

      {/* Enable toggle + name */}
      <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>MOSQUE</Text>
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={s.toggleRow}>
          <View style={[s.rowIcon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[s.rowLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
            Show mosque times & comparison
          </Text>
          <Switch
            value={mosque.enabled}
            onValueChange={val => updateMosque({ enabled: val })}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <View style={s.nameRow}>
          <TextInput
            style={[s.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted, fontFamily: 'Inter_500Medium' }]}
            value={name}
            onChangeText={setName}
            onBlur={saveName}
            placeholder="Mosque name (optional)"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="done"
            onSubmitEditing={saveName}
            accessibilityLabel="Mosque name"
          />
        </View>
      </View>

      {mosque.enabled && (
        <>
          {/* Provenance */}
          <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            SOURCE OF THESE TIMES
          </Text>
          <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius, padding: 12 }]}>
            <View style={s.sourcePills}>
              {SOURCE_TYPES.map(st => {
                const active = mosque.sourceType === st;
                return (
                  <Pressable
                    key={st}
                    style={[s.sourcePill, { backgroundColor: active ? colors.primary + '22' : colors.muted, borderColor: active ? colors.primary : 'transparent' }]}
                    onPress={() => updateMosque({ sourceType: st })}
                  >
                    <Text style={[s.sourcePillText, { color: active ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                      {SOURCE_TYPE_LABELS[st]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {lastUpdatedText && (
              <Text style={[s.lastUpdated, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Last updated {lastUpdatedText}
              </Text>
            )}
          </View>

          {/* Start times */}
          <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            MOSQUE START TIMES (OPTIONAL)
          </Text>
          <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {TRACKABLE_PRAYERS.map(p => (
              <StartTimeRow key={p} prayer={p} />
            ))}
          </View>

          {/* Comparison */}
          <ComparisonSection />

          {/* Iqamah offsets */}
          <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            IQAMAH OFFSETS (MINUTES AFTER ADHAN)
          </Text>
          <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {TRACKABLE_PRAYERS.map(p => (
              <OffsetRow key={p} prayer={p} />
            ))}
          </View>
        </>
      )}

      {/* Info */}
      <View style={[s.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
        <Text style={[s.infoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Enter your mosque’s printed start times to see exactly how they differ from the astronomical calculation, and why. Iqamah times are shown as adhan + offset. Everything stays on your device.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 20, lineHeight: 19 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15 },
  nameRow: { paddingHorizontal: 16, paddingVertical: 12 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  sourcePills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sourcePill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  sourcePillText: { fontSize: 13 },
  lastUpdated: { fontSize: 12, marginTop: 10, paddingHorizontal: 2 },
  compareHeader: { flexDirection: 'row' },
  compareRow: { flexDirection: 'row', paddingVertical: 6 },
  compareCol: { flex: 1, fontSize: 13, textAlign: 'center' },
  explainBox: { flexDirection: 'row', gap: 8, borderRadius: 10, padding: 12, marginTop: 12, alignItems: 'flex-start' },
  explainText: { fontSize: 13, lineHeight: 19, flex: 1 },
  infoCard: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12, padding: 14, alignItems: 'flex-start' },
  infoText: { fontSize: 13, lineHeight: 18, flex: 1 },
});

const startInput: import('react-native').TextStyle = {
  borderWidth: 1.5,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 15,
  minWidth: 78,
  textAlign: 'center',
};

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15 },
  time: { fontSize: 12, marginTop: 1 },
  btn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  offset: { fontSize: 14 },
});
