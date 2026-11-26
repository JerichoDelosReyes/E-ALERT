import { radius, space } from '@e-alert/shared';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appActions } from '@/state/app';
import { Icon, type IconName } from '@/ui/Icon';
import { Logo } from '@/ui/Logo';
import { Button } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const CONSENT: { icon: IconName; title: string; body: string }[] = [
  { icon: 'location', title: 'Location', body: 'Only during an alert, with your responder.' },
  { icon: 'heart', title: 'Medical ID', body: 'Your responder and hospital, if you allow.' },
  { icon: 'id', title: 'ID document', body: 'E-Alert admins only, to verify your account.' },
  { icon: 'mic', title: 'Audio and photos', body: 'Police and Medical alerts only. Always visible, never secret.' },
];

export default function Onboarding() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const { finishOnboarding } = appActions;
  const [step, setStep] = useState(0);
  const { width } = useWindowDimensions();
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const PAGES = 3;

  /** Continue button and dots scroll the pager; swiping updates the step. */
  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(PAGES - 1, i));
    setStep(next);
    pager.current?.scrollTo({ x: next * width, animated: !reduce });
  };

  // Role comes from the account, so every path ends at the login screen.
  const finish = (role?: 'responder') => {
    finishOnboarding();
    router.replace(role ? { pathname: '/login', params: { role } } : '/login');
  };

  const unlock = async () => {
    const ok = await LocalAuthentication.hasHardwareAsync().catch(() => false);
    if (ok) await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock E-Alert' }).catch(() => null);
    finish();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top + space.xxxl, paddingBottom: insets.bottom + space.lg }]}>
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== step && i >= 0 && i < PAGES) setStep(i);
        }}
        style={{ flex: 1 }}>
          <View style={[styles.page, { width }]}>
            <Logo size={150} />
            <Text variant="largeTitle" align="center" style={{ marginTop: space.xxl }}>Help in three taps</Text>
            <Text variant="body" color="secondaryLabel" align="center" style={styles.lede}>
              E-Alert sends your location to the nearest verified responder in Imus, so you never have to explain where you are.
            </Text>
          </View>

          <View style={[styles.page, { width }]}>
            <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: c.brand }]}>YOUR PRIVACY</Text>
            <Text variant="largeTitle" align="center">Who sees what</Text>
            <Text variant="body" color="secondaryLabel" align="center" style={[styles.lede, { marginBottom: space.xxl }]}>
              You stay in control.
            </Text>
            <View style={[styles.consentCard, { backgroundColor: c.surface }]}>
              {CONSENT.map((r, i) => (
                <View key={r.title} accessible accessibilityLabel={`${r.title}. ${r.body}`}>
                  {i > 0 ? <View style={[styles.consentSep, { backgroundColor: c.separator }]} /> : null}
                  <View style={styles.consentRow}>
                    <View style={[styles.consentIcon, { backgroundColor: c.brandSoft }]}>
                      <Icon name={r.icon} size={17} color={c.brand} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{r.title}</Text>
                      <Text variant="footnote" color="secondaryLabel" style={{ marginTop: 1 }}>{r.body}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <Text variant="footnote" color="tertiaryLabel" align="center" style={{ marginTop: space.lg }}>
              Change this anytime in Profile.
            </Text>
          </View>

          <View style={[styles.page, { width }]}>
            <View style={[styles.hero, { backgroundColor: c.surface, boxShadow: `0px 12px 30px ${c.shadow}` }]}>
              <Icon name="faceid" size={48} color={c.action} />
            </View>
            <Text variant="largeTitle" align="center" style={{ marginTop: space.xxl }}>
              Unlock with {Platform.OS === 'ios' ? 'Face ID' : 'your fingerprint'}
            </Text>
            <Text variant="body" color="secondaryLabel" align="center" style={styles.lede}>
              Keeps your Medical ID and history private. The SOS button always works, even when locked.
            </Text>
          </View>
      </ScrollView>

      <View style={styles.dots} accessibilityLabel={`Step ${step + 1} of ${PAGES}`}>
        {Array.from({ length: PAGES }, (_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === step ? c.label : c.fillStrong, width: i === step ? 22 : 8 }]} />
        ))}
      </View>

      <View style={{ gap: space.sm, paddingHorizontal: space.xl }}>
        {step < 2 ? (
          <Button label="Continue" onPress={() => goTo(step + 1)} />
        ) : (
          <>
            <Button label={`Turn on ${Platform.OS === 'ios' ? 'Face ID' : 'fingerprint'}`} onPress={unlock} />
            <Button label="Not now" variant="plain" tone="action" onPress={() => finish()} />
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
  root: { flex: 1 },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  hero: { width: 112, height: 112, borderRadius: 34, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  lede: { marginTop: space.md, maxWidth: 340 },
  eyebrow: { letterSpacing: 1.2, marginBottom: space.sm },
  consentCard: { alignSelf: 'stretch', borderRadius: 22, borderCurve: 'continuous', paddingHorizontal: space.lg },
  consentRow: { flexDirection: 'row', gap: space.md, alignItems: 'center', paddingVertical: space.md + 2 },
  consentIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  consentSep: { height: StyleSheet.hairlineWidth, marginLeft: 36 + space.md },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: space.xl },
  dot: { height: 8, borderRadius: radius.pill },
});
