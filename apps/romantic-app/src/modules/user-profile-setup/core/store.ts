import { atom, computed, map } from '../../../libs/supa-store';
import type * as Models from '../contracts/models';

export const createStore = () => {
  const $step = atom<Models.Step>(0);
  const $questions = map<Record<Models.QuestionId, Models.Question>>({});
  const $questionsList = computed([$questions], (questions) =>
    Object.values(questions),
  );
  const $age = atom<Models.Age | null>(null);
  const $name = atom<Models.Name | null>(null);

  const start = () => {
    $step.set(1);
  };

  const prev = () => {
    $step.set($step.get() - 1);
  };

  const next = () => {
    $step.set($step.get() + 1);
  };

  return {
    $step,
    $questions,
    $questionsList,
    $age,
    $name,
    start,
    prev,
    next,
  };
};

export type Store = ReturnType<typeof createStore>;
