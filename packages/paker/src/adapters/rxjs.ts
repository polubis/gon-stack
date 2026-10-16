import { filter, map, Observable, Subject, Subscription, tap } from 'rxjs';
import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { extend } from '../actions.js';
import type { Readable, Updater } from '../value.js';

type Target<T> = { set(next: Updater<T>): void };

export const events = <T>(
  source: Readable<T>,
): Observable<{ current: T; previous: T }> =>
  new Observable((subscriber) =>
    source.subscribe((current, previous) =>
      subscriber.next({ current, previous }),
    ),
  );

export function forward<T>(
  source: Observable<T>,
  target: Target<T>,
): Subscription;
export function forward<A, B>(
  source: Observable<A>,
  target: Target<B>,
  map: (event: A) => B,
): Subscription;
export function forward(
  source: Observable<unknown>,
  target: Target<unknown>,
  map: (event: unknown) => unknown = (event) => event,
): Subscription {
  return source.subscribe((event) => target.set(() => map(event)));
}

export const skipOn = <T>(gate: {
  get(): boolean;
}): MonoTypeOperatorFunction<T> => filter(() => !gate.get());

type Handlers = Record<
  string,
  (event$: Observable<never>) => Observable<unknown>
>;

type Payload<H> = H extends (event$: Observable<infer P>) => unknown
  ? P
  : never;

type Emit<H extends Handlers> = <K extends keyof H & string>(
  name: K,
  ...payload: [Payload<H[K]>] extends [void] ? [] : [Payload<H[K]>]
) => void;

export type Operators = {
  /** Emits every value of the stream as another event. */
  forward<P>(name: string): OperatorFunction<P, P>;
  skipOn: typeof skipOn;
  emit(name: string, payload?: unknown): void;
};

export const rxjs = <T extends () => unknown, H extends Handlers>(
  target: T,
  setup: (target: T, operators: Operators) => H,
): T & { emit: Emit<H>; register(): () => void } => {
  const bus = new Subject<{ name: string; payload: unknown }>();
  const emit = (name: string, payload?: unknown) => bus.next({ name, payload });
  const handlers = setup(target, {
    emit,
    skipOn,
    forward: (name) => tap((payload) => emit(name, payload)),
  });

  const register = () => {
    const subscription = new Subscription();
    Object.entries(handlers).forEach(([name, handler]) =>
      subscription.add(
        handler(
          bus.pipe(
            filter((event) => event.name === name),
            map((event) => event.payload as never),
          ),
        ).subscribe(),
      ),
    );
    return () => subscription.unsubscribe();
  };

  return extend(target, { emit: emit as Emit<H>, register });
};
