import z from 'zod';
import { limit, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listLimitsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(limit()) }),
      errorOut(),
    ]),
  });

export const createLimitSchema = () =>
  z.object({
    in: limit(),
    out: z.union([
      z.object({ code: z.literal(201), data: limit() }),
      errorOut(),
    ]),
  });

export const updateLimitSchema = () =>
  z.object({
    in: limit(),
    out: z.union([
      z.object({ code: z.literal(200), data: limit() }),
      writeErrors,
    ]),
  });

export const deleteLimitSchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
