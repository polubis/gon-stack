import z from 'zod';
import { isTimeZone } from '@/shared/date/date';
import { recurring, errorOut, notFoundOut } from './general';

/** Zone whose today decides which recurring charges have come due. */
const tz = z.string().refine(isTimeZone, 'Unknown time zone').optional();

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listRecurringSchema = () =>
  z.object({
    in: z.object({ tz }),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(recurring()) }),
      errorOut(),
    ]),
  });

export const createRecurringSchema = () =>
  z.object({
    in: recurring(),
    out: z.union([
      z.object({ code: z.literal(201), data: recurring() }),
      errorOut(),
    ]),
  });

export const updateRecurringSchema = () =>
  z.object({
    in: recurring(),
    out: z.union([
      z.object({ code: z.literal(200), data: recurring() }),
      writeErrors,
    ]),
  });

export const deleteRecurringSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
