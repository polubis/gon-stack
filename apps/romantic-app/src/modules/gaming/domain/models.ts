import type { Brand } from '@repo/type-beast/brand';
import type { Prettify } from '@repo/type-beast/prettify';

export type RoomId = Brand<string, 'RoomId'>;
export type RoomCode = Brand<string, 'RoomCode'>;
export type GameId = Brand<string, 'GameId'>;
export type ParticipantId = Brand<string, 'ParticipantId'>;
export type PlayerId = Brand<string, 'PlayerId'>;
export type QuestionId = Brand<string, 'QuestionId'>;

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

export type Participant = {
  userId: string;
  displayName: string;
  joinedAt: string;
};

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

type QuestionBase = {
  id: QuestionId;
  content: string;
};

export type MultipleChoiceQuestion = Prettify<
  QuestionBase & { type: 'multiple_choice'; options: string[] }
>;

export type TextInputQuestion = Prettify<QuestionBase & { type: 'text_input' }>;

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

export type MultipleChoiceAnswer = { type: 'multiple_choice'; selected: string[] };
export type TextInputAnswer = { type: 'text_input'; text: string };
export type ScaleAnswer = { type: 'scale'; value: number };
export type WildChallengeAnswer = { type: 'wild_challenge'; text: string };

export type Answer =
  | MultipleChoiceAnswer
  | TextInputAnswer
  | ScaleAnswer
  | WildChallengeAnswer;

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

export type LeaveGameConfirmation = {
  gameId: GameId;
  visible: boolean;
};
