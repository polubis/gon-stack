import { eda } from '../../../libs/eda';
import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import { getConfig } from '../integration/repository';
import { type Store } from './store';
import { Event } from '../contracts/events';

export const createRegistry = ({
  $isIdle,
  $isLoading,
  $error,
  $steps,
  $isStarted,
  $isFinished,
  $activeStepIndex,
  $totalSteps,
}: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    ofType('[TRIGGER]_INIT').pipe(
      tap(() => {
        $isIdle.set(false);
        $isLoading.set(true);
        $error.reset();
        $isStarted.reset();
        $isFinished.reset();
        $activeStepIndex.reset();
        $steps.reset();
      }),
      map(() => new AbortController()),
      switchMap((ctrl) =>
        from(getConfig(ctrl.signal)).pipe(
          tap((steps) => {
            $steps.set(steps);
          }),
          catchError((error) => {
            $error.set(
              error instanceof Error
                ? error.message
                : 'Failed to load profile setup configuration.',
            );
            return EMPTY;
          }),
          finalize(() => {
            $isLoading.reset();
            ctrl.abort();
          }),
        ),
      ),
    ),
    ofType('[TRIGGER]_START').pipe(
      tap(() => {
        $error.reset();
        $isStarted.set(true);
        $isFinished.reset();
        $activeStepIndex.reset();
      }),
    ),
    ofType('[TRIGGER]_PREV').pipe(
      tap(() => {
        $activeStepIndex.set(Math.max(0, $activeStepIndex.get() - 1));
      }),
    ),
    ofType('[TRIGGER]_NEXT').pipe(
      tap((answers) => {
        const activeStepIndex = $activeStepIndex.get();

        const stepsWithUpdatedAnswers = $steps.get().map((step, idx) =>
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

        $steps.set(stepsWithUpdatedAnswers);

        const maxStep = Math.max(0, $totalSteps.get() - 1);

        if (activeStepIndex >= maxStep) {
          $isFinished.set(true);
          return;
        }

        $activeStepIndex.set(Math.min(maxStep, activeStepIndex + 1));
      }),
    ),
    ofType('[TRIGGER]_EDIT_ANSWERS').pipe(
      tap(() => {
        $isFinished.reset();
        $activeStepIndex.reset();
      }),
    ),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
