import type { AnswerValue, CategorySummary, PlayerScore } from '../domain/models';

const normalizeAnswer = (value: AnswerValue | null): string => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  return String(value);
};

export const resolveRoundDelta = (
  localAnswer: AnswerValue | null,
  partnerAnswer: AnswerValue | null,
): number => {
  if (localAnswer === null || partnerAnswer === null) {
    return 0;
  }

  return normalizeAnswer(localAnswer) === normalizeAnswer(partnerAnswer) ? 1 : -1;
};

export const applyScoreDelta = ({
  players,
  localPlayerId,
  delta,
}: {
  players: PlayerScore[];
  localPlayerId: string;
  delta: number;
}): PlayerScore[] => {
  return players.map((player) => {
    if (player.playerId === localPlayerId) {
      return {
        ...player,
        score: player.score + delta,
      };
    }

    return player;
  });
};

export const buildCategorySummary = ({
  categoryId,
  askedQuestionIds,
  scoreDeltas,
}: {
  categoryId: string;
  askedQuestionIds: string[];
  scoreDeltas: number[];
}): CategorySummary => {
  const matches = scoreDeltas.filter((delta) => delta > 0).length;
  const roundsPlayed = askedQuestionIds.length;
  const compatibility = roundsPlayed > 0 ? Math.round((matches / roundsPlayed) * 100) : 0;

  return {
    categoryId,
    roundsPlayed,
    matches,
    compatibility,
  } as CategorySummary;
};
