---
version: 1.1
hash: 32b10122fec9f1a7762765540b11257d970a545604fb77d40801078cf724d18a
---


# Gaming

Room and game management module. Players discover public rooms on a rooms wall, create or join rooms, then manage a games wall and participant list inside a room. In-game, a WebSocket channel delivers questions, timer ticks, and live scores; the game summary shows final rankings.

## Architecture

1. "configuration" — `constraints.ts`: `FEATURE_NAME` constant. No state.
2. "domain" — `models.ts`: branded ids (`RoomId`, `RoomCode`, `GameId`, `QuestionId`, …), `Room`, `Participant`, `Game` (discriminated on `status`), `Question` (discriminated on `type`), `Answer` (co-discriminated), `GamePlayState`, `GameSummary`. `events.ts`: `Event` union of `TriggerEvent`s covering rooms-wall, room join/create, games-wall, game lifecycle, game play, leave-game 3-step, WS-pushed state (`[TRIGGER]_WS_*`).
3. "core" — `store.ts` (atoms/computed), `bus.ts`, `handlers/` (one file per trigger — 26 handlers), `registry.ts` (wires handlers + repository to bus), `facade.ts` (actions + `use*` selectors), `mediator.ts` (composes store + repository + registry + facade). `ports/repository.ts` defines `IRepository` interface — the seam between core and integration.
4. "integration" — `repository.ts`: `createRepository()` factory implementing `IRepository`; `mappers.ts`: pure DTO → domain mappers with exhaustive switch; `ws-contracts.ts`: `WsServerMessage` / `WsClientMessage` types for the game-play WebSocket.
5. "presentation" — `context.tsx` (power-context Provider + useContext), `router.tsx` (state-driven: no activeRoomId → RoomsWall; game_pending → GamePlay; game_finished → GameSummary; else → GamesWall), `main.tsx` (entry). Sub-views under `rooms-wall/`, `games-wall/`, `game-play/`, `game-summary/`.

## Code

1. Always `const`; always arrow functions.
2. Named exports only — no default exports.
3. Factory pattern: `createX(...)` returns an object; type with `ReturnType<typeof createX>`.
4. Branded ids: `type RoomId = Brand<string, 'RoomId'>`.
5. `type` aliases only — no `interface`, no `class`.
6. Discriminated unions on `status` (Game) and `type` (Question, Answer); exhaustive `switch` with `const _: never = value` default.
7. Store atoms are `$`-prefixed; facade exposes them as `use*` hooks.
8. Events are `[TRIGGER]_NAME` literals; handlers are RxJS `ofType(...).pipe(tap/switchMap/...)`.
9. WS events are dispatched from `ws-connect.ts` handler into the bus as `[TRIGGER]_WS_*` — core never imports WebSocket directly.
10. Presentation reaches core only through the facade.

## References

- [domain/models.ts](./domain/models.ts) — branded ids + discriminated unions.
- [domain/events.ts](./domain/events.ts) — full Event union.
- [core/ports/repository.ts](./core/ports/repository.ts) — IRepository interface (integration/core seam).
- [core/store.ts](./core/store.ts) — atoms + computed.
- [core/handlers/rooms-wall-init.ts](./core/handlers/rooms-wall-init.ts) — async handler pattern.
- [core/handlers/ws-connect.ts](./core/handlers/ws-connect.ts) — WebSocket lifecycle + bus dispatch.
- [core/facade.ts](./core/facade.ts) — actions + use* selectors.
- [integration/mappers.ts](./integration/mappers.ts) — DTO → domain mapping with exhaustive switch.
- [presentation/router.tsx](./presentation/router.tsx) — state-driven view switch.

> Read a reference only when the rule above is unclear.
