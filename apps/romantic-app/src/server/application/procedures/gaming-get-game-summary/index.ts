import { schema } from '@schemas/gaming-get-game-summary';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';

export const gamingGetGameSummary = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path }, { db }) => {
    const { gameId } = path;

    const { data: game, error: gameError } = await db
      .from('games')
      .select('id, name, started_at, finished_at, status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new NotFound('Game not found');
    }

    if (game.status !== 'finished') {
      return {
        code: 409,
        type: 'conflict' as const,
        message: 'Game is not yet finished',
      };
    }

    const { count: questionCount, error: questionError } = await db
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (questionError) {
      throw new InternalServer(questionError.message);
    }

    const { data: scores, error: scoresError } = await db
      .from('game_scores')
      .select('user_id, total_score')
      .eq('game_id', gameId)
      .order('total_score', { ascending: false });

    if (scoresError) {
      throw new InternalServer(scoresError.message);
    }

    const startedAt = game.started_at ? new Date(game.started_at).getTime() : 0;
    const finishedAt = game.finished_at ? new Date(game.finished_at).getTime() : Date.now();
    const totalTimeSeconds = Math.round((finishedAt - startedAt) / 1000);

    const rankings = (scores ?? []).map((s, idx) => ({
      rank: idx + 1,
      userId: s.user_id,
      displayName: s.user_id,
      score: s.total_score,
      pointsEarned: s.total_score,
    }));

    return {
      code: 200,
      summary: {
        gameId,
        gameName: game.name,
        totalQuestions: questionCount ?? 0,
        totalTimeSeconds,
        rankings,
      },
    };
  },
});
