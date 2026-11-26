import { radius, space } from '@e-alert/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authActions, PASSWORD_RULES, type AuthRole } from '@/state/auth';
import { Icon, type IconName } from '@/ui/Icon';
import { Logo } from '@/ui/Logo';
import { Button } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

type Mode = 'login' | 'signup';
type InputRef = ComponentRef<typeof TextInput>;

/** Placeholder login. Accounts are stored on this device only (see state/auth.ts). */
export default function Login() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<AuthRole>(params.role === 'responder' ? 'responder' : 'resident');
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<InputRef>(null);
  const pwRef = useRef<InputRef>(null);

  const responder = role === 'responder';
  // Responder accounts are issued by CDRRMO, so responders can only log in.
  const isLogin = responder || mode === 'login';

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = isLogin ? await authActions.logIn(email, password, role) : await authActions.signUp(name, email, password);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    router.replace(res.session.role === 'responder' ? '/duty' : '/home');
  };

  const demo = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await authActions.demoLogIn(role);
    setBusy(false);
    if (res.ok) router.replace(role === 'responder' ? '/duty' : '/home');
  };

  const pickRole = (r: AuthRole) => {
    if (r === role) return;
    setRole(r);
    setMode('login');
    setError(null);
  };

  const switchMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    setError(null);
    setPassword('');
  };

  const soon = (what: string) => Alert.alert(`${what} is not available yet`, 'This is a placeholder for the next phase.');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.brandSoft }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}>
        {/* Back to the three intro pages */}
        <View style={[styles.topRow, { paddingTop: insets.top + space.sm }]}>
          <Pressable
            onPress={() => router.replace('/onboarding')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to introduction"
            style={({ pressed }) => [styles.backBtn, { backgroundColor: c.fill, opacity: pressed ? 0.7 : 1 }]}>
            <Icon name="back" size={18} color={c.label} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Logo size={96} />
          <Text variant="title1" weight="700" style={{ marginTop: space.md }}>E-Alert</Text>
          <Text variant="subhead" color="secondaryLabel" align="center">Help in three taps, anywhere in Imus.</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: c.surface, paddingBottom: insets.bottom + space.xl }, shadow(c, -4, 24)]}>
          <RoleSwitch role={role} onChange={pickRole} />

          <Text variant="title1" weight="700" align="center" accessibilityRole="header">
            {responder ? 'Responder log in' : isLogin ? 'Log in' : 'Create account'}
          </Text>
          <Text variant="subhead" color="secondaryLabel" align="center" style={{ marginTop: space.xs, marginBottom: space.xl }}>
            {responder
              ? 'For verified CDRRMO, BFP, PNP and medical responders.'
              : isLogin ? 'Welcome back. Please log in to your account.' : 'Sign up as a resident to send alerts.'}
          </Text>

          <View style={{ gap: space.md }}>
            {!isLogin ? (
              <Field
                icon="person"
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            ) : null}
            <Field
              ref={emailRef}
              icon="at"
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => pwRef.current?.focus()}
            />
            <Field
              ref={pwRef}
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              textContentType={isLogin ? 'password' : 'newPassword'}
              returnKeyType="go"
              onSubmitEditing={submit}
              trailing={
                <Pressable
                  onPress={() => setShowPw((v) => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPw ? 'Hide password' : 'Show password'}>
                  <Icon name={showPw ? 'eyeOff' : 'eye'} size={18} color={c.secondaryLabel} />
                </Pressable>
              }
            />
          </View>

          {!isLogin ? (
            <View style={styles.rules} accessibilityLabel="Password requirements">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(password);
                return (
                  <View key={r.key} style={styles.rule} accessible accessibilityLabel={`${r.label}, ${ok ? 'met' : 'not met'}`}>
                    <Icon name={ok ? 'checkCircle' : 'xmark'} size={14} color={ok ? c.safe : c.tertiaryLabel} />
                    <Text variant="footnote" color={ok ? 'label' : 'secondaryLabel'}>{r.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {error ? (
            <Text variant="footnote" color="critical" style={{ marginTop: space.sm }} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          {isLogin ? (
            <Pressable onPress={() => soon('Password reset')} hitSlop={8} style={styles.forgot} accessibilityRole="button">
              <Text variant="subhead" weight="600" color="action">Forgot password?</Text>
            </Pressable>
          ) : <View style={{ height: space.lg }} />}

          {responder ? (
            <>
              {/* Same 1×2 layout as the resident row: demo on the left, log in on the right */}
              <View style={styles.actions}>
                <Button label="Try demo" icon="wave" variant="tinted" tone="brand" size="medium" style={{ flex: 1 }} onPress={demo}
                  accessibilityHint="Opens the app with a sample responder account. No real alerts are sent." />
                <Button label={busy ? 'Please wait…' : 'Log in'} icon="duty" tone="label" size="medium" style={{ flex: 1.3 }} onPress={submit} />
              </View>
              <Text variant="footnote" color="secondaryLabel" align="center" style={{ marginTop: space.lg }}>
                No account yet? Responder accounts are issued by the{'\n'}City of Imus CDRRMO after verification.
              </Text>
            </>
          ) : (
          <>
          <View style={styles.actions}>
            <Button label={isLogin ? 'Sign up' : 'Log in'} variant="plain" tone="label" size="medium" style={{ flex: 1 }} onPress={switchMode} />
            <Button label={busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'} tone="label" size="medium" style={{ flex: 1.3 }} onPress={submit} />
          </View>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: c.separator }]} />
            <Text variant="footnote" color="secondaryLabel">Or</Text>
            <View style={[styles.orLine, { backgroundColor: c.separator }]} />
          </View>

          <View style={styles.social}>
            <SocialButton label="Continue with Apple" bg={c.label} onPress={() => soon('Sign in with Apple')}>
              <Icon name="apple" size={22} color={c.inverse} />
            </SocialButton>
            <SocialButton label="Continue with Google" bg={c.fill} onPress={() => soon('Sign in with Google')}>
              <Text variant="title3" weight="700" style={{ color: '#4285F4' }}>G</Text>
            </SocialButton>
            <SocialButton label="Try resident demo" bg={c.brandSoft} onPress={demo}>
              <Icon name="wave" size={20} color={c.brand} />
            </SocialButton>
          </View>
          <Text variant="caption" color="tertiaryLabel" align="center" style={{ marginTop: space.md }}>
            Or try the demo with sample data. No real alerts are sent.
          </Text>

          </>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Resident / Responder segmented switch at the top of the card. */
function RoleSwitch({ role, onChange }: { role: AuthRole; onChange: (r: AuthRole) => void }) {
  const c = useColors();
  const opts: { k: AuthRole; label: string; icon: IconName }[] = [
    { k: 'resident', label: 'Resident', icon: 'person' },
    { k: 'responder', label: 'Responder', icon: 'duty' },
  ];
  return (
    <View style={[styles.seg, { backgroundColor: c.fill }]} accessibilityRole="tablist">
      {opts.map((o) => {
        const on = o.k === role;
        return (
          <Pressable
            key={o.k}
            onPress={() => onChange(o.k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segBtn, on && { backgroundColor: c.surfaceRaised, boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' }]}>
            <Icon name={o.icon} size={15} color={on ? c.brand : c.secondaryLabel} />
            <Text variant="subhead" weight={on ? '600' : '500'} color={on ? 'label' : 'secondaryLabel'}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Field({ icon, trailing, ref, ...input }: TextInputProps & { icon: IconName; trailing?: React.ReactNode; ref?: React.Ref<InputRef> }) {
  const c = useColors();
  return (
    <View style={[styles.field, { backgroundColor: c.fill }]}>
      <Icon name={icon} size={17} color={c.secondaryLabel} />
      <TextInput
        ref={ref}
        placeholderTextColor={c.tertiaryLabel}
        accessibilityLabel={input.placeholder}
        style={[styles.input, { color: c.label }]}
        {...input}
      />
      {trailing}
    </View>
  );
}

function SocialButton({ label, bg, onPress, children }: { label: string; bg: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.socialBtn, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { paddingHorizontal: space.lg, flexDirection: 'row' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxxl, justifyContent: 'center' },
  seg: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, marginBottom: space.xl },
  segBtn: { flex: 1, flexDirection: 'row', gap: 6, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexGrow: 1,
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    borderCurve: 'continuous',
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    marginTop: -space.lg,
  },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 54, borderRadius: radius.pill, paddingHorizontal: space.lg },
  input: { flex: 1, fontSize: 16, height: '100%' },
  rules: { marginTop: space.md, gap: 6, paddingHorizontal: space.sm },
  rule: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  forgot: { alignSelf: 'flex-end', marginTop: space.md, marginBottom: space.lg },
  actions: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
  social: { flexDirection: 'row', justifyContent: 'center', gap: space.lg },
  socialBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
