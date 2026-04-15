import z from 'zod';

const questionBase = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  prompt: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimitSec: z.number().int().positive(),
  tip: z.string().optional(),
});

const questionSchema = z.discriminatedUnion('answerType', [
  questionBase.extend({
    answerType: z.literal('multiple-choice'),
    options: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    ),
  }),
  questionBase.extend({
    answerType: z.literal('scale'),
    min: z.literal(1),
    max: z.literal(5),
  }),
  questionBase.extend({
    answerType: z.literal('yes-no'),
  }),
  questionBase.extend({
    answerType: z.literal('open-text'),
    maxLength: z.number().int().positive(),
  }),
]);

const summarySchema = z.object({
  categoryId: z.string().min(1),
  roundsPlayed: z.number().int().nonnegative(),
  matches: z.number().int().nonnegative(),
  compatibility: z.number().int().min(0).max(100),
});

export const schema = () =>
  z.object({
    in: z.object({
      sessionId: z.string().min(1),
      categoryId: z.string().min(1),
      askedQuestionIds: z.array(z.string()),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        question: questionSchema.nullable(),
        categorySummary: summarySchema.optional(),
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
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
