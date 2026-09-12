import { atom, computed } from '@repo/react-kit/supa-store';
import type { WalkthroughOutcome, WalkthroughStep } from '../domain/models';

export const createStore = () => {
  const $steps = atom<WalkthroughStep[]>([]);
  const $activeStepIndex = atom(0);
  const $outcome = atom<WalkthroughOutcome | null>(null);
  const $persistenceKey = atom('');

  return {
    $steps,
    $activeStepIndex,
    $outcome,
    $persistenceKey,
    $totalSteps: computed([$steps], (steps) => steps.length),
    $activeStep: computed(
      [$activeStepIndex, $steps],
      (activeStepIndex, steps) => steps[activeStepIndex],
    ),
    $hasPreviousStep: computed(
      [$activeStepIndex],
      (activeStepIndex) => activeStepIndex > 0,
    ),
    $isLastStep: computed(
      [$activeStepIndex, $steps],
      (activeStepIndex, steps) => activeStepIndex >= steps.length - 1,
    ),
    $progressPercentage: computed(
      [$activeStepIndex, $steps],
      (activeStepIndex, steps) =>
        steps.length === 0 ? 0 : ((activeStepIndex + 1) / steps.length) * 100,
    ),
    $isFinished: computed([$outcome], (outcome) => outcome !== null),
  };
};

export type Store = ReturnType<typeof createStore>;
