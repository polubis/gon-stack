import { atom, computed } from '../../../libs/supa-store';
import type { Answers, Step } from '../contracts/models';

export const createStore = () => {
  const $isIdle = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $isStarted = atom(false);
  const $isFinished = atom(false);
  const $isSaving = atom(false);
  const $isSaved = atom(false);
  const $activeStepIndex = atom(0);
  const $steps = atom<Step[]>([]);

  return {
    $isIdle,
    $isStarted,
    $isFinished,
    $isLoading,
    $error,
    $isSaving,
    $isSaved,
    $activeStepIndex,
    $hasPreviousStep: computed(
      [$activeStepIndex],
      (activeStepIndex) => activeStepIndex > 0,
    ),
    $activeStep: computed(
      [$activeStepIndex, $steps],
      (activeStepIndex, steps) => steps[activeStepIndex],
    ),
    $totalSteps: computed([$steps], (steps) => steps.length),
    $progressPercentage: computed(
      [$activeStepIndex, $steps],
      (activeStepIndex, steps) => (activeStepIndex / steps.length) * 100,
    ),
    $steps,
    $stepAnswers: computed([$activeStepIndex, $steps], (activeStepIndex, steps) =>
      steps[activeStepIndex].questions.reduce<Answers>((acc, question) => {
        acc[question.key] = question.value;
        return acc;
      }, {}),
    ),
  };
};

export type Store = ReturnType<typeof createStore>;
