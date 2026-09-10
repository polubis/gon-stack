import type { ParkaState } from './types';
import { createSeedState } from './seed';

const STORAGE_KEY = 'parka:state:v1';

let state: ParkaState = createSeedState();
const listeners = new Set<() => void>();

const isBrowser = typeof window !== 'undefined';

/**
 * `pending`  — first bootstrap request in flight.
 * `backend`  — a signed-in session; every mutation syncs to Postgres.
 * `local`    — anonymous visitor; state lives in localStorage (demo mode).
 */
type Mode = 'pending' | 'backend' | 'local';
let mode: Mode = 'pending';

const notify = () => listeners.forEach((l) => l());

const loadLocal = () => {
  if (!isBrowser) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = { ...createSeedState(), ...(JSON.parse(raw) as ParkaState) };
    }
  } catch {
    /* fall back to seed */
  }
};

const persistLocal = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
};

const toPayload = (s: ParkaState) => ({
  categories: s.categories,
  expenses: s.expenses,
  limits: s.limits,
  goals: s.goals,
  recurring: s.recurring,
  notifications: s.notifications,
  settings: s.settings,
});

let syncTimer: ReturnType<typeof setTimeout> | undefined;
let syncChain: Promise<unknown> = Promise.resolve();

const flushToBackend = () => {
  const snapshot = toPayload(state);
  syncChain = syncChain
    .catch(() => undefined)
    .then(() =>
      fetch('/api/state/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      }),
    )
    .catch(() => undefined);
};

const persistBackend = () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(flushToBackend, 250);
};

const persist = () => {
  if (mode === 'backend') persistBackend();
  else persistLocal();
};

/** Resolves once the current backend sync (if any) has been flushed. */
export const whenSynced = async (): Promise<void> => {
  if (mode !== 'backend') return;
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = undefined;
    flushToBackend();
  }
  await syncChain;
};

let bootstrapPromise: Promise<void> | undefined;

export const bootstrap = (): Promise<void> => {
  if (!isBrowser) return Promise.resolve();
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const res = await fetch('/api/state/', {
        headers: { Accept: 'application/json' },
      });
      const body = (await res.json()) as
        { code: 200; data: Partial<ParkaState> } | { code: number };

      if (res.ok && body.code === 200 && 'data' in body) {
        state = {
          ...createSeedState(),
          ...body.data,
          authed: true,
          selectedMonth: state.selectedMonth,
        };
        mode = 'backend';
        notify();
        return;
      }
    } catch {
      /* offline / no backend — fall through to local mode */
    }

    mode = 'local';
    loadLocal();
    notify();
  })();

  return bootstrapPromise;
};

if (isBrowser) void bootstrap();

export const getState = (): ParkaState => state;

export const getMode = (): Mode => mode;

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setState = (updater: (prev: ParkaState) => ParkaState): void => {
  state = updater(state);
  persist();
  notify();
};

export const resetState = (): void => {
  state = createSeedState();
  persist();
  notify();
};

export const genId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
