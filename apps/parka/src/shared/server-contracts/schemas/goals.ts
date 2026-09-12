import z from 'zod';
import { goal, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listGoalsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(goal()) }),
      errorOut(),
    ]),
  });

export const createGoalSchema = () =>
  z.object({
    in: goal(),
    out: z.union([
      z.object({ code: z.literal(201), data: goal() }),
      errorOut(),
    ]),
  });

export const updateGoalSchema = () =>
  z.object({
    in: goal(),
    out: z.union([
      z.object({ code: z.literal(200), data: goal() }),
      writeErrors,
    ]),
  });

export const deleteGoalSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
