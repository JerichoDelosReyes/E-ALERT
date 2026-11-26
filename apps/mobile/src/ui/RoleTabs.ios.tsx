import { NativeTabs } from 'expo-router/native-tabs';
import type { SFSymbol } from 'sf-symbols-typescript';

import { ICONS } from './Icon';
import type { TabSpec } from './tabs';
import { useColors } from './theme';

/** iOS: system tab bar = real Liquid Glass. No custom background on top. */
export function RoleTabs({ tabs }: { tabs: TabSpec[] }) {
  const c = useColors();
  return (
    <NativeTabs tintColor={c.brand}>
      {tabs.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <NativeTabs.Trigger.Label>{t.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={ICONS[t.icon][0] as SFSymbol} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
