# Module Guide: Store, Mediator & Event-Driven State

This guide explains how to build a feature module using the project's state
primitives: **`supa-store`** (reactive atoms), **`eda`** (event-driven
architecture over RxJS), and **`power-context`** (scoped React context). It is
meant to be passed as a reference when starting a new module so the wiring does
not have to be re-explained each time.

---

## Mental model

Data flows in one direction:

```
 UI (presentation)                core (mediator)                integration
 ─────────────────                ───────────────                ───────────
 trigger('[TRIGGER]_X')  ──────►  registry handler  ──────►      repository
                                  (RxJS stream)      async call  (API / mock)
                                        │
                                        ▼
                                  store.$atom.set(...)
                                        │
        re-render  ◄── $atom.use() ◄────┘
```

- **The UI never mutates state directly.** It calls `trigger(...)` to announce
  an intent, and reads state via `$atom.use()`.
- **Handlers** (the registry) listen for events, perform async work through the
  repository, and write results into the store.
- **The store** holds reactive atoms. Any component reading an atom with
  `.use()` re-renders when it changes.
- **The mediator** binds one store instance to one registry instance and is
  scoped to a React subtree via `power-context`. State is therefore **per
  Provider**, not a global singleton — mounting the module twice gives two
  independent states.

---

## Folder & file structure

Create the module under `src/modules/<module-name>/` with four layers:

```
src/modules/<module-name>/
├── contracts/
│   ├── models.ts          # Domain types (ids, entities, enums)
│   └── events.ts          # The event union (TRIGGER / TASK / FACT / EFFECT)
├── core/
│   ├── store.ts           # createStore(): atoms, maps, computed values
│   ├── registry.ts        # createRegistry(store): wires handlers to events
│   ├── mediator.ts        # createMediator(): store + trigger + registry
│   └── handlers/
│       ├── <handler-a>.ts # One file per event handler
│       └── <handler-b>.ts
├── integration/
│   └── repository.ts      # API calls / data access (returns Promises)
└── presentation/
    ├── context.tsx        # createHookContext → [Provider, useContext]
    ├── main.tsx           # Provider + bootstrap trigger (module entry point)
    └── <feature>.tsx      # UI components that read store + call trigger
```

| Layer           | Responsibility                                                    | May import from                          |
| --------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| `contracts/`    | Pure types. No logic.                                             | nothing (only `@/libs/eda` types)        |
| `core/`         | State + business logic. Framework-agnostic except the store hook. | `contracts/`, `integration/`, `@/libs/*` |
| `integration/`  | Talking to the outside world (HTTP, Supabase, mocks).             | `contracts/`                             |
| `presentation/` | React components. Reads state, fires triggers.                    | `core/`, `contracts/`, `@/libs/ui`       |

> Import the shared primitives via the `@/` alias, e.g.
> `import { atom, computed } from '@/libs/supa-store';`.

---

## Step 1 — Define the contracts

### `contracts/models.ts`

Domain types only. No behaviour.

```ts
export type EventId = string;

export type EventStatus = 'draft' | 'published' | 'archived';

export type EventItem = {
  id: EventId;
  title: string;
  status: EventStatus;
};
```

### `contracts/events.ts`

The event union is the contract between the UI and the core. Each event is one
of four kinds, distinguished by a `[PREFIX]_` naming convention:

| Prefix       | Meaning                                      | Emitted by                 |
| ------------ | -------------------------------------------- | -------------------------- |
| `[TRIGGER]_` | A user action / external input (entry point) | the UI, via `trigger(...)` |
| `[TASK]_`    | An async operation about to run              | a handler, via `forwardAs` |
| `[FACT]_`    | Something that happened (state change)       | a handler, via `forwardAs` |
| `[EFFECT]_`  | Cross-cutting concern (logging, analytics)   | a handler, via `emit`      |

```ts
import { type TriggerEvent } from '@/libs/eda';

export type Event =
  | TriggerEvent<'[TRIGGER]_BOOTSTRAP'>
  | TriggerEvent<'[TRIGGER]_SELECT_EVENT', { eventId: string }>
  | TriggerEvent<'[TRIGGER]_UPDATE_SEARCH', { query: string }>
  | TriggerEvent<'[TRIGGER]_SAVE_EVENT'>;
```

For simple modules you may only need `TriggerEvent`s (the UI triggers, the
handler does the work and writes the store directly). `TaskEvent` / `FactEvent`
become useful once a flow has multiple async stages worth tracing. See the
"Event flow depth" note at the end.

---

## Step 2 — Build the store

### `core/store.ts`

`createStore()` returns an object of reactive atoms and computed values. It is a
**factory** (not module-level singletons) so each Provider gets its own state.

```ts
import { atom, computed } from '@/libs/supa-store';
import type { EventId, EventItem } from '../contracts/models';

export const createStore = () => {
  const $isBootstrapping = atom(false);
  const $bootstrapError = atom<string | null>(null);
  const $events = atom<EventItem[]>([]);
  const $selectedId = atom<EventId>('');
  const $searchQuery = atom('');

  return {
    $isBootstrapping,
    $bootstrapError,
    $events,
    $selectedId,
    $searchQuery,
    // Derived state — recomputes automatically when dependencies change.
    $selectedEvent: computed(
      [$events, $selectedId],
      (events, selectedId) => events.find((e) => e.id === selectedId) ?? null,
    ),
    $filteredEvents: computed([$events, $searchQuery], (events, query) => {
      const q = query.trim().toLowerCase();
      if (!q) return events;
      return events.filter((e) => e.title.toLowerCase().includes(q));
    }),
  };
};

export type Store = ReturnType<typeof createStore>;
```

Primitive choice (from `supa-store`):

| Use                                                    | Primitive                      |
| ------------------------------------------------------ | ------------------------------ |
| flags, strings, numbers, nullable values, whole arrays | `atom`                         |
| dictionaries needing efficient single-key updates      | `map` (`setKey` / `removeKey`) |
| values derived from other stores                       | `computed`                     |

Each atom exposes `.get()`, `.set(v)`, `.reset()`, `.getInitial()`, and the
React hook `.use()`. **Always export `type Store`** — the registry and handlers
depend on it.

---

## Step 3 — Write the handlers

Each handler lives in its own file under `core/handlers/`. A handler is a
function that takes `(store, ofType)` and returns an **RxJS stream** that
listens for one event type and reacts to it.

### `core/handlers/bootstrap.ts` (async example)

```ts
import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { getEvents } from '../../integration/repository';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const bootstrap = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_BOOTSTRAP').pipe(
    tap(() => {
      store.$isBootstrapping.set(true);
      store.$bootstrapError.reset();
    }),
    switchMap(() => {
      const ctrl = new AbortController();

      return from(getEvents(ctrl.signal)).pipe(
        tap((events) => store.$events.set(events)),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$bootstrapError.set(
            error instanceof Error ? error.message : 'Failed to load.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isBootstrapping.reset();
          ctrl.abort();
        }),
      );
    }),
  );
```

### `core/handlers/update-search.ts` (synchronous example)

```ts
import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const updateSearch = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_UPDATE_SEARCH').pipe(
    tap(({ query }) => store.$searchQuery.set(query)),
  );
```

Handler conventions:

- `ofType('[TRIGGER]_X')` emits the event **payload** (already unwrapped), so
  destructure it directly: `.pipe(tap(({ query }) => ...))`.
- Pick the RxJS flattening operator deliberately:
  - `switchMap` — cancel the previous run when a new event arrives (search,
    navigation, bootstrap/refresh).
  - `exhaustMap` — ignore new events while one is in flight (submit/send, to
    prevent double-submits).
  - `mergeMap` / `concatMap` — run concurrently / in sequence.
- For cancellable async work, create an `AbortController`, pass `ctrl.signal`
  to the repository, and `ctrl.abort()` inside `finalize`. Swallow `AbortError`
  in `catchError`.
- Keep each handler focused on one event. Reset loading flags in `finalize` so
  they clear on success, error, and cancellation alike.

---

## Step 4 — Assemble the registry

### `core/registry.ts`

`createRegistry(store)` creates an `eda` instance bound to your `Event` union,
wires every handler, and returns `{ trigger, registry }`.

```ts
import { eda } from '@/libs/eda';
import { type Store } from './store';
import { type Event } from '../contracts/events';
import { bootstrap } from './handlers/bootstrap';
import { selectEvent } from './handlers/select-event';
import { updateSearch } from './handlers/update-search';
import { saveEvent } from './handlers/save-event';

// Shared handler signature — every handler receives this `ofType`.
export type OfType = ReturnType<typeof eda<Event>>['ofType'];

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    bootstrap(store, ofType),
    selectEvent(store, ofType),
    updateSearch(store, ofType),
    saveEvent(store, ofType),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
```

- `trigger` is the type-safe emitter the UI uses to start a flow.
- `registry` is a function that, when called, subscribes all handler streams
  and returns an **unsubscribe** function. It is invoked once by the Provider
  (Step 6) and torn down on unmount. Each stream has its own error boundary, so
  one failing handler will not stop the others.
- When you add a handler, register it in **both** places: create the file in
  `handlers/` and add a line to `createRegistry(...)`.

---

## Step 5 — Create the mediator

### `core/mediator.ts`

The mediator is the single object that bundles a fresh store, its trigger, and
its registry. It is what the Provider instantiates.

```ts
import { createRegistry } from './registry';
import { createStore } from './store';

export const createMediator = () => {
  const store = createStore();
  const { trigger, registry } = createRegistry(store);

  return [store, trigger, registry] as const;
};
```

That's the entire core. Calling `createMediator()` produces an isolated
`[store, trigger, registry]` triple.

---

## Step 6 — Wire it into React with `power-context`

### `presentation/context.tsx`

`createHookContext` builds a typed `[Provider, useContext]` pair. The hook runs
`createMediator()` once, spreads the store atoms alongside `trigger` into the
context value, and activates the registry on mount (tearing it down on unmount).

```tsx
import { useLayoutEffect, useState } from 'react';
import { createHookContext } from '@/libs/power-context';
import { createMediator } from '../core/mediator';

export const [Provider, useContext] = createHookContext(
  'EventManagement',
  () => {
    // useState(initialiser)[0] runs createMediator exactly once per Provider.
    const [store, trigger, registry] = useState(createMediator)[0];
    const value = useState(() => ({ ...store, trigger }))[0];

    useLayoutEffect(() => {
      const unsub = registry(); // subscribe all handler streams
      return () => unsub(); // clean up on unmount
    }, [registry]);

    return value;
  },
);
```

Notes:

- The first argument to `createHookContext` is a **PascalCase display name**. It
  must not contain spaces and must not end in `Provider` or `Context` (the type
  enforces this at compile time). It is used for the error message and React
  DevTools labels.
- `value` exposes every store atom plus `trigger`. Components consume them as
  `ctx.$someAtom.use()` and `ctx.trigger(...)`.

### `presentation/main.tsx` — module entry point

Wrap your UI in the `Provider`, and fire the bootstrap trigger once mounted.

```tsx
import { useEffect } from 'react';
import { Provider, useContext } from './context';
import { EventManager } from './event-manager';

const Content = () => {
  const { trigger } = useContext();

  useEffect(() => {
    trigger('[TRIGGER]_BOOTSTRAP');
  }, [trigger]);

  return <EventManager />;
};

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
```

`Main` is the component you mount from a page / route (e.g. an Astro island).

---

## Consuming the module in the UI

Inside any component **below the Provider**, call `useContext()` to get the
store + `trigger`. Read state with `.use()` (reactive) and announce intents with
`trigger(...)`.

```tsx
import { useContext } from './context';

export const EventManager = () => {
  const ctx = useContext();

  // Reactive reads — component re-renders when these change.
  const isBootstrapping = ctx.$isBootstrapping.use();
  const error = ctx.$bootstrapError.use();
  const events = ctx.$filteredEvents.use();
  const selected = ctx.$selectedEvent.use();
  const searchQuery = ctx.$searchQuery.use();

  const { trigger } = ctx;

  if (error) {
    return (
      <button onClick={() => trigger('[TRIGGER]_BOOTSTRAP')}>Retry</button>
    );
  }

  return (
    <div aria-busy={isBootstrapping}>
      <input
        value={searchQuery}
        onChange={(e) =>
          trigger('[TRIGGER]_UPDATE_SEARCH', { query: e.target.value })
        }
      />

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <button
              onClick={() =>
                trigger('[TRIGGER]_SELECT_EVENT', { eventId: event.id })
              }
            >
              {event.title}
            </button>
          </li>
        ))}
      </ul>

      {selected && <p>Selected: {selected.title}</p>}
    </div>
  );
};
```

Consumption rules:

- **Read with `.use()`, never `.get()`** inside render — `.get()` does not
  subscribe, so the component won't re-render. (`.get()` is for handlers.)
- **Never mutate the store from a component.** Express the intent with
  `trigger(...)`; let a handler perform the change. This keeps the data flow
  one-directional and traceable.
- `trigger` is fully typed: the event name autocompletes and the payload is
  required/checked against `contracts/events.ts`.
- Prefer `computed` values (`$filteredEvents`, `$selectedEvent`) over deriving
  data in the component, so the logic is testable and shared.

---

## Quick checklist for a new module

1. `contracts/models.ts` — domain types.
2. `contracts/events.ts` — the `Event` union (`[TRIGGER]_…`).
3. `integration/repository.ts` — async data access returning Promises.
4. `core/store.ts` — `createStore()` + `export type Store`.
5. `core/handlers/*.ts` — one handler per event, signature `(store, ofType)`.
6. `core/registry.ts` — `createRegistry(store)` wiring every handler.
7. `core/mediator.ts` — `createMediator()` returning `[store, trigger, registry]`.
8. `presentation/context.tsx` — `createHookContext('ModuleName', …)`.
9. `presentation/main.tsx` — `Provider` + bootstrap trigger.
10. UI components — `useContext()`, read with `.use()`, act with `trigger(...)`.

---

## Event flow depth: how many event types do I need?

Keep it as simple as the feature allows.

- **Simple action** — `[TRIGGER]_X` → handler writes the store directly
  (like `update-search` above). This is the common case.
- **Async work** — `[TRIGGER]_X` → handler does `switchMap`/`exhaustMap` into
  the repository, then writes the store on success/failure (like `bootstrap`).
- **Multi-stage / cross-cutting** — introduce `[TASK]_` and `[FACT]_` events and
  chain them with `forwardAs`, so each stage is a separate, traceable handler.
  Use `[EFFECT]_` (via `emit`) for logging/analytics. See the `@/libs/eda`
  README for `forwardAs`, `createForwardErrorAs`, cancellation, and the full
  set of good/bad practices.

Avoid circular event chains and don't call `trigger(...)` from inside a handler
(use `forwardAs` / `emit` for non-trigger events instead).
