import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePrayer } from '@/context/PrayerContext';
import { formatTime } from '@/constants/prayers';
import { getRamadanInfo } from '@/constants/ramadan';
import { useT } from '@/lib/i18n';

/** Shows on the Today screen only during Ramadan; taps into the dashboard. */
export function RamadanBanner() {
  const t = useT();
  const { settings, todayTimes } = usePrayer();

  const adj = new Date(Date.now() + (settings.hijriOffset ?? 0) * 86_400_000);
  const info = getRamadanInfo(adj);
  if (!info.isRamadan) return null;

  const iftar = todayTimes ? todayTimes.maghrib : null;

  return (
    <Pressable onPress={() => router.push('/ramadan')} accessibilityRole="button">
      <LinearGradient
        colors={['#1B6B45', '#0D3825']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.wrap}
      >
        <View style={s.iconWrap}>
          <Ionicons name="moon" size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { fontFamily: 'Inter_700Bold' }]}>
            {t('ramadan.bannerTitle')}
            {info.dayOfRamadan != null ? ` · ${t('ramadan.day', { n: info.dayOfRamadan })}` : ''}
          </Text>
          {iftar && (
            <Text style={[s.sub, { fontFamily: 'Inter_400Regular' }]}>
              {t('ramadan.iftar')} {formatTime(iftar)}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFFAA" />
      </LinearGradient>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 14 },
  sub: { color: '#FFFFFFCC', fontSize: 13, marginTop: 1 },
});
