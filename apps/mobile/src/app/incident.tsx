import { categoryMeta, clockTime, incidents, me, radius, responders, space, statusMeta, type IncidentStatus } from '@e-alert/shared';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapCanvas, MeMarker, PersonMarker, Route } from '@/features/MapCanvas';
import { useApp } from '@/state/app';
import { Glass, GlassGroup } from '@/ui/Glass';
import { Icon } from '@/ui/Icon';
import { Avatar, Button, GlassIconButton } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

const STEPS: IncidentStatus[] = ['sent', 'assigned', 'en_route', 'arrived'];

export default function ActiveIncident() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { activeIncident, endIncident } = useApp();
  const inc = { ...incidents[0], category: activeIncident?.category ?? incidents[0].category };
  const responder = responders.find((r) => r.id === inc.responderId)!;
  const cat = categoryMeta[inc.category];
  const current = STEPS.indexOf(inc.status);

  const route = [
    responder.location,
    { lat: 14.4262, lng: 120.9425 },
    { lat: 14.4278, lng: 120.9418 },
    { lat: 14.4281, lng: 120.9401 },
    me.location,
  ];

  const imSafe = () =>
    Alert.alert('Mark yourself safe?', 'This closes your alert and tells the responder they can stop.', [
      { text: 'Keep alert open', style: 'cancel' },
      { text: 'I’m safe', style: 'destructive', onPress: () => { endIncident(); router.back(); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <MapCanvas center={{ lat: 14.4272, lng: 120.9412 }} delta={0.014}>
        <Route points={route} color={c.action} />
        <PersonMarker at={responder.location} initials={responder.initials} label={`${responder.name}, responder`} />
        <MeMarker at={me.location} />
      </MapCanvas>

      {/* Functional layer: floating glass controls */}
      <GlassGroup style={[styles.topBar, { top: insets.top + space.sm }]}>
        <GlassIconButton icon="back" label="Back to home" onPress={() => router.back()} />
        <Glass style={styles.livePill}>
          <View style={[styles.liveDot, { backgroundColor: c.critical }]} />
          <Text variant="subhead" weight="600">Live · {cat.label}</Text>
        </Glass>
        <GlassIconButton icon="location" label="Center on me" onPress={() => {}} />
      </GlassGroup>

      {/* Content layer: solid panel */}
      <View style={[styles.panel, { backgroundColor: c.surface, paddingBottom: insets.bottom + space.lg }, shadow(c, -4, 24)]}>
        <View style={[styles.grabber, { backgroundColor: c.fillStrong }]} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl }}>
          <View style={styles.etaRow}>
            <View style={{ flex: 1 }}>
              <Text variant="footnote" color="secondaryLabel">{statusMeta[inc.status].label}</Text>
              <Text variant="largeTitle" accessibilityLabel={`Arriving in about ${inc.etaMinutes} minutes`}>
                {inc.etaMinutes} min
              </Text>
            </View>
            <View style={[styles.distance, { backgroundColor: c.fill }]}>
              <Text variant="subhead" weight="600">{inc.distanceKm} km away</Text>
            </View>
          </View>

          {/* Responder */}
          <View style={styles.responder}>
            <Avatar initials={responder.initials} size={52} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{responder.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="shield" size={13} color={c.safe} />
                <Text variant="footnote" color="secondaryLabel">Verified · {responder.department} · Tier {responder.tier}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Call" icon="phone" tone="safe" size="medium" style={{ flex: 1 }} onPress={() => {}} />
            <Button label="Message" icon="message" variant="tinted" tone="action" size="medium" style={{ flex: 1 }} onPress={() => {}} />
          </View>

          {/* Timeline */}
          <View style={{ marginTop: space.xxl }} accessibilityRole="list">
            {STEPS.map((s, i) => {
              const done = i <= current;
              const ev = inc.events.find((e) => e.status === s);
              const m = statusMeta[s];
              return (
                <View key={s} style={styles.step} accessible accessibilityLabel={`${m.label}${done ? ', done' : ', not yet'}`}>
                  <View style={{ alignItems: 'center', width: 24 }}>
                    <View style={[styles.stepDot, { backgroundColor: done ? c[m.color] : c.fillStrong }]}>
                      {done ? <Icon name="check" size={11} color="#fff" weight="bold" /> : null}
                    </View>
                    {i < STEPS.length - 1 ? <View style={[styles.stepLine, { backgroundColor: i < current ? c[m.color] : c.fill }]} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: space.lg }}>
                    <Text variant="subhead" weight={done ? '600' : '400'} color={done ? 'label' : 'tertiaryLabel'}>{m.label}</Text>
                    {ev ? <Text variant="footnote" color="secondaryLabel">{ev.note} · {clockTime(ev.at)}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Shared info notice (consent made visible) */}
          <View style={[styles.notice, { backgroundColor: c.fill }]}>
            <Icon name="heart" size={18} color={c.critical} />
            <Text variant="footnote" style={{ flex: 1 }}>
              Your Medical ID is shared with this responder only. Two people nearby confirmed the alert.
            </Text>
          </View>

          <Button label="I’m safe now" variant="tinted" tone="critical" onPress={imSafe} style={{ marginTop: space.lg }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 18, borderRadius: 24 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '58%', borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, borderCurve: 'continuous', paddingTop: space.sm },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginBottom: space.md },
  etaRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: space.lg },
  distance: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginBottom: 6 },
  responder: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  step: { flexDirection: 'row', gap: space.md },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, marginVertical: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.sm, marginTop: space.sm },
});
