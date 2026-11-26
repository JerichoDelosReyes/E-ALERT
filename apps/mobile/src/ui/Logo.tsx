import { LOGO_ARCS, LOGO_CORAL, LOGO_PIN, LOGO_RING_WIDTH, LOGO_VIEWBOX } from '@e-alert/shared';
import Svg, { Path } from 'react-native-svg';

import { useColors } from './theme';

/** E-Alert mark. Transparent background; the pin follows the text color (black in light, white in dark). */
export function Logo({ size = 32 }: { size?: number }) {
  const c = useColors();
  return (
    <Svg width={size} height={size} viewBox={LOGO_VIEWBOX} accessibilityLabel="E-Alert logo">
      {LOGO_ARCS.map((d, i) => (
        <Path key={i} d={d} stroke={LOGO_CORAL} strokeWidth={LOGO_RING_WIDTH} strokeLinecap="butt" fill="none" />
      ))}
      <Path d={LOGO_PIN} fill={c.label} fillRule="evenodd" />
    </Svg>
  );
}
