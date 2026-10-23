import z from 'zod';
import { conflictOut, errorOut, notFoundOut } from './general';

/** Lifetimes offered at creation; `null` never expires. */
const ttlDays = () =>
  z
    .union([
      z.literal(1),
      z.literal(7),
      z.literal(30),
      z.literal(90),
      z.literal(365),
    ])
    .nullable();

/** What is shown about a token after creation: never the secret or its hash. */
export const mcpToken = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(60),
    /** First and last characters of the secret, to tell tokens apart. */
    hint: z.string().length(4),
    tail: z.string().length(4),
    status: z.enum(['active', 'expired', 'revoked']),
    ttlDays: ttlDays(),
    expiresAt: z.string().nullable(),
    lastUsedAt: z.string().nullable(),
    rotatedAt: z.string().nullable(),
    createdAt: z.string(),
  });

/** The only response that carries a secret; it is never retrievable again. */
const issued = () => z.object({ token: z.string().min(1), item: mcpToken() });

const writeErrors = z.union([errorOut(), notFoundOut(), conflictOut()]);

export const listMcpTokensSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(mcpToken()) }),
      errorOut(),
    ]),
  });

export const createMcpTokenSchema = () =>
  z.object({
    in: z.object({
      name: z.string().trim().min(1).max(60),
      ttlDays: ttlDays(),
    }),
    out: z.union([
      z.object({ code: z.literal(201), data: issued() }),
      errorOut(),
      conflictOut(),
    ]),
  });

export const rotateMcpTokenSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), data: issued() }),
      writeErrors,
    ]),
  });

export const revokeMcpTokenSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), data: mcpToken() }),
      writeErrors,
    ]),
  });

export const deleteMcpTokenSchema = () =>
  z.object({
    in: z.object({ id: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
