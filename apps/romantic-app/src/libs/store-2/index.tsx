import { useRef, useSyncExternalStore, type ReactNode } from 'react';
import { createHookContext } from '../power-context';

type Listener<TState> = (state: TState) => void;
type SelectorListener<TState, TKey extends keyof TState> = (
  value: TState[TKey],
) => void;

type ActionHandlers<TState extends object> = Record<
  string,
  (state: TState, ...args: unknown[]) => unknown
>;

type Tail<TArgs extends unknown[]> = TArgs extends [unknown, ...infer TRest]
  ? TRest
  : never;

type SetterValue<TState extends object, TKey extends keyof TState> =
  | TState[TKey]
  | ((previous: TState[TKey]) => TState[TKey]);

type StoreCreator<TState extends object, TInitialState> = (
  initialState: TInitialState,
) => TState;

type StoreInstance<TState extends object, TActions extends ActionHandlers<TState>> =
  {
    get(): TState;
    get<TKey extends keyof TState>(key: TKey): TState[TKey];
    set<TKey extends keyof TState>(
      key: TKey,
      value: SetterValue<TState, TKey>,
    ): void;
    subscribe(listener: Listener<TState>): () => void;
    on<TKey extends keyof TState>(
      key: TKey,
      listener: SelectorListener<TState, TKey>,
    ): () => void;
    dispatch<TKey extends keyof TActions>(
      type: TKey,
      ...args: Tail<Parameters<TActions[TKey]>>
    ): void;
    use(): TState;
    use<TKey extends keyof TState>(key: TKey): TState[TKey];
  };

type ProviderProps<TInitialState> = {
  children: ReactNode;
  initialState?: TInitialState;
};

const cloneState = <TState extends object>(value: TState): TState => {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as TState;
};

const createStoreInstance = <
  TState extends object,
  TInitialState,
  TActions extends ActionHandlers<TState>,
>(
  initialize: StoreCreator<TState, TInitialState>,
  actions: TActions,
  initialValue?: TInitialState,
): StoreInstance<TState, TActions> => {
  let state = initialize((initialValue ?? {}) as TInitialState);
  const stateListeners = new Set<Listener<TState>>();
  const keyListeners = new Map<keyof TState, Set<(value: unknown) => void>>();

  const notify = (previousState: TState, nextState: TState): void => {
    stateListeners.forEach((listener) => listener(nextState));

    keyListeners.forEach((listeners, key) => {
      const previousValue = previousState[key];
      const nextValue = nextState[key];

      if (Object.is(previousValue, nextValue)) return;
      listeners.forEach((listener) => listener(nextValue));
    });
  };

  const setState = (nextState: TState): void => {
    const previousState = state;
    state = nextState;
    notify(previousState, nextState);
  };

  const get = <TKey extends keyof TState>(key?: TKey) => {
    if (key === undefined) return state;
    return state[key];
  };

  const set = <TKey extends keyof TState>(
    key: TKey,
    value: SetterValue<TState, TKey>,
  ) => {
    const currentValue = state[key];
    const nextValue =
      typeof value === 'function'
        ? (value as (previous: TState[TKey]) => TState[TKey])(currentValue)
        : value;

    setState({
      ...state,
      [key]: nextValue,
    });
  };

  const subscribe = (listener: Listener<TState>) => {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  };

  const on = <TKey extends keyof TState>(
    key: TKey,
    listener: SelectorListener<TState, TKey>,
  ) => {
    const listenersForKey = keyListeners.get(key) ?? new Set<(v: unknown) => void>();
    const wrapped = (value: unknown) => listener(value as TState[TKey]);

    listenersForKey.add(wrapped);
    keyListeners.set(key, listenersForKey);

    return () => {
      const current = keyListeners.get(key);
      if (!current) return;
      current.delete(wrapped);
      if (current.size === 0) keyListeners.delete(key);
    };
  };

  const dispatch = <TKey extends keyof TActions>(
    type: TKey,
    ...args: Tail<Parameters<TActions[TKey]>>
  ) => {
    const action = actions[type];
    const draft = cloneState(state);
    action(draft, ...args);
    setState(draft);
  };

  function use(): TState;
  function use<TKey extends keyof TState>(key: TKey): TState[TKey];
  function use<TKey extends keyof TState>(key?: TKey) {
    const snapshot = useSyncExternalStore(subscribe, () => state, () => state);

    if (key === undefined) return snapshot;
    return snapshot[key];
  }

  return {
    get: get as StoreInstance<TState, TActions>['get'],
    set,
    subscribe,
    on,
    dispatch,
    use: use as StoreInstance<TState, TActions>['use'],
  };
};

type StoreWithContext<
  TState extends object,
  TInitialState,
  TActions extends ActionHandlers<TState>,
> = StoreInstance<TState, TActions> & {
  createContext(): readonly [
    (props: ProviderProps<TInitialState>) => ReactNode,
    () => StoreInstance<TState, TActions>,
  ];
};

export const store = <
  TState extends object,
  TInitialState = Partial<TState>,
  TActions extends ActionHandlers<TState> = ActionHandlers<TState>,
>(
  initialize: StoreCreator<TState, TInitialState>,
  actions: TActions,
): StoreWithContext<TState, TInitialState, TActions> => {
  const defaultStore = createStoreInstance(initialize, actions);

  const createContext = () => {
    const useStoreForContext = (initialState: TInitialState) => {
      const storeRef = useRef<StoreInstance<TState, TActions> | null>(null);

      if (storeRef.current === null) {
        storeRef.current = createStoreInstance(initialize, actions, initialState);
      }

      return storeRef.current;
    };

    const [BaseProvider, useContextStore] = createHookContext(
      'Store2',
      useStoreForContext,
    );

    type BaseProviderProps = {
      children: ReactNode;
      value?: TInitialState;
    };

    const TypedBaseProvider =
      BaseProvider as unknown as (props: BaseProviderProps) => ReactNode;

    const Provider = ({ children, initialState }: ProviderProps<TInitialState>) =>
      TypedBaseProvider({
        children,
        value: (initialState ?? {}) as TInitialState,
      });

    return [Provider, useContextStore] as const;
  };

  return {
    ...defaultStore,
    createContext,
  };
};
