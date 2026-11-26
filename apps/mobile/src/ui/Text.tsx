import { type as ramp, type Palette, type TypeStyle } from '@e-alert/shared';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { fontFamily, useColors } from './theme';

type Props = TextProps & {
  variant?: TypeStyle;
  color?: keyof Palette;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
};

export function Text({ variant = 'body', color = 'label', weight, align, style, ...rest }: Props) {
  const c = useColors();
  const t = ramp[variant];
  const w = String(weight ?? t.weight);
  return (
    <RNText
      maxFontSizeMultiplier={variant === 'largeTitle' || variant === 'title1' ? 1.4 : 2}
      {...rest}
      style={[
        {
          fontSize: t.size,
          lineHeight: t.line,
          fontWeight: w as TextStyle['fontWeight'],
          fontFamily: fontFamily(w),
          color: c[color],
          textAlign: align,
          letterSpacing: t.size >= 20 ? -0.4 : t.size >= 17 ? -0.2 : 0,
        },
        style,
      ]}
    />
  );
}
