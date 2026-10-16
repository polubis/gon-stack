import { useSyncExternalStore } from 'react';

export type Updater<T> = T | ((previous: T) => T);
export type Listener<T> = (current: T, previous: T) => void;

type KeyOf<T> = T extends readonly unknown[] ? number : keyof T;
type KeyValue<T, K> = T[K & keyof T];

export type Readable<T> = {
  (): T;
  get(): T;
  subscribe(listener: Listener<T>): () => void;
};

type Keyed<T> = [T] extends [object]
  ? {
      getKey<K extends KeyOf<T>>(key: K): KeyValue<T, K>;
      setKey<K extends KeyOf<T>>(key: K, next: Updater<KeyValue<T, K>>): void;
      subscribeKey<K extends KeyOf<T>>(
        key: K,
        listener: Listener<KeyValue<T, K>>,
      ): () => void;
    }
  : unknown;

export type Value<T> = Readable<T> & {
  set(next: Updater<T>): void;
  getInitial(): T;
  reset(): void;
} & Keyed<T>;

export type InferValue<V> = V extends { get(): infer T } ? T : never;

type Source = { get(): unknown };

const resolve = <T>(next: Updater<T>, previous: T): T =>
  typeof next === 'function' ? (next as (p: T) => T)(previous) : next;

const readable = <T>(
  get: () => T,
  subscribe: Readable<T>['subscribe'],
  getServer: () => T,
): Readable<T> =>
  Object.assign(
    () =>
      useSyncExternalStore(
        (notify) => subscribe(() => notify()),
        get,
        getServer,
      ),
    { get, subscribe },
  );

const create = <T>(init: Updater<T>): Value<T> => {
  const listeners = new Set<Listener<T>>();
  let ready = false;
  let initial: T;
  let current: T;

  const get = (): T => {
    if (!ready) {
      ready = true;
      initial = current = resolve(init, undefined as T);
    }
    return current;
  };

  const set = (next: Updater<T>) => {
    const previous = get();
    const value = resolve(next, previous);
    if (Object.is(value, previous)) return;
    current = value;
    listeners.forEach((listener) => listener(value, previous));
  };

  const subscribe = (listener: Listener<T>) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getInitial = (): T => (get(), initial);

  type Any = Record<PropertyKey, unknown>;
  const keyed = {
    getKey: (key: PropertyKey) => (get() as Any)[key],
    setKey: (key: PropertyKey, next: Updater<unknown>) =>
      set(((previous: Any) => {
        const item = resolve(next, previous[key]);
        if (Object.is(item, previous[key])) return previous;
        if (!Array.isArray(previous)) return { ...previous, [key]: item };
        const copy = [...previous];
        copy[key as number] = item;
        return copy;
      }) as never),
    subscribeKey: (key: PropertyKey, listener: Listener<unknown>) =>
      subscribe(((current: Any, previous: Any) => {
        if (!Object.is(current[key], previous[key]))
          listener(current[key], previous[key]);
      }) as never),
  };

  return Object.assign(readable(get, subscribe, getInitial), keyed, {
    set,
    getInitial,
    reset: () => set(() => getInitial()),
  }) as unknown as Value<T>;
};

const derive = <R>(
  deps: readonly Readable<unknown>[],
  fn: (...values: never[]) => R,
): Readable<R> => {
  let last: { args: unknown[]; result: R } | undefined;

  const get = (): R => {
    const args = deps.map((dep) => dep.get());
    if (!last || args.some((arg, index) => !Object.is(arg, last?.args[index])))
      last = { args, result: fn(...(args as never[])) };
    return last.result;
  };

  const subscribe: Readable<R>['subscribe'] = (listener) => {
    let previous = get();
    const offs = deps.map((dep) =>
      dep.subscribe(() => {
        const current = get();
        if (Object.is(current, previous)) return;
        const before = previous;
        previous = current;
        listener(current, before);
      }),
    );
    return () => offs.forEach((off) => off());
  };

  return readable(get, subscribe, get);
};

export function value<T>(initial: T | (() => T)): Value<T>;
export function value<const D extends readonly Source[], R>(
  deps: D,
  fn: (...values: { [K in keyof D]: InferValue<D[K]> }) => R,
): Readable<R>;
export function value(first: unknown, fn?: unknown): unknown {
  return Array.isArray(first) && typeof fn === 'function'
    ? derive(first as Readable<unknown>[], fn as never)
    : create(first as never);
}
