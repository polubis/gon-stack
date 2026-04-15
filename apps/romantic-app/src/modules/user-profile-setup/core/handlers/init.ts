import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import { getConfig } from '../../integration/repository';
import type { Bus } from '../bus';

export const init = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_INIT').pipe(
    tap(() => {
      store.$isIdle.set(false);
      store.$isLoading.set(true);
      store.$error.reset();
      store.$isStarted.reset();
      store.$isFinished.reset();
      store.$isSaving.reset();
      store.$isSaved.reset();
      store.$activeStepIndex.reset();
      store.$steps.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(getConfig(ctrl.signal)).pipe(
        tap((steps) => {
          store.$steps.set(steps);
        }),
        catchError((error) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load profile setup configuration.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

const userStore = store(
  (initialState: { loading: boolean, error: string | null, steps: Step[] }) => ({
    loading: false,
    error: null,
    steps: [],
  }),
  {
    STARTED: (state, payload: { id: number }) => (state.loading = true),
    FINISHED: (state) => (state.loading = false),
    ERROR: (state, error) => (state.error = error),
    STEPS: (state, steps) => (state.steps = steps),
  },
);

export const [Provider, useContext] = userStore.createContext();

userStore.set('loading', (prev) => !prev);
userStore.set('loading', true);
userStore.get('loading');

userStore.subscribe((state) => {
  console.log(state);
});

userStore.on('loading', (value) => {
  console.log(value);
});

userStore.dispatch('STARTED', { id: 1 });

const Component = () => {
  const state = userStore.use();
  const loading = userStore.use('loading');
}

const WithProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider initialState={{ loading: false, error: null, steps: [] }}>{children}</Provider>;
};