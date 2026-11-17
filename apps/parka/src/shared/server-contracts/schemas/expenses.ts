import z from 'zod';
import { isTimeZone } from '@/shared/date/date';
import { expense, errorOut, notFoundOut, recurringScope } from './general';

/** Zone whose today decides which recurring charges have come due. */
const tz = z.string().refine(isTimeZone, 'Unknown time zone').optional();

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listExpensesSchema = () =>
  z.object({
    in: z.object({ tz }),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(expense()) }),
      errorOut(),
    ]),
  });

export const createExpenseSchema = () =>
  z.object({
    in: expense(),
    out: z.union([
      z.object({ code: z.literal(201), data: expense() }),
      errorOut(),
    ]),
  });

export const updateExpenseSchema = () =>
  z.object({
    /** `scope` only matters for an expense made by a recurring rule. */
    in: expense().extend({ scope: recurringScope().default('this') }),
    out: z.union([
      z.object({ code: z.literal(200), data: expense() }),
      writeErrors,
    ]),
  });

export const deleteExpenseSchema = () =>
  z.object({
    in: z.object({
      id: z.string().min(1),
      scope: recurringScope().default('this'),
    }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
