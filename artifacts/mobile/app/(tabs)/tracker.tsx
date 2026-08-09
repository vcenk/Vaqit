import React, { useState } from 'react';
import {
  Alert,
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
import { useTracker, type PrayerStatus, type ExemptReason, EXEMPT_REASONS } from '@/context/TrackerContext';
import { usePrayer } from '@/context/PrayerContext';
import { ProgressRing } from '@/components/ProgressRing';
import {
  PRAYER_DISPLAY_NAMES,
  PRAYER_ICONS,
  TRACKABLE_PRAYERS,
  STATUS_COLORS,
  formatDateKey,
  formatTime,
  type PrayerKey,
} from '@/constants/prayers';
import { useT, type TKey } from '@/lib/i18n';

const STATUS_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  jamaah: 'people',
  ontime: 'checkmark-circle',
  late: 'time',
};

/** Order shown in the log — congregation first, no "missed" button (P17). */
const LOGGABLE_STATUSES: PrayerStatus[] = ['jamaah', 'ontime', 'late'];

const EXEMPT_ICON: Record<ExemptReason, React.ComponentProps<typeof Ionicons>['name']> = {
  menstruation: 'flower-outline',
  travel: 'airplane-outline',
  illness: 'medkit-outline',
};

function WeekStrip({ selectedKey, onSelect }: { selectedKey: string; onSelect: (k: string) => void }) {
  const colors = useColors();
  const { getCount, getExempt } = useTracker();
  const days: { key: string; label: string; dayNum: string; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      dayNum: String(d.getDate()),
      isToday: i === 0,
    });
  }
  return (
    <View style={ws.row}>
      {days.map(({ key, label, dayNum, isToday }) => {
        const exempt = getExempt(key);
        const count = getCount(key);
        const progress = exempt ? 1 : count / TRACKABLE_PRAYERS.length;
        const isSelected = key === selectedKey;
        const ringColor = exempt ? colors.mutedForeground : colors.primary;
        return (
          <Pressable key={key} style={ws.day} onPress={() => onSelect(key)}>
            <Text style={[ws.dayLabel, { color: isToday ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
              {label}
            </Text>
            <View style={[ws.ringWrap, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}>
              <ProgressRing
                progress={progress}
                size={30}
                strokeWidth={3}
                color={ringColor}
                trackColor={colors.muted}
              >
                {exempt ? (
                  <Ionicons name={EXEMPT_ICON[exempt]} size={13} color={colors.mutedForeground} />
                ) : count > 0 ? (
                  <Text style={[ws.ringNum, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{count}</Text>
                ) : (
                  <View />
                )}
              </ProgressRing>
            </View>
            <Text style={[ws.dayNum, { color: isToday ? colors.foreground : colors.mutedForeground, fontFamily: isToday ? 'Inter_700Bold' : 'Inter_400Regular' }]}>
              {dayNum}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrayerLogRow({ prayerKey, dateKey, dimmed }: { prayerKey: PrayerKey; dateKey: string; dimmed?: boolean }) {
  const colors = useColors();
  const t = useT();
  const { getDay, logPrayer } = useTracker();
  const log = getDay(dateKey);
  const status = log[prayerKey];
  const icon = (PRAYER_ICONS[prayerKey] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];

  const subtitle =
    status && status !== 'missed'
      ? t(`status.${status}` as TKey)
      : t('tracker.notLogged');

  const handlePress = async (s: PrayerStatus) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logPrayer(dateKey, prayerKey, status === s ? null : s);
  };

  return (
    <View style={[plr.row, { borderBottomColor: colors.border, opacity: dimmed ? 0.45 : 1 }]}>
      <View style={[plr.iconWrap, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={18} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[plr.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
          {PRAYER_DISPLAY_NAMES[prayerKey]}
        </Text>
        <Text style={[plr.sub, { color: status && status !== 'missed' ? STATUS_COLORS[status] : colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {subtitle}
        </Text>
      </View>
      <View style={plr.buttons}>
        {LOGGABLE_STATUSES.map((s) => {
          const active = status === s;
          const col = STATUS_COLORS[s] ?? colors.primary;
          return (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`${PRAYER_DISPLAY_NAMES[prayerKey]} — ${t(`status.${s}` as TKey)}`}
              style={[plr.btn, { backgroundColor: active ? col + '22' : colors.muted, borderColor: active ? col : 'transparent', borderWidth: 1.5 }]}
              onPress={() => handlePress(s)}
            >
              <Ionicons name={STATUS_ICONS[s]!} size={17} color={active ? col : colors.mutedForeground} />
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
  const { getCount, getExempt, setExempt } = useTracker();
  const { nextPrayer } = usePrayer();

  const todayKey = formatDateKey(new Date());
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const isToday = selectedDay === todayKey;
  const selectedDate = new Date(selectedDay + 'T12:00:00');
  const selectedLabel = isToday
    ? t('common.today')
    : selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const exempt = getExempt(selectedDay);
  const count = getCount(selectedDay);
  const remaining = TRACKABLE_PRAYERS.length - count;
  const progress = exempt ? 1 : count / TRACKABLE_PRAYERS.length;

  const headline = exempt
    ? t(`tracker.exempt.${exempt}` as TKey)
    : count === 0
    ? t('tracker.freshDay')
    : t('tracker.prayedCount', { n: count });

  const encourage = exempt
    ? t('tracker.restDaySub')
    : remaining === 0
    ? t('tracker.encourageDone')
    : t('tracker.encourageMore');

  const openExemptPicker = () => {
    const options = EXEMPT_REASONS.map((r) => ({
      text: t(`tracker.exempt.${r}` as TKey),
      onPress: () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); void setExempt(selectedDay, r); },
    }));
    Alert.alert(
      t('tracker.notRequired'),
      t('tracker.notRequiredSub'),
      [
        ...options,
        ...(exempt ? [{ text: t('tracker.clearExempt'), onPress: () => setExempt(selectedDay, null) }] : []),
        { text: t('common.cancel'), style: 'cancel' as const },
      ],
    );
  };

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
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {t('tracker.subtitle')}
      </Text>

      {/* Day summary card — calm ring, plain-language line, no streaks */}
      <View style={[s.todayCard, { backgroundColor: colors.card, borderRadius: colors.radius + 4 }]}>
        <ProgressRing
          progress={progress}
          size={92}
          strokeWidth={8}
          color={exempt ? colors.mutedForeground : colors.primary}
          trackColor={colors.muted}
        >
          {exempt ? (
            <Ionicons name={EXEMPT_ICON[exempt]} size={30} color={colors.mutedForeground} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={[s.ringNum, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                {count}/{TRACKABLE_PRAYERS.length}
              </Text>
              <Text style={[s.ringSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {isToday ? t('common.today').toLowerCase() : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </ProgressRing>
        <View style={s.todayMsg}>
          <Text style={[s.todayHeadline, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {headline}
          </Text>
          <Text style={[s.todayEncourage, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {encourage}
          </Text>
          {isToday && !exempt && nextPrayer && remaining > 0 && (
            <View style={[s.nextPill, { backgroundColor: colors.secondary }]}>
              <Ionicons name="time-outline" size={13} color={colors.primary} />
              <Text style={[s.nextPillText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                {t('tracker.nextPill', { name: nextPrayer.name, time: formatTime(nextPrayer.time) })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Week — seven gentle rings, also the day selector */}
      <View style={[s.weekCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[s.weekCap, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          {t('tracker.thisWeek').toUpperCase()}
        </Text>
        <WeekStrip selectedKey={selectedDay} onSelect={setSelectedDay} />
      </View>

      {/* Day label */}
      <Text style={[s.dayLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
        {selectedLabel}
      </Text>

      {/* Prayer rows */}
      <View style={[s.logCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        {exempt && (
          <View style={[s.restBanner, { backgroundColor: colors.secondary }]}>
            <Ionicons name={EXEMPT_ICON[exempt]} size={18} color={colors.mutedForeground} />
            <Text style={[s.restBannerText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {t('tracker.restDaySub')}
            </Text>
          </View>
        )}
        {TRACKABLE_PRAYERS.map((p) => (
          <PrayerLogRow key={p} prayerKey={p} dateKey={selectedDay} dimmed={!!exempt} />
        ))}

        {/* Not-required-today — a first-class, dignified path */}
        <Pressable style={[s.exemptRow, { borderTopColor: colors.border }]} onPress={openExemptPicker}>
          <Ionicons name="moon-outline" size={18} color={colors.mutedForeground} />
          <View style={{ flex: 1 }}>
            <Text style={[s.exemptTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {exempt ? t('tracker.clearExempt') : t('tracker.notRequired')}
            </Text>
            <Text style={[s.exemptSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {t('tracker.notRequiredSub')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20 },
  subtitle: { fontSize: 13.5, paddingHorizontal: 20, marginTop: 2, marginBottom: 18 },
  todayCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  ringNum: { fontSize: 22 },
  ringSub: { fontSize: 10, marginTop: 1 },
  todayMsg: { flex: 1 },
  todayHeadline: { fontSize: 16 },
  todayEncourage: { fontSize: 13, marginTop: 5, lineHeight: 18 },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  nextPillText: { fontSize: 12 },
  weekCard: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 14, paddingHorizontal: 10 },
  weekCap: { fontSize: 11, letterSpacing: 0.8, paddingHorizontal: 6, marginBottom: 12 },
  dayLabel: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logCard: { marginHorizontal: 16, overflow: 'hidden' },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  restBannerText: { fontSize: 13, flex: 1 },
  exemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exemptTitle: { fontSize: 14 },
  exemptSub: { fontSize: 11.5, marginTop: 1 },
});

const ws = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  day: { flex: 1, alignItems: 'center', gap: 5 },
  dayLabel: { fontSize: 11 },
  ringWrap: { width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent', borderWidth: 2 },
  ringNum: { fontSize: 12 },
  dayNum: { fontSize: 11 },
});

const plr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  name: { fontSize: 15 },
  sub: { fontSize: 11.5, marginTop: 1 },
  buttons: { flexDirection: 'row', gap: 6 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
