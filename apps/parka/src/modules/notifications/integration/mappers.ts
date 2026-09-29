import type { z } from 'zod';
import type { listNotificationsSchema } from '@schemas/notifications';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type {
  Notification,
  NotificationId,
  NotificationKind,
} from '../domain/models';

type NotificationDto = InferOut<
  z.infer<ReturnType<typeof listNotificationsSchema>>['out'],
  200
>['data'][number];

const KINDS = [
  'limit-warning',
  'receipt-confirmation',
  'limit-alert',
  'recurring',
] as const satisfies readonly NotificationKind[];

/** Server validates `kind` as a non-empty string, not the closed union. */
const toKind = (kind: string): NotificationKind =>
  KINDS.find((known) => known === kind) ?? 'other';

export const toNotification = (dto: NotificationDto): Notification => ({
  id: dto.id as NotificationId,
  kind: toKind(dto.kind),
  title: dto.title,
  body: dto.body,
  ageDays: dto.ageDays,
});
