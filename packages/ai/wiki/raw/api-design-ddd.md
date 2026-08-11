# EDA Store — Implementation Specification

> **Purpose:** This document is the single source of truth for implementing `eda-store` (framework-agnostic) and `eda-store-react` (React bindings) inside `@repo/react-kit`.
>
> **Audience:** LLM or engineer implementing the library from scratch.
>
> **Related code today (do not break):**
>
> - `@repo/react-kit/supa-store` — low-level nanostores wrappers (`atom`, `map`, `computed`)
> - `apps/romantic-app/src/libs/eda` — RxJS event bus (TRIGGER → TASK → FACT). EDA Store is a **complementary** state layer, not a replacement.

---

## 1. Goals

| Goal                    | Detail                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Single store object     | One module-level store holds all slice state, sync reducers, and async actions                  |
| Fine-grained reactivity | Each **state key** is backed by its own nanostores **atom** (not `map`)                         |
| Framework-agnostic core | `eda-store` has zero React imports; usable in Node, Workers, tests                              |
| React integration       | `eda-store-react` exposes hooks, dispatch-only actions, and subscriptions                       |
| Type safety             | Full inference for state keys, reducers, public/private actions, args, and action events        |
| Action events           | Observe **public** action dispatches via `store.on` (separate from state `subscribe`)           |
| DDD-friendly            | Presentation dispatches **public** actions only; core logic lives in reducers + private actions |

---

## 2. Package Layout

```
packages/react-kit/src/
├── eda-store/
│   ├── index.ts          # export store()
│   ├── types.ts          # StoreState, Reducers, Actions, StoreInstance, …
│   ├── create-store.ts   # main factory
│   ├── atoms.ts          # per-key atom creation from initializer
│   ├── computed.ts       # computed property resolution
│   ├── setters.ts        # set / reset helpers
│   └── events.ts         # action event bus (store.on)
└── eda-store-react/
    ├── index.ts          # export toReact()
    └── to-react.ts       # hook + subscribe + dispatch + on wrappers
```

---

## 3. Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│  initializer(): State                                       │
│    idle, busy, users, error          ← plain data atoms      │
│    isActive(state) => boolean      ← computed (derived)     │
├─────────────────────────────────────────────────────────────┤
│  reducers({ get, set })                                     │
│    setSmth, doOtherThing             ← sync state mutations   │
├─────────────────────────────────────────────────────────────┤
│  actions({ get, set, action, delegate })                    │
│    private: LOAD_USERS               ← internal only          │
│    public:  INIT_LOAD                ← dispatch from React  │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   someStore (vanilla)            useSomeStore (React)
   .set / .reset / .get           .use.* / .get.* / dispatch
   .subscribe.*  (state)          .subscribe.*  (state)
   .on.*         (actions)         .on.*         (actions — passthrough)
```

**Data flow:**

1. **Reducer** or **action** returns a partial state patch `{ idle: true, … }`.
2. Store merges patch into atoms (batch when multiple keys change).
3. **State subscribers** (`subscribe`) receive updates per changed key.
4. **Action listeners** (`on`) receive an event when a **public** action is dispatched and settles.

**Two observation channels:**

| Channel | API                   | Fires when               | Payload                                 |
| ------- | --------------------- | ------------------------ | --------------------------------------- |
| State   | `subscribe` / `use.*` | Atoms change             | State snapshot or single key value      |
| Actions | `on` / `on.ACTION`    | Public action dispatched | Typed action event (args, patch, error) |

**Presentation layer rule:** React components MUST NOT call `someStore.set()` or `someStore.reset()`. They dispatch public actions via `useSomeStore.INIT_LOAD(args)` only.

---

## 4. State Shape

### 4.1 Plain fields

Any JSON-serializable or reference value. Stored in a dedicated atom per key.

### 4.2 Computed fields

A computed field is a **function** on the initializer return value:

```typescript
type ComputedField<TState, TResult> = (state: TState) => TResult;
```

- Computed keys are **read-only** — no `set.computedKey()` or `reset.computedKey()`.
- Computed re-evaluates when any **dependency atom** it reads (via `get()`) changes.
- Implementation: wrap in nanostores `computed()` reading from a snapshot getter or dependency atoms.

### 4.3 Initializer

```typescript
type StateInitializer<TState extends Record<string, unknown>> = () => TState;
```

- Called once at store creation.
- Return value defines initial atoms **and** computed definitions.
- Must be pure (no side effects).

---

## 5. API — `store()`

### 5.1 Signature

```typescript
function store<
  TState extends Record<string, unknown>,
  TReducers extends Record<string, ReducerFn<TState, any[], Partial<TState>>>,
  TPrivateActions extends Record<
    string,
    ActionFn<
      TState,
      any[],
      Partial<TState> | void | Promise<Partial<TState> | void>
    >
  >,
  TPublicActions extends Record<
    string,
    ActionFn<
      TState,
      any[],
      Partial<TState> | void | Promise<Partial<TState> | void>
    >
  >,
>(
  initializer: StateInitializer<TState>,
  reducers: (ctx: ReducerContext<TState>) => TReducers,
  actions: (ctx: ActionContext<TState, TPrivateActions, TPublicActions>) => {
    private: TPrivateActions;
    public: TPublicActions;
  },
): StoreInstance<TState, TReducers, TPublicActions>;
```

### 5.2 Context objects

```typescript
type ReducerContext<TState> = {
  /** Read current state snapshot (plain + computed values) */
  get: () => Readonly<ResolvedState<TState>>;
  /** Imperative setters — prefer returning patches from reducers when possible */
  set: SetAPI<TState>;
};

type ActionContext<
  TState,
  TPrivate extends Record<string, ActionFn<TState, any[], unknown>>,
  TPublic extends Record<string, ActionFn<TState, any[], unknown>>,
> = ReducerContext<TState> & {
  /** Call another action by name (same store) */
  action: ActionCaller<TPrivate & TPublic>;
  /** Shorthand for calling private actions only (typed) */
  delegate: ActionCaller<TPrivate>;
};
```

### 5.3 Reducer / action return semantics

| Return                              | Behavior                                     |
| ----------------------------------- | -------------------------------------------- |
| `Partial<TState>` (plain keys only) | Merge into atoms; omit keys = unchanged      |
| `void` / `undefined`                | No state change (side-effect-only action OK) |
| `Promise<Partial<TState> \| void>`  | Await, then apply same rules                 |

**Do not** return computed keys in patches — ignore if present.

### 5.4 Sync reducers vs async actions

| Kind           | Defined in        | Callable from                                                      | Async          |
| -------------- | ----------------- | ------------------------------------------------------------------ | -------------- |
| Reducer        | 2nd argument      | `someStore.setSmth()` (vanilla/tests)                              | No (sync only) |
| Private action | `actions.private` | `action.LOAD_USERS()` / `delegate.LOAD_USERS()`                    | Yes            |
| Public action  | `actions.public`  | `useStore.INIT_LOAD()` (React) / `someStore.INIT_LOAD()` (vanilla) | Yes            |

---

## 6. Store Instance (vanilla — `eda-store`)

Given:

```typescript
const someStore = store(initializer, reducers, actions);
```

### 6.1 State access

| Method                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `someStore.get()`       | Full resolved snapshot `{ idle, busy, users, error, isActive }` |
| `someStore.get.idle()`  | Single key snapshot                                             |
| `someStore.get.users()` | Same for any plain or computed key                              |

### 6.2 Imperative mutation (non-React)

| Method                                       | Description                                    |
| -------------------------------------------- | ---------------------------------------------- |
| `someStore.set({ idle: false, busy: true })` | Batch merge (preferred)                        |
| `someStore.set.idle(false)`                  | Single-key set                                 |
| `someStore.reset()`                          | Reset **all plain keys** to initializer values |
| `someStore.reset.idle()`                     | Reset one plain key                            |

`set` on computed keys: **TypeScript error** (exclude from `SetAPI`).

### 6.3 Reducers (sync)

Reducer names are mounted on the store instance:

```typescript
someStore.setSmth(arg1, arg2); // runs reducer; applies returned patch
someStore.doOtherThing();
```

### 6.4 Public actions (vanilla)

Public actions are also on the vanilla store (for tests, SSR bootstrap, non-React UI):

```typescript
await someStore.INIT_LOAD({ force: true });
```

Private actions are **not** mounted on the store instance.

### 6.5 Subscriptions

| Method                               | Description                                  |
| ------------------------------------ | -------------------------------------------- |
| `someStore.subscribe(listener)`      | `(snapshot) => void` on any plain key change |
| `someStore.subscribe.idle(listener)` | `(value) => void` on single key              |
| Return value                         | `unsubscribe(): void`                        |

Use nanostores `listen()` on underlying atoms; fan-in for full-store subscribe.

### 6.6 Action events (`on`)

Action events observe **public action dispatches** — not state diffs, not reducers, not private actions.

Implementation lives in **`eda-store`** (framework-agnostic). The React adapter **passthroughs** the same `on` API on the object returned by `toReact()` — no separate React-specific event system.

#### Event payload

Every emitted event is a discriminated object:

```typescript
type ActionEventMeta = {
  /** Unique id per dispatch — use for tracing / deduping */
  id: string;
  /** High-resolution timestamp (performance.now()) */
  time: number;
};

type ActionEvent<TName extends string, TArgs extends unknown[], TPatch> = {
  /** Public action name — discriminant for union narrowing */
  type: TName;
  /** Arguments passed to the dispatch call */
  args: TArgs;
  /** Patch returned by the action, if any (plain keys only) */
  patch?: TPatch;
  /** Set when the action throws or rejected promise */
  error?: unknown;
  meta: ActionEventMeta;
};
```

#### When events fire

| Phase                          | `on.ACTION` / `on` called? | Notes                                          |
| ------------------------------ | -------------------------- | ---------------------------------------------- |
| Public action invoked          | —                          | Dispatch begins                                |
| Handler runs (sync or awaited) | —                          | Private `delegate.*` calls do **not** emit     |
| Handler settles                | ✅ once                    | After return value applied (or error captured) |

- One event per **top-level public dispatch**. If `REFRESH` calls `delegate.LOAD_USERS()` internally, only `REFRESH` emits — not `LOAD_USERS`.
- Reducer calls (`someStore.clearError()`) do **not** emit action events.
- Imperative `set` / `reset` do **not** emit action events.

#### API

Given public actions `INIT_LOAD`, `REFRESH`:

```typescript
// Listen to one public action — args and patch are fully typed
const unsub = someStore.on.INIT_LOAD((event) => {
  event.type; // 'INIT_LOAD'
  event.args; // [opts?: { force?: boolean }]
  event.patch; // Partial<UsersState> | undefined
  event.error; // unknown | undefined
  event.meta.id;
});

// Listen to ALL public actions — discriminated union on `type`
const unsubAll = someStore.on((event) => {
  switch (event.type) {
    case 'INIT_LOAD':
      event.args; // narrowed
      break;
    case 'REFRESH':
      event.args; // narrowed
      break;
  }
});

unsub(); // remove single-action listener
unsubAll(); // remove global listener
```

#### Type helpers

```typescript
/** Union of all public-action event types for this store */
type PublicActionEvents<TPublicActions> = {
  [K in keyof TPublicActions]: ActionEvent<
    K & string,
    Parameters<TPublicActions[K]>,
    Partial<ResolvedState<TState>> // infer TState from store
  >;
}[keyof TPublicActions];

type OnAPI<
  TPublicActions,
  TEvents extends PublicActionEvents<TPublicActions>,
> = {
  /** Subscribe to any public action dispatch */
  (listener: (event: TEvents) => void): () => void;
} & {
  /** Subscribe to a specific public action */
  [K in keyof TPublicActions & string]: (
    listener: (event: Extract<TEvents, { type: K }>) => void,
  ) => () => void;
};
```

#### Use cases

- Analytics / audit log when user-triggered commands run
- Cross-module reactions (module B listens to module A's public actions without importing its private actions)
- Test assertions on dispatch order and args
- Toast / notification side effects keyed off action completion

---

## 7. React Bindings — `toReact()`

```typescript
import { toReact } from '@repo/react-kit/eda-store-react';

const useSomeStore = toReact(someStore);
```

### 7.1 Hooks (re-render on change)

```typescript
const idle = useSomeStore.use.idle(); // subscribes to `idle` atom
const users = useSomeStore.use.users(); // subscribes to `users` atom
const isActive = useSomeStore.use.isActive(); // subscribes to computed
```

- Implemented via `@nanostores/react` `useStore(atom)` per key.
- Each hook call = one atom subscription (fine-grained).

### 7.2 Snapshots (no subscription)

```typescript
const snapshot = useSomeStore.get(); // full object, no re-render
const idle = useSomeStore.get.idle();
```

Use only in event handlers, effects, or callbacks — not for render-driven UI.

### 7.3 Subscriptions (effects, no re-render)

```typescript
useEffect(() => {
  const unsub = useSomeStore.subscribe.idle((v) => console.log(v));
  return unsub;
}, []);

useEffect(() => {
  return useSomeStore.subscribe((state) => {
    /* … */
  });
}, []);
```

### 7.4 Dispatch (public actions only)

```typescript
// In component body or handlers — NOT direct set/reset
await useSomeStore.INIT_LOAD({ force: true });
useSomeStore.LOAD_USERS(); // ❌ TS error — private, not exposed
```

**React hook object MUST NOT expose:** `set`, `reset`, reducers, or private actions.

### 7.5 Action events (passthrough)

`toReact(store)` exposes the same `on` API as the vanilla store (reference passthrough or equivalent surface):

```typescript
useEffect(() => {
  // Per-action listener
  const unsub = useUsersStore.on.REFRESH((event) => {
    analytics.track('users_refresh', { ok: !event.error });
  });
  return unsub;
}, []);

useEffect(() => {
  // All public actions
  return useUsersStore.on((event) => {
    console.debug('[users-store]', event.type, event.args);
  });
}, []);
```

No React hook wrapper (e.g. no `useOn`) in v1 — use `useEffect` + `on` for side effects without re-renders.

---

## 8. Complete Example

```typescript
import { store } from '@repo/react-kit/eda-store';
import { toReact } from '@repo/react-kit/eda-store-react';

// ── Types ──────────────────────────────────────────────────────

type User = { id: string; name: string };

type UsersState = {
  idle: boolean;
  busy: boolean;
  users: User[];
  error: string | null;
  isActive: (state: Omit<UsersState, 'isActive'>) => boolean;
};

// ── Store ──────────────────────────────────────────────────────

const usersStore = store(
  (): UsersState => ({
    idle: true,
    busy: false,
    users: [],
    error: null,
    isActive: (state) => !state.idle && !state.busy,
  }),

  ({ get, set }) => ({
    clearError: () => {
      return { error: null };
    },

    setUsers: (users: User[]) => {
      // `set` available for imperative escape hatches in reducers
      set.busy(false);
      return { users, idle: false };
    },
  }),

  ({ get, set, action, delegate }) => ({
    private: {
      LOAD_USERS: async (signal?: AbortSignal) => {
        try {
          const res = await fetch('/api/users', { signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const users: User[] = await res.json();
          return { users, busy: false, idle: false, error: null };
        } catch (err) {
          return {
            busy: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      },
    },

    public: {
      INIT_LOAD: async (opts?: { force?: boolean }) => {
        const { idle, busy } = get();
        if (busy) return;
        if (!opts?.force && !idle) return;

        // Option A: inline work
        // Option B: delegate to private action (preferred for reuse)
        return delegate.LOAD_USERS();
      },

      REFRESH: () => action.INIT_LOAD({ force: true }),
    },
  }),
);

// ── Vanilla usage (tests, scripts) ─────────────────────────────

usersStore.get();                    // snapshot
usersStore.set({ busy: true });      // batch
usersStore.reset.error();            // single key
usersStore.clearError();             // reducer
await usersStore.INIT_LOAD();        // public action

// Action events (vanilla)
usersStore.on.INIT_LOAD((event) => {
  if (event.error) console.error(event.error);
});

usersStore.on((event) => {
  // event: INIT_LOAD | REFRESH
});

// ── React usage ────────────────────────────────────────────────

const useUsersStore = toReact(usersStore);

const UsersPanel = () => {
  const busy = useUsersStore.use.busy();
  const users = useUsersStore.use.users();
  const isActive = useUsersStore.use.isActive();
  const error = useUsersStore.use.error();

  return (
    <section>
      {busy && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
      <button
        disabled={busy}
        onClick={() => useUsersStore.REFRESH()}
      >
        Refresh {isActive ? '(active)' : ''}
      </button>
    </section>
  );
};
```

---

## 9. Implementation Notes (nanostores)

### 9.1 One atom per plain key

```typescript
// Pseudocode — create-store.ts
const initial = initializer();
const atoms: Record<string, WritableAtom<unknown>> = {};

for (const [key, value] of Object.entries(initial)) {
  if (typeof value === 'function') continue; // computed — handled separately
  atoms[key] = nanoAtom(value);
}
```

**Do not use `nanoMap`** for the store object in v1. Per-key atoms give predictable `use.key()` granularity and match existing `supa-store` atom patterns.

### 9.2 Applying patches

```typescript
function applyPatch(patch: Partial<TState>) {
  for (const [key, value] of Object.entries(patch)) {
    if (key in atoms) atoms[key].set(value);
  }
  // computed stores auto-refresh via nanostores computed()
}
```

Batch: collect changed keys, set all in one microtask if needed to avoid double render (optional optimization).

### 9.3 Computed resolution

For each computed field `isActive: (state) => …`:

1. Build a `computed()` that calls `getSnapshot()` where snapshot reads all plain atoms.
2. Expose `.get.isActive()` and a dedicated atom for `use.isActive()`.

Alternatively: one hidden “version” atom bumped on any plain change to invalidate all computeds — simpler but coarser. **Prefer dependency tracking via nanostores computed.**

### 9.4 Wrapper reuse

Reuse patterns from `packages/react-kit/src/supa-store.ts`:

- `reset()` → set atom to initial value from initializer
- `use()` → `useStore(atom)` from `@nanostores/react`

EDA Store adds: unified snapshot, reducers, actions, dispatch rules.

### 9.5 Action event bus

```typescript
// Pseudocode — events.ts
const listenersByAction = new Map<string, Set<Listener>>();
const globalListeners = new Set<Listener>();

function emitActionEvent(event: ActionEvent<string, unknown[], unknown>) {
  listenersByAction.get(event.type)?.forEach((fn) => fn(event));
  globalListeners.forEach((fn) => fn(event));
}

async function runPublicAction(name: string, fn: ActionFn, args: unknown[]) {
  const meta = { id: crypto.randomUUID(), time: performance.now() };
  try {
    const patch = await fn(...args);
    if (patch) applyPatch(patch);
    emitActionEvent({ type: name, args, patch, meta });
  } catch (error) {
    emitActionEvent({ type: name, args, error, meta });
    throw error; // still propagate after emit
  }
}
```

- Wire `on` at store creation; mount on `StoreInstance`.
- `toReact()` assigns `hook.on = store.on` (same object).

---

## 10. Type-Level Requirements

Implement these types in `eda-store/types.ts`:

```typescript
/** Split plain vs computed keys from initializer return type */
type PlainKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

type ComputedKeys<T> = {
  [K in keyof T]: T[K] extends (state: infer S) => infer R ? K : never;
}[keyof T];

/** Resolved state: plain values + computed results (functions replaced by return types) */
type ResolvedState<T> = {
  [K in PlainKeys<T>]: T[K];
} & {
  [K in ComputedKeys<T>]: T[K] extends (state: any) => infer R ? R : never;
};

/** set / reset only plain keys */
type SetAPI<T> = {
  (patch: Partial<Pick<T, PlainKeys<T>>>): void;
} & {
  [K in PlainKeys<T>]: (value: T[K]) => void;
};

/** Store instance type — extend with reducers + public actions + on */
type StoreInstance<TState, TReducers, TPublicActions> = GetAPI<TState> &
  SetAPI<TState> &
  ResetAPI<TState> &
  SubscribeAPI<TState> & {
    on: OnAPI<TPublicActions, PublicActionEvents<TPublicActions>>;
  } & TReducers &
  TPublicActions;

/** React hook — dispatch + read + observe; no mutation */
type ReactStore<TState, TPublicActions> = GetAPI<TState> &
  SubscribeAPI<TState> & {
    on: OnAPI<TPublicActions, PublicActionEvents<TPublicActions>>;
  } & TPublicActions;
```

Ensure:

- Reducer/action names cannot collide with reserved keys (`get`, `set`, `reset`, `subscribe`, `on`).
- Public vs private action names are disjoint (enforce at type level if possible).

---

## 11. Error Handling & Edge Cases

| Case                                 | Expected behavior                                                        |
| ------------------------------------ | ------------------------------------------------------------------------ |
| Action throws before returning patch | Propagate error; do not partial-apply                                    |
| Action returns `{}`                  | No-op                                                                    |
| Concurrent `INIT_LOAD` while `busy`  | Second call no-ops (guard in action — see example)                       |
| `reset()`                            | Plain keys only; computeds follow automatically                          |
| Store used outside React             | Fully supported via vanilla API                                          |
| SSR                                  | No `window`; `get()` / `subscribe` work; hooks only in client components |
| Hydration                            | Document: initialize store before render or accept client-only state     |
| Listener throws inside `on`          | Isolate per listener; do not block other listeners or action completion  |
| `delegate.X()` from public action    | No separate event for `X` — only the outer public dispatch emits         |
| Unsubscribe during emit              | Safe — copy listener set before iteration                                |

---

## 12. Testing Checklist

Implement tests in `packages/react-kit/src/__tests__/eda-store.test.ts`:

- [ ] Initial snapshot matches initializer (plain + computed)
- [ ] `set({ … })` and `set.key(v)` update atoms
- [ ] `reset()` / `reset.key()` restore initializer values
- [ ] Reducer return patch merges correctly
- [ ] Async action resolves and applies patch
- [ ] `delegate.X()` calls private action
- [ ] `subscribe` / `subscribe.key` fire on correct changes only
- [ ] `toReact().use.key()` re-renders component (RTL `renderHook`)
- [ ] React hook does not expose `set`, `reset`, private actions
- [ ] Computed updates when dependency changes
- [ ] Type tests: `set.computedKey` is a type error
- [ ] `on.INIT_LOAD` fires with typed `args` after action settles
- [ ] `on()` receives discriminated union for all public actions
- [ ] Private / delegate-only calls do not emit action events
- [ ] Reducers and `set` / `reset` do not emit action events
- [ ] `toReact().on` is passthrough of vanilla `store.on`
- [ ] Unsubscribe stops further events

---

## 13. Non-Goals (v1)

- Persistence / middleware pipeline
- DevTools integration
- `map` store backend (atoms only)
- Time-travel / undo
- Replacing RxJS `eda()` event bus — modules may use **both** (events for orchestration, store for state)

---

## 14. Migration / Coexistence

Existing modules (e.g. `chat-2`) use multiple `atom()` from `supa-store`. New modules may adopt `eda-store` when they need colocated reducers + actions. No forced migration in v1.

**Suggested module layout with EDA Store:**

```
my-module/
├── contracts/
│   └── models.ts
├── core/
│   ├── store.ts         # store(initializer, reducers, actions)
│   └── …                # optional: thin wrappers calling store actions
├── integration/
│   └── repository.ts    # fetch/API — called from private actions
└── presentation/
    ├── context.tsx      # optional: createContext(useStore)
    └── main.tsx         # useStore.use.* / useStore.PUBLIC_ACTION()
```

Optional: combine with RxJS EDA by emitting facts from action completion inside private actions — keep event definitions separate.

---

## 15. Summary API Table

| Surface       | `get` | `set` | `reset` | `subscribe` | `on`                     | Reducers | Public actions | Private actions | `use.*` hook |
| ------------- | ----- | ----- | ------- | ----------- | ------------------------ | -------- | -------------- | --------------- | ------------ |
| Vanilla store | ✅    | ✅    | ✅      | ✅ state    | ✅ actions               | ✅       | ✅ dispatch    | ❌              | ❌           |
| `toReact()`   | ✅    | ❌    | ❌      | ✅ state    | ✅ actions (passthrough) | ❌       | ✅ dispatch    | ❌              | ✅           |

---

_End of specification._
