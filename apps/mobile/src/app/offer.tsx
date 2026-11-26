import { ASSIGNMENT, categoryMeta, km, me, pendingOffer, radius, space } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appActions } from '@/state/app';
import { CountdownRing } from '@/ui/CountdownRing';
import { Icon, type IconName } from '@/ui/Icon';
import { Button } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

/**
 * Incident offer (thesis Scope 4). 30 s to accept, then it passes to the
 * next responder. Two big choices. Everything else is read-only facts.
 */
export default function Offer() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { acceptOffer } = appActions;
  const inc = pendingOffer;
  const cat = categoryMeta[inc.category];
  const [left, setLeft] = useState<number>(ASSIGNMENT.acceptTimeoutSec);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    AccessibilityInfo.announceForAccessibility(`New ${cat.label} alert, ${km(inc.distanceKm ?? 0)} away. ${ASSIGNMENT.acceptTimeoutSec} seconds to accept.`);
  }, [cat.label, inc.distanceKm]);

  useEffect(() => {
    if (left === 0) {
      AccessibilityInfo.announceForAccessibility('Time is up. The alert went to the next responder.');
      router.back();
      return;
    }
    if (left === 10) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const accept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptOffer(inc);
    router.back();
    router.navigate('/navigate');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + space.lg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xl }}>
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.catBadge, { backgroundColor: c[cat.color] }]}>
            <Icon pair={cat} size={16} color="#fff" />
            <Text variant="subhead" weight="700" style={{ color: '#fff' }}>{cat.label}</Text>
          </View>
          <Text variant="title1" align="center" style={{ marginTop: space.md }} accessibilityRole="header">New alert near you</Text>
          <Text variant="subhead" color="secondaryLabel" align="center">{km(inc.distanceKm ?? 0)} · about {inc.etaMinutes} min drive</Text>

          <View style={{ marginVertical: space.xxl }}>
            <CountdownRing seconds={ASSIGNMENT.acceptTimeoutSec} remaining={left} size={150} color={left <= 10 ? c.critical : c.action} caption="to accept" />
          </View>
        </View>

        {/* Landmark photo placeholder (real photo in Phase 2) */}
        <View style={styles.photo} accessible accessibilityLabel={`Landmark photo: ${inc.landmark}`}>
          <LinearGradient colors={['#7FA38C', '#3E5F4D']} style={StyleSheet.absoluteFill} />
          <Icon name="camera" size={22} color="rgba(255,255,255,0.85)" />
          <View style={styles.photoCaption}>
            <Text variant="footnote" weight="600" style={{ color: '#fff' }} numberOfLines={2}>{inc.landmark}</Text>
          </View>
        </View>

        <View style={[styles.facts, { backgroundColor: c.surface }]}>
          <Fact icon="pin" label="Barangay" value={inc.barangay} />
          <Fact icon="people" label="Reports" value={`${inc.reportCount} reports, ${inc.confirmations} confirmed`} />
          <Fact icon="heart" label="Medical" value={`${me.medical.bloodType}, ${me.medical.conditions.join(', ')}. Allergic to ${me.medical.allergies.join(', ')}`} />
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.md, borderTopColor: c.separator, backgroundColor: c.bg }]}>
        <Button label="Decline" variant="tinted" tone="label" style={{ flex: 1 }} onPress={() => router.back()} accessibilityHint="Passes the alert to the next responder." />
        <Button label="Accept" icon="check" tone="safe" style={{ flex: 2 }} onPress={accept} />
      </View>
    </View>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const c = useColors();
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={18} color={c.secondaryLabel} style={{ width: 24 }} />
      <Text variant="subhead" color="secondaryLabel" style={{ width: 92 }}>{label}</Text>
      <Text variant="subhead" weight="600" style={{ flex: 1 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill },
  photo: { height: 150, borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  photoCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.md, backgroundColor: 'rgba(0,0,0,0.35)' },
  facts: { borderRadius: radius.md, borderCurve: 'continuous', paddingHorizontal: space.lg, paddingVertical: space.sm },
  fact: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: space.sm, gap: 4 },
  actions: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.xl, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
});
