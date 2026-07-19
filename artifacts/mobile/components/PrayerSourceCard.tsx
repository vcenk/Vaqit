import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePrayer } from '@/context/PrayerContext';
import { useMosque } from '@/context/MosqueContext';
import { buildPrayerExplanation, explainMosqueDiff, methodRegion } from '@/lib/prayerMeta';
import { formatTime } from '@/constants/prayers';
import { SOURCE_TYPE_LABELS } from '@/context/MosqueContext';

interface Props {
  prayerKey: string | null;
  time: Date | null;
  onClose: () => void;
}

/** A labelled fact line in the source card. */
function Fact({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  valueColor?: string;
}) {
  const colors = useColors();
  return (
    <View style={s.fact}>
      <View style={[s.factIcon, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon} size={15} color={colors.mutedForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.factLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
        <Text style={[s.factValue, { color: valueColor ?? colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{value}</Text>
      </View>
    </View>
  );
}

export function PrayerSourceCard({ prayerKey, time, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings } = usePrayer();
  const { mosque, getIqamahTime, getMosqueStart, getDiffMinutes } = useMosque();

  const explanation = useMemo(() => {
    if (!prayerKey) return null;
    return buildPrayerExplanation(settings, prayerKey, new Date());
  }, [prayerKey, settings]);

  const visible = prayerKey !== null && explanation !== null;
  const region = methodRegion(settings.calculationMethod);

  // Mosque comparison (only for the five daily prayers, when enabled)
  const isDaily = prayerKey && prayerKey !== 'sunrise';
  const pk = isDaily ? (prayerKey as any) : null;
  const showMosque = Boolean(visible && pk && mosque.enabled && time);

  const iqamah = showMosque && time ? getIqamahTime(pk, time) : null;
  const iqamahOffset = pk ? mosque.offsets[pk as keyof typeof mosque.offsets] ?? 0 : 0;

  const mosqueStart = showMosque && time ? getMosqueStart(pk, time) : null;
  const diffMin = showMosque && time ? getDiffMinutes(pk, time) : null;
  const mosqueDiff =
    pk && diffMin !== null ? explainMosqueDiff(pk, diffMin, settings.calculationMethod) : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[s.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
          onPress={e => e.stopPropagation()}
        >
          {explanation && (
            <>
              <View style={s.handle} />

              {/* Header: prayer name + time */}
              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.prayerName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                    {explanation.displayName}
                  </Text>
                  <Text style={[s.sourceLine, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    {explanation.sourceLine}
                  </Text>
                </View>
                {time && (
                  <Text style={[s.time, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
                    {formatTime(time)}
                  </Text>
                )}
              </View>

              {/* Approximated warning (the differentiator) */}
              {explanation.approximated && (
                <View style={[s.approxCard, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '55' }]}>
                  <View style={s.approxHeader}>
                    <Ionicons name="alert-circle" size={18} color={colors.accent} />
                    <Text style={[s.approxTitle, { color: colors.accent, fontFamily: 'Inter_700Bold' }]}>
                      Estimated time
                    </Text>
                  </View>
                  {explanation.approxNote && (
                    <Text style={[s.approxBody, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                      {explanation.approxNote}
                    </Text>
                  )}
                  {explanation.ruleLabel && (
                    <View style={[s.ruleBox, { backgroundColor: colors.background }]}>
                      <Text style={[s.ruleLabel, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                        Rule applied: {explanation.ruleLabel}
                      </Text>
                      {explanation.ruleExplanation && (
                        <Text style={[s.ruleBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                          {explanation.ruleExplanation}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Facts */}
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                <Fact icon="calculator-outline" label="How it’s derived" value={explanation.basisText} />
                <Fact
                  icon="options-outline"
                  label="Calculation method"
                  value={region ? `${explanation.methodLabel} · ${region}` : explanation.methodLabel}
                />
                <Fact icon="location-outline" label="Location" value={explanation.locationName} />
                {explanation.adjustmentMin !== 0 && (
                  <Fact
                    icon="hand-left-outline"
                    label="Your manual adjustment"
                    value={`${explanation.adjustmentMin > 0 ? '+' : ''}${explanation.adjustmentMin} min`}
                    valueColor={colors.primary}
                  />
                )}

                {/* Mosque comparison */}
                {showMosque && (iqamah || mosqueStart) && (
                  <View style={[s.mosqueBox, { borderTopColor: colors.border }]}>
                    <Text style={[s.mosqueTitle, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
                      {mosque.mosqueName ? mosque.mosqueName.toUpperCase() : 'YOUR MOSQUE'}
                      {`  ·  ${SOURCE_TYPE_LABELS[mosque.sourceType].toUpperCase()}`}
                    </Text>

                    {mosqueStart && (
                      <Fact
                        icon="time-outline"
                        label="Mosque start time"
                        value={
                          diffMin === null || diffMin === 0
                            ? `${formatTime(mosqueStart)}  (matches calculated)`
                            : `${formatTime(mosqueStart)}  (${diffMin > 0 ? '+' : ''}${diffMin} min)`
                        }
                        valueColor={colors.primary}
                      />
                    )}

                    {iqamah && (
                      <Fact
                        icon="business-outline"
                        label="Iqamah"
                        value={`${formatTime(iqamah)}  (+${iqamahOffset} min after adhan)`}
                        valueColor={colors.primary}
                      />
                    )}

                    {mosqueDiff && diffMin !== null && diffMin !== 0 && (
                      <View style={[s.ruleBox, { backgroundColor: colors.background, marginTop: 6 }]}>
                        <Text style={[s.ruleBody, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                          {mosqueDiff.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>

              <Pressable style={[s.closeBtn, { backgroundColor: colors.muted }]} onPress={onClose}>
                <Text style={[s.closeText, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>Done</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#88888855', marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  prayerName: { fontSize: 24 },
  sourceLine: { fontSize: 13, marginTop: 2 },
  time: { fontSize: 26 },
  approxCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16, gap: 8 },
  approxHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  approxTitle: { fontSize: 15 },
  approxBody: { fontSize: 13, lineHeight: 19 },
  ruleBox: { borderRadius: 10, padding: 12, gap: 4, marginTop: 2 },
  ruleLabel: { fontSize: 13 },
  ruleBody: { fontSize: 12, lineHeight: 17 },
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  factIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  factLabel: { fontSize: 12, marginBottom: 2 },
  factValue: { fontSize: 15, lineHeight: 20 },
  mosqueBox: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 8 },
  mosqueTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 2 },
  closeBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  closeText: { fontSize: 15 },
});
