import type {
  InitSessionResponse,
  NextQuestionRequest,
  NextQuestionResponse,
  QuizRepository,
  SubmitAnswerRequest,
} from './contracts';

type SuccessResponse<T> = T & { code: 200 };

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error('Quiz endpoint request failed.');
  }

  return (await response.json()) as T;
};

export const createRepository = (): QuizRepository => {
  return {
    initSession: async (signal) => {
      const response = await fetch('/api/quiz/init', { signal });
      const data = await parseJson<SuccessResponse<InitSessionResponse>>(response);
      return {
        sessionId: data.sessionId,
        localPlayerId: data.localPlayerId,
        partnerPlayerId: data.partnerPlayerId,
        players: data.players,
        categories: data.categories,
        winScore: data.winScore,
      };
    },
    submitAnswer: async (input: SubmitAnswerRequest, signal) => {
      const response = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer.');
      }
    },
    nextQuestion: async (input: NextQuestionRequest, signal) => {
      const response = await fetch('/api/quiz/next-question', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      const data = await parseJson<SuccessResponse<NextQuestionResponse>>(response);
      return {
        question: data.question,
        categorySummary: data.categorySummary,
      };
    },
  };
};
