import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import {
  categoryMeta, historicalPoints, IMUS_CENTER, incidents, responders, timeAgo, type Incident,
} from '@e-alert/shared';
import { ChevronLeft, RefreshCw, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import MapGL, { Marker, NavigationControl, useControl } from 'react-map-gl/maplibre';

// MapLibre finds its tile worker next to its own file. Vite's dependency
// pre-bundling moves maplibre-gl into .vite/deps without the worker, so the
// worker fails to load and the map stays black. Point it at the real file.
setWorkerUrl(maplibreWorkerUrl);

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
  const mq = (q: string) => window.matchMedia(q).matches;
  const phone = mq('(max-width: 599px)'); // bottom sheet
  const small = !phone && mq('(max-width: 899px)'); // top bar + side panel
  const tablet = !phone && !small && mq('(max-width: 1199px)'); // icon rail
  return {
    longitude: IMUS_CENTER.lng,
    latitude: phone ? IMUS_CENTER.lat - 0.006 : IMUS_CENTER.lat,
    zoom: phone ? 12.4 : small ? 12.8 : 13.2,
    padding: phone
      ? { top: 130, bottom: Math.round(window.innerHeight * 0.46), left: 10, right: 10 }
      : small
        ? { top: 130, bottom: 20, left: 10, right: Math.min(340, window.innerWidth * 0.45) }
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
  // Phone bottom sheet: list ↔ detail view, and collapsed to just its header.
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [collapsed, setCollapsed] = useState(false);
  const pick = (i: Incident) => { setSel(i); setView('detail'); setCollapsed(false); };
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
    <div className={`map-wrap${collapsed ? ' sheet-collapsed' : ''}`}>
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
                onClick={() => pick(i)}>
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
          <button aria-pressed={layer === 'heat'} onClick={() => setLayer('heat')}>Heatmap<span className="hide-sm"> · 30 days</span></button>
        </div>
      </div>

      {/* Incident queue + detail */}
      <aside
        className={`float incident-list glass${view === 'detail' ? ' show-detail' : ''}${collapsed ? ' collapsed' : ''}`}
        aria-label="Active incidents">
        <button
          className="sheet-handle"
          aria-label={collapsed ? 'Expand incident panel' : 'Collapse incident panel'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        />
        <div className="inc-list-head">
          <b>Active incidents <span className="muted tnum">· {active.length}</span></b>
          <span className="muted" style={{ fontSize: 12 }}>by priority</span>
        </div>
        <div className="inc-rows">
        {active.map((i) => (
          <button key={i.id} className="inc-row" aria-pressed={i.id === sel.id} onClick={() => pick(i)}>
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
        </div>

        <div className="detail">
          <button className="btn sheet-back" onClick={() => setView('list')}>
            <ChevronLeft size={16} /> All incidents
          </button>
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

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
