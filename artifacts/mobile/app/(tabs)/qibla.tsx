import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePrayer } from '@/context/PrayerContext';

const MECCA_LAT = 21.3891;
const MECCA_LON = 39.8579;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CompassRose({ size, colors }: { size: number; colors: ReturnType<typeof useColors> }) {
  const r = size / 2;
  const ringWidth = 3;
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* Outer ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: ringWidth,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      />
      {/* Tick marks */}
      {ticks.map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const isMajor = angle % 90 === 0;
        const isMinor = angle % 45 === 0;
        const innerR = r - (isMajor ? 20 : isMinor ? 14 : 10);
        const outerR = r - 4;
        const x1 = r + outerR * Math.cos(rad);
        const y1 = r + outerR * Math.sin(rad);
        const x2 = r + innerR * Math.cos(rad);
        const y2 = r + innerR * Math.sin(rad);
        return (
          <View
            key={angle}
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: isMajor ? 2.5 : 1.5,
              height: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
              backgroundColor: isMajor ? colors.foreground : colors.border,
              transformOrigin: 'top left',
              transform: [
                { rotate: `${angle}deg` },
                { translateX: -0.5 },
              ],
            }}
          />
        );
      })}
      {/* Cardinal labels */}
      {cardinals.map(({ label, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const labelR = r - 32;
        const x = r + labelR * Math.cos(rad);
        const y = r + labelR * Math.sin(rad);
        const isNorth = label === 'N';
        return (
          <Text
            key={label}
            style={{
              position: 'absolute',
              left: x - 10,
              top: y - 10,
              width: 20,
              textAlign: 'center',
              fontSize: isNorth ? 16 : 13,
              fontFamily: 'Inter_700Bold',
              color: isNorth ? colors.destructive : colors.foreground,
            }}
          >
            {label}
          </Text>
        );
      })}
    </View>
  );
}

export default function QiblaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, qiblaDirection } = usePrayer();

  const [heading, setHeading] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const compassAnim = useRef(new Animated.Value(0)).current;
  const needleAnim = useRef(new Animated.Value(0)).current;
  const prevHeadingRef = useRef(0);

  const distance = Math.round(
    haversineDistance(settings.latitude, settings.longitude, MECCA_LAT, MECCA_LON)
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let sub: { remove: () => void } | null = null;
    (async () => {
      try {
        // Import directly from the Magnetometer module to avoid Pedometer.js
        // eagerly accessing PermissionStatus.GRANTED (undefined in Expo Go SDK 54).
        const { Magnetometer } = await import('expo-sensors/build/Magnetometer');
        setSensorAvailable(true);
        Magnetometer.setUpdateInterval(150);
        sub = Magnetometer.addListener(({ x, y }) => {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
        });
      } catch {
        setSensorAvailable(false);
      }
    })();

    return () => { sub?.remove(); };
  }, []);

  useEffect(() => {
    // Smooth compass rotation
    const compassTarget = -heading;
    Animated.spring(compassAnim, {
      toValue: compassTarget,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start();

    // Needle points to qibla direction minus current heading
    const needleTarget = qiblaDirection - heading;
    Animated.spring(needleAnim, {
      toValue: needleTarget,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start();
    prevHeadingRef.current = heading;
  }, [heading, qiblaDirection]);

  const compassSize = 280;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : insets.bottom + 90;

  const bearingToMecca = Math.round(((qiblaDirection % 360) + 360) % 360);

  return (
    <View style={[s.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* Title */}
      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Qibla</Text>
      <Text style={[s.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Direction toward the Kaaba
      </Text>

      {/* Compass */}
      <View style={s.compassWrap}>
        <Animated.View
          style={{
            transform: [{ rotate: compassAnim.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }],
          }}
        >
          <CompassRose size={compassSize} colors={colors} />
        </Animated.View>

        {/* Qibla needle (fixed to compass frame) */}
        <Animated.View
          style={[
            s.needle,
            {
              transform: [
                { rotate: needleAnim.interpolate({ inputRange: [-720, 720], outputRange: ['-720deg', '720deg'] }) },
              ],
            },
          ]}
        >
          <View style={[s.needleTip, { backgroundColor: colors.primary }]} />
          <View style={[s.needleTail, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Center dot */}
        <View style={[s.centerDot, { backgroundColor: colors.primary }]} />

        {/* Kaaba icon in center */}
        <View style={s.kaabaDot}>
          <Ionicons name="location" size={12} color={colors.primaryForeground} />
        </View>
      </View>

      {/* Info cards */}
      <View style={s.infoRow}>
        <View style={[s.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="navigate-outline" size={22} color={colors.primary} />
          <Text style={[s.infoVal, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {bearingToMecca}°
          </Text>
          <Text style={[s.infoLbl, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            from North
          </Text>
        </View>
        <View style={[s.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="map-outline" size={22} color={colors.accent} />
          <Text style={[s.infoVal, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {distance.toLocaleString()}
          </Text>
          <Text style={[s.infoLbl, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            km to Mecca
          </Text>
        </View>
      </View>

      {!sensorAvailable && Platform.OS !== 'web' && (
        <Text style={[s.hint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Magnetometer not available on this device
        </Text>
      )}
      {Platform.OS === 'web' && (
        <Text style={[s.hint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          Live compass requires a real device via Expo Go
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 28, alignSelf: 'flex-start', marginBottom: 4 },
  subtitle: { fontSize: 14, alignSelf: 'flex-start', marginBottom: 40 },
  compassWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  needle: {
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    left: 140 - 3,
    height: 140,
    width: 6,
  },
  needleTip: {
    width: 6,
    height: 70,
    borderRadius: 3,
  },
  needleTail: {
    width: 6,
    height: 70,
    borderRadius: 3,
  },
  centerDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  kaabaDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', gap: 12, width: '100%' },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  infoVal: { fontSize: 26 },
  infoLbl: { fontSize: 13 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 16, paddingHorizontal: 16 },
});
