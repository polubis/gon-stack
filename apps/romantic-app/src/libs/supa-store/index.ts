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

/**
 * Enhanced atom interface with utility methods.
 * Extends the base nanostores atom with reset, initial value access, and React hook.
 *
 * @template TValue - The type of value stored in the atom
 */
type EnhancedAtom<TValue> = {
  /** Resets the atom to its initial value */
  reset(): void;
  /** Returns the initial value the atom was created with */
  getInitial(): TValue;
  /** React hook that subscribes to atom changes and returns current value */
  use(): TValue;
};

/**
 * Enhanced atom type combining nanostores WritableAtom with utility methods.
 *
 * @template TValue - The type of value stored in the atom
 */
type Atom<TValue> = PreinitializedWritableAtom<TValue> & EnhancedAtom<TValue>;

/**
 * Enhanced computed interface with React hook integration.
 *
 * @template TValue - The type of computed value
 */
type EnhancedComputed<TValue> = {
  /** React hook that subscribes to computed changes and returns current value */
  use(): TValue;
};

/**
 * Enhanced computed type combining nanostores ReadableAtom with utility methods.
 *
 * @template TValue - The type of computed value
 */
type Computed<TValue> = ReadableAtom<TValue> & EnhancedComputed<TValue>;

/**
 * Enhanced map interface with utility methods.
 * Extends the base nanostores map with reset, initial value access, React hook, and key removal.
 *
 * @template TValue - The object type stored in the map
 */
type EnhancedMap<TValue extends object> = {
  /** Resets the map to its initial value */
  reset(): void;
  /** Returns the initial value the map was created with */
  getInitial(): TValue;
  /** React hook that subscribes to map changes and returns current value */
  use(): TValue;
  /** Removes a key from the map by setting it to undefined */
  removeKey<TKey extends keyof TValue>(key: TKey): void;
};

/**
 * Enhanced map type combining nanostores MapStore with utility methods.
 *
 * @template TValue - The object type stored in the map
 */
type Map<TValue extends object> = MapStore<TValue> & EnhancedMap<TValue>;

type Obj = Record<string | number | symbol, unknown>;

/**
 * Creates an enhanced atom store for primitive or complex values.
 *
 * Wraps nanostores atom with additional utility methods:
 * - `reset()` - Resets to initial value
 * - `getInitial()` - Returns initial value
 * - `use()` - React hook for subscribing to changes
 *
 * @template TValue - The type of value stored in the atom
 * @template TStoreExt - Optional store extension type
 * @param value - The initial value of the atom
 * @returns Enhanced atom with utility methods
 *
 * @example
 * ```typescript
 * // Create an atom
 * const $count = atom(0);
 *
 * // Update value
 * $count.set(5);
 *
 * // Reset to initial value
 * $count.reset(); // now 0
 *
 * // Use in React component
 * const MyComponent = () => {
 *   const count = $count.use();
 *   return <div>{count}</div>;
 * };
 * ```
 */
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

/**
 * Creates an enhanced map store for object values with key-level reactivity.
 *
 * Wraps nanostores map with additional utility methods:
 * - `reset()` - Resets to initial value
 * - `getInitial()` - Returns initial value
 * - `use()` - React hook for subscribing to changes
 * - `removeKey()` - Removes a key from the map
 *
 * Maps are optimized for objects where individual keys may be updated,
 * providing fine-grained reactivity per key.
 *
 * @template TValue - The object type stored in the map
 * @param value - The initial value of the map
 * @returns Enhanced map with utility methods
 *
 * @example
 * ```typescript
 * // Create a map store
 * const $user = map({ name: '', email: '', age: 0 });
 *
 * // Update single key (more efficient than full object update)
 * $user.setKey('name', 'John');
 *
 * // Remove a key
 * $user.removeKey('age');
 *
 * // Reset to initial value
 * $user.reset();
 *
 * // Use in React component
 * const UserProfile = () => {
 *   const user = $user.use();
 *   return <div>{user.name}</div>;
 * };
 * ```
 */
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

/**
 * Creates an enhanced computed store derived from one store.
 *
 * @template TValue - The type of computed value
 * @template TStore - The source store type
 * @param stores - Single source store
 * @param cb - Callback that receives the store value and returns computed value
 * @returns Enhanced computed store with React hook
 */
export function computed<TValue, TStore extends Store>(
  stores: TStore,
  cb: (value: StoreValue<TStore>) => TValue,
): Computed<TValue>;

/**
 * Creates an enhanced computed store derived from multiple stores.
 *
 * @template TValue - The type of computed value
 * @template TStores - Tuple of source store types
 * @param stores - Array of source stores
 * @param cb - Callback that receives all store values and returns computed value
 * @returns Enhanced computed store with React hook
 */
export function computed<TValue, TStores extends [Store, ...Store[]]>(
  stores: TStores,
  cb: (...values: { [K in keyof TStores]: StoreValue<TStores[K]> }) => TValue,
): Computed<TValue>;

/**
 * Creates an enhanced computed store derived from other stores.
 *
 * Wraps nanostores computed with React hook integration.
 * Computed stores automatically update when their source stores change.
 *
 * @template TValue - The type of computed value
 * @param stores - Single store or array of stores to derive from
 * @param cb - Callback that receives store value(s) and returns computed value
 * @returns Enhanced computed store with `use()` React hook
 *
 * @example
 * ```typescript
 * // Single store computed
 * const $count = atom(5);
 * const $doubled = computed($count, (count) => count * 2);
 *
 * // Multiple stores computed
 * const $firstName = atom('John');
 * const $lastName = atom('Doe');
 * const $fullName = computed(
 *   [$firstName, $lastName],
 *   (first, last) => `${first} ${last}`
 * );
 *
 * // Use in React component
 * const Display = () => {
 *   const fullName = $fullName.use();
 *   return <div>{fullName}</div>;
 * };
 * ```
 */
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
