import { me, space } from '@e-alert/shared';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Button, Grouped, ListRow } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { useColors } from '@/ui/theme';

export default function MedicalId() {
  const c = useColors();
  const m = me.medical;
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, paddingTop: space.xxxl }}>
      <View style={{ alignItems: 'center', marginBottom: space.xxl, gap: space.sm }}>
        <Icon name="heart" size={40} color={c.critical} />
        <Text variant="title1">Medical ID</Text>
        <Text variant="subhead" color="secondaryLabel" align="center">Shared only with your assigned responder and the receiving hospital, during an alert.</Text>
      </View>
      <Grouped>
        <ListRow title="Blood type" trailing={<Text variant="headline">{m.bloodType}</Text>} />
        <ListRow title="Allergies" subtitle={m.allergies.join(', ')} />
        <ListRow title="Conditions" subtitle={m.conditions.join(', ')} />
        <ListRow title="Medications" subtitle={m.medications.join(', ')} last />
      </Grouped>
      <Button label="Done" onPress={() => router.back()} />
    </ScrollView>
  );
}
