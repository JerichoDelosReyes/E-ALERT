import { incidents, verificationQueue } from '@e-alert/shared';
import { BarChart3, FlaskConical, Inbox, Map, Megaphone, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { NavLink, Route, Routes, useLocation } from 'react-router';

import { lazy, Suspense, useEffect, useState } from 'react';

// Each page loads on demand: the map stack (MapLibre + deck.gl) only on Live Map,
// the chart library only on Analytics.
const LiveMap = lazy(() => import('./pages/LiveMap').then((m) => ({ default: m.LiveMap })));
const Incidents = lazy(() => import('./pages/Incidents').then((m) => ({ default: m.Incidents })));
const Responders = lazy(() => import('./pages/Responders').then((m) => ({ default: m.Responders })));
const Verification = lazy(() => import('./pages/Verification').then((m) => ({ default: m.Verification })));
const Broadcasts = lazy(() => import('./pages/Broadcasts').then((m) => ({ default: m.Broadcasts })));
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })));
const Drill = lazy(() => import('./pages/Drill').then((m) => ({ default: m.Drill })));
import { Avatar, Logo } from './ui';

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
  const { pathname } = useLocation();
  const bleed = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const title = NAV.flatMap((g) => g.items).find((n) => n.to === pathname)?.label ?? 'E-Alert';

  // Close the phone drawer after navigating, and on Escape.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={`shell${menuOpen ? ' menu-open' : ''}`}>
      {/* Phone only: slim glass top bar with a menu button */}
      <header className="topbar glass">
        <button className="icon-btn" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <Logo size={26} />
        <b className="topbar-title">{title}</b>
      </header>
      <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden />

      <nav id="main-nav" className="sidebar glass" aria-label="Main">
        <div className="brand">
          <Logo size={34} />
          <div className="brand-text"><b>E-Alert</b><span>Imus Command</span></div>
          <button className="icon-btn drawer-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map((n) => (
              <NavLink key={n.to} to={n.to} end title={n.label} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <n.icon size={18} strokeWidth={2.2} aria-hidden />
                <span className="nav-label">{n.label}</span>
                {'count' in n && n.count ? (
                  <span className={`count${'alert' in n && n.alert ? ' alert' : ''}`} aria-label={`${n.count} open`}>{n.count}</span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="sidebar-foot">
          <Avatar initials="CA" />
          <div className="foot-text" style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 600 }}>CDRRMO Admin</div>
            <div className="muted" style={{ fontSize: 12 }}>City of Imus</div>
          </div>
        </div>
      </nav>

      <main className={`main${bleed ? ' bleed' : ''}`}>
        <Suspense fallback={<div className="page muted" role="status">Loading…</div>}>
          <Routes>
            <Route path="/" element={<LiveMap />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/responders" element={<Responders />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/broadcasts" element={<Broadcasts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/drill" element={<Drill />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
