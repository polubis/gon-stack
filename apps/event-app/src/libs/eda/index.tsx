import {
  catchError,
  EMPTY,
  filter,
  map,
  merge,
  Subject,
  tap,
  type Observable,
  type OperatorFunction,
} from 'rxjs';

import { useEffect } from 'react';

import type { ComponentType } from 'react';

export type EventMeta = {
  id: string;
  time: number;
};

export type Event<
  TType extends string = string,
  TPayload = void,
> = TPayload extends void
  ? { type: TType; meta: EventMeta }
  : { type: TType; payload: TPayload; meta: EventMeta };

export type TriggerEvent<
  TKey extends `[TRIGGER]_${string}`,
  TPayload = void,
> = Event<TKey, TPayload>;

export type TaskEvent<TKey extends `[TASK]_${string}`, TPayload = void> = Event<
  TKey,
  TPayload
>;

export type FactEvent<TKey extends `[FACT]_${string}`, TPayload = void> = Event<
  TKey,
  TPayload
>;

export type EffectEvent<
  TKey extends `[EFFECT]_${string}`,
  TPayload = void,
> = Event<TKey, TPayload>;

export type InferPayload<TEvents extends Event, TType extends TEvents['type']> =
  Extract<TEvents, { type: TType }> extends { payload: infer P } ? P : void;

export type OnlyFact<T extends string> = T extends `[FACT]_${string}`
  ? T
  : never;

export type OnlyTrigger<T extends string> = T extends `[TRIGGER]_${string}`
  ? T
  : never;

export type ExcludeTrigger<T extends string> = T extends `[TRIGGER]_${string}`
  ? never
  : T;

const createMeta = (): EventMeta => ({
  id: crypto.randomUUID(),
  time: performance.now(),
});

export const eda = <TEvents extends Event>() => {
  const event$ = new Subject<TEvents>();

  const emit = <TType extends TEvents['type']>(
    type: TType,
    payload?: InferPayload<TEvents, TType>,
  ) => {
    const meta = createMeta();
    const event = (
      payload === undefined ? { type, meta } : { type, payload, meta }
    ) as Extract<TEvents, { type: TType }>;
    event$.next(event);
  };

  return {
    ofAny: () => event$.asObservable(),

    ofType: <TType extends TEvents['type']>(type: TType) =>
      event$.pipe(
        filter(
          (event): event is Extract<TEvents, { type: TType }> =>
            event.type === type,
        ),
        map(
          (event) =>
            ('payload' in event ? event.payload : undefined) as InferPayload<
              TEvents,
              TType
            >,
        ),
      ),

    trigger: <TType extends OnlyTrigger<TEvents['type']>>(
      ...args: InferPayload<TEvents, TType> extends void
        ? [type: TType]
        : [type: TType, payload: InferPayload<TEvents, TType>]
    ) => {
      const [type, payload] = args;
      emit(type, payload);
    },

    emit,

    forwardAs: <TType extends ExcludeTrigger<TEvents['type']>>(type: TType) =>
      ((source: Observable<unknown>) =>
        source.pipe(
          tap((payload) => {
            emit(type, payload as InferPayload<TEvents, TType>);
          }),
        )) as InferPayload<TEvents, TType> extends void
        ? <TPayload>(source: Observable<TPayload>) => Observable<TPayload>
        : <TPayload extends InferPayload<TEvents, TType>>(
            source: Observable<TPayload>,
          ) => Observable<TPayload>,

    createRegistry:
      <TStreams extends readonly Observable<unknown>[]>(...args: TStreams) =>
      () => {
        const streams = args.map((stream) =>
          stream.pipe(catchError((_error, caught) => caught)),
        );
        const sub = merge(...streams).subscribe();

        return () => {
          sub.unsubscribe();
        };
      },

    createForwardErrorAs:
      <TError,>(parseError: (error: unknown) => TError | null) =>
      <TType extends OnlyFact<TEvents['type']>>(
        ...args: InferPayload<TEvents, TType> extends void
          ? [type: TType]
          : [
              type: TType,
              mapper: (error: TError) => InferPayload<TEvents, TType>,
            ]
      ): OperatorFunction<unknown, unknown> =>
        catchError((error: unknown) => {
          const parsed = parseError(error);

          if (parsed !== null) {
            const [type, mapper] = args;
            const payload = mapper ? mapper(parsed) : undefined;
            emit(type, payload as InferPayload<TEvents, TType>);
          }

          return EMPTY;
        }),
  };
};

export const withEda = <P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  register: () => () => void,
) => {
  const WithEda = (props: P) => {
    useEffect(() => {
      const unsubscribe = register();

      return () => {
        unsubscribe();
      };
    }, []);

    return <Component {...props} />;
  };

  return WithEda;
};
