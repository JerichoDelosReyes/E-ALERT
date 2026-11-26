import { categoryMeta, clockTime, incidents, km, me, radius, responders, space, statusMeta, type IncidentStatus, type LatLng } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapCanvas, MeMarker, PersonMarker, Route, toLatLng } from '@/features/MapCanvas';
import { useApp } from '@/state/app';
import { Glass, GlassGroup } from '@/ui/Glass';
import { Icon, type IconName } from '@/ui/Icon';
import { Avatar, Button, GlassIconButton } from '@/ui/primitives';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

const STEPS: IncidentStatus[] = ['sent', 'assigned', 'en_route', 'arrived'];
const THREAD_ID = 't-0042';

/** Road path from the responder to you (mock; Google Routes API in Phase 2). */
const ROUTE: LatLng[] = [
  { lat: 14.4262, lng: 120.9441 },
  { lat: 14.4262, lng: 120.9425 },
  { lat: 14.4278, lng: 120.9418 },
  { lat: 14.4281, lng: 120.9401 },
  me.location,
];

export default function ActiveIncident() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { activeIncident, endIncident, unreadCount } = useApp();
  const inc = { ...incidents[0], category: activeIncident?.category ?? incidents[0].category };
  const responder = responders.find((r) => r.id === inc.responderId)!;
  const cat = categoryMeta[inc.category];
  const current = STEPS.indexOf(inc.status);
  const arrived = inc.status === 'arrived';
  const unread = unreadCount(THREAD_ID);

  const map = useRef<MapView>(null);
  const region = useRef<Region | null>(null);
  const route = [responder.location, ...ROUTE.slice(1)];

  const zoom = (factor: number) => {
    const r = region.current;
    if (!r) return;
    Haptics.selectionAsync();
    map.current?.animateToRegion({ ...r, latitudeDelta: r.latitudeDelta * factor, longitudeDelta: r.longitudeDelta * factor }, 250);
  };
  const fitRoute = () => {
    Haptics.selectionAsync();
    map.current?.fitToCoordinates(route.map(toLatLng), {
      edgePadding: { top: insets.top + 140, right: 80, bottom: 420, left: 40 },
      animated: true,
    });
  };
  const recenter = () => {
    Haptics.selectionAsync();
    map.current?.animateToRegion({ ...toLatLng(me.location), latitudeDelta: 0.006, longitudeDelta: 0.006 }, 300);
  };

  const imSafe = () =>
    Alert.alert('Mark yourself safe?', 'This closes your alert and tells the responder they can stop.', [
      { text: 'Keep alert open', style: 'cancel' },
      { text: 'I’m safe', onPress: () => { endIncident('safe'); router.back(); } },
    ]);

  const cancelAlert = () =>
    Alert.alert('Cancel this alert?', 'The responder will be told it was a mistake and will turn back.', [
      { text: 'Keep alert open', style: 'cancel' },
      { text: 'Cancel alert', style: 'destructive', onPress: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        endIncident('cancelled');
        router.back();
      } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <MapCanvas
        mapRef={map}
        center={{ lat: 14.4272, lng: 120.9418 }}
        delta={0.016}
        onRegionChangeComplete={(r) => { region.current = r; }}>
        <Route points={route} color={c.action} />
        <PersonMarker at={responder.location} initials={responder.initials} label={`${responder.name}, responder`} />
        <MeMarker at={me.location} />
      </MapCanvas>

      {/* Functional layer: floating glass controls */}
      <View style={[styles.top, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <GlassGroup style={styles.topBar}>
          <GlassIconButton icon="back" label="Back to home" onPress={() => router.back()} />
          <Glass style={styles.livePill}>
            <View style={[styles.liveDot, { backgroundColor: c.critical }]} />
            <Text variant="subhead" weight="600">Live · {cat.label}</Text>
          </Glass>
          <View style={{ width: 48 }} />
        </GlassGroup>

        <Glass style={styles.banner}>
          <Icon name={arrived ? 'pin' : 'car'} size={18} color={arrived ? c.safe : c.action} />
          <Text variant="subhead" weight="600" style={{ flex: 1 }} accessibilityLiveRegion="polite">
            {arrived ? 'Your responder has arrived' : 'Your responder is on the way'}
          </Text>
        </Glass>

        <GlassGroup style={styles.controls} spacing={0}>
          <Glass style={styles.controlStack}>
            <MapControl icon="zoomIn" label="Zoom in" onPress={() => zoom(0.5)} />
            <View style={[styles.controlSep, { backgroundColor: c.separator }]} />
            <MapControl icon="zoomOut" label="Zoom out" onPress={() => zoom(2)} />
          </Glass>
          <GlassIconButton icon="fit" label="Show the whole route" onPress={fitRoute} size={46} />
          <GlassIconButton icon="location" label="Center on me" onPress={recenter} size={46} tint={c.action} />
        </GlassGroup>
      </View>

      {/* Content layer: solid panel */}
      <View style={[styles.panel, { backgroundColor: c.surface, paddingBottom: insets.bottom + space.md }, shadow(c, -4, 24)]}>
        <View style={[styles.grabber, { backgroundColor: c.fillStrong }]} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl }}>
          {/* Responder */}
          <View style={styles.responder}>
            <Avatar initials={responder.initials} size={52} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{responder.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="verified" size={13} color={c.action} />
                <Text variant="footnote" color="secondaryLabel">Verified · {responder.department} · Tier {responder.tier}</Text>
              </View>
            </View>
          </View>

          {/* Stat tiles */}
          <View style={styles.tiles}>
            <StatTile icon="clock" value={arrived ? 'Here' : `~${inc.etaMinutes} min`} label="Estimated arrival" />
            <StatTile icon="location" value={km(inc.distanceKm ?? 0)} label="Road distance" />
          </View>

          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button label="Call" icon="phone" tone="safe" size="medium" style={{ flex: 1 }} onPress={() => Linking.openURL('tel:+639175550101')} />
            <Button
              label={unread ? `Message · ${unread}` : 'Message'}
              icon="message"
              variant="tinted"
              tone="action"
              size="medium"
              style={{ flex: 1 }}
              onPress={() => router.push(`/chat/${THREAD_ID}`)}
            />
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

          <View style={[styles.notice, { backgroundColor: c.fill }]}>
            <Icon name="heart" size={18} color={c.critical} />
            <Text variant="footnote" style={{ flex: 1 }}>
              Your Medical ID is shared with this responder only. Two people nearby confirmed the alert.
            </Text>
          </View>

          <Button label="I’m safe now" icon="checkCircle" variant="tinted" tone="safe" onPress={imSafe} style={{ marginTop: space.lg }} />
          <Button
            label="Cancel alert"
            variant="plain"
            tone="critical"
            size="medium"
            onPress={cancelAlert}
            accessibilityHint="Use this if the alert was a mistake. The responder will turn back."
            style={{ marginTop: space.xs }}
          />
        </ScrollView>
      </View>
    </View>
  );
}

function MapControl({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.controlBtn, { opacity: pressed ? 0.5 : 1 }]}>
      <Icon name={icon} size={18} color={c.label} weight="bold" />
    </Pressable>
  );
}

function StatTile({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const c = useColors();
  return (
    <View style={[styles.tile, { backgroundColor: c.fill }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={18} color={c.action} />
      <Text variant="title2" style={{ marginTop: 4 }}>{value}</Text>
      <Text variant="footnote" color="secondaryLabel">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: space.lg, right: space.lg, gap: space.sm },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 18, borderRadius: 24 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 44, paddingHorizontal: space.lg, borderRadius: 22 },
  controls: { alignSelf: 'flex-end', gap: space.sm, alignItems: 'center', marginTop: space.xs },
  controlStack: { width: 46, borderRadius: 23, alignItems: 'center', paddingVertical: 2 },
  controlBtn: { width: 46, height: 44, alignItems: 'center', justifyContent: 'center' },
  controlSep: { width: 24, height: StyleSheet.hairlineWidth },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '56%', borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, borderCurve: 'continuous', paddingTop: space.sm },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, marginBottom: space.md },
  responder: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  tiles: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  tile: { flex: 1, borderRadius: radius.md, borderCurve: 'continuous', padding: space.md, alignItems: 'center' },
  step: { flexDirection: 'row', gap: space.md },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, marginVertical: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.sm, marginTop: space.sm },
});
