import { categoryMeta, radius, responders, space } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ActionSheetIOS, Alert, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapCanvas, MeMarker, Route, SymbolMarker } from '@/features/MapCanvas';
import { useApp } from '@/state/app';
import { Glass, GlassGroup } from '@/ui/Glass';
import { Icon } from '@/ui/Icon';
import { Button, GlassIconButton } from '@/ui/primitives';
import { TAB_BAR_CLEARANCE } from '@/ui/tabs';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

const SELF = responders[2];

export default function Navigate() {
  const c = useColors();
  const { assignment, markArrived, closeAssignment } = useApp();

  if (!assignment) {
    return (
      <SafeAreaView edges={['top']} style={[styles.empty, { backgroundColor: c.bg }]}>
        <Icon name="location" size={44} color={c.tertiaryLabel} />
        <Text variant="title2" align="center" style={{ marginTop: space.lg }}>No active assignment</Text>
        <Text variant="subhead" color="secondaryLabel" align="center" style={{ marginTop: 6, maxWidth: 300 }}>
          When you accept an alert, the route to the person shows here.
        </Text>
        <Button label="Go to Duty" variant="tinted" tone="action" size="medium" style={{ marginTop: space.xl }} onPress={() => router.navigate('/duty')} />
      </SafeAreaView>
    );
  }

  const cat = categoryMeta[assignment.category];
  const route = [SELF.location, { lat: 14.4258, lng: 120.9437 }, { lat: 14.4254, lng: 120.9425 }, assignment.location];

  const requestBackup = () => {
    const opts = ['Same team (Medical)', 'Fire (BFP)', 'Police (PNP)', 'Cancel'];
    const done = (i: number) => {
      if (i === opts.length - 1) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Backup requested', `${opts[i]} has been notified with your location.`);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ title: 'Request backup from', options: opts, cancelButtonIndex: opts.length - 1 }, done);
    } else {
      Alert.alert('Request backup from', undefined, [
        ...opts.slice(0, -1).map((o, i) => ({ text: o, onPress: () => done(i) })),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <MapCanvas center={{ lat: 14.4256, lng: 120.9430 }} delta={0.01}>
        <Route points={route} color={c.action} />
        <SymbolMarker at={assignment.location} pair={cat} color={c[cat.color]} label={`${cat.label} incident`} size={42} />
        <MeMarker at={SELF.location} />
      </MapCanvas>

      {/* Next turn (functional layer) */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.topWrap}>
      <GlassGroup style={styles.top}>
        <Glass style={styles.turn}>
          <Icon name="back" size={26} color={c.label} style={{ transform: [{ rotate: '180deg' }] }} />
          <View style={{ flex: 1 }}>
            <Text variant="title3">{assignment.arrived ? 'You’re on scene' : '200 m'}</Text>
            <Text variant="subhead">{assignment.arrived ? assignment.landmark : 'Turn right onto Nueno Ave'}</Text>
          </View>
        </Glass>
        <GlassIconButton icon="phone" label="Call the reporter" tint={c.safe} onPress={() => {}} />
      </GlassGroup>
      </SafeAreaView>

      {/* Incident card (content layer) */}
      <View style={[styles.card, { backgroundColor: c.surface, bottom: TAB_BAR_CLEARANCE - 10 }, shadow(c, 6, 20)]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
          <View style={[styles.catIcon, { backgroundColor: c[cat.color] }]}>
            <Icon pair={cat} size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headline">{assignment.reporterName}</Text>
            <Text variant="footnote" color="secondaryLabel" numberOfLines={1}>{assignment.landmark}</Text>
          </View>
          {!assignment.arrived ? <Text variant="title3">{assignment.etaMinutes} min</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button label="Backup" icon="backup" variant="tinted" tone="label" size="medium" style={{ flex: 1 }} onPress={requestBackup} />
          {assignment.arrived ? (
            <Button label="Close incident" icon="checkCircle" tone="label" size="medium" style={{ flex: 1.4 }}
              onPress={() => Alert.alert('Close this incident?', 'It moves to the incident report.', [
                { text: 'Not yet', style: 'cancel' },
                { text: 'Close', onPress: () => { closeAssignment(); router.navigate('/duty'); } },
              ])} />
          ) : (
            <Button label="I’ve arrived" icon="flag" tone="safe" size="medium" style={{ flex: 1.4 }}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); markArrived(); }} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  topWrap: { position: 'absolute', top: 0, left: space.lg, right: space.lg, paddingTop: space.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  turn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.md + 4 },
  card: { position: 'absolute', left: space.lg, right: space.lg, padding: space.lg, borderRadius: radius.lg, borderCurve: 'continuous' },
  catIcon: { width: 40, height: 40, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
