import { schema } from '@schemas/quiz-next-question';
import type { Schema } from '@schemas/quiz-next-question';
import { withZodSchema } from '../../adapter/zod';
import { createProcedure } from '../../core/procedure';
import type { InferOut } from '@/shared/server-contracts/extraction';
import { getShuffledQuestions } from '@/modules/quiz/integration/mocks/mock-data';

export const quizNextQuestion = createProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input) => {
    const availableQuestions = getShuffledQuestions(input.categoryId).filter(
      (question) => !input.askedQuestionIds.includes(question.id),
    );
    const nextQuestion = availableQuestions[0] ?? null;

    if (!nextQuestion) {
      const roundsPlayed = input.askedQuestionIds.length;
      const response: InferOut<Schema['out'], 200> = {
        code: 200,
        question: null,
        categorySummary: {
          categoryId: input.categoryId,
          roundsPlayed,
          matches: Math.round(roundsPlayed / 2),
          compatibility: roundsPlayed > 0 ? 50 : 0,
        },
      };

      return response;
    }

    const response: InferOut<Schema['out'], 200> = {
      code: 200,
      question: nextQuestion,
    };

    return response;
  },
});
