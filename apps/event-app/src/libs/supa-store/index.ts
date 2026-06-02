import { useStore } from '@nanostores/react';
import {
  atom as nanoAtom,
  map as nanoMap,
  computed as nanoComputed,
  type PreinitializedWritableAtom,
  type MapStore,
  type Store,
  type StoreValue,
  type ReadableAtom,
} from 'nanostores';

type EnhancedAtom<TValue> = {
  reset(): void;
  getInitial(): TValue;
  use(): TValue;
};

type Atom<TValue> = PreinitializedWritableAtom<TValue> & EnhancedAtom<TValue>;

type EnhancedComputed<TValue> = {
  use(): TValue;
};

type Computed<TValue> = ReadableAtom<TValue> & EnhancedComputed<TValue>;

type EnhancedMap<TValue extends object> = {
  reset(): void;
  getInitial(): TValue;
  use(): TValue;
  removeKey<TKey extends keyof TValue>(key: TKey): void;
};

type Map<TValue extends object> = MapStore<TValue> & EnhancedMap<TValue>;

type Obj = Record<string | number | symbol, unknown>;

export const atom = <TValue, TStoreExt = object>(
  value: TValue,
): Atom<TValue> => {
  const $atom = nanoAtom<TValue, TStoreExt>(value);

  const atomWithMethods: Atom<TValue> = Object.assign($atom, {
    reset() {
      $atom.set(value);
    },
    getInitial() {
      return value;
    },
    use() {
      return useStore($atom);
    },
  } satisfies EnhancedAtom<TValue>);

  return atomWithMethods;
};

export const map = <TValue extends Obj>(value: TValue): Map<TValue> => {
  const $map = nanoMap<TValue>(value);

  const mapWithMethods: Map<TValue> = Object.assign($map, {
    reset() {
      $map.set(value);
    },
    getInitial() {
      return value;
    },
    use() {
      return useStore($map);
    },
    removeKey<TKey extends keyof TValue>(key: TKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $map.setKey(key as any, undefined as any);
    },
  } satisfies EnhancedMap<TValue>);

  return mapWithMethods;
};

export function computed<TValue, TStore extends Store>(
  stores: TStore,
  cb: (value: StoreValue<TStore>) => TValue,
): Computed<TValue>;

export function computed<TValue, TStores extends [Store, ...Store[]]>(
  stores: TStores,
  cb: (...values: { [K in keyof TStores]: StoreValue<TStores[K]> }) => TValue,
): Computed<TValue>;

export function computed<TValue>(
  stores: Store | Store[],
  cb: (...values: unknown[]) => TValue,
): Computed<TValue> {
  const $computed = nanoComputed(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stores as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb as any,
  ) as ReadableAtom<TValue>;

  const computedWithMethods: Computed<TValue> = Object.assign($computed, {
    use() {
      return useStore($computed);
    },
  } satisfies EnhancedComputed<TValue>);

  return computedWithMethods;
}
