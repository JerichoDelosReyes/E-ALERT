import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from './Text';
import { useColors } from './theme';

const ACircle = Animated.createAnimatedComponent(Circle);

/** Ring that drains over `seconds`. `remaining` is driven by the parent's timer. */
export function CountdownRing({ seconds, remaining, size = 180, stroke = 10, color, caption }: {
  seconds: number; remaining: number; size?: number; stroke?: number; color: string; caption?: string;
}) {
  const c = useColors();
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const progress = useSharedValue(remaining / seconds);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, remaining - 1) / seconds, { duration: reduce ? 0 : 1000, easing: Easing.linear });
  }, [remaining, seconds, reduce, progress]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - progress.value) }));

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${remaining} seconds left${caption ? `, ${caption}` : ''}`}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.fill} strokeWidth={stroke} fill="none" />
        <ACircle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={len} animatedProps={props}
        />
      </Svg>
      <Text variant="largeTitle" style={{ fontSize: size * 0.3, lineHeight: size * 0.36, fontVariant: ['tabular-nums'] }}>{remaining}</Text>
      {caption ? <Text variant="footnote" color="secondaryLabel">{caption}</Text> : null}
    </View>
  );
}
