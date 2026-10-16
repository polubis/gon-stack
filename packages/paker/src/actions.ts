import type { Readable, Updater } from './value.js';

type Target<T> = { get(): T; set(next: Updater<T>): void };

type Def<S, R> = (current: S, ...args: never[]) => R | Promise<R>;

type Bound<D> = {
  [K in keyof D]: D[K] extends (current: never, ...args: infer A) => infer R
    ? (...args: A) => R extends Promise<unknown> ? Promise<void> : void
    : never;
};

export type InferActions<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => unknown ? A : never;
};

const bind = <S, R>(
  get: () => S,
  apply: (result: R) => void,
  defs: Record<string, Def<S, R>>,
) =>
  Object.fromEntries(
    Object.entries(defs).map(([name, def]) => [
      name,
      (...args: never[]) => {
        const result = def(get(), ...args);
        return result instanceof Promise ? result.then(apply) : apply(result);
      },
    ]),
  );

export const extend = <G extends () => unknown, B>(
  target: G,
  bound: B,
): G & B => Object.assign((() => target()) as G, target, bound);

type Settable = (() => unknown) & { get(): unknown; set(next: never): void };
type State<G> = G extends { get(): infer S } ? S : never;

type Typed<G> = {
  get(): State<G>;
  set(next: (previous: State<G>) => State<G>): void;
};

export const actions = <
  G extends Settable,
  D extends Record<string, Def<State<G>, State<G>>>,
>(
  target: G,
  defs: D,
): G & Bound<D> => {
  const typed = target as Typed<G>;
  return extend(
    target,
    bind(
      typed.get,
      (next: State<G>) => typed.set(() => next),
      defs,
    ) as Bound<D>,
  );
};

export const patches = <
  G extends Settable,
  D extends Record<string, Def<State<G>, Partial<State<G>>>>,
>(
  target: G,
  defs: D,
): G & Bound<D> => {
  const typed = target as Typed<G>;
  return extend(
    target,
    bind(
      typed.get,
      (patch: Partial<State<G>>) =>
        typed.set(
          (previous) => ({ ...(previous as object), ...patch }) as State<G>,
        ),
      defs,
    ) as Bound<D>,
  );
};
export function forward<T>(source: Readable<T>, target: Target<T>): () => void;
export function forward<A, B>(
  source: Readable<A>,
  target: Target<B>,
  map: (current: A) => B,
): () => void;
export function forward(
  source: Readable<unknown>,
  target: Target<unknown>,
  map: (current: unknown) => unknown = (current) => current,
): () => void {
  return source.subscribe((current) => target.set(() => map(current)));
}

export const forwardPatch = <A, S extends object>(
  source: Readable<A>,
  target: Target<S>,
  map: (current: A) => Partial<S>,
): (() => void) =>
  source.subscribe((current) =>
    target.set((previous) => ({ ...previous, ...map(current) })),
  );
