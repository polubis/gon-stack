import { catchError, concatMap, EMPTY, finalize, from } from 'rxjs';
import { validateAvatarFile } from '@/shared/avatar/domain/validate-avatar-file';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postAvatar } from '../../integration/repository';

export const uploadAvatar = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPLOAD_AVATAR').pipe(
    concatMap(({ file }) =>
      from(validateAvatarFile(file)).pipe(
        concatMap((reason) => {
          if (reason) {
            notify(store, {
              tone: 'error',
              title: 'Nie udało się zmienić zdjęcia',
              code: 'AVATAR_INVALID_FILE',
              description: reason,
            });
            return EMPTY;
          }

          // Show the chosen picture right away, restore the old one on failure.
          const previous = store.$avatar.get();
          const preview = URL.createObjectURL(file);
          store.$avatar.set({ variants: [{ size: 256, url: preview }] });
          store.$isUploadingAvatar.set(true);

          return from(postAvatar(file)).pipe(
            concatMap((avatar) => {
              store.$avatar.set(avatar);
              notify(store, { tone: 'success', message: 'Zmieniono zdjęcie.' });
              return EMPTY;
            }),
            catchError((error: unknown) => {
              store.$avatar.set(previous);
              notify(store, {
                tone: 'error',
                title: 'Nie udało się zmienić zdjęcia',
                code: 'AVATAR_UPLOAD_FAILED',
                description: errorMessage(error),
                retry: () => emit('[TRIGGER]_UPLOAD_AVATAR', { file }),
              });
              return EMPTY;
            }),
            finalize(() => {
              URL.revokeObjectURL(preview);
              store.$isUploadingAvatar.reset();
            }),
          );
        }),
      ),
    ),
  );
