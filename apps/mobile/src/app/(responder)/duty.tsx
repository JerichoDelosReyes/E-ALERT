import { availabilityMeta, categoryMeta, radius, responders, space, type Availability } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { appActions, useAppState } from '@/state/app';
import { Icon } from '@/ui/Icon';
import { Avatar, Button, Card, LargeTitleScreen } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

const ME_RESPONDER = responders[2];

const ORDER: Availability[] = ['available', 'busy', 'off_duty'];
const HELP: Record<Availability, string> = {
  available: 'You’ll get alerts within 10 km.',
  busy: 'Alerts skip you until you’re free.',
  off_duty: 'You won’t get any alerts.',
};

export default function Duty() {
  const c = useColors();
  const { setAvailability } = appActions;
  const availability = useAppState((s) => s.availability);
  const assignment = useAppState((s) => s.assignment);
  const r = ME_RESPONDER;

  return (
    <LargeTitleScreen title="Duty" trailing={
        <Pressable
          onPress={() => router.navigate('/account')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Your account"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Avatar initials={r.initials} size={40} />
        </Pressable>
      }>
      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: c.fill }]}>
          <Icon name="shield" size={14} color={c.safe} />
          <Text variant="footnote" weight="600">{r.department} · Tier {r.tier}</Text>
        </View>
        <Text variant="footnote" color="secondaryLabel">{r.name}</Text>
      </View>

      {assignment ? (
        <Pressable onPress={() => router.navigate('/navigate')} accessibilityRole="button" accessibilityLabel="Current assignment. Open navigation.">
          <Card style={{ backgroundColor: c.brandSoft, flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xxl }}>
            <View style={[styles.catIcon, { backgroundColor: c[categoryMeta[assignment.category].color] }]}>
              <Icon pair={categoryMeta[assignment.category]} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline">{assignment.arrived ? 'On scene' : 'Heading to'} {assignment.barangay}</Text>
              <Text variant="footnote" color="secondaryLabel" numberOfLines={1}>{assignment.landmark}</Text>
            </View>
            <Icon name="chevron" size={14} color={c.secondaryLabel} />
          </Card>
        </Pressable>
      ) : null}

      <Text variant="footnote" color="secondaryLabel" style={{ marginLeft: space.lg, marginBottom: 6 }}>Your status</Text>
      <View style={{ gap: space.sm, marginBottom: space.xxl }} accessibilityRole="radiogroup">
        {ORDER.map((a) => {
          const m = availabilityMeta[a];
          const on = a === availability;
          return (
            <Pressable
              key={a}
              onPress={() => { Haptics.selectionAsync(); setAvailability(a); }}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${m.label}. ${HELP[a]}`}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: c.surface, borderColor: on ? c[m.color] : 'transparent', transform: [{ scale: pressed ? 0.985 : 1 }] },
                shadow(c, 2, 10),
              ]}>
              <View style={[styles.optIcon, { backgroundColor: on ? c[m.color] : c.fill }]}>
                <Icon pair={m} size={22} color={on ? '#fff' : c.secondaryLabel} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{m.label}</Text>
                <Text variant="footnote" color="secondaryLabel">{HELP[a]}</Text>
              </View>
              <View style={[styles.radio, { borderColor: on ? c[m.color] : c.separator }]}>
                {on ? <View style={[styles.radioDot, { backgroundColor: c[m.color] }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ flexDirection: 'row', gap: space.lg, marginBottom: space.xxl }}>
        <View style={{ flex: 1 }}>
          <Text variant="title2">2</Text>
          <Text variant="footnote" color="secondaryLabel">Handled today</Text>
        </View>
        <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: c.separator }} />
        <View style={{ flex: 1 }}>
          <Text variant="title2">4 min</Text>
          <Text variant="footnote" color="secondaryLabel">Average reply</Text>
        </View>
      </Card>

      <Button
        label="Preview an incoming alert"
        icon="bell"
        variant="tinted"
        tone="action"
        size="medium"
        accessibilityHint="Demo only. Shows the screen you see when an alert is offered to you."
        onPress={() => router.push('/offer')}
      />
    </LargeTitleScreen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: -space.md, marginBottom: space.xxl },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.md, borderCurve: 'continuous', borderWidth: 2, minHeight: 76 },
  optIcon: { width: 44, height: 44, borderRadius: 14, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  catIcon: { width: 40, height: 40, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
