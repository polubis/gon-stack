import { act, render, renderHook, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createElement, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { from, map, switchMap, tap } from 'rxjs';
import type { Observable } from 'rxjs';
import { actions, patches } from '../actions.js';
import { rxjs, type Operators } from '../adapters/rxjs.js';
import { store } from '../store.js';
import { value } from '../value.js';

type User = { id: number; name: string };

type AppState = {
  users: User[];
  count: number;
  loading: boolean;
};

type UsersApi = () => Promise<User[]>;

const initialAppState = (): AppState => ({
  users: [],
  count: 0,
  loading: false,
});

const createAppStore = (api: UsersApi) =>
  patches(
    actions(store(initialAppState()), {
      incrementBy: (current, by: number) => ({
        ...current,
        count: current.count + by,
      }),
    }),
    {
      setLoading: (_, loading: boolean) => ({ loading }),
      receive: (_, users: User[]) => ({ users, loading: false }),
      fetchLater: async () => ({ users: await api(), loading: false }),
    },
  );

type AppTarget = ReturnType<typeof createAppStore>;

const createAppHandlers =
  (api: UsersApi) =>
  (
    { loading$, setLoading, receive, incrementBy, fetchLater }: AppTarget,
    { forward, skipOn, emit }: Operators,
  ) => ({
    FETCH: (event$: Observable<void>) =>
      event$.pipe(
        skipOn(loading$),
        tap(() => setLoading(true)),
        switchMap(() => from(api())),
        forward('RECEIVE_USERS'),
      ),
    RECEIVE_USERS: (event$: Observable<User[]>) =>
      event$.pipe(
        tap((users) => receive(users)),
        map((users) => users.length),
        tap((length) => incrementBy(length)),
      ),
    RETRY: (event$: Observable<void>) => event$.pipe(tap(() => emit('FETCH'))),
    FETCH_LATER: (event$: Observable<void>) =>
      event$.pipe(tap(() => void fetchLater())),
  });

const createApp = (api: UsersApi) =>
  rxjs(createAppStore(api), createAppHandlers(api));

const deferred = () => {
  let resolve!: (users: User[]) => void;
  const promise = new Promise<User[]>((r) => (resolve = r));
  return { promise, resolve };
};

const USERS: User[] = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Linus' },
];

const Users = ({ app }: { app: ReturnType<typeof createApp> }) => {
  const users = app.users$();
  const loading = app.loading$();

  return (
    <section>
      <button onClick={() => app.emit('FETCH')}>Fetch users</button>
      {loading && <p role="status">Loading</p>}
      <ul aria-label="Users">
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </section>
  );
};

describe('paker full flow', () => {
  it('user fetches users and sees them listed', async () => {
    const app = createApp(async () => USERS);
    const unregister = app.register();
    render(<Users app={app} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fetch users' }));

    expect(await screen.findByText('Linus')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unregister();
  });

  it('user sees loading while users are on the way', async () => {
    const { promise, resolve } = deferred();
    const app = createApp(() => promise);
    const unregister = app.register();
    render(<Users app={app} />);

    await userEvent.click(screen.getByRole('button', { name: 'Fetch users' }));

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    await act(async () => resolve(USERS));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unregister();
  });

  it('second fetch while loading is skipped', async () => {
    const { promise, resolve } = deferred();
    const api = vi.fn(() => promise);
    const app = createApp(api);
    const unregister = app.register();
    render(<Users app={app} />);
    const button = screen.getByRole('button', { name: 'Fetch users' });

    await userEvent.click(button);
    await userEvent.click(button);
    await act(async () => resolve(USERS));

    expect(api).toHaveBeenCalledOnce();
    unregister();
  });

  it('forwarded event updates counter through an action', async () => {
    const app = createApp(async () => USERS);
    const unregister = app.register();

    app.emit('FETCH');
    await vi.waitFor(() => expect(app.count$.get()).toBe(2));

    expect(app.get()).toEqual({ users: USERS, count: 2, loading: false });
    unregister();
  });

  it('async action applies its patch', async () => {
    const app = createApp(async () => USERS);
    const unregister = app.register();

    app.emit('FETCH_LATER');

    await vi.waitFor(() => expect(app.users$.get()).toEqual(USERS));
    expect(app.count$.get()).toBe(0);
    unregister();
  });

  it('handler can emit another event', async () => {
    const app = createApp(async () => USERS);
    const unregister = app.register();

    app.emit('RETRY');

    await vi.waitFor(() => expect(app.users$.get()).toEqual(USERS));
    unregister();
  });

  it('events are ignored after unregister', () => {
    const api = vi.fn(async () => USERS);
    const app = createApp(api);

    app.register()();
    app.emit('FETCH');

    expect(api).not.toHaveBeenCalled();
  });

  it('atomic key hook ignores changes of other keys', () => {
    const app = createApp(async () => USERS);
    const renders = vi.fn();
    const Count = () => {
      const count = app.count$();
      useEffect(() => renders(count));
      return <output aria-label="Count">{count}</output>;
    };
    render(<Count />);

    act(() => app.setLoading(true));
    act(() => app.incrementBy(3));

    expect(screen.getByLabelText('Count')).toHaveTextContent('3');
    expect(renders.mock.calls).toEqual([[0], [3]]);
  });

  it('whole store hook follows every key', () => {
    const app = createApp(async () => USERS);
    const { result } = renderHook(() => app());

    act(() => app.receive(USERS));

    expect(result.current).toEqual({ users: USERS, count: 0, loading: false });
  });

  it('fresh app per server render starts clean', () => {
    const first = createApp(async () => USERS);
    first.receive(USERS);
    const second = createApp(async () => USERS);

    const html = renderToString(createElement(Users, { app: second }));

    expect(html).not.toContain('Ada');
    expect(second.get().users).toEqual([]);
    expect(first.get().users).toEqual(USERS);
  });
});

describe('value with actions and rxjs', () => {
  const createCounter = () =>
    rxjs(
      actions(
        value(() => 10),
        { add: (current, by: number) => current + by },
      ),
      ({ add }, { forward }) => ({
        ADD: (event$: Observable<number>) =>
          event$.pipe(
            tap((by) => add(by)),
            forward('ADDED'),
          ),
        ADDED: (event$: Observable<number>) => event$,
      }),
    );

  it('events change the value and notify subscribers', () => {
    const counter = createCounter();
    const listener = vi.fn();
    counter.subscribe(listener);
    const unregister = counter.register();

    counter.emit('ADD', 5);

    expect(counter.get()).toBe(15);
    expect(listener).toHaveBeenCalledExactlyOnceWith(15, 10);
    unregister();
  });

  it('counters from separate instances stay independent', () => {
    const first = createCounter();
    const second = createCounter();
    const unregister = first.register();

    first.emit('ADD', 1);

    expect(first.get()).toBe(11);
    expect(second.get()).toBe(10);
    unregister();
  });

  it('hook shows the value', () => {
    const counter = createCounter();
    const { result } = renderHook(() => counter());

    act(() => counter.add(2));

    expect(result.current).toBe(12);
  });
});
