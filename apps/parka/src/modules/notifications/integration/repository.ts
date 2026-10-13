import type { z } from 'zod';
import type {
  listNotificationsSchema,
  markAllNotificationsReadSchema,
  markNotificationReadSchema,
} from '@schemas/notifications';
import { API_ROUTER } from '@/shared/router/routes';
import type { NotificationId, NotificationsPage } from '../domain/models';
import { toPage } from './mappers';

type ListOut = z.infer<ReturnType<typeof listNotificationsSchema>>['out'];
type ReadOut = z.infer<ReturnType<typeof markNotificationReadSchema>>['out'];
type ReadAllOut = z.infer<
  ReturnType<typeof markAllNotificationsReadSchema>
>['out'];

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Nothing else in this module fetches. `cursor` null asks for the first page. */
export const fetchNotifications = async (
  cursor: string | null,
  limit: number,
  signal: AbortSignal,
): Promise<NotificationsPage> => {
  const response = await fetch(
    API_ROUTER.notifications({ limit, ...(cursor ? { cursor } : {}) }),
    { headers: { Accept: 'application/json' }, signal },
  );
  const json = (await response.json()) as ListOut;
  if (json.code !== 200) throw new Error(json.message);
  return toPage(json);
};

export const putRead = async (id: NotificationId): Promise<void> => {
  const response = await fetch(API_ROUTER.notificationById(id), {
    method: 'PUT',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as ReadOut;
  if (json.code !== 200) throw new Error(json.message);
};

export const putReadAll = async (): Promise<void> => {
  const response = await fetch(API_ROUTER.notificationsReadAll(), {
    method: 'PUT',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as ReadAllOut;
  if (json.code !== 200) throw new Error(json.message);
};
