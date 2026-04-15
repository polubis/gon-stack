import type { AnswerValue, CategoryId } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    init: () => trigger('[TRIGGER]_INIT'),
    selectCategory: (categoryId: CategoryId) =>
      trigger('[TRIGGER]_SELECT_CATEGORY', { categoryId }),
    submitAnswer: (answer: AnswerValue) => trigger('[TRIGGER]_SUBMIT_ANSWER', { answer }),
    nextQuestion: () => trigger('[TRIGGER]_NEXT_QUESTION'),
    pause: () => trigger('[TRIGGER]_PAUSE'),
    resume: () => trigger('[TRIGGER]_RESUME'),
    endSession: () => trigger('[TRIGGER]_END_SESSION'),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useStatus: () => store.$status.use(),
    useCategories: () => store.$categories.use(),
    usePlayers: () => store.$players.use(),
    useWinScore: () => store.$winScore.use(),
    useActiveCategoryId: () => store.$activeCategoryId.use(),
    useActiveQuestion: () => store.$activeQuestion.use(),
    useSecondsLeft: () => store.$secondsLeft.use(),
    useLocalAnswer: () => store.$localAnswer.use(),
    usePartnerAnswer: () => store.$partnerAnswer.use(),
    useIsReveal: () => store.$isReveal.use(),
    useLastSummary: () => store.$lastSummary.use(),
    useWinnerId: () => store.$winnerId.use(),
    useIsConnected: () => store.$isConnected.use(),
    useIsRoundLocked: () => store.$isRoundLocked.use(),
  };
};
