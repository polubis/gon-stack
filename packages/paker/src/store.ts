import { useSyncExternalStore } from 'react';
import { value } from './value.js';
import type { Listener, Readable, Updater, Value } from './value.js';

type Shape = Record<string, unknown>;

export type Store<S extends Shape> = {
  [K in keyof S & string as `${K}$`]: Value<S[K]>;
} & Readable<S> & {
    set(next: Updater<S>): void;
    getInitial(): S;
    reset(): void;
  };

export type InferStore<T> = T extends Readable<infer S> ? S : never;

const sameShape = (a: Shape, b: Shape): boolean =>
  Object.keys(a).every((key) => Object.is(a[key], b[key]));

export const store = <S extends Shape>(initial: S): Store<S> => {
  const keys = Object.keys(initial);
  const values = Object.fromEntries(
    keys.map((key) => [key, value(initial[key])]),
  ) as Record<string, Value<unknown>>;
  const listeners = new Set<Listener<S>>();
  let batching = false;
  let snapshot: Shape | undefined;
  let initialSnapshot: Shape | undefined;

  const read = (pick: (v: Value<unknown>) => unknown): Shape =>
    Object.fromEntries(keys.map((key) => [key, pick(values[key] as never)]));

  const get = (): S => {
    const next = read((v) => v.get());
    if (!snapshot || !sameShape(snapshot, next)) snapshot = next;
    return snapshot as S;
  };

  const getInitial = (): S =>
    (initialSnapshot ??= read((v) => v.getInitial())) as S;

  let last = get();

  const emit = () => {
    const current = get();
    if (current === last) return;
    const previous = last;
    last = current;
    listeners.forEach((listener) => listener(current, previous));
  };

  const batch = (run: () => void) => {
    batching = true;
    run();
    batching = false;
    emit();
  };

  keys.forEach((key) =>
    (values[key] as Value<unknown>).subscribe(() => !batching && emit()),
  );

  const set = (next: Updater<S>) => {
    const state =
      typeof next === 'function' ? (next as (p: S) => S)(get()) : next;
    batch(() =>
      keys.forEach((key) =>
        (values[key] as Value<unknown>).set(() => state[key]),
      ),
    );
  };

  const subscribe = (listener: Listener<S>) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const hook = Object.assign(
    () =>
      useSyncExternalStore(
        (notify) => subscribe(() => notify()),
        get,
        getInitial,
      ),
    { get, subscribe, set, getInitial, reset: () => set(getInitial()) },
  );

  return Object.assign(
    hook,
    Object.fromEntries(keys.map((key) => [`${key}$`, values[key]])),
  ) as unknown as Store<S>;
};
