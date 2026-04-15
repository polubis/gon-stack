import z from 'zod';

const categorySchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
});

const playerSchema = z.object({
  playerId: z.string().min(1),
  name: z.string().min(1),
  score: z.number().int(),
});

export const schema = () =>
  z.object({
    in: z.object({}).optional().default({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        sessionId: z.string().min(1),
        localPlayerId: z.string().min(1),
        partnerPlayerId: z.string().min(1),
        winScore: z.number().int().positive(),
        categories: z.array(categorySchema),
        players: z.array(playerSchema).length(2),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;
