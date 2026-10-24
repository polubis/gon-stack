import z from 'zod';
import { isTimeZone } from '../../date/date';
import { daysBetween, isDay } from '../../period/period';
import {
  conflictOut,
  errorOut,
  notFoundOut,
  timeBacklogTask,
  timeCategory,
  timeCategoryInput,
  timePriority,
  timeRecurring,
  timeTask,
} from './general';

/** A year view plus slack. */
const MAX_RANGE_DAYS = 400;

const writeErrors = z.union([errorOut(), notFoundOut()]);

/** Categories, priorities and the tasks whose day lies in `from..to`. */
export const listTimeSchema = () =>
  z.object({
    in: z
      .object({
        from: z.string().refine(isDay, 'Invalid day'),
        to: z.string().refine(isDay, 'Invalid day'),
        /** Zone whose clock decides when today is over. */
        tz: z.string().refine(isTimeZone, 'Unknown time zone').optional(),
      })
      .refine(
        ({ from, to }) => from <= to && daysBetween(from, to) <= MAX_RANGE_DAYS,
        'Invalid range',
      ),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          categories: z.array(timeCategory()),
          priorities: z.array(timePriority()),
          tasks: z.array(timeTask()),
          /** Tasks without a day, whatever the range. */
          backlog: z.array(timeBacklogTask()),
        }),
      }),
      errorOut(),
    ]),
  });

export const createTimeTaskSchema = () =>
  z.object({
    in: timeTask(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeTask() }),
      errorOut(),
    ]),
  });

export const createTimeBacklogTaskSchema = () =>
  z.object({
    in: timeBacklogTask(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeBacklogTask() }),
      errorOut(),
    ]),
  });

export const updateTimeBacklogTaskSchema = () =>
  z.object({
    in: timeBacklogTask(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeBacklogTask() }),
      writeErrors,
    ]),
  });

export const sendTimeTaskToBacklogSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), data: timeBacklogTask() }),
      writeErrors,
    ]),
  });

export const updateTimeTaskSchema = () =>
  z.object({
    in: timeTask(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeTask() }),
      writeErrors,
    ]),
  });

export const deleteTimeTaskSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const createTimeRecurringSchema = () =>
  z.object({
    in: timeRecurring(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeRecurring() }),
      errorOut(),
    ]),
  });

export const deleteTimeRecurringSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });

export const createTimeCategorySchema = () =>
  z.object({
    in: timeCategoryInput(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeCategory() }),
      errorOut(),
    ]),
  });

export const updateTimeCategorySchema = () =>
  z.object({
    in: timeCategoryInput(),
    out: z.union([
      z.object({ code: z.literal(200), data: timeCategory() }),
      writeErrors,
    ]),
  });

export const deleteTimeCategorySchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
      conflictOut(),
    ]),
  });

export const createTimePrioritySchema = () =>
  z.object({
    in: timePriority(),
    out: z.union([
      z.object({ code: z.literal(201), data: timePriority() }),
      errorOut(),
    ]),
  });
