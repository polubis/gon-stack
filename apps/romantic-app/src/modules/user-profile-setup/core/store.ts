import { atom, computed, map } from '../../../libs/supa-store';
import type * as Models from '../contracts/models';

export const createStore = () => {
  const $step = atom<Models.Step>(0);
  const $questions = map<Record<Models.QuestionId, Models.Question>>({});
  const $questionsList = computed([$questions], (questions) =>
    Object.values(questions),
  );

  const start = () => {
    $step.set(1);
  };

  return {
    $step,
    $questions,
    $questionsList,
    start,
  };
};

export type Store = ReturnType<typeof createStore>;
