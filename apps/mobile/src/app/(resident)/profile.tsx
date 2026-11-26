import { me, radius, space } from '@e-alert/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import { AppearancePicker } from '@/features/AppearancePicker';
import { appActions } from '@/state/app';
import { Icon } from '@/ui/Icon';
import { Avatar, Card, Grouped, IconTile, LargeTitleScreen, ListRow } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function Profile() {
  const c = useColors();
  const { setRole } = appActions;
  const [audio, setAudio] = useState(true);
  const [medical, setMedical] = useState(me.medical.shareWithResponder);

  return (
    <LargeTitleScreen title="Profile">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xxl, borderRadius: radius.lg }}>
        <Avatar initials={me.initials} size={64} />
        <View style={{ flex: 1 }}>
          <Text variant="title3">{me.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Icon name="shield" size={14} color={c.safe} />
            <Text variant="footnote" color="secondaryLabel">Identity verified · {me.barangay}</Text>
          </View>
        </View>
      </Card>

      <Grouped>
        <ListRow
          title="Medical ID"
          subtitle={`${me.medical.bloodType} · ${me.medical.conditions.join(', ')}`}
          leading={<IconTile name="heart" bg={c.critical} />}
          onPress={() => router.push('/medical-id')}
        />
        <ListRow title="Emergency contacts" subtitle="4 people" leading={<IconTile name="contacts" bg={c.action} />} onPress={() => router.navigate('/contacts')} last />
      </Grouped>

      <Grouped title="Who sees what" footer="Your ID document is seen only by E-Alert administrators. Audio is recorded only during Police or Medical alerts, with a visible indicator, and deleted after 30 days.">
        <ListRow title="Location during an alert" subtitle="Assigned responder only" leading={<IconTile name="location" bg={c.action} />} trailing={<Text variant="subhead" color="secondaryLabel">Always</Text>} />
        <ListRow
          title="Share Medical ID"
          subtitle="Responder and receiving hospital"
          leading={<IconTile name="heart" bg={c.critical} />}
          trailing={<Switch value={medical} onValueChange={setMedical} trackColor={{ true: c.safe }} accessibilityLabel="Share Medical ID" />}
        />
        <ListRow
          title="10-second audio clip"
          subtitle="Police and Medical alerts"
          leading={<IconTile name="mic" bg={c.warning} />}
          trailing={<Switch value={audio} onValueChange={setAudio} trackColor={{ true: c.safe }} accessibilityLabel="Allow 10-second audio clip" />}
          last
        />
      </Grouped>

      <Grouped title="Appearance">
        <AppearancePicker />
      </Grouped>

      <Grouped title="Demo" footer="Phase 1 preview. Real roles come from your verified account.">
        <ListRow
          title="Switch to responder view"
          leading={<IconTile name="swap" bg={c.info} />}
          onPress={() => { setRole('responder'); router.replace('/duty'); }}
          last
        />
      </Grouped>
    </LargeTitleScreen>
  );
}
