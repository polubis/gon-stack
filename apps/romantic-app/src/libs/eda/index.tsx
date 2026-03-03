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

/**
 * Metadata attached to every event.
 * Contains unique ID and timestamp for tracing and debugging.
 */
export type EventMeta = {
  /** Unique identifier for the event instance */
  id: string;
  /** High-resolution timestamp from performance.now() */
  time: number;
};

/**
 * Base event type for the EDA system.
 * Events can optionally carry a payload.
 *
 * The EDA pattern uses four event types:
 * - **TRIGGER** → User actions or external inputs (entry points)
 * - **TASK** → Async operations (API calls, side effects)
 * - **FACT** → State changes or completed actions
 * - **EFFECT** → Cross-cutting concerns (logging, analytics, notifications)
 *
 * @template TType - The event type string identifier
 * @template TPayload - The payload type (void if no payload)
 */
export type Event<
  TType extends string = string,
  TPayload = void,
> = TPayload extends void
  ? { type: TType; meta: EventMeta }
  : { type: TType; payload: TPayload; meta: EventMeta };

/**
 * Trigger event - initiated by user actions or external inputs.
 * These are the entry points into the EDA system.
 *
 * @template TKey - Must follow pattern `[TRIGGER]_*`
 * @template TPayload - Optional payload type
 *
 * @example
 * TriggerEvent<'[TRIGGER]_SUBMIT_FORM', { formData: FormData }>
 */
export type TriggerEvent<
  TKey extends `[TRIGGER]_${string}`,
  TPayload = void,
> = Event<TKey, TPayload>;

/**
 * Task event - represents async operations or side effects.
 * Tasks typically result in Fact events upon completion.
 *
 * @template TKey - Must follow pattern `[TASK]_*`
 * @template TPayload - Optional payload type
 *
 * @example
 * TaskEvent<'[TASK]_FETCH_DATA', { endpoint: string }>
 */
export type TaskEvent<TKey extends `[TASK]_${string}`, TPayload = void> = Event<
  TKey,
  TPayload
>;

/**
 * Fact event - represents something that has happened.
 * Facts are immutable records of state changes or completed actions.
 *
 * @template TKey - Must follow pattern `[FACT]_*`
 * @template TPayload - Optional payload type
 *
 * @example
 * FactEvent<'[FACT]_DATA_LOADED', { data: Data[] }>
 */
export type FactEvent<TKey extends `[FACT]_${string}`, TPayload = void> = Event<
  TKey,
  TPayload
>;

/**
 * Effect event - represents side effects triggered by facts.
 * Used for cross-cutting concerns like logging, analytics, etc.
 *
 * @template TKey - Must follow pattern `[EFFECT]_*`
 * @template TPayload - Optional payload type
 *
 * @example
 * EffectEvent<'[EFFECT]_LOG_ACTION', { action: string }>
 */
export type EffectEvent<
  TKey extends `[EFFECT]_${string}`,
  TPayload = void,
> = Event<TKey, TPayload>;

/**
 * Utility type to extract the payload type from an event.
 *
 * @template TEvents - Union of all event types
 * @template TType - The specific event type to extract payload from
 * @returns The payload type, or void if no payload
 */
export type InferPayload<TEvents extends Event, TType extends TEvents['type']> =
  Extract<TEvents, { type: TType }> extends { payload: infer P } ? P : void;

/**
 * Filters event types to only include FACT events.
 */
export type OnlyFact<T extends string> = T extends `[FACT]_${string}`
  ? T
  : never;

/**
 * Filters event types to only include TRIGGER events.
 */
export type OnlyTrigger<T extends string> = T extends `[TRIGGER]_${string}`
  ? T
  : never;

/**
 * Filters event types to exclude TRIGGER events.
 * Used for forwardAs which should only emit non-trigger events.
 */
export type ExcludeTrigger<T extends string> = T extends `[TRIGGER]_${string}`
  ? never
  : T;

/**
 * Creates metadata for an event with unique ID and timestamp.
 * @returns Event metadata object
 */
const createMeta = (): EventMeta => ({
  id: crypto.randomUUID(),
  time: performance.now(),
});

/**
 * Creates an Event-Driven Architecture (EDA) instance.
 *
 * Provides a type-safe, RxJS-based event system following the pattern:
 * - **TRIGGER** → User actions or external inputs
 * - **TASK** → Async operations (API calls, side effects)
 * - **FACT** → State changes or completed actions
 * - **EFFECT** → Cross-cutting concerns (logging, analytics, notifications)
 *
 * @template TEvents - Union type of all events in the system
 * @returns EDA utilities object
 *
 * @example
 * ```typescript
 * type Events =
 *   | TriggerEvent<'[TRIGGER]_CLICK'>
 *   | TaskEvent<'[TASK]_FETCH'>
 *   | FactEvent<'[FACT]_LOADED', { data: Data }>
 *   | EffectEvent<'[EFFECT]_LOG', { message: string }>;
 *
 * const { ofType, trigger, forwardAs, createRegistry } = eda<Events>();
 * ```
 */
export const eda = <TEvents extends Event>() => {
  const event$ = new Subject<TEvents>();

  /**
   * Emits an event into the event stream.
   *
   * @param type - The event type to emit
   * @param payload - Optional payload (required if event defines one)
   *
   * @example
   * ```typescript
   * emit('[FACT]_DATA_LOADED', { data: response });
   * ```
   */
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
    /**
     * Observable of all events in the system.
     * Useful for debugging, logging, or cross-cutting concerns.
     *
     * @returns Observable emitting all events
     *
     * @example
     * ```typescript
     * ofAny().pipe(
     *   tap(event => console.log(event))
     * )
     * ```
     */
    ofAny: () => event$.asObservable(),

    /**
     * Filters events by type and extracts the payload.
     *
     * @param type - The event type to filter for
     * @returns Observable emitting only the payload of matching events
     *
     * @example
     * ```typescript
     * ofType('[FACT]_DATA_LOADED').pipe(
     *   tap(({ data }) => store.setData(data))
     * )
     * ```
     */
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

    /**
     * Triggers an event from user actions or external inputs.
     * Only accepts TRIGGER event types.
     *
     * @param type - The trigger event type
     * @param payload - Optional payload (required if event defines one)
     *
     * @example
     * ```typescript
     * // In a React component
     * onClick={() => trigger('[TRIGGER]_SUBMIT', { formData })}
     * ```
     */
    trigger: <TType extends OnlyTrigger<TEvents['type']>>(
      ...args: InferPayload<TEvents, TType> extends void
        ? [type: TType]
        : [type: TType, payload: InferPayload<TEvents, TType>]
    ) => {
      const [type, payload] = args;
      emit(type, payload);
    },

    emit,

    /**
     * RxJS operator that emits an event while passing through the payload.
     * When the target event has no payload (void), accepts any source payload.
     *
     * @param type - The event type to emit (non-TRIGGER events only)
     * @returns RxJS operator that emits the event and passes through the payload
     *
     * @example
     * ```typescript
     * ofType('[TRIGGER]_SUBMIT').pipe(
     *   map(() => ({ data: store.getData() })),
     *   forwardAs('[FACT]_DATA_READY'),  // Emits event, passes { data } through
     *   switchMap(({ data }) => api.save(data))
     * )
     * ```
     */
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

    /**
     * Creates an event registry that subscribes to all provided observables.
     * Returns a cleanup function to unsubscribe.
     *
     * Each stream is wrapped with its own error boundary so an unhandled
     * error in one stream does not stop other registry streams from running.
     *
     * @param args - Observable streams to subscribe to
     * @returns Function that starts subscriptions and returns cleanup function
     *
     * @example
     * ```typescript
     * export const register = createRegistry(
     *   ofType('[TRIGGER]_INIT').pipe(forwardAs('[TASK]_LOAD')),
     *   ofType('[TASK]_LOAD').pipe(
     *     switchMap(() => from(api.load()).pipe(
     *       forwardAs('[FACT]_LOADED')
     *     ))
     *   ),
     *   ofType('[FACT]_LOADED').pipe(
     *     tap(({ data }) => store.setData(data))
     *   )
     * );
     *
     * // In React
     * useEffect(() => {
     *   const cleanup = register();
     *   return cleanup;
     * }, []);
     * ```
     */
    createRegistry:
      (...args: Observable<unknown>[]) =>
      () => {
        const streams = args.map((stream) =>
          stream.pipe(catchError((_error, caught) => caught)),
        );
        const sub = merge(...streams).subscribe();

        return () => {
          sub.unsubscribe();
        };
      },

    /**
     * Creates a type-safe error forwarding operator.
     *
     * Factory that returns an RxJS operator which catches errors,
     * parses them with your custom error parser, and emits a FACT event.
     * The error parsing logic is injected, keeping the EDA system decoupled
     * from any specific error handling implementation.
     *
     * @template TError - The parsed error type returned by your error parser
     * @param parseError - Function that parses unknown errors into TError or null (null = ignore)
     * @returns A function that creates error forwarding operators for FACT events
     *
     * @example
     * ```typescript
     * // 1. Create the error handler with your parser
     * const forwardErrorAs = createForwardErrorAs<AppError>((error) => {
     *   if (error instanceof Error) {
     *     return { errorMessage: error.message };
     *   }
     *   return { errorMessage: 'Unknown error' };
     * });
     *
     * // 2. Use in your registry
     * ofType('[TASK]_FETCH').pipe(
     *   switchMap(() =>
     *     from(api.fetch()).pipe(
     *       forwardAs('[FACT]_SUCCESS'),
     *       forwardErrorAs('[FACT]_ERROR', (error) => ({
     *         message: error.errorMessage,
     *       }))
     *     )
     *   )
     * );
     * ```
     */
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

/**
 * Higher-Order Component (HOC) that integrates EDA with React.
 *
 * Wraps a component and manages the EDA registry lifecycle:
 * - Subscribes to all event streams when the component mounts
 * - Unsubscribes from all event streams when the component unmounts
 *
 * This ensures proper cleanup and prevents memory leaks from
 * orphaned subscriptions.
 *
 * @template P - The props type of the wrapped component
 * @param Component - The React component to wrap
 * @param register - The registry function from createRegistry()
 * @returns A new component with EDA integration
 *
 * @example
 * ```tsx
 * // In registry.ts
 * export const register = createRegistry(
 *   ofType('[TRIGGER]_INIT').pipe(...),
 *   ofType('[FACT]_LOADED').pipe(...)
 * );
 *
 * // In component file
 * const MyComponent = () => {
 *   return <div>...</div>;
 * };
 *
 * export default withEda(MyComponent, register);
 *
 * // Or wrap at the app level
 * const App = () => <Router>...</Router>;
 * export default withEda(App, register);
 * ```
 */
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
