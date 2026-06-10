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
  | TriggerEvent<'[TRIGGER]_ROOMS_WALL_INIT'>
  | TriggerEvent<'[TRIGGER]_CREATE_ROOM_OPEN'>
  | TriggerEvent<
      '[TRIGGER]_CREATE_ROOM_SUBMIT',
      { name: string; visibility: 'public' | 'private'; password?: string }
    >
  | TriggerEvent<'[TRIGGER]_CREATE_ROOM_SUCCESS', Room>
  | TriggerEvent<'[TRIGGER]_JOIN_ROOM_OPEN'>
  | TriggerEvent<
      '[TRIGGER]_JOIN_ROOM_SUBMIT',
      { roomId: RoomId; roomCode: string; roomPassword?: string }
    >
  | TriggerEvent<'[TRIGGER]_JOIN_ROOM_SUCCESS', Participant>
  | TriggerEvent<'[TRIGGER]_GAMES_WALL_INIT', { roomId: RoomId }>
  | TriggerEvent<
      '[TRIGGER]_REMOVE_PARTICIPANT',
      { roomId: RoomId; userId: string }
    >
  | TriggerEvent<'[TRIGGER]_CREATE_GAME_OPEN'>
  | TriggerEvent<
      '[TRIGGER]_CREATE_GAME_SUBMIT',
      {
        name: string;
        type: 'casual';
        maxPlayers: number;
        timePerQuestion: number;
        category: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        description?: string;
      }
    >
  | TriggerEvent<'[TRIGGER]_CREATE_GAME_SUCCESS', Game>
  | TriggerEvent<'[TRIGGER]_JOIN_GAME', { gameId: GameId }>
  | TriggerEvent<'[TRIGGER]_JOIN_GAME_SUCCESS', { gameId: GameId }>
  | TriggerEvent<'[TRIGGER]_START_GAME', { gameId: GameId }>
  | TriggerEvent<
      '[TRIGGER]_SUBMIT_ANSWER',
      { questionId: string; answer: Answer }
    >
  | TriggerEvent<'[TRIGGER]_LEAVE_GAME_REQUEST'>
  | TriggerEvent<
      '[TRIGGER]_LEAVE_GAME_CONFIRM',
      { gameId: GameId; userId: string }
    >
  | TriggerEvent<'[TRIGGER]_LEAVE_GAME_CANCEL'>
  | TriggerEvent<'[TRIGGER]_GAME_SUMMARY_INIT', { gameId: GameId }>
  | TriggerEvent<'[TRIGGER]_WS_GAME_STATE_CHANGED', GamePlayState>
  | TriggerEvent<
      '[TRIGGER]_WS_SCORES_UPDATED',
      { scores: GamePlayState['scores'] }
    >
  | TriggerEvent<
      '[TRIGGER]_WS_TIMER_TICKED',
      { questionId: string; remaining: number }
    >
  | TriggerEvent<
      '[TRIGGER]_WS_QUESTION_STARTED',
      GamePlayState['activeQuestion']
    >
  | TriggerEvent<'[TRIGGER]_WS_GAME_ENDED', GameSummary>;
