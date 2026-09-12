import z from 'zod';
import { notification, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listNotificationsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(notification()) }),
      errorOut(),
    ]),
  });

export const createNotificationSchema = () =>
  z.object({
    in: notification(),
    out: z.union([
      z.object({ code: z.literal(201), data: notification() }),
      errorOut(),
    ]),
  });

export const deleteNotificationSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
