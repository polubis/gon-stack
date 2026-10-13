import { catchError, concatMap, EMPTY, finalize, from } from 'rxjs';
import { validateAvatarFile } from '@/shared/avatar/domain/validate-avatar-file';
import type { Device } from '@/shared/device/domain/models';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postDevicePhoto } from '../../integration/repository';

const setPhoto = (store: Store, id: string, photo: Device['photo']) => {
  const settings = store.$settings.get();
  if (!settings) return;
  store.$settings.set({
    ...settings,
    devices: settings.devices.map((d) => (d.id === id ? { ...d, photo } : d)),
  });
};

const setUploading = (store: Store, id: string, on: boolean) =>
  store.$uploadingDeviceIds.set([
    ...store.$uploadingDeviceIds.get().filter((x) => x !== id),
    ...(on ? [id] : []),
  ]);

export const uploadDevicePhoto = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPLOAD_DEVICE_PHOTO').pipe(
    concatMap(({ deviceId, file }) =>
      from(validateAvatarFile(file)).pipe(
        concatMap((reason) => {
          if (reason) {
            notify(store, {
              tone: 'error',
              title: 'Nie udało się zmienić zdjęcia urządzenia',
              code: 'DEVICE_PHOTO_INVALID_FILE',
              description: reason,
            });
            return EMPTY;
          }

          // Show the chosen picture right away, restore the old one on failure.
          const previous =
            store.$settings.get()?.devices.find((d) => d.id === deviceId)
              ?.photo ?? null;
          const preview = URL.createObjectURL(file);
          setPhoto(store, deviceId, {
            variants: [{ size: 256, url: preview }],
          });
          setUploading(store, deviceId, true);

          return from(postDevicePhoto(deviceId, file)).pipe(
            concatMap((photo) => {
              setPhoto(store, deviceId, photo);
              notify(store, {
                tone: 'success',
                message: 'Zmieniono zdjęcie urządzenia.',
              });
              return EMPTY;
            }),
            catchError((error: unknown) => {
              setPhoto(store, deviceId, previous);
              notify(store, {
                tone: 'error',
                title: 'Nie udało się zmienić zdjęcia urządzenia',
                code: 'DEVICE_PHOTO_UPLOAD_FAILED',
                description: errorMessage(error),
                retry: () =>
                  emit('[TRIGGER]_UPLOAD_DEVICE_PHOTO', { deviceId, file }),
              });
              return EMPTY;
            }),
            finalize(() => {
              URL.revokeObjectURL(preview);
              setUploading(store, deviceId, false);
            }),
          );
        }),
      ),
    ),
  );
