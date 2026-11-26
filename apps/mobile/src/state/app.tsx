import {
  chatMessages, demoReplies,
  type Availability, type Category, type ChatMessage, type Incident, type Role,
} from '@e-alert/shared';
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

export type AppearancePref = 'system' | 'light' | 'dark';
export type EndReason = 'safe' | 'cancelled';

export type AppState = {
  onboarded: boolean;
  role: Extract<Role, 'resident' | 'responder'>;
  availability: Availability;
  activeIncident: { category: Category; startedAt: number } | null;
  /** Why the last alert ended. Phase 2 sends this to the admin. */
  lastEndReason: EndReason | null;
  appearance: AppearancePref;
  /** Responder: the incident they accepted. */
  assignment: (Incident & { arrived: boolean }) | null;
  messages: ChatMessage[];
};

/*
 * Tiny selector store (Phase 1, in memory; Firestore replaces it in Phase 2).
 *
 * Why not one React context: every change re-rendered every consumer, and iOS
 * native tabs keep all tabs mounted, so a chat message re-rendered the Map tab
 * and its MapView. Here each component subscribes to the exact slice it reads
 * and only re-renders when that slice changes. Actions are stable functions.
 */
let state: AppState = {
  onboarded: false,
  role: 'resident',
  availability: 'available',
  activeIncident: null,
  lastEndReason: null,
  appearance: 'system',
  assignment: null,
  messages: chatMessages,
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

function set(fn: (s: AppState) => AppState) {
  const next = fn(state);
  if (next === state) return;
  state = next;
  listeners.forEach((l) => l());
}

/** Read one slice. The selector must return a primitive or an existing reference. */
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

/** Unread = messages from the other side not read yet. Returns a number, so it is cheap to compare. */
export function useUnread(threadId?: string): number {
  return useAppState((s) => {
    let n = 0;
    for (const m of s.messages) {
      if (!m.read && m.from !== 'system' && m.from !== s.role && (!threadId || m.threadId === threadId)) n++;
    }
    return n;
  });
}

let replyTimer: ReturnType<typeof setTimeout> | undefined;

export const appActions = {
  /** Clears per-user state on log in / log out. */
  resetSession: () => set((p) => ({ ...p, activeIncident: null, lastEndReason: null, assignment: null, availability: 'available' })),
  finishOnboarding: () => set((p) => (p.onboarded ? p : { ...p, onboarded: true })),
  setRole: (role: AppState['role']) => set((p) => (p.role === role ? p : { ...p, role })),
  setAvailability: (availability: Availability) => set((p) => (p.availability === availability ? p : { ...p, availability })),
  startIncident: (category: Category) => set((p) => ({ ...p, activeIncident: { category, startedAt: Date.now() }, lastEndReason: null })),
  endIncident: (reason: EndReason) => set((p) => ({ ...p, activeIncident: null, lastEndReason: reason })),
  setAppearance: (appearance: AppearancePref) => {
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
    set((p) => (p.appearance === appearance ? p : { ...p, appearance }));
  },
  acceptOffer: (i: Incident) => set((p) => ({ ...p, assignment: { ...i, arrived: false }, availability: 'busy' })),
  markArrived: () => set((p) => (p.assignment && !p.assignment.arrived ? { ...p, assignment: { ...p.assignment, arrived: true } } : p)),
  closeAssignment: () => set((p) => ({ ...p, assignment: null, availability: 'available' })),

  sendMessage: (threadId: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    set((p) => ({
      ...p,
      messages: [...p.messages, { id: `m${Date.now()}`, threadId, from: p.role, text: t, at: new Date().toISOString(), read: true }],
    }));
    // DEMO ONLY: one canned reply from the other side, so the thread feels alive.
    // Rapid sends collapse into one reply. Phase 2 replaces this with Firestore.
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      set((p) => {
        const other = p.role === 'resident' ? 'responder' : 'resident';
        const pool = demoReplies[other];
        return {
          ...p,
          messages: [...p.messages, {
            id: `m${Date.now()}r`, threadId, from: other,
            text: pool[p.messages.length % pool.length], at: new Date().toISOString(), read: false,
          }],
        };
      });
    }, 2500);
  },

  markRead: (threadId: string) => set((p) => (
    p.messages.some((m) => m.threadId === threadId && !m.read)
      ? { ...p, messages: p.messages.map((m) => (m.threadId === threadId && !m.read ? { ...m, read: true } : m)) }
      : p
  )),
};
