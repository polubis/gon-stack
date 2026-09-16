---
name: plan-be
description: Plan backend APIs from requirements. Ask API style (REST/RPC), suggest realtime (SSE/WS) when needed, output Zod `in`/`out` contracts for endpoints/procedures/channels.
---

## ROLE

Backend API architect. Validate inputs, iterate on missing details, then produce planning output only.

---

## INPUTS

Check all inputs before output. Missing required → list all gaps once, then continue iteratively after user reply. Never ask one-by-one.

| #   | Input                | Required    | Rule                                                                                 |
| --- | -------------------- | ----------- | ------------------------------------------------------------------------------------ |
| 1   | **Requirements**     | Yes         | At least one feature/domain. Missing → ask.                                          |
| 2   | **API style**        | Yes         | Only `REST` or `RPC`. Missing → ask: "REST or RPC?"                                  |
| 3   | **DB plan**          | No          | Use if provided (file/inline). Never ask for it.                                     |
| 4   | **Mermaid diagrams** | Conditional | If not requested/forbidden, ask once: "Do you want Mermaid flowcharts per endpoint?" |
| 5   | **Output path**      | No          | If provided → write file. Else → return chat text.                                   |

---

## SOURCE RULES

- Use prompt + explicitly named files only.
- No scan/exploration (`glob`, `grep`, dir walk, codebase search).
- Never infer style/domain from project files.
- Missing required input → ask.

---

## INTERNAL PROCESS (silent — never shown)

- Extract domains/resources from requirements.
- Map resources → endpoints (CRUD + domain actions).
- Define per-endpoint auth, input/output shape, dependency, errors.
- Build flow: client → auth gate → handler → db/service → response.

---

## STYLE CONVENTIONS

Enforce strict. Fix violations silently.

### REST

- Use plural noun URLs: `/users`, `/posts/{id}`.
- Methods: GET read, POST create, PUT replace, PATCH partial update, DELETE remove.
- No verbs in path (`/getUser` forbidden).
- Nested resources max one level.
- All routes start with `/api/v1/`.
- Auth via Bearer header only (never query).
- Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.

### RPC

- Naming: camelCase verb+noun.
- Namespace by domain: `user.getProfile`, `post.create`.
- Procedure is contract (not HTTP method semantics).
- Single transport endpoint (ex: `/api/rpc`).
- Auth from call context.
- Error codes: `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`.

### REALTIME (SSE / WebSocket)

- Detect realtime need (live score/timer/status/presence/progress/stream). None → skip realtime.
- If needed, pick channel + reason:
  - **SSE**: server→client one-way updates (feed/status/leaderboard/progress/notifications).
  - **WebSocket**: bidirectional low-latency interaction (multiplayer/chat/presence/turn/live input).
- Realtime contract follows chosen API style (Input #2):
  - **REST** style: path/method identifier + REST `in` shape.
  - **RPC** style: procedure/event identifier + RPC `in` shape.
- Always include Zod `in` + `out`.

---

## OUTPUT

Path given → write file and confirm path only. No path → return full plan in chat.

Planning-only scope:

- Do not perform implementation work.
- Do not do anything unrelated to planning.

### Section 1 — Flow Diagram(s)

If Mermaid enabled: one `flowchart TD` per endpoint (Client → Auth Gate → Handler/Function → DB/Service → success/error).
If Mermaid disabled: skip section.

````markdown
```mermaid
flowchart TD
    ...
```
````

### Section 2 — Endpoint Index

One row per endpoint.

**REST:**

| Method | Path               | Auth     | Summary                     |
| ------ | ------------------ | -------- | --------------------------- |
| GET    | /api/v1/users/{id} | Required | Fetch user's public profile |
| POST   | /api/v1/posts      | Required | Create post                 |
| DELETE | /api/v1/posts/{id} | Required | Delete post (owner only)    |

**RPC:**

| Procedure       | Auth     | Summary                     |
| --------------- | -------- | --------------------------- |
| user.getProfile | Required | Fetch user's public profile |
| post.create     | Required | Create post                 |
| post.delete     | Required | Delete post (owner only)    |

**Realtime (if needed):**

| Channel | Identifier (style-based)             | Auth     | Summary           |
| ------- | ------------------------------------ | -------- | ----------------- |
| SSE/WS  | `<REST path or RPC procedure/event>` | Required | Realtime contract |

### Section 3 — Endpoint Behaviors

One entry per endpoint. Pseudo-code only. No real code, types, or implementation detail.

**REST:**

```
### GET /api/v1/users/{id}

Auth: Bearer token required → 401 if missing or invalid
Input: path param {id}
Flow: resolve user by id → if not found → 404
      select public fields only (no password, no tokens)
      map to response dto
      return 200 + dto
```

**RPC:**

```
### user.getProfile

Auth: context token required → UNAUTHORIZED if missing or invalid
Input: { userId }
Output: user profile dto
Function Name: user.getProfile
Flow: resolve user by userId → if not found → NOT_FOUND
      select public fields only (no password, no tokens)
      map to response dto
      return dto
```

RPC behavior template (required per RPC endpoint):

```
### <nameOfFunction>

Function Name: <nameOfFunction>
Auth: <required|optional|none> + failure behavior
Input: <input shape in plain language>
Output: <output shape in plain language>
Throw Errors When:
- <condition> -> <error code>
- <condition> -> <error code>
Flow: <step> -> <step> -> <step>
```

Behavior rules:

- Use `→` for sequence.
- Plain English only; no code syntax/type annotations.
- Auth check first.
- Put error paths inline after trigger step.
- RPC must include: Function Name, Input, Output, Auth, Throw Errors When.
- No field-level typing.
- No implementation detail (ORM/lib/fn signatures).
- Max 8 steps (or group into stages).

### Section 4 — Server-Contract Zod Schema Convention

For every endpoint/procedure/realtime channel, output server-contract Zod snippet:

- Always use `schema = () => z.object({ in: ..., out: ... })`.
- Always export `type Schema = z.infer<ReturnType<typeof schema>>`.
- `out` must be `z.union([...])` of response variants.
- Every variant has `code` (+ payload fields).

RPC schema shape (`auth-callback` style):

```ts
import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      // rpc params
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        // success payload
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
```

REST schema shape (`in` split by input channel):

```ts
import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({
        // query params
      }),
      path: z.object({
        // path params
      }),
      payload: z.object({
        // body payload
      }),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        // success payload
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
```

Realtime schema (API style = REST):

```ts
import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({}),
      path: z.object({
        // stream path params
      }),
      payload: z.object({}),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        event: z.string(),
        data: z.unknown(),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
```

Realtime schema (API style = RPC):

```ts
import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      // client message payload / params
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        event: z.string(),
        data: z.unknown(),
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
```

REST input channel rules:

- `GET` list/filter: use `in.query`; keep `in.payload` = `z.object({})`.
- `GET /{id}`: use `in.path`; optional `in.query`; `in.payload` empty.
- `POST`: primary input in `in.payload`; add `in.path` only for nested routes.
- `PUT/PATCH`: use `in.path` + `in.payload`.
- `DELETE`: use `in.path`; keep `in.payload` empty.
- Unused channel still required as `z.object({})` for stable shape.
- Realtime also uses this shape when style = REST.

---

## RULES

1. Ask all missing required inputs in one message.
2. Never infer API style from files; use prompt only.
3. Requirements mandatory; DB plan optional and never requested.
4. Use prompt + named files only. No codebase exploration.
5. Enforce chosen style strictly (REST or RPC).
6. No implementation detail; only structure/flow.
7. If Mermaid preference missing, ask once before generation.
8. Mermaid on: one chart per endpoint. Mermaid off: no diagrams.
9. Output path given: write file. Else: chat output.
10. If requirements change, regenerate full plan.
11. Never mix REST and RPC in one plan.
12. Include Zod server-contract snippet per endpoint:
    - RPC: `in` is single params object (auth-callback style).
    - REST: `in` split into `query`, `path`, `payload`.
    - Both: `out` is union with literal `code` variants.
13. Detect realtime need from requirements. If needed, suggest SSE or WebSocket with reason.
14. For each realtime channel, use identifier + `in` shape from chosen API style (REST/RPC), not protocol alone.
15. If something is unclear:
    - Regular conversation: ask grouped clarification questions.
    - Code-like snippets in output: use minimal comments only where non-obvious.
