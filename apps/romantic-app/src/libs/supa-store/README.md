# Gen-Store: Enhanced State Management for React

A lightweight, type-safe state management library built on top of [nanostores](https://github.com/nanostores/nanostores) with enhanced utility methods and React integration.

> 📚 **Further Reading:** [Nanostores Documentation](https://github.com/nanostores/nanostores#readme)

## Overview

Gen-Store provides three core primitives for managing application state:

```
ATOM          MAP           COMPUTED
  ↓             ↓               ↓
Primitive   Object with     Derived
 Values     Key-Level       Values
           Reactivity
```

All primitives come with built-in React hooks, reset functionality, and TypeScript support.

---

## Quick Start

### 1. Define State

```typescript
// store.ts
import { atom, map, computed } from "@/gen-store";

// Atoms for primitive/simple values
export const $idle = atom(true);
export const $error = atom<string | null>(null);
export const $question = atom("");

// Maps for objects with key-level updates
export const $threads = map<Record<ThreadId, Thread>>({});
export const $messages = map<Record<MessageId, Message>>({});

// Computed for derived values
export const $threadsList = computed($threads, (threads) =>
  Object.values(threads).sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  ),
);
```

### 2. Use in React Components

```tsx
// MyComponent.tsx
import { $question, $threadsList, $error } from "./store";

const MyComponent = () => {
  // Use the .use() hook for reactive updates
  const question = $question.use();
  const threads = $threadsList.use();
  const error = $error.use();

  return (
    <div>
      <input value={question} onChange={(e) => $question.set(e.target.value)} />
      {threads.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

### 3. Update State from Anywhere

```typescript
// api-handlers.ts
import * as store from "./store";

export const initializeApp = async () => {
  const { threads, examples } = await api.getConfig();
  store.$threads.set(toThreadsObject(threads));
  store.$examples.set(examples);
  store.$idle.set(false);
};

export const resetApp = () => {
  // Reset all stores to initial values
  store.$examples.reset();
  store.$threads.reset();
  store.$idle.reset();
  store.$error.reset();
};
```

---

## API Reference

### `atom<TValue>(initialValue)`

Creates an enhanced atom store for primitive or complex values.

| Method         | Description                        |
| -------------- | ---------------------------------- |
| `get()`        | Returns current value              |
| `set(value)`   | Sets new value                     |
| `reset()`      | Resets to initial value            |
| `getInitial()` | Returns initial value              |
| `use()`        | React hook - subscribes to changes |

```typescript
const $count = atom(0);

// Read value
const current = $count.get();

// Update value
$count.set(5);

// Reset to initial
$count.reset(); // now 0

// React component
const Counter = () => {
  const count = $count.use();
  return <span>{count}</span>;
};
```

### `map<TValue>(initialValue)`

Creates an enhanced map store for objects with key-level reactivity.

| Method               | Description                        |
| -------------------- | ---------------------------------- |
| `get()`              | Returns current object             |
| `set(value)`         | Replaces entire object             |
| `setKey(key, value)` | Updates single key (efficient)     |
| `removeKey(key)`     | Removes a key from the map         |
| `reset()`            | Resets to initial value            |
| `getInitial()`       | Returns initial value              |
| `use()`              | React hook - subscribes to changes |

```typescript
const $messages = map<Record<MessageId, Message>>({});

// Add/update single entry (efficient - doesn't replace whole object)
$messages.setKey(messageId, newMessage);

// Remove entry
$messages.removeKey(messageId);

// Replace entire map
$messages.set(newMessagesObject);

// Reset to empty
$messages.reset();

// React component
const MessageList = () => {
  const messages = $messages.use();
  return Object.values(messages).map(msg => <Message key={msg.id} {...msg} />);
};
```

### `computed(stores, callback)`

Creates a derived store that automatically updates when source stores change.

| Method  | Description                        |
| ------- | ---------------------------------- |
| `get()` | Returns current computed value     |
| `use()` | React hook - subscribes to changes |

```typescript
// Single store computed
const $messagesList = computed($messages, (messages) =>
  Object.values(messages)
);

// Multiple stores computed
const $activeThread = computed(
  [$activeThreadId, $threads],
  (activeThreadId, threads) => {
    if (activeThreadId === null) return null;
    return threads[activeThreadId] ?? null;
  },
);

// Combining multiple flags
const $isBusy = computed(
  [$isStartingThread, $isLoadingThread],
  (...args) => args.some((flag) => flag),
);

// React component
const ThreadStatus = () => {
  const isBusy = $isBusy.use();
  return isBusy ? <Spinner /> : null;
};
```

---

## Patterns

### Atom for Simple State

Use atoms for primitive values, flags, and simple objects that update as a whole.

```typescript
export const $idle = atom(true);
export const $error = atom<string | null>(null);
export const $isStartingThread = atom(false);
export const $isLoadingThread = atom(false);
export const $question = atom("");
export const $activeThreadId = atom<ThreadId | null>(null);
export const $activeMessage = atom<MessageWithSources | null>(null);
export const $outputEvents = atom<OutputEvent[]>([]);
```

### Map for Collections

Use maps when you need to update individual keys efficiently without replacing the entire object.

```typescript
export const $threads = map<Record<ThreadId, Thread>>({});
export const $messages = map<Record<MessageId, Message>>({});

// Efficient: only updates one key
$messages.setKey(messageId, updatedMessage);

// Less efficient for single updates: replaces entire object
$messages.set({ ...messages, [messageId]: updatedMessage });
```

### Computed for Derived State

Use computed stores to derive values from other stores. The computed value updates automatically when dependencies change.

```typescript
// Convert map to sorted array
export const $threadsList = computed($threads, (threads) =>
  Object.values(threads).sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
  ),
);

// Derive status from multiple sources
export const $activeThreadStatus = computed(
  [$activeThread, $isBusy],
  (activeThread, isBusy) => {
    if (isBusy || activeThread === null) return "unknown";
    return activeThread.open ? "opened" : "closed";
  },
);
```

### Batch State Reset

Reset multiple stores at once during cleanup or state transitions.

```typescript
export const resetAllState = () => {
  store.$examples.reset();
  store.$threads.reset();
  store.$idle.reset();
  store.$error.reset();
  store.$isStartingThread.reset();
  store.$isLoadingThread.reset();
  store.$outputEvents.reset();
  store.$activeThreadId.reset();
  store.$messages.reset();
  store.$question.reset();
  store.$clarification.reset();
  store.$activeMessage.reset();
};
```

### Accumulating Values

Append to array-based atoms using get/set pattern.

```typescript
const addOutputEvent = (
  content: string,
  type: OutputEvent["type"] = "error",
) => {
  store.$outputEvents.set([
    ...store.$outputEvents.get(),
    {
      content,
      type,
      id: crypto.randomUUID() as OutputEventId,
    },
  ]);
};
```

---

## Good Practices ✅

### ✅ Use Dollar Prefix Convention

```typescript
// Good - clear store identification
export const $count = atom(0);
export const $user = map({ name: "", email: "" });

// Bad - looks like regular variable
export const count = atom(0);
```

### ✅ Type Your Stores Explicitly

```typescript
// Good - explicit types for nullable/generic values
export const $error = atom<string | null>(null);
export const $threads = map<Record<ThreadId, Thread>>({});

// Bad - relies on inference for complex types
export const $error = atom(null);
```

### ✅ Use setKey for Map Updates

```typescript
// Good - efficient single key update
store.$messages.setKey(messageId, newMessage);

// Bad - replaces entire map
store.$messages.set({
  ...store.$messages.get(),
  [messageId]: newMessage,
});
```

### ✅ Colocate Related State

```typescript
// store.ts - all module state in one file
export const $idle = atom(true);
export const $error = atom<string | null>(null);
export const $threads = map<Record<ThreadId, Thread>>({});

// Computed values derived from above
export const $threadsList = computed($threads, ...);
```

### ✅ Use Computed for Derived State

```typescript
// Good - automatic updates when dependencies change
export const $isBusy = computed(
  [$isStartingThread, $isLoadingThread],
  (...args) => args.some((flag) => flag),
);

// Bad - manual tracking in component
const Component = () => {
  const starting = $isStartingThread.use();
  const loading = $isLoadingThread.use();
  const isBusy = starting || loading; // Calculated every render
};
```

---

## Bad Practices ❌

### ❌ Don't Mutate Store Values Directly

```typescript
// Bad - mutation doesn't trigger updates
const messages = $messages.get();
messages[id] = newMessage; // ❌ No reactivity!

// Good - use setKey
$messages.setKey(id, newMessage);
```

### ❌ Don't Create Stores Dynamically

```typescript
// Bad - loses reactivity benefits
const createStore = () => atom(0);
const $count = createStore(); // New store each call

// Good - define stores statically
export const $count = atom(0);
```

### ❌ Don't Skip the .use() Hook

```typescript
// Bad - no reactivity
const Component = () => {
  const value = $count.get(); // Won't re-render on changes!
  return <span>{value}</span>;
};

// Good - reactive
const Component = () => {
  const value = $count.use();
  return <span>{value}</span>;
};
```

### ❌ Don't Use Maps for Frequently-Replaced Objects

```typescript
// Bad - map overhead for simple object
const $formData = map({ name: "", email: "", phone: "" });
$formData.set(newFormData); // Always replacing whole object

// Good - atom for whole-object updates
const $formData = atom({ name: "", email: "", phone: "" });
```

---

## File Structure

```
my-module/
├── contracts/
│   └── models.ts        # Domain types (ThreadId, Message, etc.)
├── core/
│   └── store.ts         # State atoms, maps, computed ← Gen-Store
├── integration/
│   └── api.ts           # API calls
└── presentation/
    └── main.tsx         # React components (uses .use() hooks)
```

---

## Complete Example

```typescript
// store.ts - Define state
import { atom, map, computed } from '@/gen-store';

export const $isLoading = atom(false);
export const $data = atom<Data | null>(null);
export const $items = map<Record<string, Item>>({});
export const $itemsList = computed($items, (items) => Object.values(items));

// api.ts - Update state from async operations
import * as store from './store';

export const fetchData = async () => {
  store.$isLoading.set(true);
  try {
    const data = await api.getData();
    store.$data.set(data);
  } finally {
    store.$isLoading.set(false);
  }
};

// Component.tsx - React to state changes
import { $isLoading, $data, $itemsList } from './store';

const Component = () => {
  const isLoading = $isLoading.use();
  const data = $data.use();
  const items = $itemsList.use();

  if (isLoading) return <Spinner />;
  return <DataView data={data} items={items} />;
};
```

---

## When to Use Each Primitive

| Use Case                     | Primitive  | Example                        |
| ---------------------------- | ---------- | ------------------------------ |
| Boolean flags                | `atom`     | `$isLoading`, `$isOpen`        |
| Nullable values              | `atom`     | `$error`, `$activeId`          |
| Simple strings/numbers       | `atom`     | `$question`, `$count`          |
| Arrays (full replacement)    | `atom`     | `$outputEvents`                |
| Record/Dictionary            | `map`      | `$threads`, `$messages`        |
| Key-level updates needed     | `map`      | `$users[userId] = user`        |
| Derived from single store    | `computed` | `$threadsList` from `$threads` |
| Derived from multiple stores | `computed` | `$isBusy` from flags           |
| Filtered/sorted views        | `computed` | `$sortedItems`                 |
