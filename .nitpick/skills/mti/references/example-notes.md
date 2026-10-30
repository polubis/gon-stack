# Mock mid-level technical interview (single answer per item)

Legend: **✅** ok · **❌** wrong · **⚠️** partially correct

---

## React (30)

1. **What does `useEffect(..., [])` do?** → ⚠️ It runs after mount; in **Strict Mode (dev)** the setup may run twice to surface unsafe side effects.
2. **When is UI updated after `setState`?** → ✅ React batches updates and commits asynchronously; you should not assume the DOM updates on the very next line.
3. **List `key` best practice** → ❌ Using the array index is always the best key for performance.
4. **Controlled input** → ✅ A controlled input’s value is driven by React state and updates via `onChange`.
5. **`useMemo` mainly helps with** → ❌ Preventing child components from re-rendering automatically.
6. **`useCallback` mainly helps with** → ⚠️ It stabilizes a function reference, but it only pays off when children are memoized or deps matter—otherwise it can add noise.
7. **`React.memo`** → ✅ It avoids re-rendering when props are shallow-equal (default comparison).
8. **Context updates** → ❌ Context changes re-render only the single nearest consumer, not siblings.
9. **Error boundaries** → ⚠️ They catch render-time errors in the subtree, but not most errors thrown inside async event handlers unless you handle them.
10. **`useRef` updates** → ✅ Changing `ref.current` does not trigger a re-render by itself.
11. **Lifting state** → ❌ If two components need the same data, you must always use a global store like Redux.
12. **Fragments** → ⚠️ `<>...</>` can’t take a `key`, but `React.Fragment` can when you need keyed fragments in a list.
13. **`StrictMode`** → ❌ `StrictMode` changes production runtime behavior in the same way as development.
14. **Accessibility: clickable div** → ✅ Prefer `<button>` for actions; you get keyboard + semantics for free compared to `div` + `onClick`.
15. **`useLayoutEffect`** → ⚠️ It runs synchronously after DOM updates and before paint—great for measuring layout, but easy to misuse and it’s not the default for data fetching.
16. **Portals** → ❌ Portals completely disable React event bubbling.
17. **`dangerouslySetInnerHTML`** → ✅ It can introduce XSS if you inject untrusted HTML without sanitization.
18. **Concurrent rendering (high level)** → ❌ Concurrent features guarantee your component will never render more than once.
19. **Keys to reset state** → ⚠️ Changing `key` forces a remount (useful to reset local state), but it can be expensive if overused.
20. **Synthetic events** → ✅ React normalizes events across browsers for more consistent handler behavior.
21. **Server Components (concept)** → ❌ Every React app today is “Server Components only” with no client boundaries.
22. **`children` composition** → ✅ `children` is a core composition mechanism for reusable components/layouts.
23. **`forwardRef` purpose** → ⚠️ It exposes an inner instance/DOM ref to parents—useful, but patterns evolve with newer React versions and team conventions.
24. **`useReducer` vs `useState`** → ❌ `useReducer` is always faster than `useState`.
25. **Inline object props + memoization** → ✅ Fresh object/array identities each render can defeat `React.memo` unless you stabilize props.
26. **`useId`** → ⚠️ It’s great for stable IDs across SSR/hydration, but it’s not a substitute for domain-driven business IDs in data models.
27. **Testing UI** → ❌ The best tests always assert every private hook implementation detail.
28. **Suspense + `React.lazy`** → ✅ Code-split chunks can suspend rendering until loaded, with a fallback UI.
29. **Refs during render** → ❌ Reading and writing refs to compute rendered UI is always a recommended React pattern.
30. **Hydration mismatch** → ✅ Mismatched server/client markup can cause hydration warnings/errors; keep initial render deterministic.

---

## TypeScript (10)

1. **`unknown` vs `any`** → ✅ `unknown` forces you to narrow before use, which catches more mistakes than `any`.
2. **Structural typing** → ❌ TypeScript uses nominal typing: two different interface names are incompatible even with identical fields.
3. **`readonly` tuples** → ⚠️ They encode readonly/fixed-shape at the type level, but runtime mutation is still possible unless you actually freeze/immutably design APIs.
4. **Discriminated unions** → ✅ Narrowing on a reliable discriminant (like `kind`) is a standard TS pattern for safe branching.
5. **`satisfies`** → ❌ `satisfies` is exactly the same as `as` type assertions with identical behavior.
6. **`interface` merging** → ⚠️ Interfaces can merge via declaration merging—powerful, but surprising if unintended.
7. **Generics defaults** → ✅ Default type parameters apply when inference doesn’t supply a type argument.
8. **Exhaustiveness with `never`** → ❌ Assigning to `never` means “this value can be anything at runtime without checks.”
9. **`keyof` results** → ⚠️ `keyof` depends on the type shape; with index signatures it may be broader than you intuit.
10. **`strictNullChecks`** → ✅ It prevents treating `null`/`undefined` as valid everywhere without handling them.

---

## JavaScript (11)

1. **`==` vs `===`** → ⚠️ `===` is usually safest; `==` has coercion rules that are occasionally used intentionally (e.g., `x == null`).
2. **Closures** → ✅ A closure captures variables from its lexical scope, even after the outer function returns.
3. **`this` in arrow functions** → ❌ Arrow functions dynamically bind `this` to whoever called them, like normal functions always.
4. **Event loop ordering (basics)** → ⚠️ Microtasks (like promise callbacks) generally run before the next macrotask turn—exact scheduling still rewards careful reasoning.
5. **`const` objects** → ❌ `const` makes the entire object deeply immutable at runtime.
6. **`Array.prototype.sort` default** → ✅ Default sort is string-based and commonly breaks numeric sorting unless you pass a comparator.
7. **`async` functions** → ❌ `async` code runs on a separate OS thread automatically in standard JS.
8. **`Map` vs object** → ✅ `Map` can use non-string keys and preserves insertion order for iteration.
9. **`for...in` on arrays** → ⚠️ It iterates keys/enumerable properties—not usually what you want compared to `for...of`/indexed loops.
10. **TDZ** → ✅ Accessing `let`/`const` before initialization throws `ReferenceError` (temporal dead zone).
11. **`JSON.stringify` functions** → ❌ `JSON.stringify` always includes function properties in the output.

---

## Web fundamentals (10)

1. **CORS** → ⚠️ CORS is a browser enforcement mechanism; it doesn’t magically secure your API against non-browser clients.
2. **`HttpOnly` cookies** → ✅ It prevents JavaScript from reading the cookie, reducing XSS token theft risk for cookie-based sessions.
3. **CSP** → ❌ CSP replaces HTTPS for protecting data in transit.
4. **Same-origin policy** → ✅ It isolates many capabilities by origin (scheme + host + port).
5. **`defer` vs `async`** → ⚠️ `defer` preserves script order and runs after parsing; `async` runs ASAP and order isn’t guaranteed—pick based on dependencies.
6. **HTTPS** → ❌ HTTPS encrypts your database at rest automatically.
7. **Repaint vs layout** → ✅ Layout/reflow tends to be triggered by geometry changes; some properties are cheaper to animate than others.
8. **`localStorage` secrets** → ❌ `localStorage` is a secure place for refresh tokens because it’s “local.”
9. **WebSockets** → ⚠️ Great for realtime duplex communication, but you still need auth, reconnect strategy, and operational limits.
10. **Semantic HTML** → ✅ Semantic elements improve accessibility and meaning compared to generic `<div>` soup.

---

## Architecture (1)

1. **Separate domain logic from UI** → ✅ It improves testability and reduces coupling to a specific framework’s rendering lifecycle.

---

## Design patterns (1)

1. **Adapter pattern** → ⚠️ It wraps an incompatible API to match what your app expects—useful, but adds indirection you should justify.

---

## Buzzwords (4)

1. **“Microservices by default”** → ❌ Microservices always reduce complexity versus a well-bounded monolith.
2. **“Event-driven = scalable”** → ⚠️ It can improve decoupling/throughput, but idempotency, ordering, retries, and observability become critical.
3. **“GraphQL fixes over-fetching”** → ✅ Clients can select fields, but server resolver design still dominates performance.
4. **“Clean Architecture = many folders”** → ❌ Architecture quality is measured by dependency rules and boundaries, not directory count.

---

## Git (8)

1. **`git revert` on shared branches** → ✅ `revert` creates a new commit that undoes a change—safer for shared history than rewriting `main`.
2. **`git rebase`** → ⚠️ It can produce a cleaner linear history, but rebasing commits already pushed/shared needs team discipline.
3. **`git reset --hard`** → ❌ `git reset --hard` is a safe way to undo other people’s pushed commits on `main` without communication.
4. **`git cherry-pick`** → ✅ Applies an existing commit’s changes onto your current branch as a new commit.
5. **`git stash`** → ❌ Stash is a reliable long-term backup solution you should never clean up.
6. **`.gitignore` for leaked secrets** → ⚠️ Ignoring a file stops future adds, but tracked secrets need removal from history with proper rotation.
7. **`git bisect`** → ✅ Binary-searching commits is a strong workflow to find which commit introduced a regression.
8. **`git merge`** → ⚠️ Merge preserves history including merge commits; that can be good for auditability even if the graph is messier.

---

## Next.js + around-Next concepts (10)

1. **App Router layouts** → ✅ Layouts can persist UI across navigations within their segment boundary (useful for shells/headers).
2. **Server Actions** → ❌ Server Actions mean you can skip server-side authorization checks because “it’s server code.”
3. **`next/image`** → ⚠️ It helps with responsive delivery and optimization, but you still need meaningful `alt` text and sensible sizing constraints.
4. **Middleware** → ✅ Middleware can run early for redirects/auth gating, but should stay fast and dependency-light.
5. **`fetch` caching semantics** → ❌ `fetch` in Next never caches under any circumstances in App Router.
6. **ISR idea** → ⚠️ Regeneration strategies can be powerful, but “stale” windows must match product expectations and observability.
7. **Edge runtime** → ✅ Edge constraints differ from Node (API surface/libraries); not everything is portable.
8. **Route Handlers** → ❌ `route.ts` endpoints are inherently safe from abuse without rate limiting or validation.
9. **Metadata exports** → ✅ `metadata` helps standardize titles/descriptions; SEO still depends on content/performance/structure beyond that.
10. **Dynamic rendering config** → ⚠️ Segment config like `force-static` / `force-dynamic` changes behavior materially—misconfiguration causes stale or overly dynamic pages.

---

## Practical task (sorting / mapping / basics) (1)

**Task:** Given `users` with `{ id, name, age, tags[] }`, return **(A)** `{id, label}` sorted by **age asc** where `label` is `Name (age)`, **(B)** unique tags lowercased, **(C)** sum of ages for users whose tags include `"beta"` case-insensitively.

**Answer:** → ✅ Use `[...users].sort((a,b)=>a.age-b.age).map(...)`, `new Set(users.flatMap(u=>u.tags.map(t=>t.toLowerCase())))`, and `users.filter(u=>u.tags.some(t=>t.toLowerCase()==="beta")).reduce((s,u)=>s+u.age,0)`.

Sadly, nothing more about architecutre or design patterns is known
