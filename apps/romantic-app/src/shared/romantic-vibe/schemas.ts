import { z } from 'zod';

export const ROMANTIC_VIBE_CATEGORIES = [
  'Communication style',
  'Emotional openness',
  'Initiative in romance',
  'Playful vs serious tone',
  'Planning vs spontaneity',
  'Physical affection comfort',
  'Togetherness vs independence',
  'Conflict style',
] as const;

export type RomanticVibeCategory = (typeof ROMANTIC_VIBE_CATEGORIES)[number];

export const romanticVibeCategorySchema = z.enum(ROMANTIC_VIBE_CATEGORIES);

export const romanticVibeRawEntrySchema = z.object({
  key: z.string().min(1),
  content: z.string().min(1),
  category: romanticVibeCategorySchema,
});

export type RomanticVibeRawEntry = z.infer<typeof romanticVibeRawEntrySchema>;
