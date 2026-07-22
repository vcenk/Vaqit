import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePrayer } from '@/context/PrayerContext';
import { useNotifications } from '@/context/NotificationContext';
import { useMosque } from '@/context/MosqueContext';
import { useSupporter } from '@/context/SupporterContext';
import { useLocale, useT, SUPPORTED_LOCALES } from '@/lib/i18n';
import {
  CALCULATION_METHODS,
  HIGH_LAT_RULES,
  MADHABS,
  PRAYER_DISPLAY_NAMES,
  PRAYER_ICONS,
  TRACKABLE_PRAYERS,
  type PrayerKey,
} from '@/constants/prayers';

// ── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[sh.text, { color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold' }]}>
      {title}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[card.wrap, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      {children}
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[d.line, { backgroundColor: colors.border }]} />;
}

function SettingRow({
  label,
  value,
  icon,
  iconColor,
  onPress,
  right,
  danger = false,
}: {
  label: string;
  value?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  const colors = useColors();
  const ic = iconColor ?? (danger ? colors.destructive : colors.primary);
  return (
    <Pressable
      style={({ pressed }) => [sr.row, { backgroundColor: pressed && onPress ? colors.muted : 'transparent' }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[sr.iconWrap, { backgroundColor: ic + '22' }]}>
        <Ionicons name={icon} size={18} color={ic} />
      </View>
      <Text style={[sr.label, { color: danger ? colors.destructive : colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
        {label}
      </Text>
      {value && (
        <Text style={[sr.value, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {value}
        </Text>
      )}
      {right}
      {onPress && !right && (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function PickerModal({
  visible, title, options, selected, onSelect, onClose,
}: {
  visible: boolean; title: string;
  options: { id: string; label: string }[];
  selected: string; onSelect: (id: string) => void; onClose: () => void;
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
            const active = opt.id === selected;
            return (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [pm.option, { backgroundColor: pressed ? colors.muted : 'transparent', borderBottomWidth: idx < options.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: colors.border }]}
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

// ── Notification settings per prayer ─────────────────────────────────────────
const PRE_REMINDER_OPTIONS = [0, 5, 10, 15, 30];

function PrayerNotifRow({ prayer }: { prayer: PrayerKey }) {
  const colors = useColors();
  const t = useT();
  const { notifSettings, updatePrayerNotif, scheduleAll } = useNotifications();
  const { settings } = usePrayer();
  const [showReminder, setShowReminder] = useState(false);
  const cfg = notifSettings[prayer];
  const icon = (PRAYER_ICONS[prayer] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];

  const toggle = async (val: boolean) => {
    await updatePrayerNotif(prayer, { enabled: val });
    await scheduleAll(settings);
  };

  const setReminder = async (min: number) => {
    await updatePrayerNotif(prayer, { preReminder: min });
    await scheduleAll(settings);
    setShowReminder(false);
  };

  return (
    <View>
      <View style={pnr.row}>
        <View style={[pnr.iconWrap, { backgroundColor: colors.muted }]}>
          <Ionicons name={icon} size={16} color={colors.mutedForeground} />
        </View>
        <Text style={[pnr.name, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
          {PRAYER_DISPLAY_NAMES[prayer]}
        </Text>

        {cfg.enabled && (
          <Pressable
            style={[pnr.reminderBtn, { backgroundColor: colors.muted, borderRadius: 8 }]}
            onPress={() => setShowReminder(!showReminder)}
          >
            <Text style={[pnr.reminderText, { color: cfg.preReminder > 0 ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
              {cfg.preReminder > 0 ? `−${cfg.preReminder}m` : t('settings.notif.noReminder')}
            </Text>
          </Pressable>
        )}

        <Switch
          value={cfg.enabled}
          onValueChange={toggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
        />
      </View>

      {showReminder && cfg.enabled && (
        <View style={[pnr.reminderOptions, { backgroundColor: colors.background }]}>
          <Text style={[pnr.reminderLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            {t('settings.notif.preReminder')}
          </Text>
          <View style={pnr.reminderPills}>
            {PRE_REMINDER_OPTIONS.map(min => (
              <Pressable
                key={min}
                style={[pnr.pill, { backgroundColor: cfg.preReminder === min ? colors.primary + '22' : colors.muted, borderColor: cfg.preReminder === min ? colors.primary : 'transparent', borderWidth: 1.5, borderRadius: 8 }]}
                onPress={() => setReminder(min)}
              >
                <Text style={[pnr.pillText, { color: cfg.preReminder === min ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                  {min === 0 ? t('settings.notif.off') : `${min}m`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Main Settings screen ──────────────────────────────────────────────────────
export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, requestLocation, locationLoading } = usePrayer();
  const { permissionStatus, scheduledCount } = useNotifications();
  const { mosque } = useMosque();
  const { isSupporter } = useSupporter();
  const { locale, setLocale, isSystemDefault, clearOverride, t } = useLocale();

  const [picker, setPicker] = useState<'method' | 'madhab' | 'highLat' | 'language' | null>(null);

  const currentLanguage = isSystemDefault
    ? t('settings.language.systemDefault')
    : SUPPORTED_LOCALES.find(l => l.code === locale)?.label ?? locale;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : insets.bottom + 90;

  const currentMethod = CALCULATION_METHODS.find(m => m.id === settings.calculationMethod)?.label ?? settings.calculationMethod;
  const currentMadhab = MADHABS.find(m => m.id === settings.madhab)?.label ?? settings.madhab;
  const currentHighLat = HIGH_LAT_RULES.find(r => r.id === settings.highLatitudeRule)?.label ?? settings.highLatitudeRule;

  const notifStatusLabel = permissionStatus === 'granted'
    ? scheduledCount > 0 ? t('settings.notif.scheduled', { n: scheduledCount }) : t('settings.notif.enabled')
    : permissionStatus === 'denied' ? t('settings.notif.blocked') : t('settings.notif.notSet');

  const notifStatusColor = permissionStatus === 'granted'
    ? colors.primary
    : colors.destructive;

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>{t('settings.title')}</Text>

      {/* ── Notifications ── */}
      <SectionHeader title={t('settings.section.notifications').toUpperCase()} />
      <Card>
        <SettingRow
          icon="medkit-outline"
          iconColor={notifStatusColor}
          label={t('settings.row.notifHealth')}
          value={notifStatusLabel}
          onPress={() => router.push('/notification-health')}
        />
        <Divider />
        {TRACKABLE_PRAYERS.map((p, idx) => (
          <View key={p}>
            <View style={{ paddingHorizontal: 0 }}>
              <PrayerNotifRow prayer={p} />
            </View>
            {idx < TRACKABLE_PRAYERS.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      {/* ── Location ── */}
      <SectionHeader title={t('settings.section.location').toUpperCase()} />
      <Card>
        <SettingRow
          icon="location-outline"
          label={settings.locationName}
          value={`${settings.latitude.toFixed(2)}°`}
          onPress={requestLocation}
        />
        <Divider />
        <SettingRow
          icon={locationLoading ? 'reload-outline' : 'navigate-outline'}
          label={t('settings.row.updateGps')}
          onPress={requestLocation}
        />
      </Card>

      {/* ── Prayer Calculation ── */}
      <SectionHeader title={t('settings.section.calculation').toUpperCase()} />
      <Card>
        <SettingRow icon="calculator-outline" label={t('settings.row.calcMethod')} value={currentMethod} onPress={() => setPicker('method')} />
        <Divider />
        <SettingRow icon="school-outline" iconColor={colors.accent} label={t('settings.row.school')} value={currentMadhab} onPress={() => setPicker('madhab')} />
        <Divider />
        <SettingRow icon="compass-outline" label={t('settings.row.highLat')} value={currentHighLat} onPress={() => setPicker('highLat')} />
      </Card>

      {/* ── Advanced / Offsets ── */}
      <SectionHeader title={t('settings.section.fineTune').toUpperCase()} />
      <Card>
        {TRACKABLE_PRAYERS.map((p, idx) => {
          const offset = settings.offsets?.[p] ?? 0;
          const icon = (PRAYER_ICONS[p] ?? 'time-outline') as React.ComponentProps<typeof Ionicons>['name'];
          return (
            <View key={p}>
              <View style={[sr.row, { paddingVertical: 10 }]}>
                <View style={[sr.iconWrap, { backgroundColor: colors.muted }]}>
                  <Ionicons name={icon} size={16} color={colors.mutedForeground} />
                </View>
                <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
                  {PRAYER_DISPLAY_NAMES[p]}
                </Text>
                <Pressable
                  style={[offsetBtn, { backgroundColor: colors.muted }]}
                  onPress={() => updateSettings({ offsets: { ...(settings.offsets ?? {}), [p]: Math.max(-30, offset - 1) } })}
                >
                  <Ionicons name="remove" size={16} color={colors.foreground} />
                </Pressable>
                <Text style={[offsetVal, { color: offset !== 0 ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_600SemiBold', minWidth: 44, textAlign: 'center' }]}>
                  {offset > 0 ? `+${offset}` : `${offset}`} min
                </Text>
                <Pressable
                  style={[offsetBtn, { backgroundColor: colors.muted }]}
                  onPress={() => updateSettings({ offsets: { ...(settings.offsets ?? {}), [p]: Math.min(30, offset + 1) } })}
                >
                  <Ionicons name="add" size={16} color={colors.foreground} />
                </Pressable>
              </View>
              {idx < TRACKABLE_PRAYERS.length - 1 && <Divider />}
            </View>
          );
        })}
      </Card>

      {/* ── Hijri Calendar ── */}
      <SectionHeader title={t('settings.section.hijri').toUpperCase()} />
      <Card>
        <View style={[sr.row, { paddingVertical: 10 }]}>
          <View style={[sr.iconWrap, { backgroundColor: colors.accent + '22' }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.accent} />
          </View>
          <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_500Medium', flex: 1 }]}>
            {t('settings.row.hijriOffset')}
          </Text>
          <Pressable
            style={[offsetBtn, { backgroundColor: colors.muted }]}
            onPress={() => updateSettings({ hijriOffset: Math.max(-2, (settings.hijriOffset ?? 0) - 1) })}
          >
            <Ionicons name="remove" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={[offsetVal, { color: (settings.hijriOffset ?? 0) !== 0 ? colors.accent : colors.mutedForeground, fontFamily: 'Inter_600SemiBold', minWidth: 44, textAlign: 'center' }]}>
            {(settings.hijriOffset ?? 0) > 0 ? `+${settings.hijriOffset}` : `${settings.hijriOffset ?? 0}`} day{Math.abs(settings.hijriOffset ?? 0) !== 1 ? 's' : ''}
          </Text>
          <Pressable
            style={[offsetBtn, { backgroundColor: colors.muted }]}
            onPress={() => updateSettings({ hijriOffset: Math.min(2, (settings.hijriOffset ?? 0) + 1) })}
          >
            <Ionicons name="add" size={16} color={colors.foreground} />
          </Pressable>
        </View>
        <Divider />
        <View style={sr.row}>
          <View style={[sr.iconWrap, { backgroundColor: colors.muted }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
          </View>
          <Text style={[s.privacyNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', flex: 1 }]}>
            {t('settings.row.hijriNote')}
          </Text>
        </View>
      </Card>

      {/* ── Language ── */}
      <SectionHeader title={t('settings.section.language').toUpperCase()} />
      <Card>
        <SettingRow
          icon="language-outline"
          iconColor={colors.accent}
          label={t('settings.language.title')}
          value={currentLanguage}
          onPress={() => setPicker('language')}
        />
      </Card>

      {/* ── Privacy ── */}
      <SectionHeader title={t('settings.section.privacy').toUpperCase()} />
      <Card>
        <View style={[sr.row, { alignItems: 'flex-start' }]}>
          <View style={[sr.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>{t('settings.row.dataStaysTitle')}</Text>
            <Text style={[s.privacyNote, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {t('settings.row.dataStaysBody')}
            </Text>
          </View>
        </View>
        <Divider />
        <View style={sr.row}>
          <View style={[sr.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="ban-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[sr.label, { color: colors.foreground, fontFamily: 'Inter_600SemiBold', flex: 1 }]}>{t('settings.row.noAds')}</Text>
        </View>
      </Card>

      {/* ── Ramadan ── */}
      <SectionHeader title={t('ramadan.title').toUpperCase()} />
      <Card>
        <SettingRow
          icon="moon-outline"
          iconColor={colors.accent}
          label={t('settings.row.ramadan')}
          onPress={() => router.push('/ramadan')}
        />
      </Card>

      {/* ── Mosque ── */}
      <SectionHeader title={t('settings.section.mosque').toUpperCase()} />
      <Card>
        <SettingRow
          icon="business-outline"
          label={t('settings.row.mosqueTimetable')}
          value={mosque.enabled ? (mosque.mosqueName || t('settings.row.mosqueEnabled')) : t('settings.row.mosqueOff')}
          onPress={() => router.push('/mosque-timetable')}
        />
      </Card>

      {/* ── Support ── */}
      <SectionHeader title={t('settings.section.support').toUpperCase()} />
      <Card>
        <SettingRow
          icon={isSupporter ? 'heart' : 'heart-outline'}
          iconColor="#E11D48"
          label={isSupporter ? t('settings.row.supporterActive') : t('settings.row.becomeSupporter')}
          value={isSupporter ? undefined : t('settings.row.keepAdFree')}
          onPress={() => router.push('/supporter')}
        />
      </Card>

      {/* ── About ── */}
      <SectionHeader title={t('settings.section.about').toUpperCase()} />
      <Card>
        <SettingRow icon="information-circle-outline" label={t('settings.row.version')} value="1.0.0" />
        <Divider />
        <SettingRow
          icon="shield-checkmark-outline"
          label={t('settings.row.privacyPolicy')}
          onPress={() => router.push('/privacy')}
        />
        <Divider />
        <SettingRow
          icon="map-outline"
          label={t('settings.row.roadmap')}
          onPress={() => { import('react-native').then(({ Linking }) => Linking.openURL('https://vaqit.online/roadmap')); }}
        />
        <Divider />
        <SettingRow icon="heart-outline" iconColor="#E11D48" label={t('settings.row.worshipFree')} />
      </Card>

      {/* Pickers */}
      <PickerModal visible={picker === 'method'} title={t('settings.picker.method')} options={CALCULATION_METHODS} selected={settings.calculationMethod} onSelect={id => updateSettings({ calculationMethod: id })} onClose={() => setPicker(null)} />
      <PickerModal visible={picker === 'madhab'} title={t('settings.picker.madhab')} options={MADHABS} selected={settings.madhab} onSelect={id => updateSettings({ madhab: id })} onClose={() => setPicker(null)} />
      <PickerModal visible={picker === 'highLat'} title={t('settings.picker.highLat')} options={HIGH_LAT_RULES} selected={settings.highLatitudeRule} onSelect={id => updateSettings({ highLatitudeRule: id })} onClose={() => setPicker(null)} />
      <PickerModal
        visible={picker === 'language'}
        title={t('settings.language.title')}
        options={[
          { id: 'system', label: t('settings.language.systemDefault') },
          ...SUPPORTED_LOCALES.map(l => ({ id: l.code, label: l.label })),
        ]}
        selected={isSystemDefault ? 'system' : locale}
        onSelect={id => (id === 'system' ? clearOverride() : setLocale(id as 'en' | 'tr' | 'ar'))}
        onClose={() => setPicker(null)}
      />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, marginBottom: 20 },
  privacyNote: { fontSize: 13, lineHeight: 18 },
});
const sh = StyleSheet.create({ text: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 } });
const card = StyleSheet.create({ wrap: { marginHorizontal: 16, marginBottom: 4, overflow: 'hidden' } });
const d = StyleSheet.create({ line: { height: StyleSheet.hairlineWidth, marginLeft: 60 } });
const sr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15 },
  value: { fontSize: 13, maxWidth: 160, textAlign: 'right' },
});
const pm = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000066' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 16, maxHeight: '80%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, marginBottom: 16, paddingHorizontal: 4 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4 },
  optionText: { fontSize: 16, flex: 1 },
});
const offsetBtn: import('react-native').ViewStyle = {
  width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
};
const offsetVal: import('react-native').TextStyle = { fontSize: 13 };

const pnr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 15 },
  reminderBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  reminderText: { fontSize: 12 },
  reminderOptions: { paddingHorizontal: 16, paddingBottom: 12 },
  reminderLabel: { fontSize: 12, marginBottom: 8 },
  reminderPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 13 },
});
