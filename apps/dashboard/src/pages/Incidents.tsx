import { categoryMeta, incidents, responders, timeAgo, type Category } from '@e-alert/shared';
import { Download } from 'lucide-react';
import { useState } from 'react';

import { CatLabel, PageHead, PriorityBar, StatusPill } from '../ui';

type F = 'all' | Category;

export function Incidents() {
  const [f, setF] = useState<F>('all');
  const rows = incidents.filter((i) => f === 'all' || i.category === f).sort((a, b) => b.priority - a.priority);
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="page">
      <PageHead title="Incidents" sub="Every report, merged by place and time. Sorted by priority.">
        <button className="btn"><Download size={14} /> Export report</button>
      </PageHead>

      <div className="seg seg-scroll" role="group" aria-label="Category" style={{ marginBottom: 16 }}>
        {(['all', 'medical', 'fire', 'police', 'disaster'] as F[]).map((k) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{k === 'all' ? 'All' : categoryMeta[k].label}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th className="hide-sm">Incident</th><th>Category</th><th>Barangay</th><th>Status</th><th>Priority</th><th className="hide-md">Reports</th><th className="hide-sm">Responder</th><th className="hide-md">Opened</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 40 }}>No incidents in this category.</td></tr>
            ) : rows.map((i) => (
              <tr key={i.id} aria-selected={sel === i.id} onClick={() => setSel(i.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSel(i.id)}>
                <td className="tnum hide-sm" style={{ fontWeight: 600 }}>{i.id}</td>
                <td><CatLabel cat={i.category} /></td>
                <td>{i.barangay}</td>
                <td><StatusPill status={i.status} /></td>
                <td><PriorityBar value={i.priority} /></td>
                <td className="tnum hide-md">{i.reportCount + i.confirmations}</td>
                <td className="hide-sm">{responders.find((r) => r.id === i.responderId)?.name ?? <span className="muted">Unassigned</span>}</td>
                <td className="muted tnum hide-md">{timeAgo(i.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
