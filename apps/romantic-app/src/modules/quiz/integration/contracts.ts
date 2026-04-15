import type {
  AnswerValue,
  CategoryId,
  CategorySummary,
  PlayerId,
  PlayerScore,
  QuizCategory,
  QuizQuestion,
  SessionId,
} from '../domain/models';

export type InitSessionResponse = {
  sessionId: SessionId;
  localPlayerId: PlayerId;
  partnerPlayerId: PlayerId;
  players: PlayerScore[];
  categories: QuizCategory[];
  winScore: number;
};

export type NextQuestionResponse = {
  question: QuizQuestion | null;
  categorySummary?: CategorySummary;
};

export type SubmitAnswerRequest = {
  sessionId: SessionId;
  categoryId: CategoryId;
  questionId: string;
  answer: AnswerValue;
};

export type NextQuestionRequest = {
  sessionId: SessionId;
  categoryId: CategoryId;
  askedQuestionIds: string[];
};

export type RealtimeOutboundEvent = {
  type: 'local-answer-submitted';
  payload: {
    questionId: string;
    answer: AnswerValue;
    answerType: QuizQuestion['answerType'];
    options?: { value: string; label: string }[];
  };
};

export type RealtimeInboundEvent = {
  type: 'partner-answer';
  payload: {
    questionId: string;
    answer: AnswerValue;
  };
};

export type QuizRepository = {
  initSession(signal?: AbortSignal): Promise<InitSessionResponse>;
  submitAnswer(input: SubmitAnswerRequest, signal?: AbortSignal): Promise<void>;
  nextQuestion(
    input: NextQuestionRequest,
    signal?: AbortSignal,
  ): Promise<NextQuestionResponse>;
};

export type QuizRealtime = {
  connect(sessionId: SessionId): void;
  disconnect(): void;
  publish(event: RealtimeOutboundEvent): void;
  subscribe(listener: (event: RealtimeInboundEvent) => void): () => void;
};
