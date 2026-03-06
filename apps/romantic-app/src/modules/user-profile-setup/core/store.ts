import { atom, computed } from '../../../libs/supa-store';
import type { QuestionGroups, Step, Answers } from '../contracts/models';

export const createStore = () => {
  const $isStarted = atom(false);
  const $isFinished = atom(false);
  const $step = atom<Step>(0);
  const $groups = atom<QuestionGroups>([]);
  const $answers = atom<Partial<Answers>>({});

  const $totalSteps = computed([$groups], (groups) => groups.length);

  const $hasPreviousStep = computed([$step], (step) => step > 0);

  const $currentGroup = computed([$step, $groups], (step, groups) => {
    const group = groups[step];
    if (!group) throw new Error('Question group not found');
    return group;
  });

  const setGroups = (groups: QuestionGroups) => {
    $groups.set(groups);
  };

  const start = () => {
    $isStarted.set(true);
    $isFinished.set(false);
    $step.set(0);
    $answers.set({});
  };

  const prev = () => {
    $step.set(Math.max(0, $step.get() - 1));
  };

  const next = (answers?: Partial<Answers>) => {
    if (answers) {
      $answers.set({
        ...$answers.get(),
        ...answers,
      });
    }

    const currentStep = $step.get();
    const maxStep = Math.max(0, $totalSteps.get() - 1);

    if (currentStep >= maxStep) {
      $isFinished.set(true);
      return;
    }

    $step.set(Math.min(maxStep, currentStep + 1));
  };

  const editAnswers = () => {
    $isFinished.set(false);
    $step.set(0);
  };

  return {
    $isStarted,
    $isFinished,
    $step,
    $hasPreviousStep,
    $groups,
    $answers,
    $totalSteps,
    $currentGroup,
    setGroups,
    start,
    prev,
    next,
    editAnswers,
  };
};

export type Store = ReturnType<typeof createStore>;
