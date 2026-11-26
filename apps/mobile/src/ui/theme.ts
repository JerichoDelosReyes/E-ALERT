import { palette, type Palette } from '@e-alert/shared';
import { Platform, useColorScheme } from 'react-native';

export function useScheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useColors(): Palette {
  return palette[useScheme()];
}

/** iOS uses SF Pro (system). Android uses bundled Inter so both look alike. */
export const fontFamily = (weight: string): string | undefined => {
  if (Platform.OS === 'ios') return undefined;
  switch (weight) {
    case '700':
    case '800':
      return 'Inter_700Bold';
    case '600':
      return 'Inter_600SemiBold';
    case '500':
      return 'Inter_500Medium';
    default:
      return 'Inter_400Regular';
  }
};

export const shadow = (c: Palette, y = 6, r = 18) =>
  Platform.select({
    ios: { shadowColor: c.shadow, shadowOpacity: 1, shadowRadius: r, shadowOffset: { width: 0, height: y } },
    default: { boxShadow: `0px ${y}px ${r}px ${c.shadow}` },
  });
