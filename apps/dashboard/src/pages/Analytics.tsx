import { categoryMeta, chartCategory, historicalPoints } from '@e-alert/shared';
import { useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { PageHead, useCatColors, usePalette } from '../ui';

type TipProps = { active?: boolean; payload?: { value: number }[]; label?: string | number; fmt?: (l: string | number) => string; unit: string };
function Tip({ active, payload, label, fmt, unit }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <div className="muted">{fmt ? fmt(label ?? '') : label}</div>
      <b className="tnum">{payload[0].value}</b> {unit}
    </div>
  );
}

const hourLabel = (h: string | number) => {
  const n = Number(h);
  return `${n % 12 === 0 ? 12 : n % 12} ${n < 12 ? 'AM' : 'PM'}`;
};

export function Analytics() {
  const p = usePalette();
  const cat = useCatColors();
  const [range, setRange] = useState<30 | 90>(30);
  const data = useMemo(() => historicalPoints(range === 30 ? 420 : 1240, range), [range]);

  const byHour = useMemo(() => Array.from({ length: 24 }, (_, h) => ({ h, n: data.filter((d) => d.hour === h).length })), [data]);
  const byCat = useMemo(() => chartCategory.order.map((k) => ({ k, label: categoryMeta[k].label, n: data.filter((d) => d.category === k).length })), [data]);
  const byBrgy = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.barangay, (m.get(d.barangay) ?? 0) + 1));
    return [...m].map(([b, n]) => ({ b, n })).sort((a, b) => b.n - a.n);
  }, [data]);
  const peak = byHour.reduce((a, b) => (b.n > a.n ? b : a));

  const axis = { stroke: 'transparent', tick: { fill: p.secondaryLabel, fontSize: 12 } };
  const grid = <CartesianGrid vertical={false} stroke={p.separator} strokeDasharray="0" />;

  return (
    <div className="page">
      <PageHead title="Analytics" sub="Incident patterns across Imus. Synthetic drill data until the pilot runs.">
        <div className="seg" role="group" aria-label="Time range">
          <button aria-pressed={range === 30} onClick={() => setRange(30)}>30 days</button>
          <button aria-pressed={range === 90} onClick={() => setRange(90)}>90 days</button>
        </div>
      </PageHead>

      <div className="grid grid-kpi" style={{ marginBottom: 16 }}>
        {[
          { v: data.length.toLocaleString(), l: 'Incidents' },
          { v: '3:48', l: 'Median time to assign' },
          { v: '82%', l: 'Accepted on first offer' },
          { v: Math.round(data.length * 0.17).toString(), l: 'Duplicate reports merged' },
        ].map((k) => (
          <div key={k.l} className="card card-pad kpi"><b className="tnum">{k.v}</b><span>{k.l}</span></div>
        ))}
      </div>

      <div className="grid grid-main-side" style={{ marginBottom: 16 }}>
        <section className="card card-pad">
          <h2>Incidents by hour</h2>
          <p className="sub">Busiest around {hourLabel(peak.h)}. Stage responders before then.</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={byHour} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="hourFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.brand} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={p.brand} stopOpacity={0} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="h" {...axis} tickFormatter={hourLabel} interval={3} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip content={<Tip unit="incidents" fmt={hourLabel} />} cursor={{ stroke: p.tertiaryLabel, strokeWidth: 1 }} />
              <Area isAnimationActive={false} type="monotone" dataKey="n" stroke={p.brand} strokeWidth={2} fill="url(#hourFill)" activeDot={{ r: 5, stroke: p.surface, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="card card-pad">
          <h2>By category</h2>
          <p className="sub">Medical alerts lead.</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCat} margin={{ top: 8, right: 0, left: -18, bottom: 0 }} barCategoryGap="28%">
              {grid}
              <XAxis dataKey="label" {...axis} interval={0} tick={{ fill: p.secondaryLabel, fontSize: 11 }} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip content={<Tip unit="incidents" />} cursor={{ fill: p.fill }} />
              <Bar isAnimationActive={false} dataKey="n" radius={[4, 4, 0, 0]}>
                {byCat.map((d) => <Cell key={d.k} fill={cat[d.k]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="card card-pad">
        <h2>Top barangays</h2>
        <p className="sub">Where staging suggestions point first.</p>
        <ResponsiveContainer width="100%" height={byBrgy.length * 44 + 20}>
          <BarChart data={byBrgy} layout="vertical" margin={{ top: 0, right: 24, left: 20, bottom: 0 }} barCategoryGap="30%">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="b" {...axis} width={112} />
            <Tooltip content={<Tip unit="incidents" />} cursor={{ fill: p.fill }} />
            <Bar isAnimationActive={false} dataKey="n" fill={p.brand} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: p.secondaryLabel, fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>

        <details style={{ marginTop: 12 }}>
          <summary className="muted" style={{ cursor: 'pointer' }}>Show as table</summary>
          <table className="tbl" style={{ marginTop: 8 }}>
            <thead><tr><th>Barangay</th><th>Incidents</th></tr></thead>
            <tbody>{byBrgy.map((r) => <tr key={r.b}><td>{r.b}</td><td className="tnum">{r.n}</td></tr>)}</tbody>
          </table>
        </details>
      </section>
    </div>
  );
}
