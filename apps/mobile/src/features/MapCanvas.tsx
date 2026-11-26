import { IMUS_CENTER, type LatLng } from '@e-alert/shared';
import type { ReactNode, Ref } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { Avatar } from '@/ui/primitives';
import { Icon } from '@/ui/Icon';
import { useColors, useScheme } from '@/ui/theme';

const toLL = (p: LatLng) => ({ latitude: p.lat, longitude: p.lng });

/** Muted Google style so Android maps sit quietly behind content like Apple Maps. */
const androidLight = [
  { elementType: 'geometry', stylers: [{ color: '#f2efe9' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f6e7a8' }] },
  { featureType: 'water', stylers: [{ color: '#bfdcec' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b70' }] },
];
const androidDark = [
  { elementType: 'geometry', stylers: [{ color: '#1c1c1e' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2e' }] },
  { featureType: 'water', stylers: [{ color: '#0e2a3a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8e8e93' }] },
];

export function MapCanvas({ center = IMUS_CENTER, delta = 0.02, children, mapRef, onRegionChangeComplete }: {
  center?: LatLng; delta?: number; children?: ReactNode; mapRef?: Ref<MapView>; onRegionChangeComplete?: (r: Region) => void;
}) {
  const scheme = useScheme();
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...toLL(center), latitudeDelta: delta, longitudeDelta: delta }}
      showsUserLocation={false}
      showsPointsOfInterests={false}
      showsCompass={false}
      toolbarEnabled={false}
      userInterfaceStyle={scheme}
      customMapStyle={Platform.OS === 'android' ? (scheme === 'dark' ? androidDark : androidLight) : undefined}
      onRegionChangeComplete={onRegionChangeComplete}
      accessibilityLabel="Map">
      {children}
    </MapView>
  );
}

/** Your own position: blue dot with a soft accuracy halo, like Apple Maps. */
export function MeMarker({ at }: { at: LatLng }) {
  return (
    <Marker coordinate={toLL(at)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false} accessibilityLabel="Your location">
      <View style={styles.meHalo}>
        <View style={styles.meDot} />
      </View>
    </Marker>
  );
}

/** Person pin: avatar inside a teardrop, from the reference design. */
export function PersonMarker({ at, initials, label, onPress }: { at: LatLng; initials: string; label: string; onPress?: () => void }) {
  const c = useColors();
  return (
    <Marker coordinate={toLL(at)} anchor={{ x: 0.5, y: 1 }} onPress={onPress} tracksViewChanges={false} accessibilityLabel={label}>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.pin, { backgroundColor: c.surface }]}>
          <Avatar initials={initials} size={40} />
        </View>
        <View style={[styles.pinTip, { borderTopColor: c.surface }]} />
      </View>
    </Marker>
  );
}

/** Round symbol pin (incidents, evacuation centers). */
export function SymbolMarker({ at, pair, color, label, onPress, size = 34 }: {
  at: LatLng; pair: { sf: string; ion: string }; color: string; label: string; onPress?: () => void; size?: number;
}) {
  return (
    <Marker coordinate={toLL(at)} anchor={{ x: 0.5, y: 0.5 }} onPress={onPress} tracksViewChanges={false} accessibilityLabel={label}>
      <View style={[styles.sym, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Icon pair={pair} size={size * 0.5} color="#fff" />
      </View>
    </Marker>
  );
}

export function Route({ points, color }: { points: LatLng[]; color: string }) {
  return <Polyline coordinates={points.map(toLL)} strokeColor={color} strokeWidth={5} lineCap="round" lineJoin="round" />;
}

const styles = StyleSheet.create({
  meHalo: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,122,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  meDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#007AFF', borderWidth: 3, borderColor: '#fff' },
  pin: { padding: 4, borderRadius: 26, boxShadow: '0px 6px 14px rgba(0,0,0,0.2)' },
  pinTip: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  sym: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#fff', boxShadow: '0px 4px 10px rgba(0,0,0,0.25)' },
});

export const toLatLng = toLL;
