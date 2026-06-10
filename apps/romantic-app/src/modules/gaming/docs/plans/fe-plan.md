# Gaming Module — Frontend Plan

**Reference architecture:** `apps/romantic-app/src/modules/user-profile-setup/`  
**Layers:** `presentation/` → facade only · `core/` store + handlers + facade · `integration/` repository + mappers  
**State lib:** `@/libs/supa-store` (atom / computed) · **Event bus:** `@/libs/eda` (RxJS-based bus)

---

## Section 1 — View / Route Map

| View | Route | Entry condition |
|------|-------|-----------------|
| `RoomsWall` | `/gaming` | Any authenticated user |
| `GamesWall` | `/gaming/rooms/:roomId` | User is participant of `roomId` |
| `GamePlay` | `/gaming/rooms/:roomId/games/:gameId/play` | User is player in `gameId`; game is `game_pending` |
| `GameSummary` | `/gaming/rooms/:roomId/games/:gameId/summary` | Game is `game_finished` |

Modal / overlay states (no route change):

| Overlay | Trigger |
|---------|---------|
| `CreateRoomModal` | User clicks "Create room" on RoomsWall |
| `JoinRoomModal` | User clicks "Join room" on RoomsWall |
| `CreateGameModal` | User clicks "Create game" on GamesWall |
| `LeaveGameConfirmDialog` | User clicks "Leave" on GamePlay |

---

## Section 2 — Component Tree

### RoomsWall (`presentation/rooms-wall/`)

```
RoomsWallView (container)
  ├── RoomsWallHeader          — title + action buttons (create, join)
  ├── RoomsList                — maps over useRooms(); renders RoomCard per item
  │     └── RoomCard           — room name, code, participant count, join CTA
  ├── RoomsWallEmpty           — empty state when no public rooms
  ├── CreateRoomModal          — controlled by useIsCreateRoomOpen()
  │     └── CreateRoomForm     — name, visibility, optional password; calls facade.submitCreateRoom()
  └── JoinRoomModal            — controlled by useIsJoinRoomOpen()
        └── JoinRoomForm       — roomId lookup + roomCode + optional password; calls facade.submitJoinRoom()
```

Facade selectors consumed: `useRooms`, `useIsLoading`, `useIsCreateRoomOpen`, `useIsJoinRoomOpen`, `useError`  
Facade actions called: `openCreateRoom`, `openJoinRoom`, `submitCreateRoom`, `submitJoinRoom`

---

### GamesWall (`presentation/games-wall/`)

```
GamesWallView (container)
  ├── GamesWallHeader          — room name, room code badge, back to rooms CTA
  ├── GamesWallFilters         — category filter, name search, sort controls; calls facade.applyGameFilters()
  ├── GamesList                — maps over useGames(); renders GameCard per item
  │     └── GameCard           — game name, status badge, category, difficulty, player count, join/start CTA
  ├── GamesWallEmpty           — empty state when no games
  ├── ParticipantsPanel        — collapsible sidebar
  │     ├── ParticipantsFilter — name search + sort; calls facade.applyParticipantFilters()
  │     └── ParticipantList    — maps over useParticipants(); renders ParticipantRow
  │           └── ParticipantRow — avatar, name, remove button (creator only)
  └── CreateGameModal          — controlled by useIsCreateGameOpen()
        └── CreateGameForm     — all game creation inputs; calls facade.submitCreateGame()
```

Facade selectors consumed: `useGames`, `useParticipants`, `useIsLoading`, `useIsCreateGameOpen`, `useGameFilters`, `useParticipantFilters`, `useError`, `useIsRoomCreator`  
Facade actions called: `initGamesWall`, `applyGameFilters`, `applyParticipantFilters`, `openCreateGame`, `submitCreateGame`, `joinGame`, `startGame`, `removeParticipant`

---

### GamePlay (`presentation/game-play/`)

```
GamePlayView (container)
  ├── GamePlayHeader           — game name, question progress (index / total)
  ├── QuestionDisplay          — discriminated on question.type:
  │     ├── MultipleChoiceQuestion  — option buttons; calls facade.submitAnswer() on select
  │     ├── TextInputQuestion       — free-text input + submit button
  │     ├── ScaleQuestion           — range slider + submit button
  │     └── WildChallengeQuestion   — challenge text, free-text response
  ├── CountdownTimer           — reads useRemainingSeconds(); visual ring/bar
  ├── ScorePanel               — reads useScores(); sorted list of PlayerScore rows
  └── LeaveGameConfirmDialog   — controlled by useIsLeaveGameConfirmVisible()
        — confirms / cancels via facade.confirmLeaveGame() / facade.cancelLeaveGame()
```

Facade selectors consumed: `useActiveQuestion`, `useRemainingSeconds`, `useScores`, `useIsLeaveGameConfirmVisible`, `useGameStatus`, `useIsLoading`  
Facade actions called: `submitAnswer`, `requestLeaveGame`, `confirmLeaveGame`, `cancelLeaveGame`

---

### GameSummary (`presentation/game-summary/`)

```
GameSummaryView (container)
  ├── SummaryHeader            — game name, total questions, total time
  ├── RankingsList             — maps over useRankings(); renders RankingRow per entry
  │     └── RankingRow         — rank medal, display name, score, points earned
  └── SummaryActions           — "Back to games wall" button
```

Facade selectors consumed: `useGameSummary`, `useIsLoading`, `useError`  
Facade actions called: `initGameSummary`

---

## Section 3 — State & Handlers (core)

### Store atoms

```
// Shared loading / error
$isLoading: atom<boolean>
$error: atom<string | null>

// Rooms wall
$rooms: atom<Room[]>
$roomsTotal: atom<number>
$isCreateRoomOpen: atom<boolean>
$isJoinRoomOpen: atom<boolean>

// Games wall context
$activeRoomId: atom<RoomId | null>
$games: atom<Game[]>
$gamesTotal: atom<number>
$participants: atom<Participant[]>
$participantsTotal: atom<number>
$isCreateGameOpen: atom<boolean>
$gameFilters: atom<{ category?: string; name?: string; sortBy?: string; sortDir?: string }>
$participantFilters: atom<{ name?: string; sortBy?: string; sortDir?: string }>

// Game play
$gamePlayState: atom<GamePlayState | null>
$isLeaveGameConfirmVisible: atom<boolean>
$ws: atom<WebSocket | null>       // managed internally; not exposed via facade

// Game summary
$gameSummary: atom<GameSummary | null>
```

Computed:
```
$hasError: computed([$error], Boolean)
$activeQuestion: computed([$gamePlayState], (s) => s?.activeQuestion ?? null)
$remainingSeconds: computed([$gamePlayState], (s) => s?.activeQuestion?.remainingSeconds ?? 0)
$scores: computed([$gamePlayState], (s) => s?.scores ?? [])
$gameStatus: computed([$gamePlayState], (s) => s?.status ?? null)
$rankings: computed([$gameSummary], (s) => s?.rankings ?? [])
$isRoomCreator: computed([$activeRoom, $currentUserId], (room, uid) => room?.creatorId === uid)
```

### Handlers (one file per action, `core/handlers/`)

| File | Trigger(s) | What it does |
|------|-----------|--------------|
| `rooms-wall-init.ts` | `[TRIGGER]_ROOMS_WALL_INIT` | Set loading, fetch public rooms via repository, populate `$rooms` |
| `create-room-open.ts` | `[TRIGGER]_CREATE_ROOM_OPEN` | Set `$isCreateRoomOpen = true` |
| `create-room-submit.ts` | `[TRIGGER]_CREATE_ROOM_SUBMIT` | Call `repository.createRoom`, on success dispatch `[TRIGGER]_CREATE_ROOM_SUCCESS` |
| `create-room-success.ts` | `[TRIGGER]_CREATE_ROOM_SUCCESS` | Prepend room to `$rooms`, close modal, navigate to GamesWall |
| `join-room-open.ts` | `[TRIGGER]_JOIN_ROOM_OPEN` | Set `$isJoinRoomOpen = true` |
| `join-room-submit.ts` | `[TRIGGER]_JOIN_ROOM_SUBMIT` | Call `repository.joinRoom`, on success dispatch `[TRIGGER]_JOIN_ROOM_SUCCESS` |
| `join-room-success.ts` | `[TRIGGER]_JOIN_ROOM_SUCCESS` | Close modal, navigate to GamesWall |
| `games-wall-init.ts` | `[TRIGGER]_GAMES_WALL_INIT` | Set `$activeRoomId`, fetch games + participants in parallel via repository, populate `$games` + `$participants` |
| `apply-game-filters.ts` | (called by UI via facade, re-triggers games-wall-init with filters) | Update `$gameFilters`, re-fetch games |
| `apply-participant-filters.ts` | (same pattern for participants) | Update `$participantFilters`, re-fetch participants |
| `create-game-open.ts` | `[TRIGGER]_CREATE_GAME_OPEN` | Set `$isCreateGameOpen = true` |
| `create-game-submit.ts` | `[TRIGGER]_CREATE_GAME_SUBMIT` | Call `repository.createGame`, on success dispatch `[TRIGGER]_CREATE_GAME_SUCCESS` |
| `create-game-success.ts` | `[TRIGGER]_CREATE_GAME_SUCCESS` | Append game to `$games`, close modal |
| `join-game.ts` | `[TRIGGER]_JOIN_GAME` | Call `repository.joinGame`, on success dispatch `[TRIGGER]_JOIN_GAME_SUCCESS` |
| `join-game-success.ts` | `[TRIGGER]_JOIN_GAME_SUCCESS` | Navigate to GamePlay route |
| `start-game.ts` | `[TRIGGER]_START_GAME` | Call `repository.updateGameStatus(gameId, 'game_pending')`, update game in `$games` |
| `remove-participant.ts` | `[TRIGGER]_REMOVE_PARTICIPANT` | Call `repository.removeParticipant`, remove from `$participants` |
| `submit-answer.ts` | `[TRIGGER]_SUBMIT_ANSWER` | Send answer via WS (from `$ws`), mark `activeQuestion.hasAnswered = true` |
| `leave-game-request.ts` | `[TRIGGER]_LEAVE_GAME_REQUEST` | Set `$isLeaveGameConfirmVisible = true` |
| `leave-game-confirm.ts` | `[TRIGGER]_LEAVE_GAME_CONFIRM` | Call `repository.leaveGame`, close WS, navigate back to GamesWall |
| `leave-game-cancel.ts` | `[TRIGGER]_LEAVE_GAME_CANCEL` | Set `$isLeaveGameConfirmVisible = false` |
| `ws-question-started.ts` | `[TRIGGER]_WS_QUESTION_STARTED` | Update `$gamePlayState.activeQuestion`, reset `hasAnswered = false` |
| `ws-timer-ticked.ts` | `[TRIGGER]_WS_TIMER_TICKED` | Update `$gamePlayState.activeQuestion.remainingSeconds` |
| `ws-scores-updated.ts` | `[TRIGGER]_WS_SCORES_UPDATED` | Update `$gamePlayState.scores` |
| `ws-game-state-changed.ts` | `[TRIGGER]_WS_GAME_STATE_CHANGED` | Update `$gamePlayState.status`; if `game_finished` navigate to GameSummary |
| `init-game-summary.ts` | `[TRIGGER]_GAMES_WALL_INIT` (or dedicated trigger) | Fetch summary via `repository.getGameSummary`, populate `$gameSummary` |

### Facade surface (`core/facade.ts`)

```ts
// Actions
init: () => trigger('[TRIGGER]_ROOMS_WALL_INIT')
openCreateRoom: () => trigger('[TRIGGER]_CREATE_ROOM_OPEN')
submitCreateRoom: (payload) => trigger('[TRIGGER]_CREATE_ROOM_SUBMIT', payload)
openJoinRoom: () => trigger('[TRIGGER]_JOIN_ROOM_OPEN')
submitJoinRoom: (payload) => trigger('[TRIGGER]_JOIN_ROOM_SUBMIT', payload)
initGamesWall: (roomId) => trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId })
applyGameFilters: (filters) => ...
applyParticipantFilters: (filters) => ...
openCreateGame: () => trigger('[TRIGGER]_CREATE_GAME_OPEN')
submitCreateGame: (payload) => trigger('[TRIGGER]_CREATE_GAME_SUBMIT', payload)
joinGame: (gameId) => trigger('[TRIGGER]_JOIN_GAME', { gameId })
startGame: (gameId) => trigger('[TRIGGER]_START_GAME', { gameId })
removeParticipant: (roomId, userId) => trigger('[TRIGGER]_REMOVE_PARTICIPANT', { roomId, userId })
submitAnswer: (questionId, answer) => trigger('[TRIGGER]_SUBMIT_ANSWER', { questionId, answer })
requestLeaveGame: () => trigger('[TRIGGER]_LEAVE_GAME_REQUEST')
confirmLeaveGame: (gameId, userId) => trigger('[TRIGGER]_LEAVE_GAME_CONFIRM', { gameId, userId })
cancelLeaveGame: () => trigger('[TRIGGER]_LEAVE_GAME_CANCEL')
initGameSummary: (gameId) => trigger('[TRIGGER]_GAMES_WALL_INIT', ...)

// use* selectors (each wraps store.$atom.use())
useRooms, useRoomsTotal, useIsCreateRoomOpen, useIsJoinRoomOpen,
useGames, useGamesTotal, useGameFilters, useParticipantFilters,
useParticipants, useParticipantsTotal, useIsCreateGameOpen,
useActiveQuestion, useRemainingSeconds, useScores, useGameStatus,
useIsLeaveGameConfirmVisible, useGameSummary, useRankings,
useIsLoading, useError, useHasError, useIsRoomCreator
```

---

## Section 4 — API Communication (integration)

### Repository functions (`integration/repository.ts`)

| Function | Endpoint called | Notes |
|----------|----------------|-------|
| `getRooms(filters, signal)` | GET /api/v1/rooms | Passes search / code / page / limit |
| `createRoom(payload, signal)` | POST /api/v1/rooms | |
| `joinRoom(roomId, payload, signal)` | POST /api/v1/rooms/{roomId}/participants | |
| `getParticipants(roomId, filters, signal)` | GET /api/v1/rooms/{roomId}/participants | |
| `removeParticipant(roomId, userId, signal)` | DELETE /api/v1/rooms/{roomId}/participants/{userId} | |
| `getGames(roomId, filters, signal)` | GET /api/v1/rooms/{roomId}/games | |
| `createGame(roomId, payload, signal)` | POST /api/v1/rooms/{roomId}/games | |
| `joinGame(gameId, signal)` | POST /api/v1/games/{gameId}/players | |
| `leaveGame(gameId, userId, signal)` | DELETE /api/v1/games/{gameId}/players/{userId} | |
| `updateGameStatus(gameId, status, signal)` | PATCH /api/v1/games/{gameId} | |
| `getGameSummary(gameId, signal)` | GET /api/v1/games/{gameId}/summary | |
| `connectGamePlay(gameId, token)` | WS /api/v1/games/{gameId}/play | Returns WebSocket; caller manages lifecycle |

Each REST function:
- Uses `InferOut<Schema['out'], 200>` to type the success response.
- Throws on non-ok HTTP response (caught by handler's `catchError`).
- Accepts `AbortSignal` for cancellation.

### Mappers (`integration/mappers.ts`)

| Mapper | From → To |
|--------|-----------|
| `toRoom(dto)` | API room DTO → `Room` (cast branded ids) |
| `toParticipant(dto)` | API participant DTO → `Participant` |
| `toGame(dto)` | API game DTO → `Game` (discriminated union narrowed by `dto.status`) |
| `toGameSummary(dto)` | API summary DTO → `GameSummary` |
| `toPlayerScore(dto)` | API score DTO → `PlayerScore` |
| `toActiveQuestion(wsPayload)` | WS `question_start` event → `ActiveQuestion` (discriminated on `type`) |

### Loading / error / cancellation pattern

- Each handler that calls a repository function uses `switchMap(ctrl => from(repo.fn(ctrl.signal)).pipe(catchError(...), finalize(() => ctrl.abort())))` — same pattern as the ideal example's `init.ts`.
- `$isLoading` is set to `true` in the leading `tap` and reset in `finalize`.
- `$error` is set in `catchError`; reset at start of each handler.
- WebSocket lifecycle: `connectGamePlay` is called in the `join-game-success` handler; the returned `WebSocket` is stored in `$ws`. Incoming messages are decoded, mapped to `[TRIGGER]_WS_*` events, and dispatched into the bus. The socket is closed in `leave-game-confirm` and on route unmount (`context.tsx` cleanup).

---

## Section 5 — Notes

- `GamePlay` uses a single `$gamePlayState` atom for the entire active-game view rather than separate atoms per concern. This avoids partial-update races between timer ticks and score pushes arriving simultaneously from the WebSocket. // Assumption: timer ticks arrive at ~1s intervals; fine-grained atom splits are not needed.
- The WebSocket handler lives in `integration/` (not `core/`), so `core/` never imports `WebSocket` directly — it only sees `[TRIGGER]_WS_*` events dispatched via the bus. This preserves the core/integration seam.
- `$ws` atom is kept in the store as an opaque value; it is never exposed through the facade — only indirectly managed by the `submit-answer` and `leave-game-confirm` handlers.
- `GamesWall` fetches games and participants in parallel (two `forkJoin`/concurrent `from()` calls in `games-wall-init` handler), then populates both atoms in sequence.
- Filter changes do not trigger a full re-init — the `apply-*-filters` handlers update `$gameFilters`/`$participantFilters` then re-trigger the fetch with new params, reusing the same repository functions.
- `CreateRoomModal` and `JoinRoomModal` are rendered inside `RoomsWallView` (not at route level) so they share the same store context without needing portal/global state.
- The `LeaveGameConfirmDialog` is a pure presentational component: it has no knowledge of the leave logic; it only calls `facade.confirmLeaveGame` or `facade.cancelLeaveGame`.
- `router.tsx` guards GamesWall and GamePlay routes — redirects to `/gaming` if the user is not a room participant (checked via the store after `games-wall-init`).
