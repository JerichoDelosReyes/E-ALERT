import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import {
  categoryMeta, historicalPoints, IMUS_CENTER, incidents, responders, timeAgo, type Incident,
} from '@e-alert/shared';
import { RefreshCw, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapGL, { Marker, NavigationControl, useControl } from 'react-map-gl/maplibre';

import { AvailPill, Avatar, CAT_ICON, CatBadge, PriorityBar, StatusPill, useCatColors, useDark, usePalette } from '../ui';

const STYLE = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

const points = historicalPoints(500);

/** Keep incidents in the part of the map not covered by floating panels. */
function initialView() {
  const phone = window.matchMedia('(max-width: 899px)').matches;
  const tablet = !phone && window.matchMedia('(max-width: 1199px)').matches;
  return {
    longitude: IMUS_CENTER.lng,
    latitude: IMUS_CENTER.lat - 0.006,
    zoom: phone ? 12.4 : 13.2,
    padding: phone
      ? { top: 130, bottom: Math.round(window.innerHeight * 0.46), left: 10, right: 10 }
      : { top: 70, bottom: 80, left: tablet ? 90 : 260, right: tablet ? 340 : 360 },
  };
}

export function LiveMap() {
  const dark = useDark();
  const p = usePalette();
  const cat = useCatColors();
  const [layer, setLayer] = useState<'live' | 'heat'>('live');
  const active = useMemo(() => incidents.filter((i) => i.status !== 'resolved').sort((a, b) => b.priority - a.priority), []);
  const [sel, setSel] = useState<Incident>(active[0]);
  const responder = responders.find((r) => r.id === sel.responderId);
  const available = responders.filter((r) => r.availability === 'available').length;

  const heat = useMemo(() => layer === 'heat' ? [new HeatmapLayer({
    id: 'heat',
    data: points,
    getPosition: (d: (typeof points)[number]) => [d.lng, d.lat],
    radiusPixels: 42,
    intensity: 1.1,
    threshold: 0.04,
    // Sequential: one hue (brand coral), light → dark.
    colorRange: dark
      ? [[58, 30, 22], [120, 48, 30], [180, 70, 40], [230, 95, 60], [255, 140, 105], [255, 190, 165]]
      : [[252, 227, 218], [247, 190, 170], [242, 150, 120], [240, 110, 75], [214, 72, 40], [160, 45, 20]],
  })] : [], [layer, dark]);

  return (
    <div className="map-wrap">
      <MapGL
        initialViewState={initialView()}
        mapStyle={dark ? STYLE.dark : STYLE.light}
        style={{ position: 'absolute', inset: 0 }}
        attributionControl={{ compact: true }}>
        <NavigationControl position="bottom-right" showCompass={false} />
        <DeckOverlay layers={heat} />

        {layer === 'live' && responders.map((r) => (
          <Marker key={r.id} longitude={r.location.lng} latitude={r.location.lat}>
            <span
              className="r-marker"
              title={`${r.name} · ${r.department} · ${r.availability.replace('_', ' ')}`}
              style={{ background: r.availability === 'available' ? p.safe : r.availability === 'busy' ? p.warning : p.tertiaryLabel }}
            />
          </Marker>
        ))}
        {layer === 'live' && active.map((i) => {
          const I = CAT_ICON[i.category];
          const on = i.id === sel.id;
          return (
            <Marker key={i.id} longitude={i.location.lng} latitude={i.location.lat} style={{ zIndex: on ? 2 : 1 }}>
              <button
                className={`marker${on ? ' sel' : ''}`}
                style={{ background: cat[i.category] }}
                aria-label={`${categoryMeta[i.category].label} incident in ${i.barangay}, priority ${i.priority}`}
                onClick={() => setSel(i)}>
                <I size={on ? 18 : 15} strokeWidth={2.4} />
              </button>
            </Marker>
          );
        })}
      </MapGL>

      {/* Toolbar */}
      <div className="float map-toolbar glass" role="toolbar" aria-label="Map controls">
        <h1>Live Map</h1>
        <span className="pill" style={{ marginLeft: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: p.critical }} aria-hidden /> Live
        </span>
        <div style={{ flex: 1 }} />
        <div className="seg" role="group" aria-label="Layer">
          <button aria-pressed={layer === 'live'} onClick={() => setLayer('live')}>Incidents</button>
          <button aria-pressed={layer === 'heat'} onClick={() => setLayer('heat')}>Heatmap · 30 days</button>
        </div>
      </div>

      {/* Incident queue + detail */}
      <aside className="float incident-list glass" aria-label="Active incidents">
        <div style={{ padding: '6px 10px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <b>Active incidents</b>
          <span className="muted" style={{ fontSize: 12 }}>by priority</span>
        </div>
        {active.map((i) => (
          <button key={i.id} className="inc-row" aria-pressed={i.id === sel.id} onClick={() => setSel(i)}>
            <CatBadge cat={i.category} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.barangay}</b>
                <span className="muted tnum" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(i.createdAt)}</span>
              </span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <StatusPill status={i.status} />
                <PriorityBar value={i.priority} />
              </span>
            </span>
          </button>
        ))}

        <div className="detail" style={{ margin: 8, padding: 14, borderRadius: 14, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CatBadge cat={sel.category} size={36} />
            <div>
              <h3>{categoryMeta[sel.category].label} · {sel.barangay}</h3>
              <div className="muted" style={{ fontSize: 12 }}>{sel.id}</div>
            </div>
          </div>
          <p style={{ margin: '10px 0' }}>{sel.landmark}</p>
          <div className="muted" style={{ fontSize: 12 }}>
            {sel.reportCount} reports merged · {sel.confirmations} “I see it too”
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 0', borderTop: '0.5px solid var(--separator)' }}>
            {responder ? (
              <>
                <Avatar initials={responder.initials} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{responder.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{responder.department} · Tier {responder.tier}</div>
                </div>
                <AvailPill a={responder.availability} />
              </>
            ) : (
              <div style={{ color: p.critical, fontWeight: 600 }}>No responder yet. {available} available nearby.</div>
            )}
          </div>

          <ol className="timeline" aria-label="Event log">
            {sel.events.map((e, k) => (
              <li key={k}>
                <span>
                  {e.note}
                  <span className="muted tnum" style={{ fontSize: 12, display: 'block' }}>{timeAgo(e.at)}</span>
                </span>
              </li>
            ))}
          </ol>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary"><RefreshCw size={14} /> Reassign</button>
            <button className="btn"><UserPlus size={14} /> Add backup</button>
          </div>
        </div>
      </aside>

      {/* Summary */}
      <div className="float stats glass" aria-label="Summary">
        <div className="stat"><b className="tnum">{active.length}</b><span>Active</span></div>
        <div className="stat"><b className="tnum">{available}</b><span>Responders free</span></div>
        <div className="stat"><b className="tnum">3:48</b><span>Median assign time</span></div>
      </div>
    </div>
  );
}
