import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useNotifications } from '@/context/NotificationContext';
import { useT } from '@/lib/i18n';

/**
 * The home-screen proof that the next athan is actually armed — the visible
 * face of the Notification Assurance moat. Tapping opens the Health Check.
 */
export function AssuranceBanner() {
  const colors = useColors();
  const t = useT();
  const { assurance } = useNotifications();
  const headline = assurance.level === 'ok' ? t('assurance.ready') : t('assurance.actionRequired');

  const config =
    assurance.level === 'ok'
      ? { icon: 'checkmark-circle' as const, tint: colors.primary }
      : assurance.level === 'blocked'
      ? { icon: 'alert-circle' as const, tint: colors.destructive }
      : { icon: 'warning' as const, tint: colors.accent };

  return (
    <Pressable
      onPress={() => router.push('/notification-health')}
      accessibilityRole="button"
      accessibilityLabel={`Notification status: ${headline}. ${assurance.detail}. Tap to open Health Check.`}
      style={({ pressed }) => [
        s.wrap,
        {
          backgroundColor: config.tint + (pressed ? '2C' : '18'),
          borderColor: config.tint + '55',
          borderRadius: colors.radius,
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.tint} />
      <View style={{ flex: 1 }}>
        <Text style={[s.headline, { color: config.tint, fontFamily: 'Inter_700Bold' }]}>
          {headline}
        </Text>
        <Text style={[s.detail, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
          {assurance.detail}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  headline: { fontSize: 14 },
  detail: { fontSize: 13, marginTop: 1 },
});
