import React, { useMemo } from 'react';
import {
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
import { usePrayer, computePrayerTimes } from '@/context/PrayerContext';
import { useRamadan, FAST_STATUS_META, type FastStatus } from '@/context/RamadanContext';
import { CountdownTimer } from '@/components/CountdownTimer';
import { formatTime, formatDateKey } from '@/constants/prayers';
import { getRamadanInfo } from '@/constants/ramadan';
import { useT, type TKey } from '@/lib/i18n';

const FAST_STATUSES: FastStatus[] = ['fasted', 'missed', 'traveling', 'exempt'];
const FAST_ICONS: Record<FastStatus, React.ComponentProps<typeof Ionicons>['name']> = {
  fasted: 'checkmark-circle',
  missed: 'ellipse-outline',
  traveling: 'airplane',
  exempt: 'heart',
};

function TimeCard({ icon, label, time, tint }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; time: Date; tint: string }) {
  const colors = useColors();
  return (
    <View style={[s.timeCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <Ionicons name={icon} size={22} color={tint} />
      <Text style={[s.timeVal, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{formatTime(time)}</Text>
      <Text style={[s.timeLbl, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

export default function RamadanScreen() {
  const colors = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { todayTimes, settings, refresh } = usePrayer();
  const { imsakOffset, getFasting, setFasting, fastedCount } = useRamadan();

  const todayKey = formatDateKey(new Date());
  const todayStatus = getFasting(todayKey);

  // Hijri offset-adjusted "today" for Ramadan detection (matches Today screen).
  const info = useMemo(() => {
    const adj = new Date(Date.now() + (settings.hijriOffset ?? 0) * 86_400_000);
    return getRamadanInfo(adj);
  }, [settings.hijriOffset]);

  const imsakTime = todayTimes ? new Date(todayTimes.fajr.getTime() - imsakOffset * 60_000) : null;
  const iftarTime = todayTimes ? todayTimes.maghrib : null;

  // Which event is next → drives the hero countdown.
  const hero = useMemo(() => {
    if (!imsakTime || !iftarTime) return null;
    const now = Date.now();
    if (now < imsakTime.getTime()) return { label: t('ramadan.suhoorCountdown'), target: imsakTime };
    if (now < iftarTime.getTime()) return { label: t('ramadan.iftarCountdown'), target: iftarTime };
    // After iftar → next suhoor (tomorrow).
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tt = computePrayerTimes(settings, tomorrow);
    if (!tt) return null;
    return { label: t('ramadan.suhoorCountdown'), target: new Date(tt.fajr.getTime() - imsakOffset * 60_000) };
  }, [imsakTime, iftarTime, settings, imsakOffset, t]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom + 24;

  const toggle = (status: FastStatus) => {
    setFasting(todayKey, todayStatus === status ? null : status);
  };

  const imsakNote = imsakOffset > 0 ? t('ramadan.imsakNote', { n: imsakOffset }) : t('ramadan.imsakNoteZero');

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color={colors.primary} />
      </Pressable>

      <View style={s.header}>
        <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('ramadan.title')}</Text>
        {info.dayOfRamadan != null && (
          <View style={[s.dayBadge, { backgroundColor: colors.accent + '22' }]}>
            <Ionicons name="moon" size={13} color={colors.accent} />
            <Text style={[s.dayText, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
              {t('ramadan.day', { n: info.dayOfRamadan })} · {info.hijriYear} AH
            </Text>
          </View>
        )}
      </View>

      {/* Not-Ramadan preview */}
      {!info.isRamadan && (
        <View style={[s.notHere, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="moon-outline" size={26} color={colors.accent} />
          <Text style={[s.notHereTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('ramadan.notHereTitle')}</Text>
          <Text style={[s.notHereBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{t('ramadan.notHereBody')}</Text>
        </View>
      )}

      {/* Hero countdown (during Ramadan) */}
      {info.isRamadan && hero && (
        <LinearGradient colors={['#1B6B45', '#0D3825']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { borderRadius: colors.radius + 4 }]}>
          <Text style={[s.heroLabel, { fontFamily: 'Inter_500Medium' }]}>{hero.label}</Text>
          <CountdownTimer targetTime={hero.target} textColor="#FFFFFF" fontSize={40} onComplete={refresh} />
        </LinearGradient>
      )}

      {/* Suhoor / Iftar times */}
      {imsakTime && iftarTime && (
        <View style={s.timeRow}>
          <TimeCard icon="restaurant-outline" label={t('ramadan.suhoorEnds')} time={imsakTime} tint={colors.primary} />
          <TimeCard icon="cloudy-night-outline" label={t('ramadan.iftar')} time={iftarTime} tint={colors.accent} />
        </View>
      )}
      {imsakTime && (
        <Text style={[s.imsakNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{imsakNote}</Text>
      )}

      {/* Today's fast (during Ramadan) */}
      {info.isRamadan && (
        <>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
            {t('ramadan.todaysFast').toUpperCase()}
          </Text>
          <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius, padding: 12 }]}>
            <View style={s.fastRow}>
              {FAST_STATUSES.map(st => {
                const active = todayStatus === st;
                const col = FAST_STATUS_META[st].color;
                return (
                  <Pressable
                    key={st}
                    style={[s.fastPill, { backgroundColor: active ? col + '22' : colors.muted, borderColor: active ? col : 'transparent' }]}
                    onPress={() => toggle(st)}
                  >
                    <Ionicons name={FAST_ICONS[st]} size={18} color={active ? col : colors.mutedForeground} />
                    <Text style={[s.fastPillText, { color: active ? col : colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                      {t(`ramadan.log.${st}` as TKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={[s.fastedCount, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {t('ramadan.fastedDays', { n: fastedCount() })}
          </Text>
          <View style={[s.compassion, { backgroundColor: colors.primary + '12', borderRadius: colors.radius }]}>
            <Ionicons name="heart-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={[s.compassionText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>{t('ramadan.compassion')}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  back: { paddingHorizontal: 12, paddingBottom: 4, alignSelf: 'flex-start' },
  header: { paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  title: { fontSize: 30 },
  dayBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  dayText: { fontSize: 13 },
  notHere: { marginHorizontal: 16, padding: 24, alignItems: 'center', gap: 10 },
  notHereTitle: { fontSize: 18, textAlign: 'center' },
  notHereBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  hero: { marginHorizontal: 16, padding: 24, marginBottom: 16, alignItems: 'center', gap: 6 },
  heroLabel: { color: '#FFFFFFAA', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  timeCard: { flex: 1, alignItems: 'center', paddingVertical: 20, gap: 4 },
  timeVal: { fontSize: 24 },
  timeLbl: { fontSize: 13 },
  imsakNote: { fontSize: 12, textAlign: 'center', paddingHorizontal: 24, marginTop: 10, lineHeight: 17 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  card: { marginHorizontal: 16, overflow: 'hidden' },
  fastRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' },
  fastPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, flexGrow: 1, justifyContent: 'center' },
  fastPillText: { fontSize: 13 },
  fastedCount: { fontSize: 15, textAlign: 'center', marginTop: 16 },
  compassion: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12, padding: 14, alignItems: 'flex-start' },
  compassionText: { fontSize: 13, lineHeight: 19, flex: 1 },
});
