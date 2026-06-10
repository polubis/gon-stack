# Gaming Module — Domain Plan

**Imports:** `@repo/type-beast/brand`, `@repo/type-beast/prettify`, `@/libs/eda`  
**Ideal example:** `apps/romantic-app/src/modules/user-profile-setup/domain/`  
**Rules:** `type` aliases only · branded ids · discriminated unions on `type`/`status` · no DTO/DB/transport concerns

---

## Section 1 — Domain Models (`models.ts`)

```ts
import type { Brand } from '@repo/type-beast/brand';
import type { Prettify } from '@repo/type-beast/prettify';

// --- Branded Ids ---

export type RoomId = Brand<string, 'RoomId'>;
export type RoomCode = Brand<string, 'RoomCode'>;
export type GameId = Brand<string, 'GameId'>;
export type ParticipantId = Brand<string, 'ParticipantId'>;
export type PlayerId = Brand<string, 'PlayerId'>;
export type QuestionId = Brand<string, 'QuestionId'>;

// --- Room ---

export type Room = {
  id: RoomId;
  name: string;
  code: RoomCode;
  visibility: 'public' | 'private';
  hasPassword: boolean;
  creatorId: string;
  participantCount: number;
  createdAt: string;
};

// --- Participant ---

export type Participant = {
  userId: string;
  displayName: string;
  joinedAt: string;
};

// --- Game ---

type GameBase = {
  id: GameId;
  name: string;
  type: 'casual';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxPlayers: number;
  playerCount: number;
  timePerQuestion: number;
  creatorId: string;
  createdAt: string;
};

export type GameWaiting = Prettify<GameBase & { status: 'game_waiting' }>;
export type GamePending = Prettify<GameBase & { status: 'game_pending' }>;
export type GameFinished = Prettify<GameBase & { status: 'game_finished' }>;

export type Game = GameWaiting | GamePending | GameFinished;

// --- Question (discriminated by type) ---

type QuestionBase = {
  id: QuestionId;
  content: string;
};

export type MultipleChoiceQuestion = Prettify<
  QuestionBase & { type: 'multiple_choice'; options: string[] }
>;

export type TextInputQuestion = Prettify<
  QuestionBase & { type: 'text_input' }
>;

export type ScaleQuestion = Prettify<
  QuestionBase & { type: 'scale'; min: number; max: number; step: number }
>;

export type WildChallengeQuestion = Prettify<
  QuestionBase & { type: 'wild_challenge' }
>;

export type Question =
  | MultipleChoiceQuestion
  | TextInputQuestion
  | ScaleQuestion
  | WildChallengeQuestion;

// --- Answer (discriminated by type — mirrors Question variants) ---

export type MultipleChoiceAnswer = { type: 'multiple_choice'; selected: string[] };
export type TextInputAnswer = { type: 'text_input'; text: string };
export type ScaleAnswer = { type: 'scale'; value: number };
export type WildChallengeAnswer = { type: 'wild_challenge'; text: string };

export type Answer =
  | MultipleChoiceAnswer
  | TextInputAnswer
  | ScaleAnswer
  | WildChallengeAnswer;

// --- Game Play State ---

export type PlayerScore = {
  userId: string;
  displayName: string;
  score: number;
};

export type ActiveQuestion = {
  question: Question;
  index: number;
  total: number;
  remainingSeconds: number;
  hasAnswered: boolean;
};

export type GamePlayState = {
  gameId: GameId;
  status: 'game_pending' | 'game_finished';
  activeQuestion: ActiveQuestion | null;
  scores: PlayerScore[];
};

// --- Game Summary ---

export type PlayerRanking = {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  pointsEarned: number;
};

export type GameSummary = {
  gameId: GameId;
  gameName: string;
  totalQuestions: number;
  totalTimeSeconds: number;
  rankings: PlayerRanking[];
};

// --- Leave Game Confirmation ---

export type LeaveGameConfirmation = {
  gameId: GameId;
  visible: boolean;
};
```

---

## Section 2 — Domain Events (`events.ts`)

```ts
import { type TriggerEvent } from '@/libs/eda';
import type {
  Answer,
  Game,
  GameId,
  GamePlayState,
  GameSummary,
  Participant,
  Room,
  RoomId,
} from './models';

export type Event =
  // Rooms wall
  | TriggerEvent<'[TRIGGER]_ROOMS_WALL_INIT'>
  // Create room
  | TriggerEvent<'[TRIGGER]_CREATE_ROOM_OPEN'>
  | TriggerEvent<'[TRIGGER]_CREATE_ROOM_SUBMIT', {
      name: string;
      visibility: 'public' | 'private';
      password?: string;
    }>
  | TriggerEvent<'[TRIGGER]_CREATE_ROOM_SUCCESS', Room>
  // Join room
  | TriggerEvent<'[TRIGGER]_JOIN_ROOM_OPEN'>
  | TriggerEvent<'[TRIGGER]_JOIN_ROOM_SUBMIT', {
      roomId: RoomId;
      roomCode: string;
      roomPassword?: string;
    }>
  | TriggerEvent<'[TRIGGER]_JOIN_ROOM_SUCCESS', Participant>
  // Games wall (enter room context)
  | TriggerEvent<'[TRIGGER]_GAMES_WALL_INIT', { roomId: RoomId }>
  // Participant management
  | TriggerEvent<'[TRIGGER]_REMOVE_PARTICIPANT', { roomId: RoomId; userId: string }>
  // Create game
  | TriggerEvent<'[TRIGGER]_CREATE_GAME_OPEN'>
  | TriggerEvent<'[TRIGGER]_CREATE_GAME_SUBMIT', {
      name: string;
      type: 'casual';
      maxPlayers: number;
      timePerQuestion: number;
      category: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      description?: string;
    }>
  | TriggerEvent<'[TRIGGER]_CREATE_GAME_SUCCESS', Game>
  // Join game
  | TriggerEvent<'[TRIGGER]_JOIN_GAME', { gameId: GameId }>
  | TriggerEvent<'[TRIGGER]_JOIN_GAME_SUCCESS', { gameId: GameId }>
  // Start game (creator action → transitions game_waiting → game_pending)
  | TriggerEvent<'[TRIGGER]_START_GAME', { gameId: GameId }>
  // Game play
  | TriggerEvent<'[TRIGGER]_SUBMIT_ANSWER', { questionId: string; answer: Answer }>
  // Leave game confirmation flow
  | TriggerEvent<'[TRIGGER]_LEAVE_GAME_REQUEST'>
  | TriggerEvent<'[TRIGGER]_LEAVE_GAME_CONFIRM', { gameId: GameId; userId: string }>
  | TriggerEvent<'[TRIGGER]_LEAVE_GAME_CANCEL'>
  // Server-pushed game state events (dispatched from WebSocket handler)
  | TriggerEvent<'[TRIGGER]_WS_GAME_STATE_CHANGED', GamePlayState>
  | TriggerEvent<'[TRIGGER]_WS_SCORES_UPDATED', { scores: GamePlayState['scores'] }>
  | TriggerEvent<'[TRIGGER]_WS_TIMER_TICKED', { questionId: string; remaining: number }>
  | TriggerEvent<'[TRIGGER]_WS_QUESTION_STARTED', GamePlayState['activeQuestion']>
  | TriggerEvent<'[TRIGGER]_WS_GAME_ENDED', GameSummary>;
```

---

## Section 3 — Notes

- `Game` uses a discriminated union on `status` so narrowing to `GameWaiting | GamePending | GameFinished` is type-safe; future variants (e.g. cancelled) can be added without touching existing branches.
- `Question` and `Answer` are co-discriminated on `type` so the presentation layer can match them safely without casting.
- `GamePlayState` is the entire in-memory game view: the WebSocket handler updates a single atom of this type instead of scattered per-field atoms.
- `LeaveGameConfirmation` is a pure view-state flag — no persistence concern.
- `RoomCode` uses `Brand<string, 'RoomCode'>` (not `Brand<number, ...>`) because room codes are alphanumeric strings. // Assumption: room codes are short alphanumeric strings generated server-side.
- `WS_*` events are dispatched by the WebSocket integration handler into the bus, keeping the core layer unaware of the transport protocol.
- `PlayerScore` (live scoreboard) and `PlayerRanking` (post-game summary) are separate types: the live view needs minimal data; the summary view adds rank and points-earned breakdown.
