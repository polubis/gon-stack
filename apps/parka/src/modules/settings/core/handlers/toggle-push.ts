import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import {
  disablePush,
  enablePush,
  PushPermissionError,
} from '../../integration/push';
import { putPushSubscription } from '../../integration/repository';

const subscribe = async () => putPushSubscription(await enablePush());

export const togglePush = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_TOGGLE_PUSH').pipe(
    concatMap(({ enabled }) => {
      const settings = store.$settings.get();
      if (!settings) return EMPTY;

      store.$isPushBusy.set(true);
      return from(enabled ? subscribe() : disablePush()).pipe(
        tap(() => {
          store.$push.set(enabled ? 'on' : 'off');
          emit('[TRIGGER]_UPDATE', {
            settings: {
              ...settings,
              notifications: { ...settings.notifications, push: enabled },
            },
          });
        }),
        catchError((error: unknown) => {
          const denied =
            error instanceof PushPermissionError &&
            error.permission === 'denied';
          if (denied) store.$push.set('blocked');
          notify(store, {
            tone: 'error',
            title: enabled
              ? 'Nie udało się włączyć powiadomień push'
              : 'Nie udało się wyłączyć powiadomień push',
            code:
              error instanceof PushPermissionError
                ? 'PUSH_PERMISSION_DENIED'
                : 'PUSH_TOGGLE_FAILED',
            description:
              error instanceof PushPermissionError
                ? 'Zezwól na powiadomienia dla tej strony w ustawieniach przeglądarki.'
                : errorMessage(error),
            retry: denied
              ? undefined
              : () => emit('[TRIGGER]_TOGGLE_PUSH', { enabled }),
          });
          return EMPTY;
        }),
        finalize(() => store.$isPushBusy.set(false)),
      );
    }),
  );
