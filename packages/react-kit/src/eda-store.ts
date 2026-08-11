/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * EDA Store — single-store state module with fine-grained atoms, sync actions,
 * and async events with dispatch notifications. React bindings (`use.*` hooks)
 * are embedded directly on the same instance — no separate facade.
 *
 * SSR: `store(...)` itself touches no browser globals — `get`/`set`/`reset`/
 * `subscribe`/actions/events all work in any JS environment, including
 * during server rendering. Only `use.*` requires a React render tree (client
 * components). Create the store once per request on the server (module-level
 * singletons leak state across requests) and either seed it via `set(...)`
 * before rendering, or accept that hook-driven state starts client-only.
 */

import {
  atom as nanoAtom,
  computed as nanoComputed,
  type WritableAtom,
  type ReadableAtom,
} from 'nanostores';
import { useStore } from '@nanostores/react';

// ── State ──────────────────────────────────────────────────────────

/** A field on the initializer return value, computed from the rest of the state. */
type ComputedField<TState, TResult> = (state: TState) => TResult;

/** Produces the initial state shape once, at store creation. Must be pure. */
type StateInitializer<TState extends Record<string, unknown>> = () => TState;

/** Keys whose values are plain data (backed by a writable atom). */
type PlainKeys<TState> = {
  [K in keyof TState]: TState[K] extends (...args: any[]) => any ? never : K;
}[keyof TState];

/** Keys whose values are computed fields (backed by a read-only derived atom). */
type ComputedKeys<TState> = {
  [K in keyof TState]: TState[K] extends ComputedField<any, any> ? K : never;
}[keyof TState];

/** Plain values as-is, computed fields replaced by their return type. */
type ResolvedState<TState> = {
  [K in PlainKeys<TState>]: TState[K];
} & {
  [K in ComputedKeys<TState>]: TState[K] extends ComputedField<any, infer R>
    ? R
    : never;
};

// ── Get / Set / Reset / Subscribe ─────────────────────────────────

/** Read the full resolved snapshot, or a single key (plain or computed). */
type GetAPI<TState extends Record<string, unknown>> = {
  (): Readonly<ResolvedState<TState>>;
} & {
  [K in keyof ResolvedState<TState>]: () => ResolvedState<TState>[K];
};

/** Merge a patch of plain keys, or set a single plain key. Computed keys are excluded. */
type SetAPI<TState extends Record<string, unknown>> = {
  (patch: Partial<Pick<TState, PlainKeys<TState>>>): void;
} & {
  [K in PlainKeys<TState>]: (value: TState[K]) => void;
};

/** Reset all plain keys (or a single one) back to their initializer values. */
type ResetAPI<TState extends Record<string, unknown>> = {
  (): void;
} & {
  [K in PlainKeys<TState>]: () => void;
};

/** Subscribe to the full snapshot, or a single key, on change. Returns an unsubscribe fn. */
type SubscribeAPI<TState extends Record<string, unknown>> = {
  (listener: (snapshot: Readonly<ResolvedState<TState>>) => void): () => void;
} & {
  [K in keyof ResolvedState<TState>]: (
    listener: (value: ResolvedState<TState>[K]) => void,
  ) => () => void;
};

/** React hook per key — subscribes and re-renders on change. */
type UseAPI<TState extends Record<string, unknown>> = {
  [K in keyof ResolvedState<TState>]: () => ResolvedState<TState>[K];
};

type BaseContext<TState extends Record<string, unknown>> = {
  /** Read current state snapshot (plain + computed values). */
  get: GetAPI<TState>;
  /** Imperative setters — prefer returning patches from handlers when possible. */
  set: SetAPI<TState>;
};

// ── Reserved keys ───────────────────────────────────────────────────

/** Instance surface names that action/event names may not collide with. */
type ReservedKey = 'get' | 'set' | 'reset' | 'subscribe' | 'on' | 'use';

const RESERVED_KEYS: readonly ReservedKey[] = [
  'get',
  'set',
  'reset',
  'subscribe',
  'on',
  'use',
];

// ── Actions (sync) ─────────────────────────────────────────────────

/** Sync state mutation. Returns a patch (plain keys only) or void. */
type ActionFn<
  TState extends Record<string, unknown>,
  TArgs extends unknown[] = any[],
  TReturn = Partial<TState> | void,
> = (...args: TArgs) => TReturn;

/** Call another action on the same store by name — applies its patch immediately. */
type ActionCaller<
  TActions extends Record<string, ActionFn<any, any[], unknown>>,
> = {
  [K in keyof TActions]: TActions[K];
};

type ActionContext<TState extends Record<string, unknown>> =
  BaseContext<TState>;

// ── Events (sync or async, with a public/private switch) ──────────

/** Per-event configuration. Omitted, or `public` omitted, both mean `public: true`. */
type EventConfig = { public?: boolean };

/**
 * An event entry: a handler (ctx first, then dispatch args), optionally
 * paired with a config object. `[handler]` and `[handler, { public: true }]`
 * both mean the event is public. `ctx` is loosely typed here (`any`) — the
 * precise `EventContext` typing happens at each `.event()` call site in the
 * builder chain, not on this storage shape.
 */
type EventEntry<
  TState extends Record<string, unknown>,
  TArgs extends unknown[] = any[],
> =
  | readonly [
      handler: (
        ctx: any,
        ...args: TArgs
      ) => Partial<TState> | void | Promise<Partial<TState> | void>,
    ]
  | readonly [
      handler: (
        ctx: any,
        ...args: TArgs
      ) => Partial<TState> | void | Promise<Partial<TState> | void>,
      config: EventConfig,
    ];

/** The externally-callable signature of an event entry's handler — `ctx` stripped, dispatch args only. */
type EventHandler<TEntry> = TEntry extends readonly [infer H, ...unknown[]]
  ? H extends (ctx: any, ...args: infer TArgs) => infer TReturn
    ? (...args: TArgs) => TReturn
    : never
  : never;

/** `false` only when the entry's config explicitly sets `public: false`. */
type IsPublicEvent<TEntry> = TEntry extends readonly [
  unknown,
  { public: false },
]
  ? false
  : true;

/** Names of the events that are public — mounted on the instance, observable via `on`. */
type PublicEventKeys<TEvents> = {
  [K in keyof TEvents]: IsPublicEvent<TEvents[K]> extends true ? K : never;
}[keyof TEvents];

/** Public events only, reduced to their handler function type. */
type PublicEvents<
  TState extends Record<string, unknown>,
  TEvents extends Record<string, EventEntry<TState, any[]>>,
> = {
  [K in PublicEventKeys<TEvents>]: EventHandler<TEvents[K]>;
};

/**
 * Call any already-registered event's handler by name (public or private) —
 * does not apply its patch or emit; only the outer dispatch does. Keyed by
 * `TEvents` as accumulated so far in the builder chain (see `EventBuilder`
 * below), never by the event currently being defined — so this is never
 * self-referential.
 */
type EventCaller<TEvents extends Record<string, EventEntry<any, any[]>>> = {
  [K in keyof TEvents]: EventHandler<TEvents[K]>;
};

type EventContext<
  TState extends Record<string, unknown>,
  TActions extends Record<string, ActionFn<TState, any[], unknown>>,
  TEvents extends Record<string, EventEntry<TState, any[]>>,
> = BaseContext<TState> & {
  /** Call a sync action by name — applies its patch immediately, same as calling it on the instance. */
  action: ActionCaller<TActions>;
  /** Call another, already-registered event's handler by name — does not apply its patch or emit a dispatch event. */
  event: EventCaller<TEvents>;
};

// ── Action events (dispatch notifications) ─────────────────────────

type ActionEventMeta = {
  /** Unique id per dispatch — use for tracing / deduping. */
  id: string;
  /** High-resolution timestamp (performance.now()). */
  time: number;
};

type ActionEvent<TName extends string, TArgs extends unknown[], TPatch> = {
  /** Public event name — discriminant for union narrowing. */
  type: TName;
  /** Arguments passed to the dispatch call. */
  args: TArgs;
  /** Patch returned by the event handler, if any (plain keys only). */
  patch?: TPatch;
  /** Set when the handler throws or its promise rejects. */
  error?: unknown;
  meta: ActionEventMeta;
};

type PublicEventBusEvents<
  TState extends Record<string, unknown>,
  TEvents extends Record<string, EventEntry<TState, any[]>>,
> = {
  [K in PublicEventKeys<TEvents>]: ActionEvent<
    K & string,
    Parameters<EventHandler<TEvents[K]>>,
    Partial<ResolvedState<TState>>
  >;
}[PublicEventKeys<TEvents>];

type OnAPI<
  TPublicEvents extends Record<string, (...args: any[]) => unknown>,
  TEvents extends { type: string },
> = {
  /** Subscribe to any public event dispatch. */
  (listener: (event: TEvents) => void): () => void;
} & {
  /** Subscribe to a specific public event. */
  [K in keyof TPublicEvents & string]: (
    listener: (event: Extract<TEvents, { type: K }>) => void,
  ) => () => void;
};

// ── Store instance ─────────────────────────────────────────────────

/**
 * Combined vanilla + React surface for a store: state access/mutation, sync
 * actions, dispatchable public events, dispatch notifications, and `use.*`
 * hooks — all on one object, no separate React facade.
 *
 * Presentation layers should dispatch public events only, and treat `use.*`
 * as the render-time read path — `set` / `reset` are an escape hatch for
 * tests, scripts, and SSR bootstrap.
 */
type StoreInstance<
  TState extends Record<string, unknown>,
  TActions extends Record<string, ActionFn<TState, any[], unknown>>,
  TEvents extends Record<string, EventEntry<TState, any[]>>,
> = TActions &
  PublicEvents<TState, TEvents> & {
    /** Read the full resolved snapshot, or a single key (plain or computed). */
    get: GetAPI<TState>;
    /** Merge a patch of plain keys, or set a single plain key. */
    set: SetAPI<TState>;
    /** Reset all plain keys (or a single one) back to their initializer values. */
    reset: ResetAPI<TState>;
    /** Subscribe to the full snapshot, or a single key, on change. */
    subscribe: SubscribeAPI<TState>;
    /** Public event dispatch notifications (fires once per top-level public dispatch). */
    on: OnAPI<
      PublicEvents<TState, TEvents>,
      PublicEventBusEvents<TState, TEvents>
    >;
    /** React hooks — one per plain/computed key, fine-grained subscription. */
    use: UseAPI<TState>;
  };

// ── Event builder chain ────────────────────────────────────────────

/** Names an event may not use — reserved instance keys, action names, and already-registered event names. */
type ForbiddenEventName<
  TActions extends Record<string, unknown>,
  TEvents extends Record<string, unknown>,
> = ReservedKey | (keyof TActions & string) | (keyof TEvents & string);

/**
 * Incrementally accumulates events via chained `.event()` calls, each typed
 * against only the events registered *before* it — this is what lets
 * `ctx.event` (see `EventContext`) be fully typed, with no `any`, without a
 * self-referential cycle. Trade-off: events can only call earlier-registered
 * events — no forward references, no mutual recursion between two events.
 */
type EventBuilder<
  TState extends Record<string, unknown>,
  TActions extends Record<string, ActionFn<TState, any[], unknown>>,
  TEvents extends Record<string, EventEntry<TState, any[]>>,
> = {
  /** Register an event, public by default (config omitted). */
  event<
    TName extends string,
    TArgs extends unknown[],
    THandler extends (
      ctx: EventContext<TState, TActions, TEvents>,
      ...args: TArgs
    ) => Partial<TState> | void | Promise<Partial<TState> | void>,
  >(
    name: TName extends ForbiddenEventName<TActions, TEvents> ? never : TName,
    handler: THandler,
  ): EventBuilder<
    TState,
    TActions,
    TEvents & Record<TName, readonly [THandler]>
  >;
  /** Register an event with an explicit `public` config. */
  event<
    TName extends string,
    TArgs extends unknown[],
    THandler extends (
      ctx: EventContext<TState, TActions, TEvents>,
      ...args: TArgs
    ) => Partial<TState> | void | Promise<Partial<TState> | void>,
    TPublic extends boolean,
  >(
    name: TName extends ForbiddenEventName<TActions, TEvents> ? never : TName,
    handler: THandler,
    config: { public: TPublic },
  ): EventBuilder<
    TState,
    TActions,
    TEvents & Record<TName, readonly [THandler, { public: TPublic }]>
  >;
  /** Finalize the chain, producing the store instance. */
  build(): StoreInstance<TState, TActions, TEvents>;
};

// ── store() ─────────────────────────────────────────────────────────

/** Build a `Record<key, fn(key)>` from a key list — the `Object.fromEntries(keys.map(...))` pattern, named. */
const mapEntries = <T>(
  keys: readonly string[],
  fn: (key: string) => T,
): Record<string, T> => Object.fromEntries(keys.map((key) => [key, fn(key)]));

/**
 * Creates a store: one module-level object holding all state atoms and sync
 * actions, plus a chainable `.event(...)` builder (sync or async, public by
 * default) finalized with `.build()` — the built instance carries embedded
 * React hooks too.
 */
export function store<
  TState extends Record<string, unknown>,
  TActions extends Record<
    string,
    ActionFn<TState, any[], Partial<TState> | void>
  > & {
    [K in ReservedKey]?: never;
  },
>(
  initializer: StateInitializer<TState>,
  action: (ctx: ActionContext<TState>) => TActions,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): EventBuilder<TState, TActions, {}> {
  const initial = initializer();
  const initialValues = initial as Record<string, unknown>;

  const plainKeys = Object.keys(initial).filter(
    (key) => typeof initialValues[key] !== 'function',
  );
  const computedKeys = Object.keys(initial).filter(
    (key) => typeof initialValues[key] === 'function',
  );
  const allKeys = [...plainKeys, ...computedKeys];

  const plainAtoms: Record<string, WritableAtom<unknown>> = mapEntries(
    plainKeys,
    (key) => nanoAtom(initialValues[key]),
  );
  const plainAtomList = plainKeys.map((key) => plainAtoms[key]!);

  const getSnapshot = () =>
    mapEntries(plainKeys, (key) => plainAtoms[key]!.get());

  const computedAtoms: Record<string, ReadableAtom<unknown>> = mapEntries(
    computedKeys,
    (key) => {
      const resolve = initialValues[key] as (state: TState) => unknown;
      return nanoComputed(
        plainAtomList as [WritableAtom<unknown>, ...WritableAtom<unknown>[]],
        () => resolve(getSnapshot() as TState),
      );
    },
  );

  /** Every atom, plain or computed, keyed the same way — read/subscribe treat both alike. */
  const atomsByKey: Record<string, ReadableAtom<unknown>> = {
    ...plainAtoms,
    ...computedAtoms,
  };

  const get = Object.assign(
    () => mapEntries(allKeys, (key) => atomsByKey[key]!.get()),
    mapEntries(allKeys, (key) => () => atomsByKey[key]!.get()),
  );

  const set = Object.assign(
    (patch: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(patch)) {
        plainAtoms[key]?.set(value);
      }
    },
    mapEntries(
      plainKeys,
      (key) => (value: unknown) => plainAtoms[key]!.set(value),
    ),
  );

  const reset = Object.assign(
    () => {
      for (const key of plainKeys) {
        plainAtoms[key]!.set(initialValues[key]);
      }
    },
    mapEntries(
      plainKeys,
      (key) => () => plainAtoms[key]!.set(initialValues[key]),
    ),
  );

  const subscribe = Object.assign(
    (listener: (snapshot: Record<string, unknown>) => void) => {
      const unsubs = allKeys.map((key) =>
        atomsByKey[key]!.listen(() => listener(get())),
      );
      return () => {
        for (const unsub of unsubs) unsub();
      };
    },
    mapEntries(
      allKeys,
      (key) => (listener: (value: unknown) => void) =>
        atomsByKey[key]!.listen(listener),
    ),
  );

  const use = mapEntries(allKeys, (key) => () => useStore(atomsByKey[key]!));

  // ── Actions ────────────────────────────────────────────────────

  const actionContext = { get, set } as unknown as ActionContext<TState>;
  const rawActions = action(actionContext) as Record<
    string,
    (...args: unknown[]) => Partial<TState> | void
  >;

  for (const name of Object.keys(rawActions)) {
    if ((RESERVED_KEYS as readonly string[]).includes(name)) {
      throw new Error(
        `eda-store: action "${name}" collides with a reserved store key`,
      );
    }
  }

  const callAction = (name: string, args: unknown[]) => {
    const patch = rawActions[name]?.(...args);
    if (patch) set(patch as Record<string, unknown>);
    return patch;
  };

  const mountedActions = Object.fromEntries(
    Object.keys(rawActions).map((name) => [
      name,
      (...args: unknown[]) => {
        callAction(name, args);
      },
    ]),
  );

  const actionCaller = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop !== 'string') return undefined;
        return (...args: unknown[]) => callAction(prop, args);
      },
    },
  ) as ActionCaller<TActions>;

  // ── Action events (dispatch notifications) ──────────────────────

  type Listener = (event: ActionEvent<string, unknown[], unknown>) => void;

  const listenersByAction = new Map<string, Set<Listener>>();
  const globalListeners = new Set<Listener>();

  const emitActionEvent = (event: ActionEvent<string, unknown[], unknown>) => {
    for (const listener of [...(listenersByAction.get(event.type) ?? [])]) {
      try {
        listener(event);
      } catch (error) {
        console.error(error);
      }
    }
    for (const listener of [...globalListeners]) {
      try {
        listener(event);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const subscribeGlobal = (listener: Listener) => {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  };

  const on = new Proxy(subscribeGlobal, {
    get: (target, prop, receiver) => {
      if (typeof prop !== 'string' || prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return (listener: Listener) => {
        let bucket = listenersByAction.get(prop);
        if (!bucket) {
          bucket = new Set();
          listenersByAction.set(prop, bucket);
        }
        bucket.add(listener);
        return () => bucket!.delete(listener);
      };
    },
  });

  // ── Events (accumulated via the builder chain) ──────────────────

  const rawEvents: Record<string, EventEntry<TState, unknown[]>> = {};

  const eventCaller = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop !== 'string') return undefined;
        return (...args: unknown[]) =>
          rawEvents[prop]?.[0](eventContext, ...args);
      },
    },
  ) as EventCaller<Record<string, EventEntry<TState, unknown[]>>>;

  const eventContext = {
    get,
    set,
    action: actionCaller,
    event: eventCaller,
  } as unknown as EventContext<
    TState,
    TActions,
    Record<string, EventEntry<TState, any[]>>
  >;

  const build = () => {
    const publicEventNames = Object.keys(rawEvents).filter(
      (name) => rawEvents[name]![1]?.public !== false,
    );

    const mountedEvents = Object.fromEntries(
      publicEventNames.map((name) => [
        name,
        async (...args: unknown[]) => {
          const meta = { id: crypto.randomUUID(), time: performance.now() };
          try {
            const patch = await rawEvents[name]![0](eventContext, ...args);
            if (patch) set(patch as Record<string, unknown>);
            emitActionEvent({ type: name, args, patch, meta });
            return patch;
          } catch (error) {
            emitActionEvent({ type: name, args, error, meta });
            throw error;
          }
        },
      ]),
    );

    return {
      get,
      set,
      reset,
      subscribe,
      on,
      use,
      ...mountedActions,
      ...mountedEvents,
    } as unknown as StoreInstance<
      TState,
      TActions,
      Record<string, EventEntry<TState, any[]>>
    >;
  };

  const builder = {
    event: (
      name: string,
      handler: (...args: unknown[]) => unknown,
      config?: EventConfig,
    ) => {
      if ((RESERVED_KEYS as readonly string[]).includes(name)) {
        throw new Error(
          `eda-store: event "${name}" collides with a reserved store key`,
        );
      }
      if (name in rawActions) {
        throw new Error(
          `eda-store: event "${name}" collides with an action of the same name`,
        );
      }
      if (name in rawEvents) {
        throw new Error(`eda-store: event "${name}" is already registered`);
      }
      rawEvents[name] = (config ? [handler, config] : [handler]) as EventEntry<
        TState,
        unknown[]
      >;
      return builder;
    },
    build,
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  return builder as unknown as EventBuilder<TState, TActions, {}>;
}
