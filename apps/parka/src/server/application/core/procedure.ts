import { APIError, InternalServer, Unauthorized } from './error-handling';
import { logger } from './logger';
import {
  supabaseServer,
  type SupabaseServer,
} from '@/shared/data-sources/supabase-server';
import type { APIContext } from 'astro';
import {
  KnownUser,
  type Email,
  type UserId,
  type Username,
} from '../../domain/user';

export type ProcedureSchema<TIn, TOut> = {
  parseInput: (input: unknown) => Promise<TIn>;
  parseOutput: (output: unknown) => Promise<TOut>;
};

const getUser = async (db: SupabaseServer): Promise<KnownUser> => {
  const userResult = await db.auth.getUser();

  if (userResult.error || !userResult.data.user)
    throw new Unauthorized(userResult.error);

  const user = userResult.data.user;
  const email = user.email;
  const username =
    (typeof user.user_metadata?.username === 'string'
      ? user.user_metadata.username
      : undefined) ?? 'Anonymous';

  if (!email) throw new Unauthorized(undefined);

  return new KnownUser(user.id as UserId, email as Email, username as Username);
};

const createProcedureFactory = <TIn, TOut, TExtra>({
  schema,
  resolveExtra,
}: {
  schema: ProcedureSchema<TIn, TOut>;
  resolveExtra: (db: SupabaseServer) => Promise<TExtra>;
}) => {
  return ({
    handler,
  }: {
    handler: (
      input: TIn,
      extra: {
        db: SupabaseServer;
        origin: string;
        signal: AbortSignal;
      } & TExtra,
    ) => Promise<TOut>;
  }) => {
    return async (
      readInput: () => Promise<unknown>,
      context: APIContext,
    ): Promise<TOut> => {
      try {
        const db = supabaseServer(context);
        const extra = await resolveExtra(db);

        const parsedInput = await schema.parseInput(await readInput());
        const result = await handler(parsedInput, {
          db,
          origin: new URL(context.request.url).origin,
          signal: context.request.signal,
          ...extra,
        });
        return await schema.parseOutput(result);
      } catch (error) {
        if (APIError.is(error)) {
          logger(error, error.code >= 500 ? 'error' : 'warn');
          return error.json() as TOut;
        }

        logger(error, 'error');
        return new InternalServer(error).json() as TOut;
      }
    };
  };
};

export const publicProcedure = <TIn, TOut>({
  schema,
}: {
  schema: ProcedureSchema<TIn, TOut>;
}) => {
  return createProcedureFactory({
    schema,
    resolveExtra: async () => ({}),
  });
};

export const privateProcedure = <TIn, TOut>({
  schema,
}: {
  schema: ProcedureSchema<TIn, TOut>;
}) => {
  return createProcedureFactory({
    schema,
    resolveExtra: async (db) => ({
      user: await getUser(db),
    }),
  });
};
