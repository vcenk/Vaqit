import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTracker, type PrayerStatus } from '@/context/TrackerContext';
import {
  PRAYER_DISPLAY_NAMES,
  PRAYER_ICONS,
  TRACKABLE_PRAYERS,
  STATUS_COLORS,
  formatDateKey,
  type PrayerKey,
} from '@/constants/prayers';
import { useT, type TKey } from '@/lib/i18n';

const STATUS_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  ontime: 'checkmark-circle',
  late: 'time',
  missed: 'close-circle',
  jamaah: 'people',
};

const ALL_STATUSES: PrayerStatus[] = ['ontime', 'late', 'missed', 'jamaah'];

function WeekStrip({ selectedKey, onSelect }: { selectedKey: string; onSelect: (k: string) => void }) {
  const colors = useColors();
  const { getDay } = useTracker();
  const days: { key: string; label: string; dayNum: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    days.push({
      key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: String(d.getDate()),
      isToday: i === 0,
    });
  }
  return (
    <View style={ws.row}>
      {days.map(({ key, label, dayNum, isToday }) => {
        const log = getDay(key);
        const count = TRACKABLE_PRAYERS.filter((p) => log[p] !== null).length;
        const isSelected = key === selectedKey;
        const bgColor = isSelected ? colors.primary : 'transparent';
        const textColor = isSelected ? colors.primaryForeground : isToday ? colors.primary : colors.foreground;
        return (
          <Pressable key={key} style={[ws.day, { backgroundColor: bgColor, borderRadius: colors.radius - 4 }]} onPress={() => onSelect(key)}>
            <Text style={[ws.dayLabel, { color: isSelected ? colors.primaryForeground : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
            <Text style={[ws.dayNum, { color: textColor, fontFamily: isToday ? 'Inter_700Bold' : 'Inter_500Medium' }]}>{dayNum}</Text>
            {count > 0 && (
              <View style={[ws.dot, { backgroundColor: isSelected ? '#FFFFFF88' : colors.primary }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function PrayerLogRow({ prayerKey, dateKey }: { prayerKey: PrayerKey; dateKey: string }) {
  const colors = useColors();
  const { getDay, logPrayer } = useTracker();
  const log = getDay(dateKey);
  const status = log[prayerKey];
  const icon = (PRAYER_ICONS[prayerKey] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];

  const handlePress = async (s: PrayerStatus) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (status === s) {
      await logPrayer(dateKey, prayerKey, null);
    } else {
      await logPrayer(dateKey, prayerKey, s);
    }
  };

  return (
    <View style={[plr.row, { borderBottomColor: colors.border }]}>
      <View style={[plr.iconWrap, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={18} color={colors.mutedForeground} />
      </View>
      <Text style={[plr.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
        {PRAYER_DISPLAY_NAMES[prayerKey]}
      </Text>
      <View style={plr.buttons}>
        {ALL_STATUSES.map((s) => {
          const active = status === s;
          const col = STATUS_COLORS[s] ?? colors.primary;
          return (
            <Pressable
              key={s}
              style={[plr.btn, { backgroundColor: active ? col + '22' : colors.muted, borderColor: active ? col : 'transparent', borderWidth: 1.5 }]}
              onPress={() => handlePress(s)}
            >
              <Ionicons name={STATUS_ICONS[s]!} size={18} color={active ? col : colors.mutedForeground} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TrackerScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { currentStreak, longestStreak } = useTracker();

  const todayKey = formatDateKey(new Date());
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const isToday = selectedDay === todayKey;
  const selectedDate = new Date(selectedDay + 'T12:00:00');
  const selectedLabel = isToday
    ? t('common.today')
    : selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : insets.bottom + 90;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        {t('tracker.title')}
      </Text>

      {/* Streak Cards */}
      <View style={s.streakRow}>
        <View style={[s.streakCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="flame" size={24} color="#F59E0B" />
          <Text style={[s.streakNum, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {currentStreak}
          </Text>
          <Text style={[s.streakLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {t('tracker.dayStreak')}
          </Text>
        </View>
        <View style={[s.streakCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <Text style={[s.streakNum, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {longestStreak}
          </Text>
          <Text style={[s.streakLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {t('tracker.bestStreak')}
          </Text>
        </View>
      </View>

      {/* Week Strip */}
      <View style={[s.weekCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <WeekStrip selectedKey={selectedDay} onSelect={setSelectedDay} />
      </View>

      {/* Day Label */}
      <Text style={[s.dayLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
        {selectedLabel}
      </Text>

      {/* Prayer Rows */}
      <View style={[s.logCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={s.statusLegend}>
          {ALL_STATUSES.map((s2) => (
            <View key={s2} style={sl.item}>
              <Ionicons name={STATUS_ICONS[s2]!} size={12} color={STATUS_COLORS[s2]} />
              <Text style={[sl.text, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {t(`status.${s2}` as TKey)}
              </Text>
            </View>
          ))}
        </View>
        {TRACKABLE_PRAYERS.map((p) => (
          <PrayerLogRow key={p} prayerKey={p} dateKey={selectedDay} />
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, marginBottom: 20 },
  streakRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  streakNum: { fontSize: 36 },
  streakLabel: { fontSize: 13 },
  weekCard: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 12 },
  dayLabel: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logCard: { marginHorizontal: 16, overflow: 'hidden' },
  statusLegend: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
});

const sl = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontSize: 11 },
});

const ws = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 8, gap: 4 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 },
  dayLabel: { fontSize: 11 },
  dayNum: { fontSize: 16 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});

const plr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, fontSize: 15 },
  buttons: { flexDirection: 'row', gap: 6 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
