import { incidents, verificationQueue } from '@e-alert/shared';
import { BarChart3, FlaskConical, Inbox, Map, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Route, Routes, useLocation } from 'react-router';

import { Analytics } from './pages/Analytics';
import { Broadcasts } from './pages/Broadcasts';
import { Drill } from './pages/Drill';
import { Incidents } from './pages/Incidents';
import { LiveMap } from './pages/LiveMap';
import { Responders } from './pages/Responders';
import { Verification } from './pages/Verification';
import { Avatar } from './ui';

const open = incidents.filter((i) => i.status !== 'resolved').length;
const pending = verificationQueue.filter((v) => v.state === 'pending').length;

const NAV = [
  { group: 'Operations', items: [
    { to: '/', label: 'Live Map', icon: Map, count: open, alert: true },
    { to: '/incidents', label: 'Incidents', icon: Inbox },
    { to: '/responders', label: 'Responders', icon: Users },
    { to: '/verification', label: 'Verification', icon: ShieldCheck, count: pending },
  ] },
  { group: 'Community', items: [{ to: '/broadcasts', label: 'Broadcasts', icon: Megaphone }] },
  { group: 'Insights', items: [
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/drill', label: 'Drill Mode', icon: FlaskConical },
  ] },
];

export default function App() {
  const bleed = useLocation().pathname === '/';
  return (
    <div className="shell">
      <nav className="sidebar glass" aria-label="Main">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 64 64"><circle cx="32" cy="38" r="7" fill="#fff" /><path d="M18 32a16 16 0 0 1 28 0M10 26a25 25 0 0 1 44 0" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" /></svg>
          </span>
          <div><b>E-Alert</b><span>Imus Command</span></div>
        </div>
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map((n) => (
              <NavLink key={n.to} to={n.to} end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <n.icon size={17} strokeWidth={2.2} aria-hidden />
                {n.label}
                {'count' in n && n.count ? (
                  <span className={`count${'alert' in n && n.alert ? ' alert' : ''}`} aria-label={`${n.count} open`}>{n.count}</span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar-foot">
          <Avatar initials="CA" />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 600 }}>CDRRMO Admin</div>
            <div className="muted" style={{ fontSize: 12 }}>City of Imus</div>
          </div>
        </div>
      </nav>

      <main className={`main${bleed ? ' bleed' : ''}`}>
        <Routes>
          <Route path="/" element={<LiveMap />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/responders" element={<Responders />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/broadcasts" element={<Broadcasts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/drill" element={<Drill />} />
        </Routes>
      </main>
    </div>
  );
}
