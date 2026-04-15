import { schema } from '@schemas/quiz-init';
import { withZodSchema } from '../../adapter/zod';
import { createProcedure } from '../../core/procedure';
import { getMockCategories } from '@/modules/quiz/integration/mocks/mock-data';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { Schema } from '@schemas/quiz-init';

export const quizInit = createProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async () => {
    const response: InferOut<Schema['out'], 200> = {
      code: 200,
      sessionId: 'session-mock',
      localPlayerId: 'player-1',
      partnerPlayerId: 'player-2',
      winScore: 10,
      categories: getMockCategories(),
      players: [
        { playerId: 'player-1', name: 'You', score: 0 },
        { playerId: 'player-2', name: 'Partner', score: 0 },
      ],
    };

    return response;
  },
});
