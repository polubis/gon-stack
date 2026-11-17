import z from 'zod';
import { isTimeZone } from '@/shared/date/date';
import { recurring, recurringScope, errorOut, notFoundOut } from './general';

const occurrenceDate = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

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

/**
 * Without `occurrenceDate` the rule alone changes (what follows the charged
 * expenses); with it, `scope` is read from that occurrence of the series.
 */
export const updateRecurringSchema = () =>
  z.object({
    in: recurring().extend({
      scope: recurringScope().default('thisAndFollowing'),
      occurrenceDate: occurrenceDate().optional(),
    }),
    out: z.union([
      z.object({ code: z.literal(200), data: recurring() }),
      writeErrors,
    ]),
  });

export const deleteRecurringSchema = () =>
  z.object({
    in: z.object({
      id: z.string().min(1),
      scope: recurringScope().default('all'),
      occurrenceDate: occurrenceDate().optional(),
    }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
