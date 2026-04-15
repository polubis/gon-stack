import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'vitest';
import { store } from './index';

type Step = { id: number; title: string };

const userStore = store(
  (initialState: {
    loading: boolean;
    error: string | null;
    steps: Step[];
  }) => ({
    loading: initialState.loading ?? false,
    error: initialState.error ?? null,
    steps: initialState.steps ?? [],
  }),
  {
    STARTED: (state, payload: { id: number }) => {
      state.loading = payload.id > 0;
    },
    FINISHED: (state) => {
      state.loading = false;
    },
    ERROR: (state, error: string | null) => {
      state.error = error;
    },
    STEPS: (state, steps: Step[]) => {
      state.steps = steps;
    },
  },
);

describe('store-2 type inference', () => {
  it('keeps strong typing for state, setters and actions', () => {
    expectTypeOf(userStore.get('loading')).toEqualTypeOf<boolean>();
    expectTypeOf(userStore.get('error')).toEqualTypeOf<string | null>();
    expectTypeOf(userStore.get('steps')).toEqualTypeOf<Step[]>();

    userStore.set('loading', true);
    userStore.set('loading', (previous) => !previous);
    userStore.dispatch('STARTED', { id: 1 });
    userStore.dispatch('ERROR', 'Network error');
    userStore.dispatch('FINISHED');

    const typeErrorAssertions = () => {
      // @ts-expect-error wrong key type
      userStore.set('loading', 'not-boolean');
      // @ts-expect-error wrong payload shape
      userStore.dispatch('STARTED', { id: 'bad' });
      // @ts-expect-error unknown action
      userStore.dispatch('MISSING_ACTION');
    };

    expectTypeOf(typeErrorAssertions).toBeFunction();
  });

  it('types Provider initialState from initializer input', () => {
    const [_Provider] = userStore.createContext();

    expectTypeOf<Parameters<typeof _Provider>[0]['initialState']>().toEqualTypeOf<
      { loading: boolean; error: string | null; steps: Step[] } | undefined
    >();
  });
});

describe('store-2 runtime', () => {
  const createCounterStore = () =>
    store(
      (initialState: { count?: number; label?: string } = {}) => ({
        count: initialState.count ?? 0,
        label: initialState.label ?? 'default',
      }),
      {
        INCREMENT: (state) => {
          state.count += 1;
        },
        SET_LABEL: (state, label: string) => {
          state.label = label;
        },
      },
    );

  it('supports get, set, subscribe, on and dispatch APIs', () => {
    const counterStore = createCounterStore();
    const stateUpdates: number[] = [];
    const countUpdates: number[] = [];

    const unsubState = counterStore.subscribe((state) => {
      stateUpdates.push(state.count);
    });

    const unsubCount = counterStore.on('count', (count) => {
      countUpdates.push(count);
    });

    counterStore.set('count', 3);
    counterStore.set('count', (previous) => previous + 2);
    counterStore.dispatch('INCREMENT');
    counterStore.dispatch('SET_LABEL', 'ready');

    expect(counterStore.get('count')).toBe(6);
    expect(counterStore.get('label')).toBe('ready');
    expect(stateUpdates).toEqual([3, 5, 6, 6]);
    expect(countUpdates).toEqual([3, 5, 6]);

    unsubState();
    unsubCount();
  });

  it('creates Provider/useContext integration using power-context', async () => {
    const counterStore = createCounterStore();
    const [Provider, useCounterContext] = counterStore.createContext();
    const user = userEvent.setup();

    const CounterView = () => {
      const contextStore = useCounterContext();
      const count = contextStore.use('count');
      const label = contextStore.use('label');

      return (
        <>
          <p>{count}</p>
          <p>{label}</p>
          <button type="button" onClick={() => contextStore.dispatch('INCREMENT')}>
            inc
          </button>
        </>
      );
    };

    render(
      <Provider initialState={{ count: 7, label: 'from-provider' }}>
        <CounterView />
      </Provider>,
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('from-provider')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'inc' }));

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(counterStore.get('count')).toBe(0);
  });
});


// npm -> 