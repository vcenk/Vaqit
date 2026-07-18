import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface CountdownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
  textColor?: string;
  fontSize?: number;
}

function getRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { h: 0, m: 0, s: 0, total: 0 };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, total: diff };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function CountdownTimer({ targetTime, onComplete, textColor, fontSize = 48 }: CountdownTimerProps) {
  const colors = useColors();
  const color = textColor ?? colors.foreground;
  const [time, setTime] = useState(getRemaining(targetTime));

  useEffect(() => {
    setTime(getRemaining(targetTime));
    const id = setInterval(() => {
      const r = getRemaining(targetTime);
      setTime(r);
      if (r.total <= 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  const sepSize = Math.round(fontSize * 0.75);
  const sepColor = textColor ? textColor + 'AA' : colors.mutedForeground;

  return (
    <View style={styles.row}>
      <Text style={[styles.digit, { color, fontSize, fontFamily: 'Inter_700Bold', letterSpacing: -1 }]}>
        {pad(time.h)}
      </Text>
      <Text style={[styles.sep, { color: sepColor, fontSize: sepSize }]}>:</Text>
      <Text style={[styles.digit, { color, fontSize, fontFamily: 'Inter_700Bold', letterSpacing: -1 }]}>
        {pad(time.m)}
      </Text>
      <Text style={[styles.sep, { color: sepColor, fontSize: sepSize }]}>:</Text>
      <Text style={[styles.digit, { color, fontSize, fontFamily: 'Inter_700Bold', letterSpacing: -1 }]}>
        {pad(time.s)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  digit: {},
  sep: { marginHorizontal: 2, marginBottom: 4 },
});
