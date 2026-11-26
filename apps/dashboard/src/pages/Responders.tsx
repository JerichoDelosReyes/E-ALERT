import { responders } from '@e-alert/shared';

import { AvailPill, Avatar, PageHead } from '../ui';

export function Responders() {
  const free = responders.filter((r) => r.availability === 'available').length;
  return (
    <div className="page">
      <PageHead title="Responders" sub={`${free} of ${responders.length} available right now. Tier 1 is offered alerts first.`} />
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Department</th><th>Tier</th><th>Barangay</th><th>Status</th></tr></thead>
          <tbody>
            {[...responders].sort((a, b) => a.tier - b.tier).map((r) => (
              <tr key={r.id}>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Avatar initials={r.initials} />{r.name}</span></td>
                <td>{r.department}</td>
                <td>{r.tier === 1 ? 'Tier 1 · Official' : 'Tier 2 · Volunteer'}</td>
                <td>{r.barangay}</td>
                <td><AvailPill a={r.availability} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
