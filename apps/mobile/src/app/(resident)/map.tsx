import {
  ASSIGNMENT, categoryMeta, evacuationCenters, haversineKm, incidents, km, me, radius, space, statusMeta, timeAgo, type Category, type Incident,
} from '@e-alert/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import { MapCanvas, MeMarker, SymbolMarker } from '@/features/MapCanvas';
import { useApp } from '@/state/app';
import { Glass, GlassGroup } from '@/ui/Glass';
import { Icon } from '@/ui/Icon';
import { Button, StatusPill } from '@/ui/primitives';
import { TAB_BAR_CLEARANCE } from '@/ui/tabs';
import { Text } from '@/ui/Text';
import { shadow, useColors } from '@/ui/theme';

type Filter = 'all' | Category | 'evac';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'medical', label: 'Medical' },
  { key: 'fire', label: 'Fire' },
  { key: 'police', label: 'Police' },
  { key: 'disaster', label: 'Flood' },
  { key: 'evac', label: 'Evacuation' },
];

export default function MapTab() {
  const c = useColors();
  const { activeIncident } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const open = incidents.filter((i) => i.status !== 'resolved' && i.reporterName !== me.name);
  const shown = filter === 'all' ? open : filter === 'evac' ? [] : open.filter((i) => i.category === filter);
  const nearest = [...open].sort((a, b) => haversineKm(me.location, a.location) - haversineKm(me.location, b.location))[0];
  const [selected, setSelected] = useState<Incident | null>(nearest ?? null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const sel = selected && shown.includes(selected) ? selected : null;
  const dist = sel ? haversineKm(me.location, sel.location) : 0;
  const canConfirm = sel ? dist * 1000 <= ASSIGNMENT.confirmRadiusM : false;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <MapCanvas center={{ lat: 14.4255, lng: 120.9365 }} delta={0.045}>
        <MeMarker at={me.location} />
        {shown.map((i) => (
          <SymbolMarker
            key={i.id}
            at={i.location}
            pair={categoryMeta[i.category]}
            color={c[categoryMeta[i.category].color]}
            label={`${categoryMeta[i.category].label} incident, ${i.barangay}`}
            onPress={() => setSelected(i)}
            size={sel?.id === i.id ? 44 : 34}
          />
        ))}
        {(filter === 'all' || filter === 'evac') &&
          evacuationCenters.map((e) => (
            <SymbolMarker key={e.id} at={e.location} pair={{ sf: 'house.fill', ion: 'home' }} color={c.safe} label={`Evacuation center, ${e.name}`} size={30} />
          ))}
      </MapCanvas>

      {/* Floating filter bar (functional layer) */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: space.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}>
          <GlassGroup style={{ flexDirection: 'row', gap: space.sm }}>
            {FILTERS.map((f) => {
              const on = f.key === filter;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => { Haptics.selectionAsync(); setFilter(f.key); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  <Glass interactive tint={on ? c.label : undefined} style={styles.chip}>
                    <Text variant="subhead" weight="600" style={{ color: on ? c.inverse : c.label }}>{f.label}</Text>
                  </Glass>
                </Pressable>
              );
            })}
          </GlassGroup>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom card (content layer) */}
      <View style={[styles.cardWrap, { bottom: TAB_BAR_CLEARANCE - 10 }]}>
        {activeIncident ? (
          <View style={[styles.card, styles.trackCard, { backgroundColor: c.surface }, shadow(c, 6, 20)]}>
            <View style={[styles.catIcon, { backgroundColor: c.action }]}>
              <Icon name="car" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headline">Help is on the way</Text>
              <Text variant="footnote" color="secondaryLabel">Nurse Joy Aquino · about 3 min</Text>
            </View>
            <Button label="Track" icon="location" tone="action" size="medium" onPress={() => router.push('/incident')} accessibilityHint="Opens live tracking of your responder" />
          </View>
        ) : filter === 'evac' ? (
          <View style={[styles.card, { backgroundColor: c.surface }, shadow(c, 6, 20)]}>
            <Text variant="headline" style={{ marginBottom: space.sm }}>Evacuation centers</Text>
            {evacuationCenters.map((e) => {
              const pct = e.occupied / e.capacity;
              const tone = pct > 0.85 ? 'critical' : pct > 0.6 ? 'warning' : 'safe';
              return (
                <View key={e.id} style={styles.evacRow} accessible accessibilityLabel={`${e.name}, ${Math.round(pct * 100)} percent full, ${km(haversineKm(me.location, e.location))} away`}>
                  <View style={{ flex: 1 }}>
                    <Text variant="subhead" weight="600">{e.name}</Text>
                    <Text variant="footnote" color="secondaryLabel">{km(haversineKm(me.location, e.location))} · {e.capacity - e.occupied} spaces left</Text>
                  </View>
                  <View style={[styles.meter, { backgroundColor: c.fill }]}>
                    <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, backgroundColor: c[tone] }} />
                  </View>
                </View>
              );
            })}
          </View>
        ) : sel ? (
          <View style={[styles.card, { backgroundColor: c.surface }, shadow(c, 6, 20)]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
              <View style={[styles.catIcon, { backgroundColor: c[categoryMeta[sel.category].color] }]}>
                <Icon pair={categoryMeta[sel.category]} size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{categoryMeta[sel.category].label} · {sel.barangay}</Text>
                <Text variant="footnote" color="secondaryLabel" numberOfLines={1}>{sel.landmark}</Text>
                <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' }}>
                  <StatusPill label={statusMeta[sel.status].label} pair={statusMeta[sel.status]} tone={statusMeta[sel.status].color} />
                  <StatusPill label={`${sel.reportCount + sel.confirmations + (confirmed.has(sel.id) ? 1 : 0)} reports`} pair={{ sf: 'person.3.fill', ion: 'people' }} tone="secondaryLabel" />
                </View>
              </View>
              <Text variant="footnote" color="secondaryLabel">{timeAgo(sel.createdAt)}</Text>
            </View>
            {canConfirm ? (
              confirmed.has(sel.id) ? (
                <View style={[styles.done, { backgroundColor: c.fill }]}>
                  <Icon name="checkCircle" size={18} color={c.safe} />
                  <Text variant="subhead" weight="600">Thanks. Your confirmation raised its priority.</Text>
                </View>
              ) : (
                <Button
                  label="I see it too"
                  icon="eyeToo"
                  variant="tinted"
                  tone="action"
                  size="medium"
                  accessibilityHint="Confirms this incident is real. You can do this once."
                  style={{ marginTop: space.md }}
                  onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setConfirmed(new Set(confirmed).add(sel.id)); }}
                />
              )
            ) : (
              <Text variant="footnote" color="secondaryLabel" style={{ marginTop: space.md }}>
                {km(dist)} away. Only people within {ASSIGNMENT.confirmRadiusM} m can confirm.
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: c.surface, alignItems: 'center' }, shadow(c, 6, 20)]}>
            <Icon name="checkCircle" size={28} color={c.safe} />
            <Text variant="headline" style={{ marginTop: 6 }}>No active {filter === 'all' ? '' : `${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} `}incidents nearby</Text>
            <Text variant="footnote" color="secondaryLabel">New alerts near you will appear here.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { height: 40, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center' },
  cardWrap: { position: 'absolute', left: space.lg, right: space.lg },
  trackCard: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  card: { borderRadius: radius.lg, borderCurve: 'continuous', padding: space.lg },
  catIcon: { width: 40, height: 40, borderRadius: 12, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  done: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.sm, marginTop: space.md },
  evacRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  meter: { width: 64, height: 6, borderRadius: 3, overflow: 'hidden' },
});
