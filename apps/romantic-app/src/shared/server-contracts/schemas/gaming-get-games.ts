import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({
        filterCategory: z.string().optional(),
        filterGameName: z.string().optional(),
        sortBy: z.enum(['order', 'category', 'game_name']).optional(),
        sortDir: z.enum(['asc', 'desc']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      path: z.object({
        roomId: z.string().uuid(),
      }),
      payload: z.object({}),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        games: z.array(
          z.object({
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
        ),
        total: z.number(),
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
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
