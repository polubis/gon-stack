import { eda } from '../../../libs/eda';
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  from,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { getConfig, saveUserProfileAnswers } from '../integration/repository';
import { type Store } from './store';
import { Event } from '../contracts/events';

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    ofType('[TRIGGER]_INIT').pipe(
      tap(() => {
        store.$isIdle.set(false);
        store.$isLoading.set(true);
        store.$error.reset();
        store.$isStarted.reset();
        store.$isFinished.reset();
        store.$isSaving.reset();
        store.$isSaved.reset();
        store.$activeStepIndex.reset();
        store.$steps.reset();
      }),
      map(() => new AbortController()),
      switchMap((ctrl) =>
        from(getConfig(ctrl.signal)).pipe(
          tap((steps) => {
            store.$steps.set(steps);
          }),
          catchError((error) => {
            store.$error.set(
              error instanceof Error
                ? error.message
                : 'Failed to load profile setup configuration.',
            );
            return EMPTY;
          }),
          finalize(() => {
            store.$isLoading.reset();
            ctrl.abort();
          }),
        ),
      ),
    ),
    ofType('[TRIGGER]_START').pipe(
      tap(() => {
        store.$error.reset();
        store.$isStarted.set(true);
        store.$isFinished.reset();
        store.$isSaving.reset();
        store.$isSaved.reset();
        store.$activeStepIndex.reset();
      }),
    ),
    ofType('[TRIGGER]_PREV').pipe(
      tap(() => {
        store.$activeStepIndex.set(
          Math.max(0, store.$activeStepIndex.get() - 1),
        );
      }),
    ),
    ofType('[TRIGGER]_NEXT').pipe(
      tap((answers) => {
        const activeStepIndex = store.$activeStepIndex.get();

        const stepsWithUpdatedAnswers = store.$steps.get().map((step, idx) =>
          idx === activeStepIndex
            ? {
                ...step,
                questions: step.questions.map((question) => {
                  const answer = answers[question.key];

                  if (
                    question.type === 'numeric' ||
                    question.type === 'slide'
                  ) {
                    return {
                      ...question,
                      value:
                        typeof answer === 'number' ? answer : question.value,
                    };
                  }

                  return {
                    ...question,
                    value: typeof answer === 'string' ? answer : question.value,
                  };
                }),
              }
            : step,
        );

        store.$steps.set(stepsWithUpdatedAnswers);

        const maxStep = Math.max(0, store.$totalSteps.get() - 1);

        if (activeStepIndex >= maxStep) {
          store.$isFinished.set(true);
          return;
        }

        store.$activeStepIndex.set(Math.min(maxStep, activeStepIndex + 1));
      }),
    ),
    ofType('[TRIGGER]_SAVE_ANSWERS').pipe(
      map(() => new AbortController()),
      tap(() => {
        store.$isSaved.reset();
        store.$isSaving.set(true);
        store.$error.reset();
      }),
      exhaustMap((ctrl) =>
        from(
          saveUserProfileAnswers(store.$stepAnswers.get(), ctrl.signal),
        ).pipe(
          tap(() => {
            store.$isSaved.set(true);
          }),
          catchError((error) => {
            store.$error.set(
              error instanceof Error
                ? error.message
                : 'Failed to save profile answers.',
            );
            return EMPTY;
          }),
          finalize(() => {
            store.$isSaving.reset();
            ctrl.abort();
          }),
        ),
      ),
    ),
    ofType('[TRIGGER]_EDIT_ANSWERS').pipe(
      tap(() => {
        store.$isFinished.reset();
        store.$isSaved.reset();
        store.$isSaving.reset();
        store.$activeStepIndex.reset();
      }),
    ),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
