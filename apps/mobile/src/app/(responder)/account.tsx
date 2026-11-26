import { radius, responders, space } from '@e-alert/shared';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppearancePicker } from '@/features/AppearancePicker';
import { appActions } from '@/state/app';
import { authActions } from '@/state/auth';
import { Icon } from '@/ui/Icon';
import { Avatar, Card, Grouped, IconTile, LargeTitleScreen, ListRow } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

const SELF = responders[2];

export default function Account() {
  const c = useColors();
  const { setRole } = appActions;
  return (
    <LargeTitleScreen title="Account">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xxl, borderRadius: radius.lg }}>
        <Avatar initials={SELF.initials} size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="title3">{SELF.name}</Text>
          <Text variant="footnote" color="secondaryLabel">{SELF.department} · Tier {SELF.tier} · {SELF.barangay}</Text>
        </View>
      </Card>

      <Grouped title="Credentials" footer="An administrator checked these documents. Renew them before they expire to keep getting alerts.">
        <ListRow title="PRC Nursing License" subtitle="Valid until Mar 2028" leading={<IconTile name="id" bg={c.action} />}
          trailing={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="checkCircle" size={16} color={c.safe} /><Text variant="subhead" color="secondaryLabel">Approved</Text></View>} />
        <ListRow title="Basic Life Support" subtitle="Valid until Jan 2027" leading={<IconTile name="heart" bg={c.critical} />}
          trailing={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Icon name="clock" size={16} color={c.warning} /><Text variant="subhead" color="secondaryLabel">Expires soon</Text></View>} last />
      </Grouped>

      <Grouped title="Appearance">
        <AppearancePicker />
      </Grouped>

      <Grouped title="Demo" footer="Phase 1 preview. Real roles come from your verified account.">
        <ListRow title="Switch to resident view" leading={<IconTile name="swap" bg={c.info} />}
          onPress={() => { setRole('resident'); router.replace('/home'); }} last />
      </Grouped>

      <Grouped>
        <ListRow title="Log out" leading={<IconTile name="logout" bg={c.critical} />}
          onPress={async () => { await authActions.logOut(); router.replace('/login'); }} last />
      </Grouped>
    </LargeTitleScreen>
  );
}
