import { BlurView } from 'expo-blur';
import { GlassContainer, GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { useScheme } from './theme';

const LIQUID = Platform.OS === 'ios' && isLiquidGlassAvailable();

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Only for the one or two primary controls (liquid-glass rule 6). */
  tint?: ColorValue;
  interactive?: boolean;
  variant?: 'regular' | 'clear';
};

/**
 * Glass is for the functional layer only: controls and navigation that
 * float above content (map buttons, floating bars). Never on cards or rows.
 *
 * iOS 26+  → native Liquid Glass (GlassView)
 * iOS <26  → system material blur
 * Android  → translucent tinted surface with a hairline highlight
 */
export function Glass({ children, style, tint, interactive, variant = 'regular' }: Props) {
  const scheme = useScheme();
  const flat = StyleSheet.flatten(style) ?? {};
  const radius = flat.borderRadius ?? 999;

  if (LIQUID) {
    return (
      <GlassView glassEffectStyle={variant} tintColor={tint} isInteractive={interactive} style={[{ borderRadius: radius }, style]}>
        {children}
      </GlassView>
    );
  }

  const border = scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)';

  if (Platform.OS === 'ios') {
    return (
      <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: border }, style]}>
        <BlurView tint="systemChromeMaterial" intensity={80} style={StyleSheet.absoluteFill} />
        {tint ? <View style={[StyleSheet.absoluteFill, { backgroundColor: tint, opacity: 0.85 }]} /> : null}
        {children}
      </View>
    );
  }

  const base = tint ?? (scheme === 'dark' ? 'rgba(44,44,46,0.86)' : 'rgba(255,255,255,0.88)');
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: base,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: border,
          boxShadow: scheme === 'dark' ? '0px 8px 24px rgba(0,0,0,0.45)' : '0px 8px 24px rgba(40,24,16,0.12)',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Groups nearby glass so it renders and blends together on iOS 26. */
export function GlassGroup({ children, spacing = 8, style }: { children: ReactNode; spacing?: number; style?: StyleProp<ViewStyle> }) {
  if (LIQUID) return <GlassContainer spacing={spacing} style={style}>{children}</GlassContainer>;
  return <View style={style}>{children}</View>;
}

export const hasLiquidGlass = LIQUID;
