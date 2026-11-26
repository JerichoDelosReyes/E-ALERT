import {
  chatMessages, demoReplies,
  type Availability, type Category, type ChatMessage, type Incident, type Role,
} from '@e-alert/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';

export type AppearancePref = 'system' | 'light' | 'dark';
export type EndReason = 'safe' | 'cancelled';

type State = {
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

type Actions = {
  finishOnboarding: () => void;
  setRole: (r: State['role']) => void;
  setAvailability: (a: Availability) => void;
  startIncident: (c: Category) => void;
  endIncident: (reason: EndReason) => void;
  setAppearance: (a: AppearancePref) => void;
  acceptOffer: (i: Incident) => void;
  markArrived: () => void;
  closeAssignment: () => void;
  sendMessage: (threadId: string, text: string) => void;
  markRead: (threadId: string) => void;
  unreadCount: (threadId?: string) => number;
};

const Ctx = createContext<(State & Actions) | null>(null);

/** Phase 1 in-memory store. Firestore replaces it in Phase 2. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>({
    onboarded: false,
    role: 'resident',
    availability: 'available',
    activeIncident: null,
    lastEndReason: null,
    appearance: 'system',
    assignment: null,
    messages: chatMessages,
  });

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sendMessage = useCallback((threadId: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    let from: ChatMessage['from'] = 'resident';
    set((p) => {
      from = p.role;
      const msg: ChatMessage = { id: `m${Date.now()}`, threadId, from, text: t, at: new Date().toISOString(), read: true };
      return { ...p, messages: [...p.messages, msg] };
    });
    // DEMO ONLY: a canned reply from the other side, so the thread feels alive.
    // Phase 2 replaces this with real Firestore messages.
    timers.current.push(setTimeout(() => {
      set((p) => {
        const other = p.role === 'resident' ? 'responder' : 'resident';
        const pool = demoReplies[other];
        const reply: ChatMessage = {
          id: `m${Date.now()}r`, threadId, from: other,
          text: pool[p.messages.length % pool.length], at: new Date().toISOString(), read: false,
        };
        return { ...p, messages: [...p.messages, reply] };
      });
    }, 2500));
  }, []);

  const value = useMemo<State & Actions>(() => ({
    ...s,
    finishOnboarding: () => set((p) => ({ ...p, onboarded: true })),
    setRole: (role) => set((p) => ({ ...p, role })),
    setAvailability: (availability) => set((p) => ({ ...p, availability })),
    startIncident: (category) => set((p) => ({ ...p, activeIncident: { category, startedAt: Date.now() }, lastEndReason: null })),
    endIncident: (reason) => set((p) => ({ ...p, activeIncident: null, lastEndReason: reason })),
    setAppearance: (appearance) => {
      Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
      set((p) => ({ ...p, appearance }));
    },
    acceptOffer: (i) => set((p) => ({ ...p, assignment: { ...i, arrived: false }, availability: 'busy' })),
    markArrived: () => set((p) => (p.assignment ? { ...p, assignment: { ...p.assignment, arrived: true } } : p)),
    closeAssignment: () => set((p) => ({ ...p, assignment: null, availability: 'available' })),
    sendMessage,
    markRead: (threadId) => set((p) => (
      p.messages.some((m) => m.threadId === threadId && !m.read)
        ? { ...p, messages: p.messages.map((m) => (m.threadId === threadId ? { ...m, read: true } : m)) }
        : p
    )),
    // Unread = messages from the *other* side that are not read yet.
    unreadCount: (threadId) => s.messages.filter((m) =>
      !m.read && m.from !== 'system' && m.from !== s.role && (!threadId || m.threadId === threadId)).length,
  }), [s, sendMessage]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
