import type {
  ParkaState,
  Category,
  Expense,
  Limit,
  SavingsGoal,
  Recurring,
  AppNotification,
  Settings,
} from './types';
import { createSeedState } from './seed';

let state: ParkaState = createSeedState();
const listeners = new Set<() => void>();

const isBrowser = typeof window !== 'undefined';

/**
 * `pending`  — first bootstrap request in flight.
 * `backend`  — a signed-in session; every mutation syncs to Postgres.
 * `anonymous` — no backend session; state stays in memory only.
 */
type Mode = 'pending' | 'backend' | 'anonymous';
let mode: Mode = 'pending';

const notify = () => listeners.forEach((l) => l());

let syncChain: Promise<unknown> = Promise.resolve();

/** Chains a write onto the in-flight queue so writes settle in order. */
const track = (p: Promise<unknown>): Promise<unknown> => {
  syncChain = syncChain
    .catch(() => undefined)
    .then(() => p)
    .catch(() => undefined);
  return syncChain;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

const postEntity = (path: string, body: unknown) => {
  if (mode !== 'backend') return Promise.resolve();
  return track(
    fetch(`/api/${path}/`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }),
  );
};

const putEntity = (path: string, id: string, body: unknown) => {
  if (mode !== 'backend') return Promise.resolve();
  return track(
    fetch(`/api/${path}/${id}/`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }),
  );
};

const deleteEntity = (path: string, id: string) => {
  if (mode !== 'backend') return Promise.resolve();
  return track(fetch(`/api/${path}/${id}/`, { method: 'DELETE' }));
};

/** Resolves once every in-flight entity write has settled. */
export const whenSynced = async (): Promise<void> => {
  await syncChain;
};

const ENTITY_ENDPOINTS = [
  'categories',
  'expenses',
  'limits',
  'goals',
  'recurring',
  'notifications',
] as const;

let bootstrapPromise: Promise<void> | undefined;

export const bootstrap = (): Promise<void> => {
  if (!isBrowser) return Promise.resolve();
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const responses = await Promise.all([
        ...ENTITY_ENDPOINTS.map((path) =>
          fetch(`/api/${path}/`, { headers: { Accept: 'application/json' } }),
        ),
        fetch('/api/settings/', { headers: { Accept: 'application/json' } }),
      ]);

      if (responses.every((r) => r.ok)) {
        const bodies = (await Promise.all(responses.map((r) => r.json()))) as (
          { code: 200; data: unknown } | { code: number }
        )[];

        const patch: Partial<ParkaState> = {};
        ENTITY_ENDPOINTS.forEach((key, i) => {
          const body = bodies[i];
          if (body.code === 200 && 'data' in body) {
            (patch as Record<string, unknown>)[key] = body.data;
          }
        });
        const settingsBody = bodies[bodies.length - 1];
        if (settingsBody.code === 200 && 'data' in settingsBody) {
          patch.settings = settingsBody.data as Settings;
        }

        state = {
          ...createSeedState(),
          ...patch,
          authed: true,
          selectedMonth: state.selectedMonth,
        };
        mode = 'backend';
        notify();
        return;
      }
    } catch {
      /* offline / no backend — fall through to anonymous mode */
    }

    mode = 'anonymous';
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
  notify();
};

export const resetState = (): void => {
  state = createSeedState();
  notify();
};

export const genId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

// --- Per-entity actions ----------------------------------------------------

export const createCategory = (category: Category): void => {
  setState((p) => ({ ...p, categories: [...p.categories, category] }));
  void postEntity('categories', category);
};

export const updateCategory = (category: Category): void => {
  setState((p) => ({
    ...p,
    categories: p.categories.map((c) => (c.id === category.id ? category : c)),
  }));
  void putEntity('categories', category.id, category);
};

export const createExpense = (expense: Expense): Promise<unknown> => {
  setState((p) => ({ ...p, expenses: [expense, ...p.expenses] }));
  return postEntity('expenses', expense);
};

export const updateExpense = (expense: Expense): void => {
  setState((p) => ({
    ...p,
    expenses: p.expenses.map((e) => (e.id === expense.id ? expense : e)),
  }));
  void putEntity('expenses', expense.id, expense);
};

export const deleteExpense = (id: string): void => {
  setState((p) => ({ ...p, expenses: p.expenses.filter((e) => e.id !== id) }));
  void deleteEntity('expenses', id);
};

export const createLimit = (limit: Limit): void => {
  setState((p) => ({ ...p, limits: [...p.limits, limit] }));
  void postEntity('limits', limit);
};

export const updateLimit = (limit: Limit): void => {
  setState((p) => ({
    ...p,
    limits: p.limits.map((l) => (l.id === limit.id ? limit : l)),
  }));
  void putEntity('limits', limit.id, limit);
};

export const createGoal = (goal: SavingsGoal): void => {
  setState((p) => ({ ...p, goals: [...p.goals, goal] }));
  void postEntity('goals', goal);
};

export const updateRecurring = (recurring: Recurring): void => {
  setState((p) => ({
    ...p,
    recurring: p.recurring.map((r) => (r.id === recurring.id ? recurring : r)),
  }));
  void putEntity('recurring', recurring.id, recurring);
};

export const createNotification = (
  notification: AppNotification,
): Promise<unknown> => {
  setState((p) => ({
    ...p,
    notifications: [notification, ...p.notifications],
  }));
  return postEntity('notifications', notification);
};

export const updateSettings = (settings: Settings): void => {
  setState((p) => ({ ...p, settings }));
  if (mode !== 'backend') return;
  void track(
    fetch('/api/settings/', {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(settings),
    }),
  );
};
