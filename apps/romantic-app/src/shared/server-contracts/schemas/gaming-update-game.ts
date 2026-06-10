import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({}),
      path: z.object({
        gameId: z.string().uuid(),
      }),
      payload: z.object({
        status: z.enum(['game_pending', 'game_finished']),
      }),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        game: z.object({
          id: z.string().uuid(),
          name: z.string(),
          type: z.literal('casual'),
          status: z.enum(['game_waiting', 'game_pending', 'game_finished']),
          category: z.string(),
          difficulty: z.enum(['Easy', 'Medium', 'Hard']),
          maxPlayers: z.number(),
          playerCount: z.number(),
          timePerQuestion: z.number(),
          creatorId: z.string().uuid(),
          createdAt: z.string(),
        }),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(403),
        type: z.literal('forbidden'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(404),
        type: z.literal('not-found'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(422),
        type: z.literal('validation-error'),
        errors: z.array(
          z.object({
            field: z.string(),
            message: z.string(),
          }),
        ),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
