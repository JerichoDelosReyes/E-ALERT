import { Send } from 'lucide-react';
import { useState } from 'react';

import { PageHead, usePalette } from '../ui';

const BARANGAYS = ['Anabu II-D', 'Bayan Luma IV', 'Medicion II-A', 'Toclong II-A', 'Malagasang I-A', 'Alapan II-B'];

export function Broadcasts() {
  const p = usePalette();
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const checkins = { safe: 412, help: 9, none: 131 };
  const total = checkins.safe + checkins.help + checkins.none;

  return (
    <div className="page">
      <PageHead title="Broadcasts" sub="Send a warning to everyone inside an area and ask them to check in." />
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)' }}>
        <form className="card card-pad" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <h2>New broadcast</h2>
          <p className="sub">Residents get a push alert with a Safe / Need help check-in.</p>
          <label className="lbl" htmlFor="area">Area</label>
          <select id="area" className="field" defaultValue={BARANGAYS[0]} style={{ marginBottom: 14 }}>
            {BARANGAYS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <label className="lbl" htmlFor="msg">Message</label>
          <textarea id="msg" className="field" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)}
            placeholder="Flood water is rising near the underpass. Go to Anabu Covered Court." style={{ marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn primary" type="submit" disabled={!msg.trim()} style={{ opacity: msg.trim() ? 1 : 0.5 }}>
              <Send size={14} /> Send broadcast
            </button>
            {sent ? <span role="status" style={{ color: p.safe, fontWeight: 600 }}>Broadcast sent</span> : null}
          </div>
        </form>

        <section className="card card-pad" aria-label="Check-ins">
          <h2>Check-ins · Anabu II-D</h2>
          <p className="sub">From the 30 min flood broadcast</p>
          {([['Safe', checkins.safe, p.safe], ['Need help', checkins.help, p.critical], ['No reply', checkins.none, p.tertiaryLabel]] as const).map(([label, n, color]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>{label}</span><b className="tnum">{n}</b>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--fill)' }}>
                <div style={{ width: `${(n / total) * 100}%`, height: '100%', borderRadius: 4, background: color }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
