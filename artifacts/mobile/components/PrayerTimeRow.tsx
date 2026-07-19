import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { PRAYER_DISPLAY_NAMES, PRAYER_ICONS, formatTime, STATUS_COLORS } from '@/constants/prayers';
import type { PrayerStatus } from '@/context/TrackerContext';

interface PrayerTimeRowProps {
  prayerKey: string;
  time: Date;
  isNext?: boolean;
  isCurrent?: boolean;
  status?: PrayerStatus | null;
  /** True when this time was estimated by a high-latitude rule (see source card). */
  approximated?: boolean;
  /** When provided, the row becomes tappable and opens the source card. */
  onPress?: () => void;
}

export function PrayerTimeRow({ prayerKey, time, isNext, isCurrent, status, approximated, onPress }: PrayerTimeRowProps) {
  const colors = useColors();
  const name = PRAYER_DISPLAY_NAMES[prayerKey] ?? prayerKey;
  const icon = (PRAYER_ICONS[prayerKey] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];
  const isSunrise = prayerKey === 'sunrise';

  const rowBg = isNext
    ? colors.primary + '18'
    : isCurrent
    ? colors.accent + '12'
    : 'transparent';

  const nameColor = isNext ? colors.primary : isCurrent ? colors.accent : colors.foreground;
  const iconColor = isNext ? colors.primary : isCurrent ? colors.accent : colors.mutedForeground;
  const timeColor = isNext ? colors.primary : colors.foreground;

  const statusDotColor = status ? STATUS_COLORS[status] : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${name} at ${formatTime(time)}. Tap to see how this time is calculated.` : undefined}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? colors.muted : rowBg, borderRadius: colors.radius - 4 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={[styles.name, { color: nameColor, fontFamily: isNext ? 'Inter_600SemiBold' : 'Inter_500Medium' }]}>
          {name}
        </Text>
        {approximated && (
          <View style={[styles.approxBadge, { backgroundColor: colors.accent + '22' }]}>
            <Ionicons name="alert-circle-outline" size={11} color={colors.accent} />
            <Text style={[styles.approxLabel, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
              Estimated
            </Text>
          </View>
        )}
      </View>

      {isNext && (
        <View style={[styles.nextBadge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.nextLabel, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Next
          </Text>
        </View>
      )}

      {statusDotColor && !isSunrise && (
        <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
      )}

      <Text style={[styles.time, { color: timeColor, fontFamily: isNext ? 'Inter_700Bold' : 'Inter_500Medium' }]}>
        {formatTime(time)}
      </Text>

      {onPress && (
        <Ionicons name="information-circle-outline" size={15} color={colors.mutedForeground} style={{ marginLeft: 2 }} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
  },
  nextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  approxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approxLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nextLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  time: {
    fontSize: 16,
    minWidth: 72,
    textAlign: 'right',
  },
});
