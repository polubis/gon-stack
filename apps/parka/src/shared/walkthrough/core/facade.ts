import type { WalkthroughStep } from '../domain/models';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    init: (
      steps: WalkthroughStep[],
      persistenceKey: string,
      resumePersistedOutcome = false,
    ) =>
      trigger('[TRIGGER]_INIT', {
        steps,
        persistenceKey,
        resumePersistedOutcome,
      }),
    next: () => trigger('[TRIGGER]_NEXT'),
    prev: () => trigger('[TRIGGER]_PREV'),
    skip: () => trigger('[TRIGGER]_SKIP'),
    useOutcome: () => store.$outcome.use(),
    useIsFinished: () => store.$isFinished.use(),
    useActiveStepIndex: () => store.$activeStepIndex.use(),
    useActiveStep: () => store.$activeStep.use(),
    useTotalSteps: () => store.$totalSteps.use(),
    useProgressPercentage: () => store.$progressPercentage.use(),
    useHasPreviousStep: () => store.$hasPreviousStep.use(),
    useIsLastStep: () => store.$isLastStep.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
