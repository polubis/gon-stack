import { schema } from '@schemas/quiz-submit-answer';
import type { Schema } from '@schemas/quiz-submit-answer';
import { withZodSchema } from '../../adapter/zod';
import { createProcedure } from '../../core/procedure';
import type { InferOut } from '@/shared/server-contracts/extraction';

export const quizSubmitAnswer = createProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (_input) => {
    const response: InferOut<Schema['out'], 200> = {
      code: 200,
      accepted: true,
    };

    return response;
  },
});
