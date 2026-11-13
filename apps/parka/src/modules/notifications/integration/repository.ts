import type { z } from 'zod';
import type {
  listNotificationsSchema,
  markAllNotificationsReadSchema,
  markNotificationReadSchema,
  deleteNotificationsSchema,
} from '@schemas/notifications';
import { NOTIFICATIONS_MAX_DELETE } from '@schemas/notifications';
import { API_ROUTER } from '@/shared/router/routes';
import type { NotificationId, NotificationsPage } from '../domain/models';
import { toPage } from './mappers';

type ListOut = z.infer<ReturnType<typeof listNotificationsSchema>>['out'];
type ReadOut = z.infer<ReturnType<typeof markNotificationReadSchema>>['out'];
type ReadAllOut = z.infer<
  ReturnType<typeof markAllNotificationsReadSchema>
>['out'];

type DeleteOut = z.infer<ReturnType<typeof deleteNotificationsSchema>>['out'];

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

/** Deletes in chunks the endpoint accepts; throws when any chunk fails. */
export const deleteMany = async (ids: NotificationId[]): Promise<void> => {
  const chunks: NotificationId[][] = [];
  for (let i = 0; i < ids.length; i += NOTIFICATIONS_MAX_DELETE)
    chunks.push(ids.slice(i, i + NOTIFICATIONS_MAX_DELETE));
  await Promise.all(
    chunks.map(async (chunk) => {
      const response = await fetch(API_ROUTER.notifications(), {
        method: 'DELETE',
        headers: JSON_HEADERS,
        body: JSON.stringify({ ids: chunk }),
      });
      const json = (await response.json()) as DeleteOut;
      if (json.code !== 200) throw new Error(json.message);
    }),
  );
};
