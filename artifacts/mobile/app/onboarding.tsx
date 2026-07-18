import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { usePrayer } from '@/context/PrayerContext';
import { useNotifications } from '@/context/NotificationContext';
import { CALCULATION_METHODS } from '@/constants/prayers';

const { width: SCREEN_W } = Dimensions.get('window');
const TOTAL_STEPS = 3;

function StepDots({ current }: { current: number }) {
  const colors = useColors();
  return (
    <View style={dot.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            dot.dot,
            {
              backgroundColor: i === current ? colors.primary : colors.border,
              width: i === current ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ── Step 1: Welcome ───────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const colors = useColors();
  const principles = [
    { icon: 'ban-outline' as const, text: 'No ads — ever' },
    { icon: 'phone-portrait-outline' as const, text: 'Your data stays on your device' },
    { icon: 'notifications-outline' as const, text: 'Athan that never fails you' },
  ];
  return (
    <View style={step.container}>
      <LinearGradient
        colors={['#1B6B45', '#0D3825']}
        style={step.iconCard}
      >
        <Ionicons name="moon" size={48} color="#FFFFFF" />
      </LinearGradient>

      <Text style={[step.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Vaqit
      </Text>
      <Text style={[step.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        A Muslim prayer companion built on trust
      </Text>

      <View style={step.principles}>
        {principles.map(({ icon, text }) => (
          <View key={text} style={[step.principleRow, { backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}>
            <View style={[step.principleIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <Text style={[step.principleText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {text}
            </Text>
          </View>
        ))}
      </View>

      <Pressable style={[step.btn, { backgroundColor: colors.primary }]} onPress={onNext}>
        <Text style={[step.btnText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>
          Get Started
        </Text>
        <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

// ── Step 2: Location + Method ─────────────────────────────────────────────────
function LocationStep({ onNext }: { onNext: () => void }) {
  const colors = useColors();
  const { settings, requestLocation, locationLoading, updateSettings } = usePrayer();
  const [showMethods, setShowMethods] = useState(false);

  const currentMethod = CALCULATION_METHODS.find(m => m.id === settings.calculationMethod);

  return (
    <View style={step.container}>
      <View style={[step.iconCard, { backgroundColor: colors.card }]}>
        <Ionicons name="location" size={48} color={colors.primary} />
      </View>

      <Text style={[step.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Where are you praying?
      </Text>
      <Text style={[step.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Accurate prayer times need your location
      </Text>

      <View style={step.fieldGroup}>
        {/* Location row */}
        <Pressable
          style={[step.fieldRow, { backgroundColor: colors.card, borderRadius: colors.radius }]}
          onPress={requestLocation}
        >
          <Ionicons name={locationLoading ? 'reload-outline' : 'navigate-outline'} size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[step.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Current location</Text>
            <Text style={[step.fieldVal, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {locationLoading ? 'Detecting…' : settings.locationName}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </Pressable>

        {/* Method picker */}
        <Pressable
          style={[step.fieldRow, { backgroundColor: colors.card, borderRadius: colors.radius }]}
          onPress={() => setShowMethods(!showMethods)}
        >
          <Ionicons name="calculator-outline" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[step.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>Calculation method</Text>
            <Text style={[step.fieldVal, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              {currentMethod?.label ?? settings.calculationMethod}
            </Text>
          </View>
          <Ionicons name={showMethods ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
        </Pressable>

        {showMethods && (
          <View style={[step.methodList, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {CALCULATION_METHODS.map((m, idx) => (
              <Pressable
                key={m.id}
                style={[
                  step.methodRow,
                  { borderBottomWidth: idx < CALCULATION_METHODS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: colors.border },
                ]}
                onPress={() => { updateSettings({ calculationMethod: m.id }); setShowMethods(false); }}
              >
                <Text style={[step.methodText, { color: m.id === settings.calculationMethod ? colors.primary : colors.foreground, fontFamily: m.id === settings.calculationMethod ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {m.label}
                </Text>
                {m.id === settings.calculationMethod && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable style={[step.btn, { backgroundColor: colors.primary }]} onPress={onNext}>
        <Text style={[step.btnText, { color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }]}>
          Continue
        </Text>
        <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

// ── Step 3: Notifications ─────────────────────────────────────────────────────
function NotificationsStep({ onDone }: { onDone: () => void }) {
  const colors = useColors();
  const { permissionStatus, requestPermission, scheduleAll } = useNotifications();
  const { settings } = usePrayer();
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(permissionStatus === 'granted');

  const handleEnable = async () => {
    setLoading(true);
    const ok = await requestPermission();
    if (ok) {
      setGranted(true);
      await scheduleAll(settings);
    }
    setLoading(false);
  };

  const features = [
    { icon: 'alarm-outline' as const, text: 'Athan at every prayer time' },
    { icon: 'time-outline' as const, text: 'Optional pre-prayer reminders' },
    { icon: 'settings-outline' as const, text: 'Per-prayer control in settings' },
  ];

  return (
    <View style={step.container}>
      <View style={[step.iconCard, { backgroundColor: colors.card }]}>
        <Ionicons name="notifications" size={48} color={colors.accent} />
      </View>

      <Text style={[step.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        Never miss a prayer
      </Text>
      <Text style={[step.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Reliable athan notifications are the heart of Vaqit
      </Text>

      <View style={step.principles}>
        {features.map(({ icon, text }) => (
          <View key={text} style={[step.principleRow, { backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}>
            <View style={[step.principleIcon, { backgroundColor: colors.accent + '22' }]}>
              <Ionicons name={icon} size={18} color={colors.accent} />
            </View>
            <Text style={[step.principleText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              {text}
            </Text>
          </View>
        ))}
      </View>

      {granted ? (
        <View style={[step.grantedBadge, { backgroundColor: colors.primary + '22', borderRadius: colors.radius }]}>
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          <Text style={[step.grantedText, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            Notifications enabled — you're all set
          </Text>
        </View>
      ) : (
        <Pressable
          style={[step.btn, { backgroundColor: colors.accent }]}
          onPress={handleEnable}
          disabled={loading}
        >
          <Ionicons name="notifications-outline" size={18} color="#000000" />
          <Text style={[step.btnText, { color: '#000000', fontFamily: 'Inter_700Bold' }]}>
            {loading ? 'Enabling…' : 'Enable Athan Notifications'}
          </Text>
        </Pressable>
      )}

      <Pressable onPress={onDone}>
        <Text style={[step.skipText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {granted ? 'Done' : 'Skip for now'}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Main onboarding shell ─────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goTo = (next: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const finish = async () => {
    await AsyncStorage.setItem('vaqit_onboarding_done', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20, paddingBottom: Platform.OS === 'web' ? 40 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepDots current={step} />

        {/* width: '100%' only works when the parent does NOT have alignItems: 'center'.
            We removed that from s.scroll — steps fill the scroll width naturally. */}
        <Animated.View style={[s.stepWrapper, { transform: [{ translateY: slideAnim }] }]}>
          {step === 0 && <WelcomeStep onNext={() => goTo(1)} />}
          {step === 1 && <LocationStep onNext={() => goTo(2)} />}
          {step === 2 && <NotificationsStep onDone={finish} />}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  // Do NOT put alignItems: 'center' here — children with width: '100%' collapse
  // to zero width on native RN when the scroll container centres its content.
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  stepWrapper: { width: '100%' },
});

const dot = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: 32 },
  dot: { height: 8, borderRadius: 4 },
});

const step = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', gap: 16 },
  iconCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 30, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8, paddingHorizontal: 16 },
  principles: { width: '100%', gap: 8 },
  principleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  principleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  principleText: { fontSize: 15, flex: 1 },
  btn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  btnText: { fontSize: 16 },
  skipText: { fontSize: 14, marginTop: 4 },
  fieldGroup: { width: '100%', gap: 8 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  fieldLabel: { fontSize: 12 },
  fieldVal: { fontSize: 15, marginTop: 2 },
  methodList: { width: '100%', overflow: 'hidden' },
  methodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  methodText: { fontSize: 15, flex: 1 },
  grantedBadge: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  grantedText: { fontSize: 14, flex: 1 },
});
