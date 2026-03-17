import { eda } from '../../../libs/eda';
import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import { getConfig } from '../integration/repository';
import { type Store } from './store';
import { Event } from '../contracts/events';

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry } = eda<Event>();

  const registry = createRegistry(
    ofType('[TRIGGER]_INIT').pipe(
      map(() => new AbortController()),
      switchMap((ctrl) =>
        from(getConfig()).pipe(
          tap(({ groups }) => store.$groups.set(groups)),
          catchError((error) => {
            console.log(JSON.stringify(error, null, 2));
            return EMPTY;
          }),
          finalize(() => ctrl.abort()),
        ),
      ),
    ),
    ofType('[TRIGGER]_START').pipe(
      tap(() => {
        store.$isStarted.set(true);
        store.$isFinished.set(false);
        store.$step.set(0);
        store.$answers.set({});
      }),
    ),
    ofType('[TRIGGER]_PREV').pipe(
      tap(() => {
        store.$step.set(Math.max(0, store.$step.get() - 1));
      }),
    ),
    ofType('[TRIGGER]_NEXT').pipe(
      tap((answers) => {
        store.$answers.set({
          ...store.$answers.get(),
          ...(answers ?? {}),
        });

        const currentStep = store.$step.get();
        const maxStep = Math.max(0, store.$totalSteps.get() - 1);

        if (currentStep >= maxStep) {
          store.$isFinished.set(true);
          return;
        }

        store.$step.set(Math.min(maxStep, currentStep + 1));
      }),
    ),
    ofType('[TRIGGER]_EDIT_ANSWERS').pipe(
      tap(() => {
        store.$isFinished.set(false);
        store.$step.set(0);
      }),
    ),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
