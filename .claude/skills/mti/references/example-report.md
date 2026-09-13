# Technical Interview Report — [Paulina]

## 1. Report Date

**Date:** 2026-05-14
**Interviewer:** Adrian
**Position:** Mid-Level Frontend Developer

## 2. Interview Description

85 questions across React, TypeScript, JavaScript, Web Fundamentals, Architecture, Design Patterns, Git, and Next.js — plus one practical task. Straightforward Q&A, one response per item.

Reliable grasp of high-level concepts and surface API patterns. Answers directionally correct but short of implementation-level detail that separates production reasoning from API familiarity. Practical task clean — no issues, well-structured output.

Architecture and Design Patterns lightly covered (one question each) — minimal weight in overall picture. Profile consistent with Mid: ships features reliably, specific blind spots to close before owning security-sensitive or performance-critical areas independently.

## 3. Asked Questions (RAW)

> ✅ Correct | ⚠️ Partially correct | ❌ Incorrect / Unknown

### React

| #   | Question                             | Result | Notes                                                                                                                                                                 |
| --- | ------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What does `useEffect(..., [])` do?   | ⚠️     | Knew it runs after mount but did not mention Strict Mode double-invocation to surface unsafe side effects.                                                            |
| 2   | When is UI updated after `setState`? | ✅     | —                                                                                                                                                                     |
| 3   | `key` best practice                  | ❌     | Stated array index is always the best key — incorrect; index causes state bugs on reorder/delete.                                                                     |
| 4   | Controlled input                     | ✅     | —                                                                                                                                                                     |
| 5   | `useMemo` mainly helps with          | ❌     | Conflated `useMemo` with `React.memo`; `useMemo` memoizes computed values, not child renders.                                                                         |
| 6   | `useCallback` mainly helps with      | ⚠️     | Correctly identified reference stabilization but did not clarify it only pays off when children are memoized.                                                         |
| 7   | `React.memo`                         | ✅     | —                                                                                                                                                                     |
| 8   | Context updates                      | ❌     | Said only the nearest consumer re-renders; in practice all consumers in the subtree re-render.                                                                        |
| 9   | Error boundaries                     | ⚠️     | Correctly limited to render-time errors; did not note that async event handler errors are not caught.                                                                 |
| 10  | `useRef` updates                     | ✅     | —                                                                                                                                                                     |
| 11  | Lifting state                        | ❌     | Said you must use a global store; correct approach is lifting to the nearest common ancestor.                                                                         |
| 12  | Fragments                            | ⚠️     | Identified `<>` limitation but explanation of when `React.Fragment` with `key` is needed was incomplete.                                                              |
| 13  | `StrictMode`                         | ❌     | Stated StrictMode affects production; it is dev-only and has zero production runtime impact.                                                                          |
| 14  | Accessibility: clickable div         | ✅     | —                                                                                                                                                                     |
| 15  | `useLayoutEffect`                    | ⚠️     | Correctly identified synchronous post-DOM/pre-paint timing; incorrectly implied data fetching is a primary misuse case (layout measurement is the canonical concern). |
| 16  | Portals                              | ❌     | Said portals disable React event bubbling; portals bubble through the React tree regardless of DOM position.                                                          |
| 17  | `dangerouslySetInnerHTML`            | ✅     | —                                                                                                                                                                     |
| 18  | Concurrent rendering (high level)    | ❌     | Stated components never render more than once under concurrent features — opposite of the intent.                                                                     |
| 19  | Keys to reset state                  | ⚠️     | Correctly identified forced remount; did not address the performance cost of overuse.                                                                                 |
| 20  | Synthetic events                     | ✅     | —                                                                                                                                                                     |
| 21  | Server Components (concept)          | ❌     | Stated every React app today is Server Components only — not true; client-only apps remain valid and common.                                                          |
| 22  | `children` composition               | ✅     | —                                                                                                                                                                     |
| 23  | `forwardRef` purpose                 | ⚠️     | Correctly explained ref forwarding; noted evolving patterns without specifying what changed (ref-as-prop in React 19).                                                |
| 24  | `useReducer` vs `useState`           | ❌     | Stated `useReducer` is always faster — false; the choice is structural/semantic, not a performance decision.                                                          |
| 25  | Inline object props + memoization    | ✅     | —                                                                                                                                                                     |
| 26  | `useId`                              | ⚠️     | Correctly described SSR/hydration stable IDs; missed that it must not be used for data-model IDs.                                                                     |
| 27  | Testing UI                           | ❌     | Said best tests assert every private hook implementation detail — testing-library philosophy is the opposite.                                                         |
| 28  | Suspense + `React.lazy`              | ✅     | —                                                                                                                                                                     |
| 29  | Refs during render                   | ❌     | Stated reading/writing refs to compute rendered output is recommended — it is explicitly an anti-pattern.                                                             |
| 30  | Hydration mismatch                   | ✅     | —                                                                                                                                                                     |

**Knowledge level: 6.5/10** — Solid grasp of the component model and common hooks in everyday use; score penalized by useMemo/memo conflation, Context propagation misunderstanding, StrictMode scope, and concurrent rendering intent.

### TypeScript

| #   | Question                    | Result | Notes                                                                                                                                     |
| --- | --------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `unknown` vs `any`          | ✅     | —                                                                                                                                         |
| 2   | Structural typing           | ❌     | Stated TS uses nominal typing — incorrect; TypeScript is structurally typed (shape compatibility, not name).                              |
| 3   | `readonly` tuples           | ⚠️     | Correctly noted compile-time enforcement; did not distinguish from runtime — `readonly` is erased, mutation is still possible at runtime. |
| 4   | Discriminated unions        | ✅     | —                                                                                                                                         |
| 5   | `satisfies`                 | ❌     | Equated `satisfies` with `as` — `satisfies` validates against a type without widening; `as` bypasses the type checker.                    |
| 6   | `interface` merging         | ⚠️     | Correctly identified declaration merging; did not address the risk of unintentional merges across files.                                  |
| 7   | Generics defaults           | ✅     | —                                                                                                                                         |
| 8   | Exhaustiveness with `never` | ❌     | Stated assigning to `never` means "value can be anything" — it means the code path is unreachable.                                        |
| 9   | `keyof` results             | ⚠️     | Directionally correct; did not address that index signatures (`[key: string]`) widen `keyof` to `string \| number`.                       |
| 10  | `strictNullChecks`          | ✅     | —                                                                                                                                         |

**Knowledge level: 4/10** — Handles nullability and basic union patterns; three missed fundamentals (structural typing, `satisfies`, exhaustive `never`) reflect surface-level rather than internalized understanding of the type system.

### JavaScript

| #   | Question                       | Result | Notes                                                                                                                                   |
| --- | ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `==` vs `===`                  | ⚠️     | Correctly recommended `===`; acknowledged intentional `== null` use but did not explain the coercion rule that makes it work.           |
| 2   | Closures                       | ✅     | —                                                                                                                                       |
| 3   | `this` in arrow functions      | ❌     | Stated arrow functions bind `this` dynamically like normal functions — wrong; arrows inherit `this` lexically from the enclosing scope. |
| 4   | Event loop ordering            | ⚠️     | Correctly placed microtasks before macrotasks; did not address scheduling nuances (e.g., queueMicrotask vs Promise chains).             |
| 5   | `const` objects                | ❌     | Stated `const` makes the object deeply immutable — `const` only binds the reference; properties remain mutable.                         |
| 6   | `Array.prototype.sort` default | ✅     | —                                                                                                                                       |
| 7   | `async` functions              | ❌     | Stated `async` code runs on a separate OS thread — JavaScript is single-threaded; `async` is cooperative via the event loop.            |
| 8   | `Map` vs object                | ✅     | —                                                                                                                                       |
| 9   | `for...in` on arrays           | ⚠️     | Correctly flagged the issue; did not specify that `for...in` iterates inherited enumerable properties (prototype chain risk).           |
| 10  | TDZ                            | ✅     | —                                                                                                                                       |
| 11  | `JSON.stringify` functions     | ❌     | Stated functions are included — `JSON.stringify` silently omits function-valued properties.                                             |

**Knowledge level: 5/10** — Closures, Map, sort, and TDZ correct; lexical `this`, threading model, and `const` mutability wrong — meaningful gaps but the correct answers show genuine JS experience alongside them.

### Web Fundamentals

| #   | Question               | Result | Notes                                                                                                                              |
| --- | ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | CORS                   | ⚠️     | Correctly identified browser enforcement; did not state that server-to-server or curl requests bypass CORS entirely.               |
| 2   | `HttpOnly` cookies     | ✅     | —                                                                                                                                  |
| 3   | CSP                    | ❌     | Stated CSP replaces HTTPS — CSP mitigates inline script injection/XSS; HTTPS is transport security; unrelated.                     |
| 4   | Same-origin policy     | ✅     | —                                                                                                                                  |
| 5   | `defer` vs `async`     | ⚠️     | Correctly distinguished timing; did not articulate that `async` script order is non-deterministic relative to other async scripts. |
| 6   | HTTPS                  | ❌     | Stated HTTPS encrypts the database at rest — HTTPS secures data in transit only.                                                   |
| 7   | Repaint vs layout      | ✅     | —                                                                                                                                  |
| 8   | `localStorage` secrets | ❌     | Called localStorage secure for refresh tokens — it is accessible to any JS on the page, making it unsuitable for sensitive tokens. |
| 9   | WebSockets             | ⚠️     | Identified realtime duplex value; missed reconnect strategy and message-ordering concerns as operational requirements.             |
| 10  | Semantic HTML          | ✅     | —                                                                                                                                  |

**Knowledge level: 4/10** — Basic request/response model understood; three security-relevant misunderstandings (CSP scope, HTTPS scope, localStorage token storage) are significant given production impact.

### Architecture

| #   | Question                      | Result | Notes |
| --- | ----------------------------- | ------ | ----- |
| 1   | Separate domain logic from UI | ✅     | —     |

**Knowledge level: 1/10** — Narrow coverage; one correct answer on a single high-level question, not enough to establish a meaningful score.

### Design Patterns

| #   | Question        | Result | Notes                                                                                                                                 |
| --- | --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Adapter pattern | ⚠️     | Correctly described the wrapping mechanism; did not address when to prefer composition alternatives or the cost of added indirection. |

**Knowledge level: 0/10** — One partial answer on a single pattern; no coverage of selection reasoning, composition alternatives, or trade-offs.

### Buzzwords

| #   | Question                            | Result | Notes                                                                                                                 |
| --- | ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| 1   | "Microservices by default"          | ❌     | Agreed microservices always reduce complexity — a well-bounded monolith often outperforms early-stage microservices.  |
| 2   | "Event-driven = scalable"           | ⚠️     | Correctly identified decoupling/throughput; did not mention idempotency or message-ordering as first-class concerns.  |
| 3   | "GraphQL fixes over-fetching"       | ✅     | —                                                                                                                     |
| 4   | "Clean Architecture = many folders" | ❌     | Agreed with the statement — architecture quality is measured by dependency rules and boundaries, not directory count. |

**Knowledge level: 9/10** — Strong critical awareness of industry trade-offs; correctly challenged GraphQL assumptions and showed nuanced thinking on event-driven architecture; two myth-related misses are minor relative to overall calibration.

### Git

| #   | Question                        | Result | Notes                                                                                                                                       |
| --- | ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `git revert` on shared branches | ✅     | —                                                                                                                                           |
| 2   | `git rebase`                    | ⚠️     | Correctly noted cleaner history; did not address the force-push requirement after rebasing already-pushed commits.                          |
| 3   | `git reset --hard`              | ❌     | Called it safe for undoing others' commits on main — it rewrites shared history and is destructive without communication.                   |
| 4   | `git cherry-pick`               | ✅     | —                                                                                                                                           |
| 5   | `git stash`                     | ❌     | Called stash a reliable long-term backup — stash is a temporary scratch area; it is easily lost and not a backup strategy.                  |
| 6   | `.gitignore` for leaked secrets | ⚠️     | Correctly noted ignoring stops future adds; did not mention that tracked secrets require `git filter-branch` / BFG and credential rotation. |
| 7   | `git bisect`                    | ✅     | —                                                                                                                                           |
| 8   | `git merge`                     | ⚠️     | Correctly identified auditability; did not compare to squash merge or address when merge commits add noise to history.                      |

**Knowledge level: 7/10** — Strong on everyday workflow commands and history-safe patterns; two notable gaps (reset --hard on shared branches, stash as backup) temper the score but most practical scenarios were handled correctly.

### Next.js

| #   | Question                  | Result | Notes                                                                                                                                            |
| --- | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | App Router layouts        | ✅     | —                                                                                                                                                |
| 2   | Server Actions            | ❌     | Said Server Actions skip authorization needs — server-side code location does not substitute for explicit auth checks.                           |
| 3   | `next/image`              | ⚠️     | Correctly identified optimization benefits; did not mention that meaningful `alt` text and correct `sizes` are still required.                   |
| 4   | Middleware                | ✅     | —                                                                                                                                                |
| 5   | `fetch` caching semantics | ❌     | Stated `fetch` never caches in App Router — Next.js extends `fetch` with `cache`/`next.revalidate` options; caching is on by default (Next ≤14). |
| 6   | ISR idea                  | ⚠️     | Correctly described regeneration value; stale window must be designed with product expectations and observability in mind.                       |
| 7   | Edge runtime              | ✅     | —                                                                                                                                                |
| 8   | Route Handlers            | ❌     | Stated route.ts endpoints are inherently safe — they require explicit rate limiting, input validation, and auth.                                 |
| 9   | Metadata exports          | ✅     | —                                                                                                                                                |
| 10  | Dynamic rendering config  | ⚠️     | Correctly identified material rendering changes; did not address observability or debugging when misconfigured.                                  |

**Knowledge level: 4/10** — Routing and layout model understood; two security-relevant gaps (Server Actions auth, Route Handler safety) and incorrect fetch caching model pull the score down materially.

## 4. Practical Task Overview

**Task given:** A practical coding exercise covering data mapping, sorting, and detecting a common division across a collection. No external libraries; standard array operations only.

### Problems Observed

- None — all parts of the task were completed correctly.

### Positives

- Approached all three sub-problems cleanly and without hesitation.
- Solutions were readable and appropriately minimal with no over-engineering.

## 5. Judgement and Summary

**Rating:** `Mid`

**Primary reasons:**

- Practical task executed correctly and cleanly; strong critical thinking on trade-offs and industry patterns (Git, Buzzwords).
- Core React and Next.js surface APIs are well-known; internalization of the rendering contract and security model is the main gap separating the current level from Mid-Senior.
- TypeScript type-system mechanics and Next.js security posture (Server Actions, Route Handlers) need deliberate focus.

**Argumentation:**

Profile: working Mid. Practical task solved cleanly, everyday React hooks and Git confident, trade-off reasoning on buzzwords and architecture mature.

Gaps specific, not broad — React rendering internals (useMemo/memo, Context propagation, StrictMode), JS execution model (lexical `this`, threading, `const`), Next.js security surface (Server Actions auth, Route Handler exposure). All closable with targeted study, not accumulated experience.

Security gaps (localStorage tokens, Server Actions auth, CSP scope) most operationally risky — primary reason score sits below role expectation. No advanced knowledge needed, only deliberate attention. Productive, ships real features; structured gap closure needed before owning security-critical areas independently.

## 6. Knowledge Level Summary

| Topic                  | Score  |
| ---------------------- | ------ |
| React                  | 6.5/10 |
| TypeScript             | 4/10   |
| JavaScript             | 5/10   |
| Web Fundamentals       | 4/10   |
| Architecture           | 1/10   |
| Design Patterns        | 0/10   |
| Buzzwords / Trade-offs | 9/10   |
| Git                    | 7/10   |
| Next.js                | 4/10   |

**Overall score: 4.5/10**

## 7. Gaps & Study Plan

> One entry per ❌/⚠️ concept. Precise name → what the gap is → one concrete action to close it.

### React

- **`useMemo` computed-value memoization** — memoizes the result of a function, not child renders (`React.memo` does that); build a side-by-side example isolating both to confirm the distinction.
- **Context subtree re-render propagation** — all consumers in the subtree re-render on value change, not just the nearest; verify with React DevTools profiler on a non-trivial tree.
- **Strict Mode dev-only double-invocation** — setup/cleanup runs twice in dev only, zero production impact; read the official Strict Mode rationale and identify which patterns it exposes.
- **Portal React-tree event bubbling** — events bubble through the React tree regardless of DOM placement; implement a modal with a stop-propagation test to confirm.
- **Concurrent render multi-pass model** — React may render a component multiple times before committing; review the concurrent rendering docs and audit any code that assumes a single-pass invariant.
- **Array index as key instability** — index keys break state and animation on reorder or delete; replace with stable business IDs in any existing list component.
- **`useReducer` as a structural pattern** — chosen for related/complex state transitions, not for speed; refactor one `useState` cluster into `useReducer` to feel the organizational difference.
- **Ref mutation during render as anti-pattern** — writing `ref.current` inside render breaks functional purity; move any such logic into `useEffect` or derive from state instead.
- **Behavior-driven UI testing** — tests should assert observable output, not hook call counts; rewrite one test using query + user-event patterns from `@testing-library/react`.
- **`React.Fragment key` prop** — shorthand `<>` cannot take props; use `React.Fragment key={id}` in keyed list wrappers.

### TypeScript

- **Structural type compatibility** — TS checks shape, not name; create two identically-shaped interfaces and verify mutual assignability to build the intuition.
- **`satisfies` operator semantics** — validates without widening, unlike `as` which bypasses the checker; replace one `as` cast with `satisfies` and observe the type difference.
- **`never` in exhaustiveness checks** — assigning to `never` means the branch is unreachable; add an exhaustive switch to a discriminated union, then introduce a new variant to trigger the compile error.
- **`readonly` compile-time vs runtime** — `readonly` is erased at runtime; use `Object.freeze` when runtime immutability is actually required.
- **`keyof` with index signatures** — `[key: string]` widens `keyof` to `string | number`; experiment in the TS playground with and without an index signature to see the difference.

### JavaScript

- **Lexical `this` binding in arrow functions** — arrows inherit `this` from the enclosing lexical scope; write the same method as both arrow and regular function and log `this` from each call site.
- **`const` reference binding** — `const` prevents reassignment, not property mutation; add `Object.freeze` in any case where deep immutability is actually required.
- **JavaScript single-threaded execution model** — `async/await` is cooperative event-loop scheduling, not OS threading; trace a Promise chain through the call stack in browser DevTools.
- **`JSON.stringify` function omission** — function properties are silently dropped with no warning; use a `replacer` argument when serialization coverage needs to be explicit.
- **`for...in` enumerable prototype traversal** — iterates inherited properties from the prototype chain; prefer `for...of` or `Object.keys()` on arrays and plain objects.

### Web Fundamentals

- **CSP script-source restriction** — CSP mitigates XSS by restricting script origins; it has no relation to HTTPS; add a `Content-Security-Policy` header to a test route and observe blocked scripts.
- **HTTPS transport-only scope** — secures data in transit only; database-at-rest encryption is a separate infrastructure concern; map the two layers explicitly on a diagram.
- **`localStorage` XSS attack surface** — any JS on the page can read localStorage; store sensitive tokens in `HttpOnly` cookies and verify the difference in DevTools.
- **CORS browser-enforcement boundary** — CORS is enforced by the browser only; server-to-server and curl requests are not subject to it; confirm with a direct curl call to the same endpoint.

### Git

- **`git reset --hard` shared-history destruction** — rewrites commits others have already pulled; use `git revert` on shared branches and reserve `reset --hard` for local-only work.
- **`git stash` as temporary scratch buffer** — stash is not a backup; entries can be lost; use a WIP branch for anything worth keeping beyond the current session.
- **Tracked-secret history rewriting** — `.gitignore` stops future adds but not existing history; practice `git filter-repo` on a throwaway repo and understand the credential rotation requirement.

### Next.js

- **Server Actions explicit authorization requirement** — server-side location does not imply authorization; add explicit session/permission checks to every Server Action before any data access.
- **Route Handler attack surface** — `route.ts` files are full HTTP endpoints; add input validation, authentication, and rate limiting before touching any data.
- **App Router `fetch` default caching** — Next.js extends `fetch` with default caching (changed in Next 15); opt into `cache: 'no-store'` explicitly when fresh data is required and verify the behavior in the Network tab.

## 8. Growth Roadmap

Solid Mid: practical skills and critical intuition clearly there — array task, Git, trade-off reasoning show you think about consequences, not just syntax. Gaps concentrated in internal mechanics: React rendering contract, TypeScript type-system depth, Next.js security posture — exactly what separates Mid from Mid–Senior. None need years of experience; all need deliberate study paired with concrete exercises (§7). 3–4 months of targeted work with regular code review involvement makes Mid–Senior realistic.
