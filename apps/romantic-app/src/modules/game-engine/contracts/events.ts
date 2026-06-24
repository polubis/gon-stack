import { type TriggerEvent, type TaskEvent, type FactEvent } from '@/libs/eda';
import type {
  AnswerValue,
  Category,
  CategoryId,
  CategoryStats,
  PlayerAnswer,
  PlayerId,
  Question,
  RoundResult,
} from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT'>
  | TriggerEvent<'[TRIGGER]_SELECT_CATEGORY', CategoryId>
  | TriggerEvent<'[TRIGGER]_LOAD_QUESTIONS'>
  | TriggerEvent<'[TRIGGER]_START_QUESTION'>
  | TriggerEvent<'[TRIGGER]_SUBMIT_ANSWER', AnswerValue>
  | TriggerEvent<'[TRIGGER]_SKIP_QUESTION'>
  | TriggerEvent<'[TRIGGER]_NEXT_QUESTION'>
  | TriggerEvent<'[TRIGGER]_PAUSE_SESSION'>
  | TriggerEvent<'[TRIGGER]_RESUME_SESSION'>
  | TaskEvent<'[TASK]_FETCH_QUESTIONS'>
  | TaskEvent<'[TASK]_SIMULATE_PARTNER_ANSWER'>
  | FactEvent<'[FACT]_CATEGORIES_LOADED', Category[]>
  | FactEvent<'[FACT]_QUESTIONS_LOADED', Question[]>
  | FactEvent<'[FACT]_QUESTIONS_LOAD_FAILED', string>
  | FactEvent<'[FACT]_TIMER_TICK', number>
  | FactEvent<'[FACT]_TIMER_EXPIRED'>
  | FactEvent<'[FACT]_PLAYER_ANSWERED', PlayerAnswer>
  | FactEvent<'[FACT]_BOTH_ANSWERED'>
  | FactEvent<'[FACT]_ROUND_EVALUATED', RoundResult>
  | FactEvent<'[FACT]_CATEGORY_COMPLETED', CategoryStats>
  | FactEvent<'[FACT]_WIN_DETECTED', PlayerId>;
