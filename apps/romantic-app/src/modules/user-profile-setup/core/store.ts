import { atom, computed } from '../../../libs/supa-store';
import type { Step } from '../contracts/models';

export const createStore = () => {
  const $isStarted = atom(false);
  const $isFinished = atom(false);
  const $activeStepIndex = atom(0);
  const $steps = atom<Step[]>([]);

  const $totalSteps = computed([$steps], (steps) => steps.length);

  const $hasPreviousStep = computed(
    [$activeStepIndex],
    (activeStepIndex) => activeStepIndex > 0,
  );

  const $activeStep = computed(
    [$activeStepIndex, $steps],
    (activeStepIndex, steps) => steps[activeStepIndex],
  );
  // Math.min(activeStepIndex + 1, totalSteps) / totalSteps) * 100
  const $progressPercentage = computed(
    [$activeStepIndex, $totalSteps],
    (activeStepIndex, totalSteps) => ((activeStepIndex + 1) / totalSteps) * 100,
  );

  return {
    $isStarted,
    $isFinished,
    $activeStepIndex,
    $hasPreviousStep,
    $activeStep,
    $totalSteps,
    $progressPercentage,
    $steps,
  };
};

export type Store = ReturnType<typeof createStore>;

