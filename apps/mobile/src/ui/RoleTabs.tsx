import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from './Glass';
import { Icon } from './Icon';
import type { TabSpec } from './tabs';
import { Text } from './Text';
import { useColors } from './theme';

/**
 * Android (and fallback): JS tabs with a floating capsule bar that copies
 * the iOS 26 tab bar layout, so both platforms look the same.
 */
export function RoleTabs({ tabs }: { tabs: TabSpec[] }) {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CapsuleBar {...props} tabs={tabs} />}>
      {tabs.map((t) => <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />)}
    </Tabs>
  );
}

type BarProps = {
  tabs: TabSpec[];
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
};

function CapsuleBar({ tabs, state, navigateToTab }: BarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Glass style={styles.bar}>
        {state.routes.map((route, i) => {
          const spec = tabs.find((t) => t.name === route.name);
          if (!spec) return null;
          const focused = state.index === i;
          const onPress = () => {
            if (focused) return;
            Haptics.selectionAsync();
            navigateToTab(route.key);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={spec.badge ? `${spec.label}, ${spec.badge} unread` : spec.label}
              style={styles.item}>
              <View style={[styles.itemInner, focused && { backgroundColor: c.fill }]}>
                <View>
                  <Icon name={spec.icon} size={22} color={focused ? c.brand : c.label} />
                  {spec.badge ? <View style={[styles.dot, { backgroundColor: c.critical, borderColor: c.surface }]} /> : null}
                </View>
                <Text variant="caption" weight={focused ? '600' : '500'} style={{ color: focused ? c.brand : c.label, fontSize: 10, lineHeight: 12 }}>
                  {spec.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
  bar: { flexDirection: 'row', borderRadius: 34, padding: 4, height: 64 },
  item: { flex: 1 },
  dot: { position: 'absolute', top: -2, right: -5, width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 30 },
});
