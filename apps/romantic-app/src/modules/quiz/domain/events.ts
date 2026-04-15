import type {
  EffectEvent,
  FactEvent,
  TaskEvent,
  TriggerEvent,
} from '@/libs/eda';
import type {
  AnswerValue,
  CategoryId,
  CategorySummary,
  PlayerId,
  PlayerScore,
  QuizCategory,
  QuizQuestion,
  SessionId,
} from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_SELECT_CATEGORY', { categoryId: CategoryId }>
  | TriggerEvent<'[TRIGGER]_SUBMIT_ANSWER', { answer: AnswerValue }>
  | TriggerEvent<'[TRIGGER]_NEXT_QUESTION'>
  | TriggerEvent<'[TRIGGER]_PAUSE'>
  | TriggerEvent<'[TRIGGER]_RESUME'>
  | TriggerEvent<'[TRIGGER]_END_SESSION'>
  | TaskEvent<'[TASK]_RUN_TIMER', { seconds: number }>
  | TaskEvent<'[TASK]_CONNECT_REALTIME', { sessionId: SessionId }>
  | FactEvent<
      '[FACT]_SESSION_READY',
      {
        sessionId: SessionId;
        localPlayerId: PlayerId;
        partnerPlayerId: PlayerId;
        players: PlayerScore[];
        categories: QuizCategory[];
        winScore: number;
      }
    >
  | FactEvent<
      '[FACT]_QUESTION_READY',
      {
        question: QuizQuestion;
        questionIndex: number;
      }
    >
  | FactEvent<
      '[FACT]_ROUND_RESOLVED',
      {
        localAnswer: AnswerValue | null;
        partnerAnswer: AnswerValue | null;
        delta: number;
      }
    >
  | FactEvent<
      '[FACT]_PARTNER_ANSWER_RECEIVED',
      {
        questionId: string;
        answer: AnswerValue;
      }
    >
  | FactEvent<'[FACT]_CATEGORY_COMPLETED', { summary: CategorySummary }>
  | FactEvent<'[FACT]_GAME_COMPLETED', { winnerId: PlayerId }>
  | EffectEvent<'[EFFECT]_LOG_ERROR', { message: string }>;
