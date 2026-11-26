import { space } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { Pressable, View } from 'react-native';

import { appActions, type AppearancePref, useAppState } from '@/state/app';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export function AppearancePicker() {
  const c = useColors();
  const { setAppearance } = appActions;
  const appearance = useAppState((s) => s.appearance);
  const opts: { k: AppearancePref; label: string }[] = [
    { k: 'system', label: 'Automatic' },
    { k: 'light', label: 'Light' },
    { k: 'dark', label: 'Dark' },
  ];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.fill, borderRadius: 10, padding: 2, margin: space.md }} accessibilityRole="radiogroup">
      {opts.map((o) => {
        const on = o.k === appearance;
        return (
          <Pressable
            key={o.k}
            onPress={() => { Haptics.selectionAsync(); setAppearance(o.k); }}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={{ flex: 1, minHeight: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.surfaceRaised : 'transparent', boxShadow: on ? '0px 2px 6px rgba(0,0,0,0.12)' : undefined }}>
            <Text variant="subhead" weight={on ? '600' : '400'}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
