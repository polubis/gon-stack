# Gen-EDA: Event-Driven Architecture for React

A lightweight, type-safe, RxJS-based event-driven architecture for React applications.

Inspired by [Redux](https://redux.js.org/) and [redux-observable](https://redux-observable.js.org/).

> 📚 **Further Reading:** [RxJS Documentation](https://rxjs.dev/guide/overview) | [Redux Documentation](https://redux.js.org/) | [redux-observable Documentation](https://redux-observable.js.org/)

## Overview

Gen-EDA provides a structured way to manage application state and side effects through events. It follows a unidirectional data flow pattern with four event types:

```
TRIGGER → TASK → FACT → EFFECT
   ↓        ↓       ↓       ↓
  User    Async   State   Side
 Action   Work   Change  Effects
```

---

## Quick Start

### 1. Define Events

```typescript
// events.ts
import { eda } from "@repo/gen-eda";
import type { TriggerEvent, TaskEvent, FactEvent } from "@repo/gen-eda";

type Events =
  | TriggerEvent<"[TRIGGER]_LOAD_DATA">
  | TriggerEvent<"[TRIGGER]_SUBMIT", { formData: FormData }>
  | TaskEvent<"[TASK]_FETCH_DATA">
  | FactEvent<"[FACT]_DATA_LOADED", { items: Item[] }>
  | FactEvent<"[FACT]_SUBMIT_SUCCESS">;

export const { ofType, trigger, forwardAs, createRegistry } = eda<Events>();
```

### 2. Create Registry (Handlers)

```typescript
// registry.ts
import { switchMap, from, tap } from "rxjs";
import { ofType, forwardAs, createRegistry } from "./events";
import * as store from "./store";
import * as api from "./api";

export const register = createRegistry(
  // TRIGGER → TASK
  ofType("[TRIGGER]_LOAD_DATA").pipe(forwardAs("[TASK]_FETCH_DATA")),

  // TASK → FACT (async work)
  ofType("[TASK]_FETCH_DATA").pipe(
    switchMap(() =>
      from(api.fetchData()).pipe(forwardAs("[FACT]_DATA_LOADED")),
    ),
  ),

  // FACT → Store update
  ofType("[FACT]_DATA_LOADED").pipe(
    tap(({ items }) => store.$items.set(items)),
  ),
);
```

### 3. Connect to React

```tsx
// main.tsx
import { withEda } from "@repo/gen-eda";
import { trigger } from "./events";
import { register } from "./registry";

const Content = () => {
  useEffect(() => {
    trigger("[TRIGGER]_LOAD_DATA");
  }, []);

  return <YourComponent />;
};

export const Main = withEda(Content, register);
```

---

## API Reference

### `eda<TEvents>()`

Creates an EDA instance with type-safe event handling.

| Method                             | Description                                            |
| ---------------------------------- | ------------------------------------------------------ |
| `ofType(type)`                     | Filters events by type, returns payload Observable     |
| `ofAny()`                          | Returns Observable of all events                       |
| `trigger(type, payload?)`          | Emits TRIGGER events (user actions)                    |
| `emit(type, payload?)`             | Emits any event type                                   |
| `forwardAs(type)`                  | RxJS operator - emits event and passes payload through |
| `createRegistry(...streams)`       | Creates subscription manager for event handlers        |
| `createForwardErrorAs(parseError)` | Factory for error forwarding operators (see below)     |

### `createForwardErrorAs<TError>(parseError)`

Factory function that creates a type-safe error forwarding operator. Returned from `eda()` to ensure type safety with your event definitions.

| Parameter    | Type                                 | Description                                              |
| ------------ | ------------------------------------ | -------------------------------------------------------- |
| `parseError` | `(error: unknown) => TError \| null` | Error parser function. Return `null` to ignore the error |

**Returns:** A function that creates RxJS operators for error forwarding to FACT events.

### Event Types

| Type           | Pattern       | Purpose                                     |
| -------------- | ------------- | ------------------------------------------- |
| `TriggerEvent` | `[TRIGGER]_*` | User actions, entry points                  |
| `TaskEvent`    | `[TASK]_*`    | Async operations                            |
| `FactEvent`    | `[FACT]_*`    | State changes, completed actions            |
| `EffectEvent`  | `[EFFECT]_*`  | Cross-cutting concerns (logging, analytics) |

### `withEda(Component, register)`

HOC that manages EDA lifecycle - subscribes on mount, cleans up on unmount.

---

## Patterns

### Basic Flow: TRIGGER → TASK → FACT

```typescript
// User clicks button → API call → Store update
ofType('[TRIGGER]_SAVE').pipe(forwardAs('[TASK]_SAVE_DATA')),

ofType('[TASK]_SAVE_DATA').pipe(
  switchMap(() =>
    from(api.save(store.$data.get())).pipe(
      forwardAs('[FACT]_SAVED')
    )
  )
),

ofType('[FACT]_SAVED').pipe(
  tap(() => store.$isSaved.set(true))
),
```

### Error Handling with `forwardErrorAs`

Use `createForwardErrorAs` from the EDA instance to create a type-safe error handling operator:

```typescript
// events.ts
import { eda } from '@repo/gen-eda';

type AllEvents = TriggerEvents | TaskEvents | FactEvents;

const {
  ofAny,
  ofType,
  trigger,
  forwardAs,
  createRegistry,
  createForwardErrorAs,  // Destructure from eda()
} = eda<AllEvents>();

// 1. Define your error type
type AppError = { errorMessage: string; code?: number };

// 2. Create the error handler with your parser
export const forwardErrorAs = createForwardErrorAs<AppError>((error) => {
  if (error instanceof Error) {
    return { errorMessage: error.message };
  }
  return { errorMessage: 'Unknown error' };
});

// 3. Use in registry
ofType('[TASK]_FETCH').pipe(
  switchMap(() =>
    from(api.fetch()).pipe(
      forwardAs('[FACT]_SUCCESS'),
      forwardErrorAs('[FACT]_ERROR', (error) => ({
        message: error.errorMessage,
      }))
    )
  )
),
```

Since `createForwardErrorAs` is returned from `eda<AllEvents>()`, it's automatically type-bound to your event definitions.
Returning `null` from the parser will ignore the error (useful for aborted requests).

### Cancellation with takeUntil

```typescript
ofType('[TASK]_LOAD').pipe(
  switchMap(() =>
    from(api.load()).pipe(
      takeUntil(ofType('[TRIGGER]_CANCEL')), // Cancel on new trigger
      forwardAs('[FACT]_LOADED')
    )
  )
),
```

### Direct State Update (Simple Actions)

```typescript
// For simple state changes, TRIGGER → FACT is acceptable
ofType('[TRIGGER]_TOGGLE_MODAL').pipe(forwardAs('[FACT]_MODAL_TOGGLED')),

ofType('[FACT]_MODAL_TOGGLED').pipe(
  tap(() => store.$isModalOpen.set(!store.$isModalOpen.get()))
),
```

---

## Good Practices ✅

### ✅ Use Descriptive Event Names

```typescript
// Good
TriggerEvent<"[TRIGGER]_SUBMIT_CONTACT_FORM", { email: string }>;
FactEvent<"[FACT]_CONTACT_FORM_SUBMITTED">;

// Bad
TriggerEvent<"[TRIGGER]_SUBMIT">;
FactEvent<"[FACT]_DONE">;
```

### ✅ Keep Handlers Pure and Focused

```typescript
// Good - each handler does one thing
ofType('[FACT]_USER_LOADED').pipe(
  tap(({ user }) => store.$user.set(user))
),

ofType('[FACT]_USER_LOADED').pipe(
  tap(() => analytics.track('user_loaded'))
),
```

### ✅ Use `forwardAs` to Chain Events

```typescript
// Good - clear flow, events are traceable
ofType('[TRIGGER]_INIT').pipe(forwardAs('[TASK]_LOAD_CONFIG')),
ofType('[TASK]_LOAD_CONFIG').pipe(
  switchMap(() => from(api.getConfig()).pipe(forwardAs('[FACT]_CONFIG_LOADED')))
),
```

### ✅ Centralize Event Definitions

```typescript
// events.ts - single source of truth
type AllEvents = TriggerEvents | TaskEvents | FactEvents;
export const { ofType, trigger, forwardAs, createRegistry } = eda<AllEvents>();
```

### ✅ Use AbortController for Cleanup

```typescript
ofType('[TASK]_FETCH').pipe(
  switchMap(() => {
    const ctrl = new AbortController();
    return from(api.fetch(ctrl.signal)).pipe(
      finalize(() => ctrl.abort()) // Cleanup on unsubscribe
    );
  })
),
```

---

## Bad Practices ❌

### ❌ Don't Trigger Events from Handlers

```typescript
// Bad - triggers inside handlers break traceability
ofType('[FACT]_LOADED').pipe(
  tap(() => {
    trigger('[TRIGGER]_REFRESH'); // ❌ Don't do this
  })
),

// Good - use emit or forwardAs for non-trigger events
ofType('[FACT]_LOADED').pipe(
  tap(() => emit('[EFFECT]_LOG', { action: 'loaded' }))
),
```

### ❌ Don't Mix Store Updates with API Calls

```typescript
// Bad - too many responsibilities
ofType('[TASK]_SAVE').pipe(
  tap(() => store.$isSaving.set(true)), // ❌
  switchMap(() => from(api.save())),
  tap(() => store.$isSaving.set(false)), // ❌
),

// Good - separate concerns
ofType('[TASK]_SAVE').pipe(forwardAs('[FACT]_SAVING_STARTED')),
ofType('[FACT]_SAVING_STARTED').pipe(tap(() => store.$isSaving.set(true))),
// ... api call with forwardAs('[FACT]_SAVED')
ofType('[FACT]_SAVED').pipe(tap(() => store.$isSaving.set(false))),
```

### ❌ Don't Skip Event Types

```typescript
// Bad - direct API call from trigger
ofType('[TRIGGER]_LOAD').pipe(
  switchMap(() => from(api.load())) // ❌ Missing TASK event
),

// Good - proper flow
ofType('[TRIGGER]_LOAD').pipe(forwardAs('[TASK]_FETCH')),
ofType('[TASK]_FETCH').pipe(switchMap(() => from(api.load()))),
```

### ❌ Don't Create Circular Event Chains

```typescript
// Bad - infinite loop
ofType('[FACT]_A').pipe(forwardAs('[FACT]_B')),
ofType('[FACT]_B').pipe(forwardAs('[FACT]_A')), // ❌ Loop!
```

### ❌ Don't Use Generic Payloads

```typescript
// Bad
FactEvent<"[FACT]_UPDATE", { data: any }>; // ❌

// Good
FactEvent<"[FACT]_USER_UPDATED", { user: User }>;
```

---

## File Structure

```
my-module/
├── contracts/
│   └── models.ts        # Domain types
├── core/
│   ├── events.ts        # Event definitions & eda() setup
│   ├── handlers.ts      # Complex reusable handlers (RxJS operators)
│   ├── registry.ts      # Event subscriptions (createRegistry)
│   └── store.ts         # State atoms
├── integration/
│   └── api.ts           # API calls
└── presentation/
    └── main.tsx         # React components with withEda()
```

---

## Debugging

Use `ofAny()` to log all events:

```typescript
ofAny().pipe(
  filter(() => process.env.NODE_ENV === 'development'),
  tap((event) => console.log('[EDA]', event))
),
```

Each event includes metadata:

- `meta.id` - Unique UUID for tracing
- `meta.time` - High-resolution timestamp

---

## When to Use EDA

| Use Case                              | Recommendation        |
| ------------------------------------- | --------------------- |
| Complex async flows                   | ✅ Perfect fit        |
| Multiple side effects from one action | ✅ Great fit          |
| Simple CRUD operations                | ⚠️ Might be overkill  |
| Single component state                | ❌ Use local state    |
| Form validation                       | ❌ Use form libraries |

---
