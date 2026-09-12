import z from 'zod';
import { expense, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listExpensesSchema = () =>
  z.object({
    in: z.object({}),
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
    in: expense(),
    out: z.union([
      z.object({ code: z.literal(200), data: expense() }),
      writeErrors,
    ]),
  });

export const deleteExpenseSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
