import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

import { appActions } from './app';

/*
 * Local placeholder login (Phase 1). Accounts and the session live on this
 * device only, in the iOS Keychain / Android Keystore via expo-secure-store.
 * Firebase Authentication replaces this in Phase 2.
 */

export type AuthRole = 'resident' | 'responder';
export type Session = { name: string; email: string; role: AuthRole };
type Account = Session & { password: string };

const ACCOUNTS_KEY = 'ealert.accounts';
const SESSION_KEY = 'ealert.session';

/** Demo accounts so the app can be tried without signing up. */
export const DEMO_PASSWORD = 'Ealert@123';
const DEMO_ACCOUNTS: Account[] = [
  { name: 'Juan Dela Cruz', email: 'resident@ealert.test', password: DEMO_PASSWORD, role: 'resident' },
  { name: 'Nurse Joy Aquino', email: 'responder@ealert.test', password: DEMO_PASSWORD, role: 'responder' },
];

type AuthState = { ready: boolean; session: Session | null };
let state: AuthState = { ready: false, session: null };
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const set = (next: AuthState) => { state = next; listeners.forEach((l) => l()); };

export function useAuth<T>(selector: (s: AuthState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const initialsOf = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';

/** Password rules for new accounts. Each rule is shown live on the sign-up form. */
export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'A capital letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: 'A number (0–9)', test: (p: string) => /\d/.test(p) },
  { key: 'special', label: 'A special character (! @ # $ …)', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

/** First rule the password breaks, or null when it passes all of them. */
export function passwordProblem(p: string): string | null {
  const miss = PASSWORD_RULES.filter((r) => !r.test(p));
  return miss.length ? `Password needs: ${miss.map((r) => r.label.toLowerCase()).join(', ')}.` : null;
}

const normEmail = (e: string) => e.trim().toLowerCase();
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function loadAccounts(): Promise<Account[]> {
  const saved = (await readJSON<Account[]>(ACCOUNTS_KEY)) ?? [];
  // Demo accounts always exist; a saved account with the same email wins.
  const emails = new Set(saved.map((a) => a.email));
  return [...saved, ...DEMO_ACCOUNTS.filter((d) => !emails.has(d.email))];
}

function startSession(session: Session) {
  appActions.resetSession();
  appActions.setRole(session.role);
  set({ ready: true, session });
}

let initStarted = false;
/** Restores the saved session once, on app start. */
export function initAuth() {
  if (initStarted) return;
  initStarted = true;
  readJSON<Session>(SESSION_KEY).then((session) => {
    if (session) startSession(session);
    else set({ ready: true, session: null });
  });
}

export type AuthResult = { ok: true; session: Session } | { ok: false; error: string };

export const authActions = {
  /** `as` checks the account matches the Resident / Responder tab picked on the login screen. */
  async logIn(email: string, password: string, as?: AuthRole): Promise<AuthResult> {
    if (!isEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
    if (!password) return { ok: false, error: 'Enter your password.' };
    const acc = (await loadAccounts()).find((a) => a.email === normEmail(email));
    if (!acc || acc.password !== password) return { ok: false, error: 'Wrong email or password.' };
    if (as && acc.role !== as) {
      return { ok: false, error: as === 'responder'
        ? 'This is a resident account. Switch to Resident to log in.'
        : 'This is a responder account. Switch to Responder to log in.' };
    }
    const session: Session = { name: acc.name, email: acc.email, role: acc.role };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    startSession(session);
    return { ok: true, session };
  },

  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    if (name.trim().length < 2) return { ok: false, error: 'Enter your full name.' };
    if (!isEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
    const weak = passwordProblem(password);
    if (weak) return { ok: false, error: weak };
    const all = await loadAccounts();
    if (all.some((a) => a.email === normEmail(email))) return { ok: false, error: 'An account with this email already exists.' };
    const acc: Account = { name: name.trim(), email: normEmail(email), password, role: 'resident' };
    const saved = (await readJSON<Account[]>(ACCOUNTS_KEY)) ?? [];
    await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify([...saved, acc]));
    return authActions.logIn(acc.email, password);
  },

  /** One-tap demo: signs in with the built-in resident or responder demo account. */
  async demoLogIn(role: AuthRole): Promise<AuthResult> {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    const session: Session = { name: acc.name, email: acc.email, role: acc.role };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    startSession(session);
    return { ok: true, session };
  },

  async logOut() {
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    appActions.resetSession();
    set({ ready: true, session: null });
  },
};
