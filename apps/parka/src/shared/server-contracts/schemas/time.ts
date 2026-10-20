import z from 'zod';
import { daysBetween, isDay } from '../../period/period';
import {
  errorOut,
  notFoundOut,
  timeCategory,
  timeCategoryInput,
  timePriority,
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

export const createTimeCategorySchema = () =>
  z.object({
    in: timeCategoryInput(),
    out: z.union([
      z.object({ code: z.literal(201), data: timeCategory() }),
      errorOut(),
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
