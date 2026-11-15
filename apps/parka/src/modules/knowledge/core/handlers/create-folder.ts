import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { postFolder } from '../../integration/repository';
import { notify } from '../actions/notify';

export const createFolder = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_FOLDER').pipe(
    tap(({ folder }) => store.$folders.set([...store.$folders.get(), folder])),
    concatMap(({ folder }) =>
      from(store.enqueue(() => postFolder(folder))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Dodano folder.' }),
        ),
        catchError((error: unknown) => {
          store.$folders.set(
            store.$folders.get().filter((f) => f.id !== folder.id),
          );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać folderu',
            code: 'FOLDER_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_FOLDER', { folder }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
