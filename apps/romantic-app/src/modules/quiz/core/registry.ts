import { createBus } from './bus';
import { connectRealtime, init } from './handlers/init';
import { nextQuestion } from './handlers/next-question';
import { pauseResume } from './handlers/pause-resume';
import { selectCategory } from './handlers/select-category';
import { submitAnswer } from './handlers/submit-answer';
import { tickTimer } from './handlers/tick-timer';
import type { Store } from './store';
import type { QuizRealtime, QuizRepository } from '../integration/contracts';

export type CoreDependencies = {
  repository: QuizRepository;
  realtime: QuizRealtime;
};

export const createRegistry = (store: Store, deps: CoreDependencies) => {
  const bus = createBus();

  const register = bus.createRegistry(
    init(store, bus, deps),
    connectRealtime(store, bus, deps),
    selectCategory(store, bus, deps),
    submitAnswer(store, bus, deps),
    nextQuestion(store, bus, deps),
    tickTimer(store, bus),
    pauseResume(store, bus),
  );

  return {
    trigger: bus.trigger,
    register,
  };
};

export type Registry = ReturnType<typeof createRegistry>;
