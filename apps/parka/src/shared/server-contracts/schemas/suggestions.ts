import z from 'zod';
import { conflictOut, errorOut, notFoundOut } from './general';

export const SUGGESTION_FIELDS = ['merchant', 'paymentMethod'] as const;

const suggestionField = () => z.enum(SUGGESTION_FIELDS);

const suggestionValue = () => z.string().trim().min(1).max(100);

const suggestion = () =>
  z.object({
    field: suggestionField(),
    value: z.string().min(1),
    useCount: z.number().int().min(0),
    lastUsed: z.string().nullable(),
  });

const okOut = () => z.object({ code: z.literal(200), ok: z.literal(true) });

/** Every remembered value of the account, best first (most used, then most recent). */
export const listSuggestionsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(suggestion()) }),
      errorOut(),
    ]),
  });

/** One more use of a value; creates it on first use. */
export const recordSuggestionUseSchema = () =>
  z.object({
    in: z.object({ field: suggestionField(), value: suggestionValue() }),
    out: z.union([okOut(), errorOut()]),
  });

/** Renames a remembered value, keeping its use count. A taken name is a 409. */
export const renameSuggestionSchema = () =>
  z.object({
    in: z.object({
      field: suggestionField(),
      value: suggestionValue(),
      newValue: suggestionValue(),
    }),
    out: z.union([okOut(), notFoundOut(), conflictOut(), errorOut()]),
  });

/** Forgets a remembered value (past expenses keep their text). */
export const deleteSuggestionSchema = () =>
  z.object({
    in: z.object({ field: suggestionField(), value: suggestionValue() }),
    out: z.union([okOut(), notFoundOut(), errorOut()]),
  });
