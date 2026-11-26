import { categoryMeta, type Category, type Palette } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

/** What the person sees. Flood and Earthquake both map to the thesis "disaster" category. */
export type EmergencyType = { key: string; label: string; category: Category; sf: string; ion: string; color: keyof Palette };

export const EMERGENCY_TYPES: EmergencyType[] = [
  { ...categoryMeta.medical, key: 'medical', label: 'Medical', category: 'medical' },
  { ...categoryMeta.fire, key: 'fire', label: 'Fire', category: 'fire' },
  { ...categoryMeta.police, key: 'police', label: 'Police', category: 'police' },
  { key: 'flood', label: 'Flood', category: 'disaster', sf: 'water.waves', ion: 'water', color: 'info' },
  { key: 'quake', label: 'Earthquake', category: 'disaster', sf: 'waveform.path', ion: 'pulse', color: 'warning' },
];

const SIZE = 64;

/**
 * Optional pre-pick above the SOS button. Tap again to clear.
 * With a pick, the SOS goes straight to the cancel countdown.
 */
export function EmergencyTypes({ selected, onSelect }: { selected: string | null; onSelect: (key: string | null) => void }) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="radiogroup">
      {EMERGENCY_TYPES.map((t) => {
        const on = selected === t.key;
        const dim = selected !== null && !on;
        return (
          <Pressable
            key={t.key}
            onPress={() => { Haptics.selectionAsync(); onSelect(on ? null : t.key); }}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${t.label} emergency`}
            accessibilityHint={on ? 'Selected. Tap again to clear.' : 'Selects this type for your SOS.'}
            style={({ pressed }) => [styles.item, { opacity: dim ? 0.45 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
            <View style={[styles.ring, { borderColor: on ? c[t.color] : 'transparent' }]}>
              <View style={[styles.circle, { backgroundColor: c[t.color] }]}>
                <Icon pair={t} size={30} color="#fff" />
              </View>
            </View>
            <Text variant="footnote" weight={on ? '700' : '500'} numberOfLines={1}>{t.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 6, gap: 0, flexGrow: 1, justifyContent: 'center' },
  item: { alignItems: 'center', gap: 6, width: 76 },
  ring: { padding: 3, borderRadius: (SIZE + 12) / 2, borderWidth: 2.5 },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
});
