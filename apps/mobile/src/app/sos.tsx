import { ASSIGNMENT, categoryMeta, radius, space, type Category } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { EMERGENCY_TYPES } from '@/features/EmergencyTypes';
import { useApp } from '@/state/app';
import { CountdownRing } from '@/ui/CountdownRing';
import { Icon } from '@/ui/Icon';
import { Button } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const CATS: Category[] = ['medical', 'fire', 'police', 'disaster'];

/**
 * Sheet after the triple tap: pick a category, then a 5 s window to cancel.
 * One primary decision per step, large targets, plain words.
 */
export default function SOSSheet() {
  const c = useColors();
  const { startIncident } = useApp();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const preset = EMERGENCY_TYPES.find((t) => t.key === type);
  const [cat, setCat] = useState<Category | null>(preset?.category ?? null);
  const [left, setLeft] = useState<number>(ASSIGNMENT.sosCancelSec);

  useEffect(() => {
    if (!cat) return;
    if (left === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      startIncident(cat);
      router.replace('/incident');
      return;
    }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cat, left, startIncident]);

  const choose = (k: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCat(k);
    AccessibilityInfo.announceForAccessibility(`${categoryMeta[k].label} alert sends in ${ASSIGNMENT.sosCancelSec} seconds. Cancel is available.`);
  };

  if (!cat) {
    return (
      <View style={styles.sheet}>
        <Text variant="title1" align="center" accessibilityRole="header">What’s happening?</Text>
        <Text variant="subhead" color="secondaryLabel" align="center" style={{ marginTop: 6, marginBottom: space.xxl }}>
          Pick one. We’ll send the right responder.
        </Text>
        <View style={styles.grid}>
          {CATS.map((k) => {
            const m = categoryMeta[k];
            return (
              <Pressable
                key={k}
                onPress={() => choose(k)}
                accessibilityRole="button"
                accessibilityLabel={`${m.label} emergency`}
                style={({ pressed }) => [styles.tile, { backgroundColor: c.surface, borderColor: c.separator, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
                <View style={[styles.tileIcon, { backgroundColor: c[m.color] }]}>
                  <Icon pair={m} size={30} color="#fff" />
                </View>
                <Text variant="title3">{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Button label="Cancel" variant="plain" tone="secondaryLabel" onPress={() => router.back()} style={{ marginTop: space.lg }} />
      </View>
    );
  }

  const m = preset ? { ...categoryMeta[cat], label: preset.label, sf: preset.sf, ion: preset.ion, color: preset.color } : categoryMeta[cat];
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut} style={[styles.sheet, { alignItems: 'center' }]}>
      <View style={[styles.catBadge, { backgroundColor: c.fill }]}>
        <Icon pair={m} size={16} color={c[m.color]} />
        <Text variant="subhead" weight="600">{m.label}</Text>
      </View>
      <Text variant="title1" align="center" style={{ marginTop: space.md }}>Sending your alert</Text>
      <Text variant="subhead" color="secondaryLabel" align="center" style={{ marginTop: 6 }}>
        Your location goes with it. Cancel if this was a mistake.
      </Text>

      <View style={{ marginVertical: space.xxl }}>
        <CountdownRing seconds={ASSIGNMENT.sosCancelSec} remaining={left} color={c.critical} caption="seconds" />
      </View>

      <View style={{ alignSelf: 'stretch', gap: space.sm }}>
        <Button label="Send now" tone="critical" icon="wave" onPress={() => setLeft(0)} />
        <Button label="Cancel alert" variant="tinted" tone="label" onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); router.back(); }} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.xxxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    flexBasis: '47%', flexGrow: 1, aspectRatio: 1.05, borderRadius: radius.lg, borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth, padding: space.lg, justifyContent: 'space-between',
  },
  tileIcon: { width: 56, height: 56, borderRadius: 18, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
});
