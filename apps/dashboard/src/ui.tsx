import {
  LOGO_ARCS, LOGO_CORAL, LOGO_PIN, LOGO_RING_WIDTH, LOGO_VIEWBOX,
  availabilityMeta, categoryMeta, chartCategory, palette, statusMeta,
  type Availability, type Category, type IncidentStatus,
} from '@e-alert/shared';
import {
  AlertTriangle, Car, CheckCircle2, Clock, Flame, MapPin, Moon, Send, ShieldHalf, Stethoscope, UserCheck, Waves,
  type LucideIcon,
} from 'lucide-react';
import { useSyncExternalStore } from 'react';

export function useDark() {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia('(prefers-color-scheme: dark)');
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );
}

export function usePalette() {
  return palette[useDark() ? 'dark' : 'light'];
}

export function useCatColors() {
  return chartCategory[useDark() ? 'dark' : 'light'];
}

export const CAT_ICON: Record<Category, LucideIcon> = { police: ShieldHalf, fire: Flame, medical: Stethoscope, disaster: Waves };
const STATUS_ICON: Record<IncidentStatus, LucideIcon> = { sent: Send, assigned: UserCheck, en_route: Car, arrived: MapPin, resolved: CheckCircle2, escalated: AlertTriangle };
const AVAIL_ICON: Record<Availability, LucideIcon> = { available: CheckCircle2, busy: Clock, off_duty: Moon };

export function CatBadge({ cat, size = 30 }: { cat: Category; size?: number }) {
  const c = useCatColors();
  const I = CAT_ICON[cat];
  return (
    <span className="cat-dot" style={{ background: c[cat], width: size, height: size }} aria-hidden>
      <I size={size * 0.5} strokeWidth={2.4} />
    </span>
  );
}

/** Status always = icon + text, never color alone. */
export function StatusPill({ status }: { status: IncidentStatus }) {
  const p = usePalette();
  const m = statusMeta[status];
  const I = STATUS_ICON[status];
  return (
    <span className="pill">
      <I size={13} color={p[m.color]} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

export function AvailPill({ a }: { a: Availability }) {
  const p = usePalette();
  const m = availabilityMeta[a];
  const I = AVAIL_ICON[a];
  return (
    <span className="pill">
      <I size={13} color={p[m.color]} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

export function CatLabel({ cat }: { cat: Category }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <CatBadge cat={cat} size={24} />
      {categoryMeta[cat].label}
    </span>
  );
}

const TONES = ['#F0623F', '#5856D6', '#34A0A4', '#E0A030', '#AF52DE', '#3478F6'];
export function Avatar({ initials, size = 30 }: { initials: string; size?: number }) {
  const tone = TONES[(initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % TONES.length];
  return <span className="avatar" style={{ background: tone, width: size, height: size, fontSize: size * 0.37 }} aria-hidden>{initials}</span>;
}

export function PriorityBar({ value }: { value: number }) {
  const p = usePalette();
  const tone = value >= 85 ? p.critical : value >= 65 ? p.warning : p.secondaryLabel;
  const label = value >= 85 ? 'Critical' : value >= 65 ? 'High' : 'Normal';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} aria-label={`Priority ${value}, ${label}`}>
      <span style={{ width: 48, height: 6, borderRadius: 3, background: p.fill, overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${value}%`, height: '100%', background: tone, borderRadius: 3 }} />
      </span>
      <span className="tnum" style={{ fontWeight: 600 }}>{value}</span>
    </span>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children ? <div style={{ display: 'flex', gap: 8 }}>{children}</div> : null}
    </header>
  );
}

/** E-Alert mark. Transparent; the pin follows the text color in light and dark mode. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox={LOGO_VIEWBOX} role="img" aria-label="E-Alert logo">
      {LOGO_ARCS.map((d, i) => <path key={i} d={d} stroke={LOGO_CORAL} strokeWidth={LOGO_RING_WIDTH} fill="none" />)}
      <path d={LOGO_PIN} fill="var(--label)" fillRule="evenodd" />
    </svg>
  );
}
