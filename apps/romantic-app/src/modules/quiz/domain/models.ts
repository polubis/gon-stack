import type { Brand } from '@repo/type-beast/brand';

export type SessionId = Brand<string, 'SessionId'>;
export type PlayerId = Brand<string, 'PlayerId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type QuestionId = Brand<string, 'QuestionId'>;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AnswerValue = string | number | boolean;

export type QuizCategory = {
  id: CategoryId;
  key: string;
  label: string;
  description: string;
};

export type QuestionOption = {
  label: string;
  value: string;
};

type QuestionBase = {
  id: QuestionId;
  categoryId: CategoryId;
  prompt: string;
  difficulty: Difficulty;
  timeLimitSec: number;
  tip?: string;
};

export type QuizQuestion =
  | (QuestionBase & {
      answerType: 'multiple-choice';
      options: QuestionOption[];
    })
  | (QuestionBase & {
      answerType: 'scale';
      min: 1;
      max: 5;
    })
  | (QuestionBase & {
      answerType: 'yes-no';
    })
  | (QuestionBase & {
      answerType: 'open-text';
      maxLength: number;
    });

export type PlayerScore = {
  playerId: PlayerId;
  name: string;
  score: number;
};

export type SessionStatus =
  | 'idle'
  | 'category-selection'
  | 'answering'
  | 'revealing'
  | 'category-summary'
  | 'paused'
  | 'finished';

export type CategorySummary = {
  categoryId: CategoryId;
  roundsPlayed: number;
  matches: number;
  compatibility: number;
};
