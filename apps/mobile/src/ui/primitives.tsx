import { HIT, radius, space, type Palette } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glass } from './Glass';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { shadow, useColors } from './theme';

/* ───────── Card (content layer: solid, never glass) ───────── */

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: radius.md, borderCurve: 'continuous', padding: padded ? space.lg : 0 }, shadow(c, 4, 14), style]}>
      {children}
    </View>
  );
}

/* ───────── Section header ───────── */

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="title3" accessibilityRole="header">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button">
          <Text variant="subhead" color="action">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ───────── Grouped list row ───────── */

type RowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  accessibilityHint?: string;
};

export function ListRow({ title, subtitle, leading, trailing, onPress, last, accessibilityHint }: RowProps) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.fill }]}>
      {leading}
      <View style={[styles.rowBody, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.separator }]}>
        <View style={{ flex: 1 }}>
          <Text variant="body">{title}</Text>
          {subtitle ? <Text variant="footnote" color="secondaryLabel">{subtitle}</Text> : null}
        </View>
        {trailing ?? (onPress ? <Icon name="chevron" size={14} color={c.tertiaryLabel} /> : null)}
      </View>
    </Pressable>
  );
}

/** Rounded square icon tile used as a row leading element (Settings style). */
export function IconTile({ name, pair, bg, size = 30 }: { name?: IconName; pair?: { sf: string; ion: string }; bg: ColorValue; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.27, borderCurve: 'continuous', backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} pair={pair} size={size * 0.56} color="#fff" />
    </View>
  );
}

/* ───────── Avatar ───────── */

const AVATAR_TONES = ['#F0623F', '#5856D6', '#34A0A4', '#E0A030', '#AF52DE', '#3478F6'];

export function Avatar({ initials, size = 44, ring }: { initials: string; size?: number; ring?: ColorValue }) {
  const tone = AVATAR_TONES[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_TONES.length];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: tone,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: ring ? 2 : 0, borderColor: ring,
      }}>
      <Text variant="headline" style={{ color: '#fff', fontSize: size * 0.36, lineHeight: size * 0.44 }}>{initials}</Text>
    </View>
  );
}

export function AvatarStack({ items, size = 30, max = 4 }: { items: { initials: string }[]; size?: number; max?: number }) {
  const c = useColors();
  const shown = items.slice(0, max);
  return (
    <View style={{ flexDirection: 'row' }}>
      {shown.map((p, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <Avatar initials={p.initials} size={size} ring={c.bg} />
        </View>
      ))}
    </View>
  );
}

/* ───────── Chip (filter pill) ───────── */

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: { sf: string; ion: string } }) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{ minHeight: HIT, justifyContent: 'center' }}>
      <View style={[styles.chip, { backgroundColor: selected ? c.label : c.surface }, !selected && shadow(c, 2, 8)]}>
        {icon ? <Icon pair={icon} size={15} color={selected ? c.inverse : c.label} /> : null}
        <Text variant="subhead" weight="600" style={{ color: selected ? c.inverse : c.label }}>{label}</Text>
      </View>
    </Pressable>
  );
}

/* ───────── Buttons ───────── */

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: keyof Palette;
  variant?: 'filled' | 'tinted' | 'plain';
  icon?: IconName;
  size?: 'large' | 'medium';
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, tone = 'label', variant = 'filled', icon, size = 'large', accessibilityHint, style }: ButtonProps) {
  const c = useColors();
  const bg = variant === 'filled' ? c[tone] : variant === 'tinted' ? c.fill : 'transparent';
  const fg = variant === 'filled' ? (tone === 'label' ? c.inverse : '#fff') : c[tone];
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, minHeight: size === 'large' ? 56 : HIT, opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}>
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text variant="headline" style={{ color: fg }}>{label}</Text>
    </Pressable>
  );
}

/** Circular glass control floating over a map (functional layer). */
export function GlassIconButton({ icon, label, onPress, size = 48, tint }: { icon: IconName; label: string; onPress: () => void; size?: number; tint?: ColorValue }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      <Glass interactive tint={tint} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={size * 0.42} color={tint ? '#fff' : c.label} />
      </Glass>
    </Pressable>
  );
}

/** Round solid icon button (header bell / help in the reference). */
export function CircleButton({ icon, label, onPress, badge }: { icon: IconName; label: string; onPress?: () => void; badge?: boolean }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
      <View style={[styles.circle, { backgroundColor: c.surface }, shadow(c, 2, 10)]}>
        <Icon name={icon} size={20} color={c.label} weight="medium" />
        {badge ? <View style={[styles.badge, { backgroundColor: c.critical, borderColor: c.surface }]} /> : null}
      </View>
    </Pressable>
  );
}

/* ───────── Status pill (icon + text, never color alone) ───────── */

export function StatusPill({ label, pair, tone }: { label: string; pair: { sf: string; ion: string }; tone: keyof Palette }) {
  const c = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: c.fill }]}>
      <Icon pair={pair} size={13} color={c[tone]} />
      <Text variant="footnote" weight="600">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: space.lg, minHeight: 56 },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md, paddingRight: space.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 38, borderRadius: radius.pill },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, borderRadius: radius.pill, paddingHorizontal: space.xl },
  circle: { width: HIT, height: HIT, borderRadius: HIT / 2, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
});

/* ───────── Grouped section (Settings-style inset list) ───────── */

export function Grouped({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: space.xxl }}>
      {title ? <Text variant="footnote" color="secondaryLabel" style={{ marginLeft: space.lg, marginBottom: 6 }}>{title}</Text> : null}
      <Card padded={false} style={{ overflow: 'hidden' }}>{children}</Card>
      {footer ? <Text variant="footnote" color="secondaryLabel" style={{ marginHorizontal: space.lg, marginTop: 6 }}>{footer}</Text> : null}
    </View>
  );
}

/** Screen scaffold with an iOS large title. */
export function LargeTitleScreen({ title, trailing, children }: { title: string; trailing?: ReactNode; children: ReactNode }) {
  const c = useColors();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
    <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingTop: space.lg, paddingBottom: 120, paddingHorizontal: space.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xl }}>
        <Text variant="largeTitle" accessibilityRole="header">{title}</Text>
        {trailing}
      </View>
      {children}
    </ScrollView>
    </SafeAreaView>
  );
}
