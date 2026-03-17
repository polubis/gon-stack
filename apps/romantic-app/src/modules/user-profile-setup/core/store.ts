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

  return {
    $isStarted,
    $isFinished,
    $step,
    $hasPreviousStep,
    $groups,
    $answers,
    $totalSteps,
    $currentGroup,
  };
};

export type Store = ReturnType<typeof createStore>;
