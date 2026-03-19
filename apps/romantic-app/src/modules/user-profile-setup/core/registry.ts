import { eda } from '../../../libs/eda';
import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import { getConfig } from '../integration/repository';
import { type Store } from './store';
import { Event } from '../contracts/events';

export const createRegistry = ({
  $steps,
  $isStarted,
  $isFinished,
  $activeStepIndex,
  $totalSteps,
}: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    ofType('[TRIGGER]_INIT').pipe(
      map(() => new AbortController()),
      switchMap((ctrl) =>
        from(getConfig(ctrl.signal)).pipe(
          tap($steps.set),
          catchError(() => EMPTY),
          finalize(() => ctrl.abort()),
        ),
      ),
    ),
    ofType('[TRIGGER]_START').pipe(
      tap(() => {
        $isStarted.set(true);
        $isFinished.set(false);
        $activeStepIndex.set(0);
      }),
    ),
    ofType('[TRIGGER]_PREV').pipe(
      tap(() => {
        $activeStepIndex.set(Math.max(0, $activeStepIndex.get() - 1));
      }),
    ),
    ofType('[TRIGGER]_NEXT').pipe(
      tap((answers) => {
        const currentStep = $activeStepIndex.get();
        const maxStep = Math.max(0, $totalSteps.get() - 1);

        if (currentStep >= maxStep) {
          $isFinished.set(true);
          return;
        }

        $activeStepIndex.set(Math.min(maxStep, currentStep + 1));
      }),
    ),
    ofType('[TRIGGER]_EDIT_ANSWERS').pipe(
      tap(() => {
        $isFinished.set(false);
        $activeStepIndex.set(0);
      }),
    ),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;

