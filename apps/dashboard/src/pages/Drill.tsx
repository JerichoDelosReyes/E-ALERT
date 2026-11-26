import { ASSIGNMENT } from '@e-alert/shared';
import { FlaskConical, Play } from 'lucide-react';
import { useState } from 'react';

import { PageHead, usePalette } from '../ui';

/** Drill mode (thesis Scope 8): synthetic incidents that never notify real users. */
export function Drill() {
  const p = usePalette();
  const [incidents, setIncidents] = useState(5);
  const [ran, setRan] = useState(false);

  return (
    <div className="page">
      <PageHead title="Drill Mode" sub="Run simulated emergencies with synthetic responders. Real users are never notified." />

      <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: 'color-mix(in srgb, var(--warning) 14%, var(--surface))' }}>
        <FlaskConical size={18} color={p.warning} />
        <span>Drill data is kept apart from live incidents and is the only data used for the thesis measurements.</span>
      </div>

      <div className="grid grid-halves">
        <form className="card card-pad" onSubmit={(e) => { e.preventDefault(); setRan(true); }}>
          <h2>Scenario</h2>
          <p className="sub">Compare greedy nearest-neighbor with optimal batch assignment.</p>
          <label className="lbl" htmlFor="n">Simultaneous incidents: {incidents}</label>
          <input id="n" type="range" min={2} max={20} value={incidents} onChange={(e) => setIncidents(+e.target.value)} style={{ width: '100%', marginBottom: 14 }} />
          <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
            Tier 1 radius {ASSIGNMENT.tier1RadiusKm} km · Tier 2 radius {ASSIGNMENT.tier2RadiusKm} km · timeout {ASSIGNMENT.acceptTimeoutSec} s · merge within {ASSIGNMENT.mergeRadiusM} m and {ASSIGNMENT.mergeWindowMin} min
          </div>
          <button className="btn primary" type="submit"><Play size={14} /> Run drill</button>
        </form>

        <section className="card card-pad" aria-live="polite">
          <h2>Results</h2>
          {ran ? <p className="sub">Sample layout only. These numbers are not measured and must not be cited.</p> : null}
          {ran ? (
            <table className="tbl">
              <thead><tr><th>Measure</th><th>Greedy</th><th>Optimal</th></tr></thead>
              <tbody>
                <tr><td>Mean distance</td><td className="tnum">1.84 km</td><td className="tnum">1.71 km</td></tr>
                <tr><td>Worst-case distance</td><td className="tnum">4.20 km</td><td className="tnum">3.35 km</td></tr>
                <tr><td>Compute time</td><td className="tnum">0.4 ms</td><td className="tnum">12.8 ms</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="muted">Run a drill to see placeholder results. The real engine arrives in Phase 3.</p>
          )}
        </section>
      </div>
    </div>
  );
}
