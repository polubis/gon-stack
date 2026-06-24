import type { Brand } from '@repo/type-beast/brand';

export type CategoryId = Brand<string, 'CategoryId'>;
export type QuestionId = Brand<string, 'QuestionId'>;
export type PlayerId = Brand<string, 'PlayerId'>;
export type SessionId = Brand<string, 'SessionId'>;

export type GamePhase =
  | 'category_selection'
  | 'question_loading'
  | 'answering'
  | 'waiting_for_partner'
  | 'results_reveal'
  | 'category_summary'
  | 'win_celebration'
  | 'session_paused';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'multiple_choice' | 'scale' | 'yes_no' | 'open_text';

export type AnswerResult = 'match' | 'mismatch' | 'no_answer';

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
  questionCount: number;
};

export type QuestionOption = {
  label: string;
  value: string;
};

export type Question = {
  id: QuestionId;
  categoryId: CategoryId;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  options?: QuestionOption[];
  scaleMin?: number;
  scaleMax?: number;
  maxLength?: number;
  educationalTip?: string;
};

export type AnswerValue = string | number | null;

export type PlayerAnswer = {
  playerId: PlayerId;
  questionId: QuestionId;
  value: AnswerValue;
  answeredAt: number;
};

export type Player = {
  id: PlayerId;
  name: string;
  score: number;
};

export type RoundResult = {
  questionId: QuestionId;
  categoryId: CategoryId;
  player1Answer: PlayerAnswer;
  player2Answer: PlayerAnswer;
  result: AnswerResult;
  pointsDelta: number;
  educationalTip?: string;
};

export type CategoryStats = {
  categoryId: CategoryId;
  totalQuestions: number;
  answered: number;
  matched: number;
  mismatched: number;
  skipped: number;
  compatibilityPercent: number;
};
