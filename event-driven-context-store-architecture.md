# Trigger, Store, Repeat: Wiring React State the Event-Driven Way

Most React apps start the same way: a `useState` here, a `useReducer` there, maybe a Context for the "global" stuff. It works fine until it doesn't - until a button click needs to trigger an API call, which needs to update three unrelated parts of the UI, which need to notify another module entirely. Suddenly your component is doing orchestration, data fetching, and rendering all at once, and nobody wants to touch it anymore.

This is the problem an event-driven architecture combined with a store and React Context is built to solve. It sounds like three separate concepts bolted together, but in practice they form one coherent pipeline: events describe what happened, a store holds the resulting state, and Context delivers that state to the component tree without prop drilling.

Everything below is illustrated with real, working code from two modules inside `apps/romantic-app`: `chat-2` (a chat interface) and `user-profile-setup` (an onboarding wizard). You can browse all of it in one place: [apps/romantic-app/src/modules on the `article/trigger-store-repeat-wiring-react-state-the-event-driven-way` branch](https://github.com/polubis/gon-stack/tree/article/trigger-store-repeat-wiring-react-state-the-event-driven-way/apps/romantic-app/src/modules) - every file path mentioned below lives under that folder, so this is the only link you'll need.

## The Problem: When Context Alone Isn't Enough

React Context is great at solving one problem: passing data down without threading props through every level. It is not, by itself, a state management solution. If you put a raw `useState` value in a Context provider, every consumer re-renders on every change, and you still have no clear place to put "what happens when the user does X" logic.

The missing piece is a way to separate three concerns that tend to get mixed together in a typical component:

- **What happened** (the user clicked "send", a websocket message arrived, a timer fired).
- **What should happen as a result** (call an API, run validation, start another process).
- **What the UI should show now** (the current state, derived from everything that has happened so far).

An event bus handles the first two. A store handles the third. Context is just the delivery mechanism that connects both to your components.

![Little diagram with architecture](https://firebasestorage.googleapis.com/v0/b/markdown-b9f5e.appspot.com/o/OWnL9ANsCfO1FxOyeDx918LFnFH3%2Fimages%2Ffb66ca32-526c-44b2-b923-5a4c75f1fd1c?alt=media)

> Keep in mind. Anti-pattern might be too big a word. Sometimes just be pragmatic, but I'm mostly talking about apps that are more complex than todo apps. In these, nobody needs the things I'm presenting today.

## Anatomy of the Pattern: Bus, Store, and Context

### The Event Bus: Triggers, Tasks, Facts, and Effects

At the center of the pattern is an event bus - a single stream that every part of the module can publish to and subscribe from. In `gon-stack` it lives in a small, reusable library: `apps/romantic-app/src/libs/eda/index.tsx`. It wraps an RxJS `Subject`, which gives you operators like `filter` and `map` for free, and it enforces a naming convention so events never turn into an unreadable soup of ad-hoc strings:

- `[TRIGGER]_*` - something the user or the outside world did.
- `[TASK]_*` - work that needs to happen in response.
- `[FACT]_*` - something that is now true and should update state.
- `[EFFECT]_*` - a side effect that isn't state, like logging or analytics.

A module declares its own event union against these four shapes, for example `chat-2/contracts/events.ts`:

```typescript
export type Event =
  | TriggerEvent<'[TRIGGER]_BOOTSTRAP'>
  | TriggerEvent<'[TRIGGER]_SELECT_THREAD', { threadId: string }>
  | TriggerEvent<'[TRIGGER]_UPDATE_DRAFT', { body: string }>
  | TriggerEvent<'[TRIGGER]_SEND_MESSAGE'>
  | TriggerEvent<'[TRIGGER]_RETRY_CONNECTION'>
  | TriggerEvent<'[TRIGGER]_UPDATE_SEARCH', { query: string }>;
```

This convention alone solves a surprising amount of confusion: anyone reading an event name immediately knows whether it is an intent, a side effect in progress, a completed fact, or a UI-only effect.

### The Store: A Single Source of Truth

Facts are only useful if something durable reacts to them. That is the store's job: a small collection of atoms (individual pieces of state) that get updated when the relevant fact arrives, and that components can subscribe to directly. `gon-stack` builds its atoms on top of `nanostores` in `packages/react-kit/src/supa-store.ts`, which adds `reset()`, `getInitial()`, and a `use()` hook to every atom.

`chat-2/core/store.ts` shows a real module store, atoms and derived `computed` values side by side:

```typescript
export const createStore = () => {
  const $threads = atom<Thread[]>([]);
  const $selectedThreadId = atom<ThreadId>('');
  const $messagesByThread = atom<Record<ThreadId, Message[]>>({});
  const $searchQuery = atom('');

  return {
    $threads,
    $selectedThreadId,
    $messagesByThread,
    $searchQuery,
    $activeMessages: computed(
      [$messagesByThread, $selectedThreadId],
      (messagesByThread, selectedThreadId) =>
        messagesByThread[selectedThreadId] ?? [],
    ),
    $filteredThreads: computed([$threads, $searchQuery], (threads, query) =>
      threads.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()),
      ),
    ),
  };
};
```

Crucially, the store does not know or care who triggered the event - it just gets `.set(...)` calls from handlers. This keeps it decoupled from any particular UI flow.

### The Context: Wiring It All Together

Context's only responsibility here is to hand components a reference to the store (and a way to publish triggers) without every component needing to know how the bus or store were constructed. `gon-stack` has a generic, reusable factory for this in `packages/react-kit/src/context.tsx` - it takes a name and a hook, and returns a typed `Provider` plus a `useContext` that throws if you forget to wrap your tree.

Each module composes that factory with its own store and registry into a **mediator** - see `chat-2/core/mediator.ts` and `chat-2/presentation/context.tsx`:

```typescript
// core/mediator.ts
export const createMediator = () => {
  const store = createStore();
  const { trigger, registry } = createRegistry(store);
  return [store, trigger, registry] as const;
};
```

```tsx
// presentation/context.tsx
export const [Provider, useContext] = context('Chat2', () => {
  const [store, trigger, registry] = useState(createMediator)[0];
  const value = useState(() => ({ ...store, trigger }))[0];

  useLayoutEffect(() => {
    const unsub = registry();
    return () => unsub();
  }, [registry]);

  return value;
});
```

Components never import the bus or the store directly. They call `useContext()`, read individual atoms (subscribing to just the slice they need), and call `trigger(...)` to kick off intents.

## Application #1: Decoupling User Actions from Side Effects

Consider a "send message" button. Without this pattern, the component that owns the button often ends up owning the fetch call, the loading state, the error handling, and the optimistic update logic too - all mixed into one `onClick` handler.

With triggers and facts, the component's job stays this small. From `chat-2/presentation/chat.tsx`:

```tsx
const { trigger } = ctx;

const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    trigger('[TRIGGER]_SEND_MESSAGE');
  }
};
```

Everything else - the API call, the optimistic message insertion, retry logic, turning a success or failure into a fact - lives in a handler file that has nothing to do with rendering. `chat-2/core/handlers/send-message.ts` reacts to the trigger, updates the store optimistically, calls the API, and reconciles the result:

```typescript
export const sendMessage = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_SEND_MESSAGE').pipe(
    exhaustMap(() => {
      const draft = store.$draft.get().trim();
      const threadId = store.$selectedThreadId.get();
      if (!draft || !threadId) return EMPTY;

      store.$draft.set('');
      store.$isSending.set(true);
      // ...optimistically append the user's message, then call the API
    }),
  );
```

You can unit test this handler with a fake store and zero React involved - it is just "event in, store update(s) out."

## Application #2: Keeping Components Reactive Without Prop Drilling

Because components subscribe to individual atoms rather than a single monolithic context value, adding a new consumer deep in the tree costs nothing. In `chat.tsx`, each piece of UI state is read independently:

```tsx
const isBootstrapping = ctx.$isBootstrapping.use();
const activeThread = ctx.$activeThread.use();
const activeMessages = ctx.$activeMessages.use();
const connection = ctx.$connection.use();
```

This also solves the classic "Context causes every consumer to re-render" complaint: the Context value itself (the store and trigger references) never changes after mount, so only the atom subscriptions - scoped to whichever slice of state a component actually reads - trigger re-renders.

The whole module then bootstraps itself in one line. `chat-2/presentation/main.tsx`:

```tsx
const Content = () => {
  const { trigger } = useContext();
  useEffect(() => {
    trigger('[TRIGGER]_BOOTSTRAP');
  }, [trigger]);
  return <Chat />;
};

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
```

## Application #3: Cross-Module Communication

The same bus that powers one module's internal flow can be used to let separate modules talk to each other without importing each other's internals. A module can listen for a `[FACT]_*` published elsewhere and react to it - say, unlocking an achievement when a first message is sent - without knowing anything about the sending module's store shape. The only contract between two modules is the shape of the events they agree to exchange, defined once in a shared `contracts` file, not a tangle of direct imports.

## Advanced Patterns: Registries and Testability

One refinement makes this pattern scale past a handful of events: **a registry**. Instead of scattering subscriptions everywhere, a single function collects every handler for a module and wires them up (and tears them down) in one place. `chat-2/core/registry.ts`:

```typescript
export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    bootstrap(store, ofType),
    selectThread(store, ofType),
    updateDraft(store, ofType),
    sendMessage(store, ofType),
    retryConnection(store, ofType),
    updateSearch(store, ofType),
  );

  return { trigger, registry };
};
```

`createRegistry` (defined in `libs/eda/index.tsx`) merges every handler stream, wraps each one in its own error boundary so a bug in one handler doesn't take down the others, and returns a single `unsubscribe` function - which is exactly what `context.tsx` calls inside its `useLayoutEffect` cleanup. One file to check when debugging "why didn't this fact fire," and one place that guarantees nothing leaks when the provider unmounts.

Because every handler is just "event in, store update(s) out," each one - `sendMessage`, `selectThread`, `bootstrap` - can be tested in isolation: emit a trigger into a bus, assert on what the store looks like afterward. No rendering, no DOM, no mocking React at all.

### A Note on Ordering and Race Conditions

Decoupling triggers from facts buys clarity, but it also reintroduces a problem you may recognize from `fetch` calls fired in quick succession: nothing guarantees an async handler resolves in the order its trigger was emitted. `send-message.ts` handles this with RxJS's `exhaustMap`, which ignores new `[TRIGGER]_SEND_MESSAGE` events while one is already in flight, and cancels its own in-flight request with an `AbortController` on `finalize`:

```typescript
const ctrl = new AbortController();

return from(postAssistantReply({ threadId, body: draft }, ctrl.signal)).pipe(
  // ...update the store with the reply, or set an error fact
  finalize(() => {
    store.$isSending.reset();
    ctrl.abort();
  }),
);
```

This is a small addition, but it is the difference between an event-driven store that is merely elegant and one that stays correct under real, messy user behavior.

## A Second Example: Hiding the Bus Behind a Facade

`chat-2` puts atoms and `trigger(...)` directly into context, which is fine when the components consuming them are written by people comfortable with that vocabulary. `user-profile-setup` - the step-by-step onboarding wizard that collects a user's profile answers - takes it one step further with a **facade**, so components never see a `$` atom or a trigger string at all.

The events and store follow the same shape as before. `user-profile-setup/domain/events.ts`:

```typescript
export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_START'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_NEXT', Answers>
  | TriggerEvent<'[TRIGGER]_EDIT_ANSWERS'>
  | TriggerEvent<'[TRIGGER]_SAVE_ANSWERS'>;
```

`user-profile-setup/core/handlers/next.ts` reacts to `[TRIGGER]_NEXT`, merges the submitted answers into the current step, and either advances `$activeStepIndex` or flips `$isFinished` once the last step is reached - ordinary event-in, store-update-out handler logic.

The new piece is `user-profile-setup/core/facade.ts`, which wraps the store and the trigger function in a single object of plain, named methods:

```typescript
export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    start: () => trigger('[TRIGGER]_START'),
    prev: () => trigger('[TRIGGER]_PREV'),
    next: (payload: Answers) => trigger('[TRIGGER]_NEXT', payload),
    saveAnswers: () => trigger('[TRIGGER]_SAVE_ANSWERS'),
    useActiveStep: () => store.$activeStep.use(),
    useProgressPercentage: () => store.$progressPercentage.use(),
    useHasPreviousStep: () => store.$hasPreviousStep.use(),
    // ...and one more pair per atom the UI needs
  };
};
```

`user-profile-setup/core/mediator.ts` composes store, registry, and facade together, and `user-profile-setup/presentation/context.tsx` puts the **facade** - not the raw store - into context:

```tsx
export const [Provider, useContext] = context(
  FEATURE_NAME,
  ({ mediatorFactory } = { mediatorFactory: createMediator }) => {
    const [{ facade, register }] = useState(mediatorFactory);

    useLayoutEffect(() => {
      const unsub = register();
      return () => unsub();
    }, [register]);

    return facade;
  },
);
```

A component now calls `useContext().useActiveStep()` and `useContext().next(answers)` - readable method names instead of raw event strings, with the exact same bus-plus-store machinery running underneath. The injectable `mediatorFactory` default is a small bonus: tests can pass in a fake mediator without touching RxJS or nanostores at all.

Which style to reach for is a judgment call, not a rule: `chat-2`'s direct-atom approach keeps the seam thin when the module's own team is writing both the store and the components; a facade like `user-profile-setup`'s is worth the extra file when a module's public surface should read like a small, stable API rather than an implementation detail.

## Summary

Event-driven architecture, a store, and React Context are not competing state management solutions - they are three layers that each do one job well:

- **The bus** captures intent and turns it into a traceable sequence of triggers, tasks, facts, and effects.
- **The store** turns facts into durable, subscribable state, with no knowledge of who caused them.
- **Context** delivers that store (and a way to trigger events) to components, without prop drilling and without every consumer re-rendering on every change.

The result is components that stay small and declarative, business logic that lives in testable handler functions instead of `onClick` callbacks, and modules that can grow independently because their only shared contract is a set of well-named events. If your app's state is starting to feel tangled between UI, side effects, and cross-component communication, this is a pattern worth reaching for before you reach for a heavier state management library.
