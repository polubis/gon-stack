import type { z } from 'zod';
import type { listNotificationsSchema } from '@schemas/notifications';
import { API_ROUTER } from '@/shared/router';
import type { Notification } from '../domain/models';
import { toNotification } from './mappers';

type ListNotificationsOut = z.infer<
  ReturnType<typeof listNotificationsSchema>
>['out'];

/** Nothing else in this module fetches. */
export const fetchNotifications = async (
  signal: AbortSignal,
): Promise<Notification[]> => {
  const response = await fetch(API_ROUTER.notifications(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListNotificationsOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toNotification);
};
