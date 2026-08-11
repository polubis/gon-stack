import { assertType, expectTypeOf } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { store } from '../eda-store.js';

type CounterState = {
  count: number;
  step: number;
  isPositive: (state: Omit<CounterState, 'isPositive'>) => boolean;
};

const initializer = (): CounterState => ({
  count: 0,
  step: 1,
  isPositive: (state) => state.count > 0,
});

const createStore = () =>
  store(initializer, ({ get, set }) => ({
    increment: () => ({ count: get().count + get().step }),
    setStepDirectly: (step: number) => {
      set.step(step);
    },
  }))
    .event('BUMP', ({ get }) => ({ count: get().count + 1 }), { public: false })
    .event('INCREMENT_ASYNC', ({ event }) => event.BUMP())
    .event('APPLY_VIA_ACTION', ({ action }) => {
      action.increment();
    })
    .event('NOOP', async () => {})
    .event('FAIL', async () => {
      throw new Error('boom');
    })
    .build();

let instance: ReturnType<typeof createStore>;

beforeEach(() => {
  instance = createStore();
});

describe('EDA store state', () => {
  it('works when created, starting out with the initial values', () => {
    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
  });

  it('works when reading one value, returning just that one', () => {
    expect(instance.get.count()).toBe(0);
    expect(instance.get.step()).toBe(1);
  });

  it('works when updating several values at once, leaving the rest untouched', () => {
    instance.set({ count: 5 });

    expect(instance.get()).toEqual({ count: 5, step: 1, isPositive: true });
  });

  it('works when updating a single value, leaving the rest untouched', () => {
    instance.set.step(3);

    expect(instance.get()).toEqual({ count: 0, step: 3, isPositive: false });
  });

  it('works when reset after changes, going back to the initial values', () => {
    instance.set({ count: 5, step: 3 });
    instance.reset();

    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
  });

  it('works when a single value is reset, leaving the rest untouched', () => {
    instance.set({ count: 5, step: 3 });
    instance.reset.count();

    expect(instance.get()).toEqual({ count: 0, step: 3, isPositive: false });
  });

  it('works when two stores are created from the same setup, keeping their values independent', () => {
    const first = createStore();
    const second = createStore();

    first.set({ count: 9 });

    expect(first.get.count()).toBe(9);
    expect(second.get.count()).toBe(0);
  });
});

describe('EDA store computed values', () => {
  it('stays in sync when the values it derives from change', () => {
    expect(instance.get.isPositive()).toBe(false);

    instance.set.count(5);

    expect(instance.get.isPositive()).toBe(true);
  });

  it('cannot be written when updating several values at once', () => {
    // @ts-expect-error computed keys are read-only — excluded from SetAPI's patch
    instance.set({ isPositive: true });

    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
  });

  it('cannot be written directly', () => {
    // @ts-expect-error computed keys have no per-key setter on SetAPI
    const setIsPositive = instance.set.isPositive;

    expect(setIsPositive).toBeUndefined();
  });

  it('cannot be reset', () => {
    // @ts-expect-error computed keys have no per-key resetter on ResetAPI
    const resetIsPositive = instance.reset.isPositive;

    expect(resetIsPositive).toBeUndefined();
  });
});

describe('EDA store state safety', () => {
  it('rejects a value of the wrong type when updating a single value', () => {
    // @ts-expect-error count is a number, not a string
    instance.set.count('nope');

    expect(instance.get.count() as unknown).toBe('nope');
  });

  it('rejects a value of the wrong type when updating several values at once', () => {
    // @ts-expect-error step is a number, not a string
    instance.set({ step: 'nope' });

    expect(instance.get.step() as unknown).toBe('nope');
  });

  it('rejects a value that is not part of the state when updating several values at once', () => {
    // @ts-expect-error unknownKey is not part of CounterState
    instance.set({ unknownKey: 1 });

    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
  });

  it('rejects reading a value that is not part of the state', () => {
    // @ts-expect-error unknownKey is not part of CounterState
    expect(instance.get.unknownKey).toBeUndefined();
  });
});

describe('EDA store returned value types', () => {
  it('returns a plain value as the same primitive type it was declared with', () => {
    expect(instance.get.count()).toBeTypeOf('number');
    expect(instance.get.step()).toBeTypeOf('number');
  });

  it('returns a computed value as the primitive type its resolver produces', () => {
    expect(instance.get.isPositive()).toBeTypeOf('boolean');
  });

  it('returns a full snapshot as a plain object combining plain and computed values', () => {
    const snapshot = instance.get();

    expect(snapshot).toBeTypeOf('object');
    expect(snapshot.count).toBeTypeOf('number');
    expect(snapshot.step).toBeTypeOf('number');
    expect(snapshot.isPositive).toBeTypeOf('boolean');
  });

  it('exposes get, set, and reset as callable functions', () => {
    expect(instance.get).toBeTypeOf('function');
    expect(instance.set).toBeTypeOf('function');
    expect(instance.reset).toBeTypeOf('function');
  });

  it('exposes a per-key function for every plain value on get, set, and reset', () => {
    expect(instance.get.count).toBeTypeOf('function');
    expect(instance.set.count).toBeTypeOf('function');
    expect(instance.reset.count).toBeTypeOf('function');
  });

  it('exposes a per-key getter for a computed value, without a setter or resetter', () => {
    expect(instance.get.isPositive).toBeTypeOf('function');
  });

  it('returns nothing from set and reset, since they mutate in place', () => {
    expect(instance.set({ count: 1 })).toBeTypeOf('undefined');
    expect(instance.set.count(2)).toBeTypeOf('undefined');
    expect(instance.reset()).toBeTypeOf('undefined');
    expect(instance.reset.count()).toBeTypeOf('undefined');
  });
});

describe('EDA store inferred types', () => {
  it('infers get, set, and reset as functions', () => {
    expectTypeOf(instance.get).toBeFunction();
    expectTypeOf(instance.set).toBeFunction();
    expectTypeOf(instance.reset).toBeFunction();
  });

  it('infers each per-key getter as returning its declared type', () => {
    expectTypeOf(instance.get.count).returns.toBeNumber();
    expectTypeOf(instance.get.step).returns.toBeNumber();
    expectTypeOf(instance.get.isPositive).returns.toBeBoolean();
  });

  it('infers each per-key setter as accepting only its declared value type', () => {
    expectTypeOf(instance.set.count).parameter(0).toBeNumber();
    expectTypeOf(instance.set.step).parameter(0).toBeNumber();
  });

  it('infers the batch patch as covering only plain keys, excluding computed ones', () => {
    expectTypeOf(instance.set).parameter(0).toExtend<{
      count?: number;
      step?: number;
    }>();
    expectTypeOf(instance.set).parameter(0).not.toHaveProperty('isPositive');
  });

  it('rejects a value of the wrong type at the call site', () => {
    // @ts-expect-error count is a number, not a string
    assertType(instance.set.count('nope'));
  });
});

describe('EDA store actions', () => {
  it('works when an action returns a patch, merging it into state', () => {
    instance.increment();

    expect(instance.get.count()).toBe(1);
  });

  it('works when an action calls set() directly instead of returning a patch', () => {
    instance.setStepDirectly(5);

    expect(instance.get.step()).toBe(5);
  });

  it('works when an action runs repeatedly, building on the latest state each time', () => {
    instance.increment();
    instance.increment();
    instance.increment();

    expect(instance.get.count()).toBe(3);
  });

  it('returns nothing from an action call, since it mutates in place', () => {
    expect(instance.increment()).toBeTypeOf('undefined');
  });

  it('exposes each action as a callable function with its declared parameter types', () => {
    expectTypeOf(instance.increment).toBeFunction();
    expectTypeOf(instance.setStepDirectly).parameter(0).toBeNumber();
  });

  it('applies immediately when an event calls an action by name', async () => {
    await instance.APPLY_VIA_ACTION();

    expect(instance.get.count()).toBe(1);
  });
});

describe('EDA store public events', () => {
  it('works when a public event resolves with a patch, merging it into state', async () => {
    await instance.INCREMENT_ASYNC();

    expect(instance.get.count()).toBe(1);
  });

  it('works when a public event calls another event internally, still resolving with its patch', async () => {
    const patch = await instance.INCREMENT_ASYNC();

    expect(patch).toEqual({ count: 1 });
  });

  it('works when a public event rejects, propagating the error to the caller', async () => {
    await expect(instance.FAIL()).rejects.toThrow('boom');
  });

  it('exposes each public event as a callable, awaitable function', () => {
    expectTypeOf(instance.INCREMENT_ASYNC).toBeFunction();
    expect(instance.NOOP()).toBeInstanceOf(Promise);
  });

  it('is public by default when no config is given', () => {
    expect(instance.NOOP).toBeTypeOf('function');
  });
});

describe('EDA store private events', () => {
  it('is not mounted on the instance when marked private', () => {
    // @ts-expect-error BUMP is private — excluded from the public event surface
    expect(instance.BUMP).toBeUndefined();
  });

  it('is still reachable from another event through the event caller', async () => {
    await instance.INCREMENT_ASYNC();

    expect(instance.get.count()).toBe(1);
  });
});

describe('EDA store event notifications', () => {
  it('works when a public event settles, notifying a listener scoped to that event', async () => {
    const events: unknown[] = [];
    const unsubscribe = instance.on.INCREMENT_ASYNC((event) =>
      events.push(event),
    );

    await instance.INCREMENT_ASYNC();

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'INCREMENT_ASYNC',
      args: [],
      patch: { count: 1 },
    });

    unsubscribe();
  });

  it('works when any public event settles, notifying a listener that observes all of them', async () => {
    const types: string[] = [];
    const unsubscribe = instance.on((event) => types.push(event.type));

    await instance.INCREMENT_ASYNC();
    await instance.NOOP();

    expect(types).toEqual(['INCREMENT_ASYNC', 'NOOP']);

    unsubscribe();
  });

  it('works when a public event rejects, notifying listeners with the error instead of a patch', async () => {
    const events: { patch?: unknown; error?: unknown }[] = [];
    instance.on.FAIL((event) => events.push(event));

    await expect(instance.FAIL()).rejects.toThrow('boom');

    expect(events).toHaveLength(1);
    expect(events[0]?.patch).toBeUndefined();
    expect((events[0]?.error as Error).message).toBe('boom');
  });

  it('works when a public event delegates to a private one internally, emitting only the outer dispatch', async () => {
    const events: unknown[] = [];
    const unsubscribe = instance.on((event) => events.push(event));

    await instance.INCREMENT_ASYNC();

    expect(events).toHaveLength(1);

    unsubscribe();
  });

  it('works when unsubscribed, no longer receiving events from later dispatches', async () => {
    const events: unknown[] = [];
    const unsubscribe = instance.on.NOOP((event) => events.push(event));

    await instance.NOOP();
    unsubscribe();
    await instance.NOOP();

    expect(events).toHaveLength(1);
  });

  it('works when a listener throws, still notifying the remaining listeners and letting the event settle', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const calls: string[] = [];
    instance.on.NOOP(() => {
      throw new Error('listener boom');
    });
    instance.on.NOOP(() => calls.push('second listener'));

    await expect(instance.NOOP()).resolves.toBeUndefined();

    expect(calls).toEqual(['second listener']);
    consoleError.mockRestore();
  });

  it('does not fire for actions or for direct state changes', async () => {
    const events: unknown[] = [];
    const unsubscribe = instance.on((event) => events.push(event));

    instance.increment();
    instance.set({ count: 9 });
    instance.reset();

    expect(events).toHaveLength(0);

    unsubscribe();
  });
});

describe('EDA store subscriptions', () => {
  it('does not fire before any value has changed', () => {
    const snapshots: unknown[] = [];
    const unsubscribe = instance.subscribe((snapshot) =>
      snapshots.push(snapshot),
    );

    expect(snapshots).toHaveLength(0);

    unsubscribe();
  });

  it('fires with the full snapshot when a plain value changes, once per key affected (direct and computed)', () => {
    const snapshots: unknown[] = [];
    const unsubscribe = instance.subscribe((snapshot) =>
      snapshots.push(snapshot),
    );

    instance.set.count(5);

    expect(snapshots).toEqual([
      { count: 5, step: 1, isPositive: true },
      { count: 5, step: 1, isPositive: true },
    ]);

    unsubscribe();
  });

  it('fires once per affected key when several values are set at once', () => {
    const snapshots: unknown[] = [];
    const unsubscribe = instance.subscribe((snapshot) =>
      snapshots.push(snapshot),
    );

    instance.set({ count: 5, step: 2 });

    expect(snapshots).toHaveLength(3);

    unsubscribe();
  });

  it('fires with just the new value when subscribed to a single plain key', () => {
    const values: number[] = [];
    const unsubscribe = instance.subscribe.count((value) => values.push(value));

    instance.set.count(5);
    instance.set.step(9);

    expect(values).toEqual([5]);

    unsubscribe();
  });

  it('fires when subscribed to a computed key and its dependency changes', () => {
    const values: boolean[] = [];
    const unsubscribe = instance.subscribe.isPositive((value) =>
      values.push(value),
    );

    instance.set.count(5);

    expect(values).toEqual([true]);

    unsubscribe();
  });

  it('stops firing after unsubscribing', () => {
    const values: number[] = [];
    const unsubscribe = instance.subscribe.count((value) => values.push(value));

    instance.set.count(5);
    unsubscribe();
    instance.set.count(9);

    expect(values).toEqual([5]);
  });

  it('does not fire for a different key than the one changed', () => {
    const values: number[] = [];
    const unsubscribe = instance.subscribe.step((value) => values.push(value));

    instance.set.count(5);

    expect(values).toHaveLength(0);

    unsubscribe();
  });

  it('exposes subscribe as a callable function with a per-key counterpart', () => {
    expect(instance.subscribe).toBeTypeOf('function');
    expect(instance.subscribe.count).toBeTypeOf('function');
    expect(instance.subscribe.isPositive).toBeTypeOf('function');
  });

  it('returns an unsubscribe function that itself returns nothing', () => {
    const unsubscribe = instance.subscribe(() => {});

    expect(unsubscribe).toBeTypeOf('function');
    expect(unsubscribe()).toBeTypeOf('undefined');
  });

  it('rejects a listener with the wrong value type for a single key at the call site', () => {
    // @ts-expect-error count's listener receives a number, not a string
    assertType(instance.subscribe.count((value: string) => value));
  });
});

describe('EDA store React hooks', () => {
  it('reads the current value of a plain key on first render', () => {
    const { result } = renderHook(() => instance.use.count());

    expect(result.current).toBe(0);
  });

  it('reads the current value of a computed key on first render', () => {
    const { result } = renderHook(() => instance.use.isPositive());

    expect(result.current).toBe(false);
  });

  it('re-renders with the new value when a plain key changes', () => {
    const { result } = renderHook(() => instance.use.count());

    act(() => {
      instance.set.count(5);
    });

    expect(result.current).toBe(5);
  });

  it('re-renders with the new value when a computed key changes because its dependency changed', () => {
    const { result } = renderHook(() => instance.use.isPositive());

    act(() => {
      instance.set.count(5);
    });

    expect(result.current).toBe(true);
  });

  it('does not re-render a hook subscribed to a different, unaffected key', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return instance.use.step();
    });

    act(() => {
      instance.set.count(5);
    });

    expect(result.current).toBe(1);
    expect(renders).toBe(1);
  });

  it('exposes a hook function for every plain and computed key', () => {
    expect(instance.use.count).toBeTypeOf('function');
    expect(instance.use.step).toBeTypeOf('function');
    expect(instance.use.isPositive).toBeTypeOf('function');
  });

  it('infers each hook as returning its declared value type', () => {
    expectTypeOf(instance.use.count).returns.toBeNumber();
    expectTypeOf(instance.use.isPositive).returns.toBeBoolean();
  });

  it('rejects reading a hook for a key that is not part of the state', () => {
    // @ts-expect-error unknownKey is not part of CounterState
    expect(instance.use.unknownKey).toBeUndefined();
  });
});

describe('EDA store reserved-key guards', () => {
  it('throws when an action is named after a reserved store key', () => {
    expect(() =>
      store(initializer, () => ({
        // @ts-expect-error "get" collides with the reserved get() reader
        get: () => ({}),
      })),
    ).toThrow(/reserved/);
  });

  it('throws when an event is named after a reserved store key', () => {
    const builder = store(initializer, () => ({}));

    expect(() =>
      // @ts-expect-error "subscribe" collides with the reserved subscribe() API
      builder.event('subscribe', () => ({})),
    ).toThrow(/reserved/);
  });

  it('throws when an event is named the same as an existing action', () => {
    const builder = store(initializer, ({ get }) => ({
      increment: () => ({ count: get().count + 1 }),
    }));

    expect(() =>
      // @ts-expect-error "increment" collides with the action of the same name
      builder.event('increment', () => ({})),
    ).toThrow(/collides with an action/);
  });

  it('throws when the same event name is registered twice', () => {
    const builder = store(initializer, () => ({})).event('BUMP', () => ({}));

    expect(() =>
      // @ts-expect-error "BUMP" is already registered
      builder.event('BUMP', () => ({})),
    ).toThrow(/already registered/);
  });
});

describe('EDA store integration', () => {
  it('ties state, computed values, actions, public/private events, dispatch notifications, subscriptions, and React hooks together in one flow', async () => {
    const { result: countHook } = renderHook(() => instance.use.count());
    const { result: isPositiveHook } = renderHook(() =>
      instance.use.isPositive(),
    );

    const countChanges: number[] = [];
    const unsubscribeState = instance.subscribe.count((value) =>
      countChanges.push(value),
    );
    const dispatchedEvents: unknown[] = [];
    const unsubscribeEvents = instance.on((event) =>
      dispatchedEvents.push(event),
    );

    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
    expect(countHook.current).toBe(0);
    expect(isPositiveHook.current).toBe(false);

    act(() => {
      instance.increment();
    });

    expect(instance.get.count()).toBe(1);
    expect(countHook.current).toBe(1);
    expect(dispatchedEvents).toHaveLength(0);

    await act(async () => {
      await instance.INCREMENT_ASYNC();
    });

    expect(instance.get()).toEqual({ count: 2, step: 1, isPositive: true });
    expect(countHook.current).toBe(2);
    expect(isPositiveHook.current).toBe(true);
    expect(countChanges).toEqual([1, 2]);
    expect(dispatchedEvents).toHaveLength(1);
    expect(dispatchedEvents[0]).toMatchObject({
      type: 'INCREMENT_ASYNC',
      patch: { count: 2 },
    });

    // @ts-expect-error BUMP is private — INCREMENT_ASYNC reached it internally, not this
    expect(instance.BUMP).toBeUndefined();

    act(() => {
      instance.reset();
    });

    expect(instance.get()).toEqual({ count: 0, step: 1, isPositive: false });
    expect(countHook.current).toBe(0);
    expect(isPositiveHook.current).toBe(false);

    unsubscribeState();
    unsubscribeEvents();
  });
});
