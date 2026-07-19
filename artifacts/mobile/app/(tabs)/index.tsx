import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePrayer } from '@/context/PrayerContext';
import { useTracker } from '@/context/TrackerContext';
import { CountdownTimer } from '@/components/CountdownTimer';
import { PrayerTimeRow } from '@/components/PrayerTimeRow';
import { PrayerSourceCard } from '@/components/PrayerSourceCard';
import { AssuranceBanner } from '@/components/AssuranceBanner';
import { toHijri, formatDateKey } from '@/constants/prayers';

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    todayTimes,
    todayMeta,
    nextPrayer,
    currentPrayerKey,
    settings,
    requestLocation,
    locationLoading,
    travelAlert,
    dismissTravelAlert,
    refresh,
  } = usePrayer();
  const { getDay } = useTracker();

  const [selectedPrayer, setSelectedPrayer] = useState<{ key: string; time: Date } | null>(null);

  const today = new Date();
  const todayKey = formatDateKey(today);
  const dayLog = getDay(todayKey);

  const hijriDate = toHijri(new Date(today.getTime() + settings.hijriOffset * 86_400_000));
  const gregorianStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hijriStr = `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} AH`;

  const progress = useMemo(() => {
    if (!todayTimes || !nextPrayer) return 0;
    const now = Date.now();
    const allTimes = [
      todayTimes.fajr, todayTimes.sunrise, todayTimes.dhuhr,
      todayTimes.asr, todayTimes.maghrib, todayTimes.isha,
    ];
    const nextIdx = allTimes.findIndex(t => t >= new Date());
    if (nextIdx <= 0) return 0;
    const prev = allTimes[nextIdx - 1]!;
    const next = allTimes[nextIdx]!;
    return Math.min(1, Math.max(0, (now - prev.getTime()) / (next.getTime() - prev.getTime())));
  }, [todayTimes, nextPrayer]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : insets.bottom + 90;

  const prayerRows = todayTimes
    ? [
        { key: 'fajr',    time: todayTimes.fajr    },
        { key: 'sunrise', time: todayTimes.sunrise  },
        { key: 'dhuhr',   time: todayTimes.dhuhr   },
        { key: 'asr',     time: todayTimes.asr      },
        { key: 'maghrib', time: todayTimes.maghrib  },
        { key: 'isha',    time: todayTimes.isha     },
      ]
    : [];

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.locationRow} onPress={requestLocation}>
          <Ionicons
            name={locationLoading ? 'reload-outline' : 'location-outline'}
            size={16}
            color={colors.primary}
          />
          <Text style={[s.cityText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {settings.locationName}
          </Text>
        </Pressable>
        <Pressable onPress={refresh}>
          <Ionicons name="refresh-outline" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Date row — Hijri date is tappable → calendar */}
      <View style={s.dateRow}>
        <Text style={[s.gregorian, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {gregorianStr}
        </Text>
        <Pressable onPress={() => router.push('/hijri-calendar')}>
          <Text style={[s.hijri, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}>
            {hijriStr} ›
          </Text>
        </Pressable>
      </View>

      {/* Notification assurance status — the moat, made visible */}
      <AssuranceBanner />

      {/* Travel alert banner */}
      {travelAlert && (
        <View style={[s.travelBanner, { backgroundColor: colors.accent + '22', borderRadius: colors.radius - 4 }]}>
          <Ionicons name="airplane-outline" size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[s.travelTitle, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
              Traveling?
            </Text>
            <Text style={[s.travelBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              You appear to be far from your saved location. Update prayer times?
            </Text>
          </View>
          <Pressable style={[s.travelBtn, { backgroundColor: colors.accent }]} onPress={requestLocation}>
            <Text style={[s.travelBtnText, { color: '#000000', fontFamily: 'Inter_600SemiBold' }]}>Update</Text>
          </Pressable>
          <Pressable onPress={dismissTravelAlert}>
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      )}

      {/* Hero card */}
      {nextPrayer ? (
        <LinearGradient
          colors={['#1B6B45', '#0D3825']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { borderRadius: colors.radius + 4 }]}
        >
          <Text style={[s.nextLabel, { fontFamily: 'Inter_500Medium' }]}>Next Prayer</Text>
          <Text style={[s.prayerName, { fontFamily: 'Inter_700Bold' }]}>{nextPrayer.name}</Text>
          <CountdownTimer targetTime={nextPrayer.time} textColor="#FFFFFF" fontSize={44} onComplete={refresh} />
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
          <Text style={[s.progressLabel, { fontFamily: 'Inter_400Regular' }]}>
            {Math.round(progress * 100)}% of interval elapsed
          </Text>
        </LinearGradient>
      ) : (
        <View style={[s.hero, { borderRadius: colors.radius + 4, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={[s.prayerName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            All prayers complete
          </Text>
          <Text style={[s.nextLabel, { color: colors.mutedForeground }]}>
            Fajr tomorrow at dawn
          </Text>
        </View>
      )}

      {/* Prayer times list */}
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
          PRAYER TIMES
        </Text>
        {prayerRows.map(({ key, time }, idx) => (
          <View key={key}>
            <PrayerTimeRow
              prayerKey={key}
              time={time}
              isNext={nextPrayer?.key === key}
              isCurrent={currentPrayerKey === key}
              status={key !== 'sunrise' ? (dayLog as unknown as Record<string, 'ontime' | 'late' | 'missed' | 'jamaah' | null>)[key] : undefined}
              approximated={(key === 'fajr' && todayMeta?.fajrApproximated) || (key === 'isha' && todayMeta?.ishaApproximated) || false}
              onPress={() => setSelectedPrayer({ key, time })}
            />
            {idx < prayerRows.length - 1 && (
              <View style={[s.divider, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>

      <Text style={[s.tapHint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Tap any prayer to see how its time is calculated
      </Text>

      <PrayerSourceCard
        prayerKey={selectedPrayer?.key ?? null}
        time={selectedPrayer?.time ?? null}
        onClose={() => setSelectedPrayer(null)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cityText: { fontSize: 16 },
  dateRow: { paddingHorizontal: 20, gap: 2, marginBottom: 16, marginTop: 4 },
  gregorian: { fontSize: 14 },
  hijri: { fontSize: 13 },
  travelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    gap: 10,
  },
  travelTitle: { fontSize: 13 },
  travelBody: { fontSize: 12, marginTop: 1, lineHeight: 16 },
  travelBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  travelBtnText: { fontSize: 12 },
  hero: { marginHorizontal: 16, padding: 24, marginBottom: 16 },
  nextLabel: {
    color: '#FFFFFF99',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  prayerName: { color: '#FFFFFF', fontSize: 28, marginBottom: 16 },
  progressTrack: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#FFFFFF22',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#4ADE80', borderRadius: 2 },
  progressLabel: { color: '#FFFFFF66', fontSize: 11, marginTop: 6 },
  card: { marginHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  sectionLabel: { fontSize: 11, letterSpacing: 1, paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  tapHint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
});
