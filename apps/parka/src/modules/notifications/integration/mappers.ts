import type { z } from 'zod';
import type { listNotificationsSchema } from '@schemas/notifications';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Notification,
  NotificationId,
  NotificationsPage,
} from '../domain/models';

type ListDto = InferOut<
  z.infer<ReturnType<typeof listNotificationsSchema>>['out'],
  200
>;
type NotificationDto = ListDto['data'][number];

export const toNotification = (dto: NotificationDto): Notification => ({
  ...dto,
  id: dto.id as NotificationId,
});

export const toPage = (dto: ListDto): NotificationsPage => ({
  items: dto.data.map(toNotification),
  nextCursor: dto.nextCursor,
  unread: dto.unread,
});
