import { categoryMeta, contacts, hotlines, space } from '@e-alert/shared';
import { Linking, Pressable, View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Avatar, CircleButton, Grouped, IconTile, LargeTitleScreen, ListRow } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function Contacts() {
  const c = useColors();
  return (
    <LargeTitleScreen title="Contacts" trailing={<CircleButton icon="plus" label="Add emergency contact" />}>
      <Grouped title="Emergency contacts" footer="These people get a text with your location whenever you send an SOS.">
        {contacts.map((p, i) => (
          <ListRow
            key={p.id}
            title={p.name}
            subtitle={`${p.relation} · ${p.phone}`}
            leading={<Avatar initials={p.initials} size={40} />}
            trailing={<CallBtn number={p.phone} name={p.name} />}
            last={i === contacts.length - 1}
          />
        ))}
      </Grouped>

      <Grouped title="Hotlines in Imus" footer="E-Alert works alongside 911. It does not replace it.">
        {hotlines.map((h, i) => {
          const m = h.category === 'general' ? { sf: 'phone.fill', ion: 'call', color: 'critical' as const } : categoryMeta[h.category];
          return (
            <ListRow
              key={h.id}
              title={h.name}
              subtitle={h.number}
              leading={<IconTile pair={m} bg={c[m.color]} />}
              trailing={<CallBtn number={h.number} name={h.name} />}
              last={i === hotlines.length - 1}
            />
          );
        })}
      </Grouped>

      <View style={{ alignItems: 'center', gap: 4, marginTop: -space.md }}>
        <Text variant="footnote" color="tertiaryLabel">Numbers from the City of Imus directory.</Text>
      </View>
    </LargeTitleScreen>
  );
}

const call = (n: string) => Linking.openURL(`tel:${n.replace(/[^\d+]/g, '')}`);

function CallBtn({ number, name }: { number: string; name: string }) {
  const c = useColors();
  return (
    <Pressable onPress={() => call(number)} accessibilityRole="button" accessibilityLabel={`Call ${name}`} hitSlop={8}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.fill, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="phone" size={17} color={c.safe} />
    </Pressable>
  );
}
