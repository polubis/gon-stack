import { useEffect, type ReactNode } from 'react';
import { store } from './index';

type Step = {
  id: number;
  title: string;
};

type UserSetupState = {
  loading: boolean;
  error: string | null;
  steps: Step[];
};

type UserSetupInitialState = Partial<UserSetupState>;

export const userSetupStore = store(
  (initialState: UserSetupInitialState) => ({
    loading: initialState.loading ?? false,
    error: initialState.error ?? null,
    steps: initialState.steps ?? [],
  }),
  {
    STARTED: (state, payload: { id: number }) => {
      state.loading = payload.id > 0;
      state.error = null;
    },
    FINISHED: (state) => {
      state.loading = false;
    },
    ERROR: (state, error: string | null) => {
      state.error = error;
      state.loading = false;
    },
    STEPS: (state, steps: Step[]) => {
      state.steps = steps;
    },
  },
);

export const [UserSetupProvider, useUserSetupContext] = userSetupStore.createContext();

export const storeOutsideReactExample = () => {
  userSetupStore.set('loading', true);
  userSetupStore.set('loading', (previous) => !previous);

  const loading = userSetupStore.get('loading');
  const allState = userSetupStore.get();

  const unsubscribeState = userSetupStore.subscribe((state) => {
    console.log('state changed', state);
  });

  const unsubscribeLoading = userSetupStore.on('loading', (value) => {
    console.log('loading changed', value);
  });

  userSetupStore.dispatch('STARTED', { id: 1 });
  userSetupStore.dispatch('STEPS', [{ id: 1, title: 'Basics' }]);

  unsubscribeState();
  unsubscribeLoading();

  return { loading, allState };
};

export const UserSetupPanel = () => {
  const state = userSetupStore.use();
  const loading = userSetupStore.use('loading');

  return (
    <section>
      <p>Loading: {String(loading)}</p>
      <p>Error: {state.error ?? 'none'}</p>
      <p>Steps: {state.steps.length}</p>
      <button
        type="button"
        onClick={() => userSetupStore.dispatch('STARTED', { id: 1 })}
      >
        Start
      </button>
      <button type="button" onClick={() => userSetupStore.dispatch('FINISHED')}>
        Finish
      </button>
    </section>
  );
};

const UserSetupContextPanel = () => {
  const contextStore = useUserSetupContext();
  const loading = contextStore.use('loading');
  const error = contextStore.use('error');

  useEffect(() => {
    const unsubscribe = contextStore.on('error', (value) => {
      if (value) {
        console.log('context error', value);
      }
    });
    return () => unsubscribe();
  }, [contextStore]);

  return (
    <section>
      <p>Context loading: {String(loading)}</p>
      <p>Context error: {error ?? 'none'}</p>
      <button
        type="button"
        onClick={() => contextStore.dispatch('ERROR', 'Something went wrong')}
      >
        Set Error
      </button>
    </section>
  );
};

export const UserSetupExampleWithProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  return (
    <UserSetupProvider
      initialState={{
        loading: false,
        error: null,
        steps: [{ id: 1, title: 'Intro' }],
      }}
    >
      <UserSetupContextPanel />
      {children}
    </UserSetupProvider>
  );
};
