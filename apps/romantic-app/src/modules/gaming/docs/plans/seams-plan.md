# Gaming Module — Seams (Facade Contracts)

These are the locked cross-layer interfaces. Each layer implements against these types only.  
No layer may import from another layer's implementation files — only from `domain/` and these contracts.

**Dependency rule:** `presentation` → `core/facade` → `integration/repository` → `domain`  
**Transport rule:** `integration/` owns all I/O (fetch, WebSocket). `core/` never imports `WebSocket` or `fetch`.

---

## 1 — Repository Interface (integration → core)

```ts
// core/ports/repository.ts  (interface file; implementation lives in integration/)

import type { AbortSignal } from 'node:events'; // or global AbortSignal
import type {
  Game,
  GameId,
  GameSummary,
  Participant,
  RoomId,
  Room,
} from '../../domain/models';

export type RoomsFilter = {
  search?: string;
  code?: string;
  page?: number;
  limit?: number;
};

export type ParticipantsFilter = {
  filterUserName?: string;
  sortBy?: 'user_name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type GamesFilter = {
  filterCategory?: string;
  filterGameName?: string;
  sortBy?: 'order' | 'category' | 'game_name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type CreateRoomPayload = {
  name: string;
  visibility: 'public' | 'private';
  password?: string;
};

export type JoinRoomPayload = {
  roomCode: string;
  roomPassword?: string;
};

export type CreateGamePayload = {
  name: string;
  type: 'casual';
  maxPlayers: number;
  timePerQuestion: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
};

export interface IRepository {
  getRooms(filters: RoomsFilter, signal: AbortSignal): Promise<PagedResult<Room>>;
  createRoom(payload: CreateRoomPayload, signal: AbortSignal): Promise<Room>;
  joinRoom(roomId: RoomId, payload: JoinRoomPayload, signal: AbortSignal): Promise<Participant>;
  getParticipants(roomId: RoomId, filters: ParticipantsFilter, signal: AbortSignal): Promise<PagedResult<Participant>>;
  removeParticipant(roomId: RoomId, userId: string, signal: AbortSignal): Promise<void>;
  getGames(roomId: RoomId, filters: GamesFilter, signal: AbortSignal): Promise<PagedResult<Game>>;
  createGame(roomId: RoomId, payload: CreateGamePayload, signal: AbortSignal): Promise<Game>;
  joinGame(gameId: GameId, signal: AbortSignal): Promise<void>;
  leaveGame(gameId: GameId, userId: string, signal: AbortSignal): Promise<void>;
  updateGameStatus(gameId: GameId, status: 'game_pending' | 'game_finished', signal: AbortSignal): Promise<Game>;
  getGameSummary(gameId: GameId, signal: AbortSignal): Promise<GameSummary>;
  connectGamePlay(gameId: GameId, token: string): WebSocket;
}
```

---

## 2 — Facade Interface (core → presentation)

```ts
// core/ports/facade.ts  (interface file; implementation lives in core/facade.ts)

import type {
  Answer,
  Game,
  GameId,
  GameSummary,
  Participant,
  PlayerRanking,
  PlayerScore,
  Question,
  Room,
  RoomId,
} from '../../domain/models';
import type { CreateGamePayload, CreateRoomPayload, GamesFilter, JoinRoomPayload, ParticipantsFilter } from './repository';

export interface IFacade {
  // --- Rooms Wall ---
  init(): void;
  openCreateRoom(): void;
  submitCreateRoom(payload: CreateRoomPayload): void;
  openJoinRoom(): void;
  submitJoinRoom(payload: { roomId: RoomId } & JoinRoomPayload): void;

  // --- Games Wall ---
  initGamesWall(roomId: RoomId): void;
  applyGameFilters(filters: GamesFilter): void;
  applyParticipantFilters(filters: ParticipantsFilter): void;
  openCreateGame(): void;
  submitCreateGame(payload: CreateGamePayload): void;
  joinGame(gameId: GameId): void;
  startGame(gameId: GameId): void;
  removeParticipant(roomId: RoomId, userId: string): void;

  // --- Game Play ---
  submitAnswer(questionId: string, answer: Answer): void;
  requestLeaveGame(): void;
  confirmLeaveGame(gameId: GameId, userId: string): void;
  cancelLeaveGame(): void;

  // --- Game Summary ---
  initGameSummary(gameId: GameId): void;

  // --- Selectors (Rooms Wall) ---
  useRooms(): Room[];
  useRoomsTotal(): number;
  useIsCreateRoomOpen(): boolean;
  useIsJoinRoomOpen(): boolean;

  // --- Selectors (Games Wall) ---
  useGames(): Game[];
  useGamesTotal(): number;
  useGameFilters(): GamesFilter;
  useParticipants(): Participant[];
  useParticipantsTotal(): number;
  useParticipantFilters(): ParticipantsFilter;
  useIsCreateGameOpen(): boolean;
  useIsRoomCreator(): boolean;

  // --- Selectors (Game Play) ---
  useActiveQuestion(): import('../../domain/models').ActiveQuestion | null;
  useRemainingSeconds(): number;
  useScores(): PlayerScore[];
  useGameStatus(): 'game_pending' | 'game_finished' | null;
  useIsLeaveGameConfirmVisible(): boolean;

  // --- Selectors (Game Summary) ---
  useGameSummary(): GameSummary | null;
  useRankings(): PlayerRanking[];

  // --- Shared ---
  useIsLoading(): boolean;
  useError(): string | null;
  useHasError(): boolean;
}
```

---

## 3 — WebSocket Message Contract (integration internal — dispatched into bus)

```ts
// integration/ws-contracts.ts

import type { ActiveQuestion, GameSummary, PlayerScore } from '../../domain/models';

// Messages received from the server over WebSocket
export type WsServerMessage =
  | { event: 'question_start'; data: ActiveQuestion }
  | { event: 'timer_tick';     data: { questionId: string; remaining: number } }
  | { event: 'score_update';   data: { scores: PlayerScore[] } }
  | { event: 'game_state_change'; data: { status: 'game_pending' | 'game_finished' } }
  | { event: 'game_end';       data: GameSummary };

// Message sent by the client to the server over WebSocket
export type WsClientMessage = {
  type: 'submit_answer';
  questionId: string;
  answer: import('../../domain/models').Answer;
};
```

---

## 4 — Cross-Layer Communication Rules

| Rule | Detail |
|------|--------|
| **Presentation → core only** | Components never call `repository` or `fetch` directly. All side effects go through `facade` actions. |
| **core → integration via IRepository** | Handlers import `IRepository` (the interface), not the concrete `repository.ts`. The concrete impl is injected in `mediator.ts`. |
| **WS events enter via bus** | The WS handler in `integration/` dispatches `[TRIGGER]_WS_*` events into the bus. `core/` handlers listen on those triggers. The WS object itself is never passed to `core/`. |
| **Domain types cross all layers** | `domain/models.ts` and `domain/events.ts` are the only files imported across all three layers. No layer defines its own copies of domain types. |
| **Mappers in integration only** | Backend DTOs are mapped to domain types in `integration/mappers.ts` before returning from any repository function. `core/` and `presentation/` never see raw API response shapes. |
| **AbortSignal per handler** | Each handler that calls a repository function creates its own `AbortController`, passes the signal, and aborts in `finalize`. No shared AbortControllers. |
| **Error as string** | `$error` stores `string | null`. All errors are normalised to message strings in the `catchError` of each handler. No raw `Error` objects in the store. |
| **Status transitions** | The FSM is `game_waiting → game_pending → game_finished`. Only the `updateGameStatus` repository call advances state. The store reflects the server's source of truth after each successful call. |
