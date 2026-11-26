import { timeAgo, verificationQueue, type VerificationRequest } from '@e-alert/shared';
import { Check, FileText, Undo2, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, PageHead, usePalette } from '../ui';

export function Verification() {
  const p = usePalette();
  const [items, setItems] = useState<VerificationRequest[]>(verificationQueue);
  const [last, setLast] = useState<{ id: string; prev: VerificationRequest['state'] } | null>(null);
  const pending = items.filter((i) => i.state === 'pending');

  const decide = (id: string, state: VerificationRequest['state']) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, state } : x)));
    setLast({ id, prev: 'pending' });
  };
  const undo = () => {
    if (!last) return;
    setItems((xs) => xs.map((x) => (x.id === last.id ? { ...x, state: last.prev } : x)));
    setLast(null);
  };

  return (
    <div className="page">
      <PageHead title="Verification" sub="Check each document against the name on the account. Documents are visible to administrators only." />

      {last ? (
        <div className="card card-pad" role="status" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ flex: 1 }}>{items.find((x) => x.id === last.id)?.name} was {items.find((x) => x.id === last.id)?.state}.</span>
          <button className="btn" onClick={undo}><Undo2 size={14} /> Undo</button>
        </div>
      ) : null}

      {pending.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <Check size={28} color={p.safe} />
          <h2 style={{ marginTop: 8 }}>All caught up</h2>
          <p className="muted">New sign-ups and credentials will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cards">
          {pending.map((v) => (
            <article key={v.id} className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Avatar initials={v.initials} size={38} />
                <div style={{ flex: 1 }}>
                  <h2>{v.name}</h2>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {v.kind === 'resident_id' ? 'Resident identity' : `Responder credential · ${v.department}`} · {timeAgo(v.submittedAt)}
                  </div>
                </div>
              </div>
              <div style={{ height: 120, borderRadius: 12, background: 'var(--fill)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={16} /> {v.document}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn safe" style={{ flex: 1, justifyContent: 'center' }} onClick={() => decide(v.id, 'approved')}><Check size={14} /> Approve</button>
                <button className="btn danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => decide(v.id, 'rejected')}><X size={14} /> Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
