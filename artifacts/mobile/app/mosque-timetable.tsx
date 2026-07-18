import React, { useState } from 'react';
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
import { useMosque } from '@/context/MosqueContext';
import { usePrayer } from '@/context/PrayerContext';
import {
  PRAYER_DISPLAY_NAMES,
  PRAYER_ICONS,
  TRACKABLE_PRAYERS,
  formatTime,
  type PrayerKey,
} from '@/constants/prayers';

const MIN_LIMITS = { min: 0, max: 90 };

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
            Adhan {formatTime(adhanTime!)} → Iqamah {formatTime(iqamahTime)}
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

export default function MosqueTimetableScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mosque, updateMosque } = useMosque();
  const [name, setName] = useState(mosque.mosqueName);

  const saveName = () => updateMosque({ mosqueName: name.trim() });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

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
        Mosque Timetable
      </Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        See iqamah times alongside adhan times on the Today screen
      </Text>

      {/* Enable toggle */}
      <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>MOSQUE</Text>
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={s.toggleRow}>
          <View style={[s.rowIcon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[s.rowLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
            Show mosque iqamah times
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

      {/* Iqamah offsets */}
      <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
        IQAMAH OFFSETS (minutes after adhan)
      </Text>
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        {TRACKABLE_PRAYERS.map(p => (
          <OffsetRow key={p} prayer={p} />
        ))}
      </View>

      {/* Compare view */}
      {mosque.enabled && (
        <>
          <Text style={[s.label, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            COMPARE VIEW
          </Text>
          <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius, padding: 16 }]}>
            <View style={s.compareHeader}>
              <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', flex: 1.2 }]}>Prayer</Text>
              <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>Adhan</Text>
              <Text style={[s.compareCol, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Iqamah</Text>
              <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>Diff</Text>
            </View>
            <View style={[s.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
            <CompareGrid />
          </View>
        </>
      )}

      {/* Info */}
      <View style={[s.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
        <Text style={[s.infoText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Iqamah times shown are calculated as adhan + offset. Tap the +/− buttons to adjust per prayer. Changes save automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

function CompareGrid() {
  const colors = useColors();
  const { mosque, getIqamahTime } = useMosque();
  const { todayTimes } = usePrayer();

  return (
    <>
      {TRACKABLE_PRAYERS.map(p => {
        const adhan = todayTimes?.[p] as Date | undefined;
        const iqamah = adhan ? getIqamahTime(p, adhan) : null;
        const offset = mosque.offsets[p] ?? 0;
        return (
          <View key={p} style={s.compareRow}>
            <Text style={[s.compareCol, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1.2 }]}>
              {PRAYER_DISPLAY_NAMES[p]}
            </Text>
            <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {adhan ? formatTime(adhan) : '—'}
            </Text>
            <Text style={[s.compareCol, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
              {iqamah ? formatTime(iqamah) : '—'}
            </Text>
            <Text style={[s.compareCol, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              +{offset}m
            </Text>
          </View>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 20 },
  label: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15 },
  nameRow: { paddingHorizontal: 16, paddingVertical: 12 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  compareHeader: { flexDirection: 'row' },
  compareRow: { flexDirection: 'row', paddingVertical: 6 },
  compareCol: { flex: 1, fontSize: 13, textAlign: 'center' },
  infoCard: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12, padding: 14, alignItems: 'flex-start' },
  infoText: { fontSize: 13, lineHeight: 18, flex: 1 },
});

const row = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  icon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15 },
  time: { fontSize: 12, marginTop: 1 },
  btn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  offset: { fontSize: 14 },
});
