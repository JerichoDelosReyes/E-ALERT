import { ASSIGNMENT, categoryMeta, contacts, me, space } from '@e-alert/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EMERGENCY_TYPES, EmergencyTypes } from '@/features/EmergencyTypes';
import { SOSButton } from '@/features/SOSButton';
import { useApp } from '@/state/app';
import { Icon } from '@/ui/Icon';
import { Logo } from '@/ui/Logo';
import { Avatar, Card, CircleButton } from '@/ui/primitives';
import { TAB_BAR_CLEARANCE } from '@/ui/tabs';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function Home() {
  const c = useColors();
  const { activeIncident, messages, unreadCount } = useApp();
  const unread = unreadCount('t-0042');
  const lastIn = [...messages].reverse().find((m) => m.threadId === 't-0042' && m.from === 'responder');
  const [type, setType] = useState<string | null>(null);
  const picked = EMERGENCY_TYPES.find((t) => t.key === type);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: TAB_BAR_CLEARANCE }}
      showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={[styles.pad, styles.topBar]}>
        <View style={styles.brandRow} accessible accessibilityRole="header" accessibilityLabel="E-Alert">
          <Logo size={34} />
          <Text variant="title3" weight="700">E-Alert</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Call911 />
          <CircleButton icon="bell" label="Notifications, 1 new" badge />
        </View>
      </View>

      {/* Greeting */}
      <View style={[styles.pad, styles.greet]}>
        <View style={{ flex: 1 }}>
          <Text variant="largeTitle">Hi, {me.firstName}!</Text>
          <View style={styles.verified}>
            <Icon name="shield" size={14} color={c.safe} />
            <Text variant="footnote" color="secondaryLabel">Verified · {me.barangay}</Text>
          </View>
        </View>
        <Pressable onPress={() => router.navigate('/profile')} accessibilityRole="button" accessibilityLabel="Your profile">
          <Avatar initials={me.initials} size={48} />
        </Pressable>
      </View>

      {/* Active incident banner */}
      {activeIncident ? (
        <Pressable
          onPress={() => router.push('/incident')}
          accessibilityRole="button"
          accessibilityLabel={`${categoryMeta[activeIncident.category].label} alert active. Help is on the way. Open details.`}
          style={[styles.pad, { marginBottom: space.lg }]}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: c.brandSoft }}>
            <View style={[styles.liveDot, { backgroundColor: c.critical }]} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">Help is on the way</Text>
              <Text variant="footnote" color={unread ? 'label' : 'secondaryLabel'} weight={unread ? '600' : '400'} numberOfLines={1}>
                {unread && lastIn ? `Nurse Joy: ${lastIn.text}` : 'Nurse Joy Aquino · about 3 min'}
              </Text>
            </View>
            <Icon name="chevron" size={14} color={c.secondaryLabel} />
          </Card>
        </Pressable>
      ) : null}

      {/* Emergency type (optional pre-pick) */}
      <EmergencyTypes selected={type} onSelect={setType} />

      {/* SOS */}
      <View style={styles.sosArea}>
        <SOSButton
          sendLabel={picked ? `${picked.label} SOS` : 'SOS'}
          idleHint={picked ? `Tap ${ASSIGNMENT.sosTaps} times to send ${picked.label} alert` : undefined}
          onTriggered={() => {
            router.push(picked ? { pathname: '/sos', params: { type: picked.key } } : '/sos');
            setType(null);
          }}
        />
      </View>

      {/* Who gets it */}
      <View style={[styles.pad, styles.who]}>
        <Text variant="subhead" color="secondaryLabel" align="center">
          Your SOS goes to the nearest verified responder{'\n'}and your {contacts.length} contacts, with your location.
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

/** Direct line to the national hotline. Confirms first so a stray tap never dials. */
function Call911() {
  const c = useColors();
  const call = () =>
    Alert.alert('Call 911?', 'This calls the national emergency hotline directly.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 911', onPress: () => Linking.openURL('tel:911') },
    ]);
  return (
    <Pressable
      onPress={call}
      accessibilityRole="button"
      accessibilityLabel="Call 911"
      accessibilityHint="Asks you to confirm, then calls the national emergency hotline."
      style={({ pressed }) => [styles.call911, { backgroundColor: c.critical, opacity: pressed ? 0.8 : 1 }]}>
      <Icon name="phone" size={15} color="#fff" />
      <Text variant="headline" weight="700" style={{ color: '#fff' }}>911</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  call911: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 16, borderRadius: 22 },
  pad: { paddingHorizontal: space.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md, marginTop: space.xs },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  greet: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  liveDot: { width: 10, height: 10, borderRadius: 5 },
  who: { alignItems: 'center', gap: space.sm, marginBottom: space.lg },
  sosArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.lg },
});
