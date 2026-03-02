import { z } from 'zod';

const schema = z.string().min(1).brand<'RomanticVibeEntryId'>();

export type RomanticVibeEntryId = z.infer<typeof schema>;

export const createRomanticVibeEntryId = (value: string): RomanticVibeEntryId =>
  schema.parse(value);
