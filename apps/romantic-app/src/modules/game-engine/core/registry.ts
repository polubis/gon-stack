import { eda } from '@/libs/eda';
import { type Event } from '../contracts/events';
import { evaluateAnswers } from './handlers/evaluate-answers';
import { init } from './handlers/init';
import { loadQuestions } from './handlers/load-questions';
import { nextQuestion } from './handlers/next-question';
import { pauseSession } from './handlers/pause-session';
import { resumeSession } from './handlers/resume-session';
import { selectCategory } from './handlers/select-category';
import { simulatePartnerAnswer } from './handlers/simulate-partner-answer';
import { skipQuestion } from './handlers/skip-question';
import { startQuestion } from './handlers/start-question';
import { submitAnswer } from './handlers/submit-answer';
import { timerExpired } from './handlers/timer-expired';
import { timerTick } from './handlers/timer-tick';
import { type Store } from './store';

export type OfType = ReturnType<typeof eda<Event>>['ofType'];
export type Emit = ReturnType<typeof eda<Event>>['emit'];

export const createRegistry = (store: Store) => {
  const { ofType, trigger, emit, createRegistry } = eda<Event>();

  const registry = createRegistry(
    init(store, ofType, emit),
    selectCategory(store, ofType, emit),
    loadQuestions(store, ofType, emit),
    startQuestion(store, ofType, emit),
    submitAnswer(store, ofType, emit),
    skipQuestion(store, ofType, emit),
    simulatePartnerAnswer(store, ofType, emit),
    timerTick(store, ofType),
    timerExpired(store, ofType, emit),
    evaluateAnswers(store, ofType, emit),
    nextQuestion(store, ofType, emit),
    pauseSession(store, ofType),
    resumeSession(store, ofType),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
