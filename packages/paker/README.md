# @repo/paker

Tiny state manager. Zero runtime deps. `react` and `rxjs` are optional peers. Subpath imports only, no barrel.

| Import                      | Exports                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `@repo/paker/value`         | `value`, types `Value`, `Readable`, `InferValue`             |
| `@repo/paker/store`         | `store`, types `Store`, `InferStore`                         |
| `@repo/paker/actions`       | `actions`, `patches`, `forward`, `forwardPatch`, `InferActions` |
| `@repo/paker/adapters/rxjs` | `events`, `forward`, `skipOn`                                |

Naming: values and stores end with `$` (`count$`).

## value

```ts
const count$ = value(0); // or value(() => expensive()): lazy, runs once on first read
count$.get();
count$.set(1);
count$.set((n) => n + 1);
count$.getInitial();
count$.reset();
const off = count$.subscribe((current, previous) => {});
const n = count$(); // React hook (useSyncExternalStore, server snapshot = initial)
```

A function passed to `value` or `set` is always an initializer / updater.

Objects and arrays get immutable key helpers:

```ts
const user$ = value({ name: 'a', age: 1 });
user$.getKey('name');
user$.setKey('age', (age) => age + 1);
user$.subscribeKey('name', (current, previous) => {}); // fires only when that key changed
```

Computed, read-only:

```ts
const sum$ = value([a$, b$], (a, b) => a + b);
```

## store

Object of values plus whole-state API. Whole `set`/`reset` notify once.

```ts
const s = store({ count: 0, name: 'a' });
s.count$.set(1);
s.get(); // { count: 1, name: 'a' }
s.set((prev) => ({ ...prev, count: 2 }));
s.reset();
s.subscribe((current, previous) => {});
const state = s(); // React hook
```

Keys must not hold functions.

## actions

Reducers get the current state first. Async reducers return a promise; the result is applied on resolve.

```ts
const { add, addLater } = actions(count$, {
  add: (current, by: number) => current + by,
  addLater: async (current, by: number) => current + by,
});

const { rename } = patches(s, { rename: (_, name: string) => ({ name }) }); // returns Partial, merged

const stop = forward(source$, target$, (v) => map(v)); // map optional
forwardPatch(source$, s, (v) => ({ count: v }));
```

## rxjs

```ts
events(count$); // Observable<{ current, previous }>
forward(stream$, target$, map?); // Subscription
stream$.pipe(skipOn(busy$)); // drop emissions while busy$.get() is true
```

## Full flow

`actions`/`patches` return the target with bound actions attached (hooks and `key$` stay). `rxjs` adds typed events:

```ts
const app = rxjs(
  actions(store({ users: [] as User[], loading: false }), {
    reset: (current) => ({ ...current, users: [] }),
  }),
  ({ loading$, receive }, { forward, skipOn, emit }) => ({
    FETCH: (event$: Observable<void>) =>
      event$.pipe(skipOn(loading$), switchMap(() => from(api())), forward('RECEIVE_USERS')),
    RECEIVE_USERS: (event$: Observable<User[]>) => event$.pipe(tap(receive)),
  }),
);
const stop = app.register(); // subscribe handlers
app.emit('FETCH'); // payload typed from the handler stream
```

Payload type comes from the handler `Observable<P>` annotation. `forward(name)` and `emit(name)` inside the setup callback are not name-checked.

## Scripts

`check-types`, `lint`, `test`, `test:coverage` (100% thresholds), `build`.
