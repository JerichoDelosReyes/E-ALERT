import { ASSIGNMENT } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const TAPS = ASSIGNMENT.sosTaps;
const TAP_WINDOW_MS = 1500;
const SIZE = 312;
const CORE = 216;

/** Arc path for segment i of n around a circle (gap in degrees between segments). */
function arc(i: number, n: number, r: number, cx: number, gap = 14) {
  const span = 360 / n;
  const a0 = ((i * span + gap / 2 - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * span - gap / 2 - 90) * Math.PI) / 180;
  const p = (a: number) => `${cx + r * Math.cos(a)} ${cx + r * Math.sin(a)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
}

/**
 * Triple-tap SOS (thesis Scope 3). Each tap fills one ring segment with a
 * haptic. Taps more than 1.5 s apart reset, so a stray tap never sends.
 */
export function SOSButton({ onTriggered, idleHint, sendLabel = 'SOS' }: { onTriggered: () => void; idleHint?: string; sendLabel?: string }) {
  const c = useColors();
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const press = useSharedValue(1);
  const halo = useSharedValue(1);

  useEffect(() => {
    if (reduce) return;
    halo.value = withRepeat(withSequence(
      withTiming(1.05, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1);
  }, [reduce, halo]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onTap = () => {
    clearTimeout(timer.current);
    const next = count + 1;
    press.value = withSequence(withTiming(0.94, { duration: 70 }), withSpring(1, { damping: 12, stiffness: 260 }));
    if (next >= TAPS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setCount(TAPS);
      setTimeout(() => { setCount(0); onTriggered(); }, 180);
      return;
    }
    Haptics.impactAsync(next === 1 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
    setCount(next);
    AccessibilityInfo.announceForAccessibility(`${TAPS - next} more ${TAPS - next === 1 ? 'tap' : 'taps'} to send ${sendLabel}`);
    timer.current = setTimeout(() => setCount(0), TAP_WINDOW_MS);
  };

  const coreStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ transform: [{ scale: halo.value }] }));

  const left = TAPS - count;
  const hint = count === 0 ? (idleHint ?? `Tap ${TAPS} times for help`) : `${left} more ${left === 1 ? 'tap' : 'taps'}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Animated.View style={[styles.halo, { backgroundColor: c.brand, opacity: 0.08 }, haloStyle]} />
        <View style={[styles.halo2, { backgroundColor: c.brand, opacity: 0.12 }]} />

        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: TAPS }, (_, i) => (
            <Path
              key={i}
              d={arc(i, TAPS, SIZE / 2 - 8, SIZE / 2)}
              stroke={i < count ? c.critical : c.fillStrong}
              strokeWidth={8}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </Svg>

        <Pressable
          onPress={onTap}
          accessibilityRole="button"
          accessibilityLabel="SOS"
          accessibilityHint={`Tap ${TAPS} times quickly to ask for emergency help. You can cancel before it sends.`}
          accessibilityActions={[{ name: 'activate', label: 'Send SOS' }]}
          onAccessibilityAction={() => onTriggered()}>
          <Animated.View style={[styles.core, coreStyle, { boxShadow: `0px 18px 40px ${c.sosTo}66` }]}>
            <LinearGradient colors={[c.sosFrom, c.sosTo]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.innerRim} />
            <Icon name="wave" size={30} color="#fff" />
            <Text variant="largeTitle" style={styles.sos}>SOS</Text>
          </Animated.View>
        </Pressable>
      </View>

      <Text variant="title3" align="center" color={count ? 'critical' : 'label'} accessibilityLiveRegion="polite" style={{ marginTop: 8 }}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  stage: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: SIZE - 24, height: SIZE - 24, borderRadius: SIZE },
  halo2: { position: 'absolute', width: CORE + 36, height: CORE + 36, borderRadius: SIZE },
  core: { width: CORE, height: CORE, borderRadius: CORE / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: 2 },
  innerRim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: CORE / 2, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', margin: 10 },
  sos: { color: '#fff', fontSize: 54, lineHeight: 60, letterSpacing: 1.5, fontWeight: '800' },
});
