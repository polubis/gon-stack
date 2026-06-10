import type {
  ActiveQuestion,
  Game,
  GameFinished,
  GameId,
  GamePending,
  GameSummary,
  GameWaiting,
  MultipleChoiceQuestion,
  Participant,
  ParticipantId,
  PlayerScore,
  QuestionId,
  Room,
  RoomCode,
  RoomId,
  ScaleQuestion,
} from '../domain/models';

export const toRoom = (dto: {
  id: string;
  name: string;
  roomCode: string;
  visibility: 'public' | 'private';
  hasPassword: boolean;
  creatorId: string;
  participantCount: number;
  createdAt: string;
}): Room => ({
  id: dto.id as RoomId,
  name: dto.name,
  code: dto.roomCode as RoomCode,
  visibility: dto.visibility,
  hasPassword: dto.hasPassword,
  creatorId: dto.creatorId,
  participantCount: dto.participantCount,
  createdAt: dto.createdAt,
});

export const toParticipant = (dto: {
  userId: string;
  displayName: string;
  joinedAt: string;
}): Participant => ({
  userId: dto.userId,
  displayName: dto.displayName,
  joinedAt: dto.joinedAt,
});

export const toGame = (dto: {
  id: string;
  name: string;
  type: 'casual';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxPlayers: number;
  playerCount: number;
  timePerQuestion: number;
  creatorId: string;
  createdAt: string;
  status: 'game_waiting' | 'game_pending' | 'game_finished';
}): Game => {
  const base = {
    id: dto.id as GameId,
    name: dto.name,
    type: dto.type,
    category: dto.category,
    difficulty: dto.difficulty,
    maxPlayers: dto.maxPlayers,
    playerCount: dto.playerCount,
    timePerQuestion: dto.timePerQuestion,
    creatorId: dto.creatorId,
    createdAt: dto.createdAt,
  } as const;

  switch (dto.status) {
    case 'game_waiting':
      return { ...base, status: 'game_waiting' } satisfies GameWaiting;
    case 'game_pending':
      return { ...base, status: 'game_pending' } satisfies GamePending;
    case 'game_finished':
      return { ...base, status: 'game_finished' } satisfies GameFinished;
    default: {
      const _: never = dto.status;
      return _;
    }
  }
};

export const toPlayerScore = (dto: {
  userId: string;
  displayName: string;
  score: number;
}): PlayerScore => ({
  userId: dto.userId,
  displayName: dto.displayName,
  score: dto.score,
});

export const toGameSummary = (dto: {
  gameId: string;
  gameName: string;
  totalQuestions: number;
  totalTimeSeconds: number;
  rankings: {
    rank: number;
    userId: string;
    displayName: string;
    score: number;
    pointsEarned: number;
  }[];
}): GameSummary => ({
  gameId: dto.gameId as GameId,
  gameName: dto.gameName,
  totalQuestions: dto.totalQuestions,
  totalTimeSeconds: dto.totalTimeSeconds,
  rankings: dto.rankings.map((r) => ({
    rank: r.rank,
    userId: r.userId,
    displayName: r.displayName,
    score: r.score,
    pointsEarned: r.pointsEarned,
  })),
});

export const toActiveQuestion = (wsPayload: {
  questionId: string;
  content: string;
  type: 'multiple_choice' | 'text_input' | 'scale' | 'wild_challenge';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  step?: number;
  index: number;
  total: number;
  duration: number;
}): ActiveQuestion => {
  const id = wsPayload.questionId as QuestionId;

  switch (wsPayload.type) {
    case 'multiple_choice': {
      const question: MultipleChoiceQuestion = {
        id,
        content: wsPayload.content,
        type: 'multiple_choice',
        options: wsPayload.options ?? [],
      };
      return {
        question,
        index: wsPayload.index,
        total: wsPayload.total,
        remainingSeconds: wsPayload.duration,
        hasAnswered: false,
      };
    }
    case 'text_input': {
      return {
        question: { id, content: wsPayload.content, type: 'text_input' },
        index: wsPayload.index,
        total: wsPayload.total,
        remainingSeconds: wsPayload.duration,
        hasAnswered: false,
      };
    }
    case 'scale': {
      const question: ScaleQuestion = {
        id,
        content: wsPayload.content,
        type: 'scale',
        min: wsPayload.scaleMin ?? 0,
        max: wsPayload.scaleMax ?? 10,
        step: wsPayload.step ?? 1,
      };
      return {
        question,
        index: wsPayload.index,
        total: wsPayload.total,
        remainingSeconds: wsPayload.duration,
        hasAnswered: false,
      };
    }
    case 'wild_challenge': {
      return {
        question: { id, content: wsPayload.content, type: 'wild_challenge' },
        index: wsPayload.index,
        total: wsPayload.total,
        remainingSeconds: wsPayload.duration,
        hasAnswered: false,
      };
    }
    default: {
      const _: never = wsPayload.type;
      return _;
    }
  }
};
