import { radius, space } from '@e-alert/shared';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/state/app';
import { Icon, type IconName } from '@/ui/Icon';
import { Button } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const CONSENT: { icon: IconName; title: string; body: string }[] = [
  { icon: 'location', title: 'Your location', body: 'Sent only during an alert, to the responder assigned to you.' },
  { icon: 'heart', title: 'Medical ID', body: 'Shared with the responder and receiving hospital, if you allow it.' },
  { icon: 'id', title: 'ID document', body: 'Seen only by E-Alert administrators, to verify your account.' },
  { icon: 'mic', title: 'Audio and photos', body: 'Only during Police or Medical alerts, with a visible indicator. Never in secret.' },
];

export default function Onboarding() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const { finishOnboarding, setRole } = useApp();
  const [step, setStep] = useState(0);

  const finish = (role: 'resident' | 'responder') => {
    setRole(role);
    finishOnboarding();
    router.replace(role === 'responder' ? '/duty' : '/home');
  };

  const unlock = async () => {
    const ok = await LocalAuthentication.hasHardwareAsync().catch(() => false);
    if (ok) await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock E-Alert' }).catch(() => null);
    finish('resident');
  };

  const enter = reduce ? undefined : FadeInRight.duration(280);
  const exit = reduce ? undefined : FadeOutLeft.duration(180);

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.lg }]}>
      <View style={{ flex: 1 }}>
        {step === 0 && (
          <Animated.View key="0" entering={enter} exiting={exit} style={styles.page}>
            <View style={[styles.hero, { backgroundColor: c.brand, boxShadow: `0px 20px 40px ${c.sosTo}55` }]}>
              <Icon name="wave" size={44} color="#fff" />
            </View>
            <Text variant="largeTitle" align="center" style={{ marginTop: space.xxl }}>Help in three taps</Text>
            <Text variant="body" color="secondaryLabel" align="center" style={styles.lede}>
              E-Alert sends your location to the nearest verified responder in Imus, so you never have to explain where you are.
            </Text>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View key="1" entering={enter} exiting={exit} style={styles.page}>
            <Text variant="largeTitle" align="center">Who sees what</Text>
            <Text variant="body" color="secondaryLabel" align="center" style={[styles.lede, { marginBottom: space.xxl }]}>
              You stay in control. You can change this anytime in Profile.
            </Text>
            <View style={{ gap: space.xl, alignSelf: 'stretch' }}>
              {CONSENT.map((r) => (
                <View key={r.title} style={styles.consentRow} accessible accessibilityLabel={`${r.title}. ${r.body}`}>
                  <Icon name={r.icon} size={26} color={c.brand} style={{ width: 32 }} />
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">{r.title}</Text>
                    <Text variant="subhead" color="secondaryLabel">{r.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View key="2" entering={enter} exiting={exit} style={styles.page}>
            <View style={[styles.hero, { backgroundColor: c.surface, boxShadow: `0px 12px 30px ${c.shadow}` }]}>
              <Icon name="faceid" size={48} color={c.action} />
            </View>
            <Text variant="largeTitle" align="center" style={{ marginTop: space.xxl }}>
              Unlock with {Platform.OS === 'ios' ? 'Face ID' : 'your fingerprint'}
            </Text>
            <Text variant="body" color="secondaryLabel" align="center" style={styles.lede}>
              Keeps your Medical ID and history private. The SOS button always works, even when locked.
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.dots} accessibilityLabel={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === step ? c.label : c.fillStrong, width: i === step ? 22 : 8 }]} />
        ))}
      </View>

      <View style={{ gap: space.sm }}>
        {step < 2 ? (
          <Button label="Continue" onPress={() => setStep(step + 1)} />
        ) : (
          <>
            <Button label={`Turn on ${Platform.OS === 'ios' ? 'Face ID' : 'fingerprint'}`} onPress={unlock} />
            <Button label="Not now" variant="plain" tone="action" onPress={() => finish('resident')} />
          </>
        )}
        {step === 0 ? (
          <Button label="I’m a verified responder" variant="plain" tone="action" size="medium" onPress={() => finish('responder')} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: 112, height: 112, borderRadius: 34, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  lede: { marginTop: space.md, maxWidth: 340 },
  consentRow: { flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: space.xl },
  dot: { height: 8, borderRadius: radius.pill },
});
