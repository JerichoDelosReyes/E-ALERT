import { categoryMeta, clockTime, incidents, km, me, radius, responders, space, statusMeta, type IncidentStatus, type LatLng } from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapCanvas, MeMarker, PersonMarker, Route, toLatLng } from '@/features/MapCanvas';
import { appActions, useAppState, useUnread } from '@/state/app';
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
  const { endIncident } = appActions;
  const activeIncident = useAppState((s) => s.activeIncident);
  const inc = { ...incidents[0], category: activeIncident?.category ?? incidents[0].category };
  const responder = responders.find((r) => r.id === inc.responderId)!;
  const cat = categoryMeta[inc.category];
  const current = STEPS.indexOf(inc.status);
  const arrived = inc.status === 'arrived';
  const unread = useUnread(THREAD_ID);

  const map = useRef<MapView>(null);
  // Seeded with the initial view so zoom works before the first pan.
  const region = useRef<Region>({ latitude: 14.4272, longitude: 120.9418, latitudeDelta: 0.016, longitudeDelta: 0.016 });
  const route = [responder.location, ...ROUTE.slice(1)];

  // Bottom sheet: drag the header (or tap the grabber) to collapse/expand.
  const [sheetH, setSheetH] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const maxOffset = Math.max(0, sheetH - headerH - insets.bottom - space.md);
  const maxRef = useRef(0);
  const [offset] = useState(() => new Animated.Value(0));
  const pos = useRef(0);
  const dragStart = useRef(0);

  const snap = (toCollapsed: boolean, velocity = 0) => {
    const to = toCollapsed ? maxRef.current : 0;
    pos.current = to;
    setCollapsed(toCollapsed);
    Animated.spring(offset, { toValue: to, velocity, useNativeDriver: true, bounciness: 0, speed: 16 }).start();
  };
  const toggleSheet = () => {
    Haptics.selectionAsync();
    snap(pos.current < maxRef.current / 2);
  };
  // Keep the drag limit in sync with layout; a collapsed sheet follows it.
  useEffect(() => {
    maxRef.current = maxOffset;
    if (collapsed) { pos.current = maxOffset; offset.setValue(maxOffset); }
  }, [maxOffset, collapsed, offset]);
  // Refs below are read only inside gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        offset.stopAnimation((v) => { dragStart.current = v; pos.current = v; });
      },
      onPanResponderMove: (_, g) => {
        const v = Math.min(maxRef.current, Math.max(0, dragStart.current + g.dy));
        pos.current = v;
        offset.setValue(v);
      },
      onPanResponderRelease: (_, g) => {
        const down = g.vy > 0.5 || (Math.abs(g.vy) <= 0.5 && pos.current > maxRef.current / 2);
        snap(down, g.vy);
      },
      onPanResponderTerminate: () => snap(pos.current > maxRef.current / 2),
    }),
  );

  const zoom = (factor: number) => {
    const r = region.current;
    Haptics.selectionAsync();
    map.current?.animateToRegion({ ...r, latitudeDelta: r.latitudeDelta * factor, longitudeDelta: r.longitudeDelta * factor }, 250);
  };
  const fitRoute = () => {
    Haptics.selectionAsync();
    map.current?.fitToCoordinates(route.map(toLatLng), {
      edgePadding: { top: insets.top + 140, right: 80, bottom: collapsed ? headerH + insets.bottom + 60 : 420, left: 40 },
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
          <Glass style={styles.banner}>
            <View
              style={styles.bannerInner}
              accessible
              accessibilityLabel={arrived ? 'Your responder has arrived' : 'Your responder is on the way'}
              accessibilityLiveRegion="polite">
              <Icon name={arrived ? 'pin' : 'car'} size={18} color={arrived ? c.safe : c.action} />
              <Text variant="subhead" weight="600" numberOfLines={1} style={{ flexShrink: 1 }}>
                {arrived ? 'Arrived' : 'On the way'}
              </Text>
            </View>
          </Glass>
        </GlassGroup>

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
      <Animated.View
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
        style={[
          styles.panel,
          { backgroundColor: c.surface, paddingBottom: insets.bottom + space.md, transform: [{ translateY: offset }] },
          shadow(c, -4, 24),
        ]}>
        {/* Drag handle area: grabber + responder stay visible when collapsed */}
        <View {...pan.panHandlers} onLayout={(e) => setHeaderH(e.nativeEvent.layout.height)}>
          <Pressable
            onPress={toggleSheet}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={collapsed ? 'Expand details' : 'Collapse details'}
            style={styles.grabberHit}>
            <View style={[styles.grabber, { backgroundColor: c.fillStrong }]} />
          </Pressable>
          {/* Responder */}
          <View style={[styles.responder, { paddingHorizontal: space.xl }]}>
            <Avatar initials={responder.initials} size={52} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{responder.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="verified" size={13} color={c.action} />
                <Text variant="footnote" color="secondaryLabel">Verified · {responder.department} · Tier {responder.tier}</Text>
              </View>
            </View>
          </View>

          {/* Stat tiles: stay visible when collapsed */}
          <View style={[styles.tiles, { paddingHorizontal: space.xl }]}>
            <StatTile icon="clock" value={arrived ? 'Here' : `~${inc.etaMinutes} min`} label="Estimated arrival" />
            <StatTile icon="location" value={km(inc.distanceKm ?? 0)} label="Road distance" />
          </View>
        </View>
        <Animated.View
          pointerEvents={collapsed ? 'none' : 'auto'}
          style={{
            flexShrink: 1,
            // Hide Call/Message and the rest when collapsed; only the header shows.
            opacity: offset.interpolate({
              inputRange: [0, Math.max(1, maxOffset * 0.6), Math.max(2, maxOffset * 0.9)],
              outputRange: [1, 1, 0],
              extrapolate: 'clamp',
            }),
          }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl }}>
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
        </Animated.View>
      </Animated.View>
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
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 18, borderRadius: 24 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  banner: { flex: 1, height: 48, paddingHorizontal: 14, borderRadius: 24, justifyContent: 'center' },
  bannerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  controls: { alignSelf: 'flex-end', gap: space.sm, alignItems: 'center', marginTop: space.xs },
  controlStack: { width: 46, borderRadius: 23, alignItems: 'center', paddingVertical: 2 },
  controlBtn: { width: 46, height: 44, alignItems: 'center', justifyContent: 'center' },
  controlSep: { width: 24, height: StyleSheet.hairlineWidth },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '56%', borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, borderCurve: 'continuous', paddingTop: space.sm },
  grabberHit: { alignSelf: 'stretch', alignItems: 'center', paddingBottom: space.md },
  grabber: { width: 36, height: 5, borderRadius: 3 },
  responder: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  tiles: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  tile: { flex: 1, borderRadius: radius.md, borderCurve: 'continuous', padding: space.md, alignItems: 'center' },
  step: { flexDirection: 'row', gap: space.md },
  stepDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, marginVertical: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.sm, marginTop: space.sm },
});
