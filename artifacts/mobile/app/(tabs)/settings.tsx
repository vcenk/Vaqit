import React, { useState } from 'react';
import {
  Modal,
  Platform,
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
import {
  CALCULATION_METHODS,
  HIGH_LAT_RULES,
  MADHABS,
} from '@/constants/prayers';

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[sh.text, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
      {title}
    </Text>
  );
}

function SettingRow({
  label,
  value,
  icon,
  onPress,
  chevron = true,
  danger = false,
}: {
  label: string;
  value?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [sr.row, { backgroundColor: pressed ? colors.muted : colors.card }]}
      onPress={onPress}
    >
      <View style={[sr.iconWrap, { backgroundColor: danger ? colors.destructive + '22' : colors.primary + '22' }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[sr.label, { color: danger ? colors.destructive : colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
        {label}
      </Text>
      {value && (
        <Text style={[sr.value, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {value}
        </Text>
      )}
      {chevron && (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={pm.backdrop} onPress={onClose} />
      <View style={[pm.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        <View style={[pm.handle, { backgroundColor: colors.border }]} />
        <Text style={[pm.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{title}</Text>
        <ScrollView>
          {options.map((opt, idx) => {
            const isLast = idx === options.length - 1;
            const active = opt.id === selected;
            return (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [pm.option, { backgroundColor: pressed ? colors.muted : 'transparent', borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                onPress={() => { onSelect(opt.id); onClose(); }}
              >
                <Text style={[pm.optionText, { color: active ? colors.primary : colors.foreground, fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {opt.label}
                </Text>
                {active && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, requestLocation, locationLoading } = usePrayer();

  const [picker, setPicker] = useState<'method' | 'madhab' | 'highLat' | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : insets.bottom + 90;

  const currentMethod = CALCULATION_METHODS.find((m) => m.id === settings.calculationMethod)?.label ?? settings.calculationMethod;
  const currentMadhab = MADHABS.find((m) => m.id === settings.madhab)?.label ?? settings.madhab;
  const currentHighLat = HIGH_LAT_RULES.find((r) => r.id === settings.highLatitudeRule)?.label ?? settings.highLatitudeRule;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>Settings</Text>

      {/* Location */}
      <SectionHeader title="LOCATION" />
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <SettingRow
          icon="location-outline"
          label={settings.locationName}
          value={`${settings.latitude.toFixed(2)}° N`}
          onPress={requestLocation}
          chevron={false}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon={locationLoading ? 'reload-outline' : 'navigate-outline'}
          label="Update with GPS"
          onPress={requestLocation}
        />
      </View>

      {/* Prayer Calculation */}
      <SectionHeader title="PRAYER CALCULATION" />
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <SettingRow
          icon="calculator-outline"
          label="Calculation Method"
          value={currentMethod}
          onPress={() => setPicker('method')}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="school-outline"
          label="School of Jurisprudence"
          value={currentMadhab}
          onPress={() => setPicker('madhab')}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="compass-outline"
          label="High Latitude Rule"
          value={currentHighLat}
          onPress={() => setPicker('highLat')}
        />
      </View>

      {/* Privacy */}
      <SectionHeader title="PRIVACY" />
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={sr.row}>
          <View style={[sr.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              Data stays on your device
            </Text>
            <Text style={[s.privacyNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Your location, prayer times, and tracker data never leave your phone. No analytics, no ads, no third-party data sharing.
            </Text>
          </View>
        </View>
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <View style={sr.row}>
          <View style={[sr.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="ban-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
              No ads — ever
            </Text>
          </View>
        </View>
      </View>

      {/* About */}
      <SectionHeader title="ABOUT" />
      <View style={[s.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" onPress={() => {}} chevron={false} />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <SettingRow icon="heart-outline" label="Worship is free, forever" onPress={() => {}} chevron={false} />
      </View>

      {/* Pickers */}
      <PickerModal
        visible={picker === 'method'}
        title="Calculation Method"
        options={CALCULATION_METHODS}
        selected={settings.calculationMethod}
        onSelect={(id) => updateSettings({ calculationMethod: id })}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === 'madhab'}
        title="School of Jurisprudence"
        options={MADHABS}
        selected={settings.madhab}
        onSelect={(id) => updateSettings({ madhab: id })}
        onClose={() => setPicker(null)}
      />
      <PickerModal
        visible={picker === 'highLat'}
        title="High Latitude Rule"
        options={HIGH_LAT_RULES}
        selected={settings.highLatitudeRule}
        onSelect={(id) => updateSettings({ highLatitudeRule: id })}
        onClose={() => setPicker(null)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, marginBottom: 20 },
  card: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  privacyNote: { fontSize: 13, lineHeight: 18 },
});

const sh = StyleSheet.create({
  text: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
});

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 15 },
  value: { fontSize: 13, maxWidth: 160, textAlign: 'right' },
});

const pm = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  optionText: { fontSize: 16, flex: 1 },
});
