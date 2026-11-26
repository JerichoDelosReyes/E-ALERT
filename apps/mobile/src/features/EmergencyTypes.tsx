import { categoryMeta, type Category, type Palette } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

/** The four thesis categories (Scope 2). Disaster covers flood and earthquake. */
export type EmergencyType = { key: string; label: string; category: Category; sf: string; ion: string; color: keyof Palette };

export const EMERGENCY_TYPES: EmergencyType[] = [
  { ...categoryMeta.medical, key: 'medical', label: 'Medical', category: 'medical' },
  { ...categoryMeta.fire, key: 'fire', label: 'Fire', category: 'fire' },
  { ...categoryMeta.police, key: 'police', label: 'Police', category: 'police' },
  { ...categoryMeta.disaster, key: 'disaster', label: 'Disaster', category: 'disaster' },
];

const SIZE = 64;

/**
 * Optional pre-pick above the SOS button. Tap again to clear.
 * With a pick, the SOS goes straight to the cancel countdown.
 */
export function EmergencyTypes({ selected, onSelect }: { selected: string | null; onSelect: (key: string | null) => void }) {
  const c = useColors();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
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
    </View>
  );
}

const styles = StyleSheet.create({
  // Four items spread across the full width, so each has clear space around it.
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  item: { alignItems: 'center', gap: 6, width: 76 },
  ring: { padding: 3, borderRadius: (SIZE + 12) / 2, borderWidth: 2.5 },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
});
