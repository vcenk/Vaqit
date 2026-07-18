import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { toHijri } from '@/constants/prayers';
import { getIslamicDate, HIJRI_MONTH_NAMES } from '@/constants/islamic-dates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarDay {
  gregorianDate: Date;
  gregorianDay: number;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  islamicDate: ReturnType<typeof getIslamicDate>;
}

function buildCalendar(year: number, month: number): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Pad start
  const startPad = firstDay.getDay(); // 0 = Sun
  // Pad end to fill last row
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7;

  const days: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month - 1, 1 - startPad + i);
    date.setHours(12, 0, 0, 0);
    const h = toHijri(date);
    const dt = new Date(date);
    dt.setHours(0, 0, 0, 0);
    days.push({
      gregorianDate: date,
      gregorianDay: date.getDate(),
      hijriDay: h.day,
      hijriMonth: h.month,
      hijriYear: h.year,
      isToday: dt.getTime() === today.getTime(),
      isCurrentMonth: date.getMonth() === month - 1,
      islamicDate: getIslamicDate(h.month, h.day),
    });
  }
  return days;
}

function getDominantHijriMonth(days: CalendarDay[]): { month: number; year: number } {
  const current = days.filter(d => d.isCurrentMonth);
  const counts: Record<string, number> = {};
  for (const d of current) {
    const key = `${d.hijriYear}-${d.hijriMonth}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const [year, month] = top.split('-').map(Number);
  return { month: month ?? 1, year: year ?? 1446 };
}

export default function HijriCalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const days = useMemo(() => buildCalendar(year, month), [year, month]);
  const dominant = useMemo(() => getDominantHijriMonth(days), [days]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const hijriMonthLabel = `${HIJRI_MONTH_NAMES[(dominant.month - 1) % 12]} ${dominant.year}`;

  const goBack = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };

  // Collect upcoming Islamic dates in next 60 days
  const upcoming = useMemo(() => {
    const result: Array<{ date: CalendarDay; label: string }> = [];
    const todayMs = new Date().setHours(0, 0, 0, 0);
    for (const d of days) {
      if (d.islamicDate && d.gregorianDate.getTime() >= todayMs) {
        result.push({ date: d, label: d.islamicDate.name });
      }
    }
    return result.slice(0, 5);
  }, [days]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[s.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>Today</Text>
      </Pressable>

      {/* Header */}
      <View style={s.headerRow}>
        <Pressable onPress={goBack} style={s.navBtn}>
          <Ionicons name="chevron-back-circle-outline" size={28} color={colors.primary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={[s.monthLabel, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {monthLabel}
          </Text>
          <Text style={[s.hijriLabel, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}>
            {hijriMonthLabel}
          </Text>
        </View>
        <Pressable onPress={goNext} style={s.navBtn}>
          <Ionicons name="chevron-forward-circle-outline" size={28} color={colors.primary} />
        </Pressable>
      </View>

      {/* Today button */}
      {(year !== now.getFullYear() || month !== now.getMonth() + 1) && (
        <Pressable style={[s.todayBtn, { backgroundColor: colors.primary + '22', borderRadius: 10 }]} onPress={goToday}>
          <Text style={[s.todayBtnText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Back to today
          </Text>
        </Pressable>
      )}

      {/* Weekday headers */}
      <View style={[s.grid, s.weekRow]}>
        {WEEKDAYS.map(d => (
          <Text key={d} style={[s.weekday, { color: d === 'Fri' ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={[s.calCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={s.grid}>
          {days.map((day, idx) => {
            const isSelected = selectedDay?.gregorianDate.getTime() === day.gregorianDate.getTime();
            const hasEvent = !!day.islamicDate;
            const isImportant = day.islamicDate?.important;
            const isFriday = day.gregorianDate.getDay() === 5;

            let cellBg = 'transparent';
            if (isSelected) cellBg = colors.primary;
            else if (day.isToday) cellBg = colors.primary + '28';

            const gregColor = !day.isCurrentMonth
              ? colors.border
              : isSelected
              ? '#FFFFFF'
              : day.isToday
              ? colors.primary
              : isFriday
              ? colors.accent
              : colors.foreground;

            const hijriColor = !day.isCurrentMonth
              ? colors.border
              : isSelected
              ? '#FFFFFF99'
              : colors.mutedForeground;

            return (
              <Pressable
                key={idx}
                style={[s.cell, { backgroundColor: cellBg, borderRadius: 10 }]}
                onPress={() => setSelectedDay(isSelected ? null : day)}
              >
                <Text style={[s.gregDay, { color: gregColor, fontFamily: day.isToday ? 'Inter_700Bold' : 'Inter_500Medium' }]}>
                  {day.gregorianDay}
                </Text>
                <Text style={[s.hijriDay, { color: hijriColor, fontFamily: 'Inter_400Regular' }]}>
                  {day.hijriDay}
                </Text>
                {hasEvent && (
                  <View style={[s.eventDot, { backgroundColor: isSelected ? '#FFFFFF' : isImportant ? colors.accent : colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected day detail */}
      {selectedDay && (
        <View style={[s.detailCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[s.detailGreg, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {selectedDay.gregorianDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[s.detailHijri, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}>
            {selectedDay.hijriDay} {HIJRI_MONTH_NAMES[(selectedDay.hijriMonth - 1) % 12]} {selectedDay.hijriYear} AH
          </Text>
          {selectedDay.islamicDate && (
            <View style={[s.eventBadge, { backgroundColor: selectedDay.islamicDate.important ? colors.accent + '22' : colors.muted, borderRadius: 8 }]}>
              <Ionicons
                name={selectedDay.islamicDate.important ? 'star' : 'information-circle-outline'}
                size={14}
                color={selectedDay.islamicDate.important ? colors.accent : colors.mutedForeground}
              />
              <Text style={[s.eventName, { color: selectedDay.islamicDate.important ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                {selectedDay.islamicDate.name}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Upcoming Islamic dates this month */}
      {upcoming.length > 0 && (
        <>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            UPCOMING THIS MONTH
          </Text>
          <View style={[s.upcomingCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {upcoming.map(({ date, label }, idx) => (
              <View key={idx}>
                <Pressable
                  style={s.upcomingRow}
                  onPress={() => { setSelectedDay(date); setYear(date.gregorianDate.getFullYear()); setMonth(date.gregorianDate.getMonth() + 1); }}
                >
                  <View style={[s.upcomingDot, { backgroundColor: date.islamicDate?.important ? colors.accent : colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.upcomingName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{label}</Text>
                    <Text style={[s.upcomingDate, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                      {date.hijriDay} {HIJRI_MONTH_NAMES[(date.hijriMonth - 1) % 12]} · {date.gregorianDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.border} />
                </Pressable>
                {idx < upcoming.length - 1 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const CELL_SIZE = Math.floor((402 - 32 - 12) / 7); // approx cell width

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingBottom: 4 },
  backText: { fontSize: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8 },
  navBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  monthLabel: { fontSize: 18 },
  hijriLabel: { fontSize: 13 },
  todayBtn: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, marginBottom: 8 },
  todayBtnText: { fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  weekRow: { marginBottom: 4 },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 11, paddingVertical: 4 },
  calCard: { marginHorizontal: 16, marginBottom: 12, overflow: 'hidden', paddingVertical: 4 },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: 4,
  },
  gregDay: { fontSize: 15 },
  hijriDay: { fontSize: 9 },
  eventDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  detailCard: { marginHorizontal: 16, marginBottom: 12, padding: 16, gap: 6 },
  detailGreg: { fontSize: 16 },
  detailHijri: { fontSize: 13 },
  eventBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 4 },
  eventName: { fontSize: 13 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  upcomingCard: { marginHorizontal: 16, overflow: 'hidden' },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  upcomingDot: { width: 8, height: 8, borderRadius: 4 },
  upcomingName: { fontSize: 14 },
  upcomingDate: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 36 },
});
