import { z } from 'zod';

const displayNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be at most 100 characters')
  .trim();

const ageSchema = z
  .number()
  .int('Age must be a whole number')
  .min(18, 'You must be at least 18')
  .max(120, 'Please enter a valid age');

const createUserProfilePayloadSchema = z.object({
  displayName: displayNameSchema,
  age: ageSchema,
  romanticVibeRef: z.string().min(1).max(500).optional(),
});

export type CreateUserProfilePayload = z.infer<
  typeof createUserProfilePayloadSchema
>;

const userProfileSchema = z.object({
  id: z.string().min(1),
  displayName: displayNameSchema,
  age: ageSchema,
  romanticVibeRef: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export type CreateUserProfileOptions = {
  /** Base URL for the profile API (e.g. /api or full origin). No trailing slash. */
  baseUrl?: string;
};

const DEFAULT_BASE_URL = '/api';

/**
 * Creates a user profile via plain fetch.
 * Pure frontend: configure baseUrl when backend exists; until then you can mock or use a local handler.
 */
export async function createUserProfile(
  payload: CreateUserProfilePayload,
  options: CreateUserProfileOptions = {}
): Promise<UserProfile> {
  const parsed = createUserProfilePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ValidationError('Invalid payload', parsed.error);
  }

  const { baseUrl = DEFAULT_BASE_URL } = options;
  const url = `${baseUrl.replace(/\/$/, '')}/profiles`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }

  const json: unknown = await response.json();
  const profile = userProfileSchema.safeParse(json);
  if (!profile.success) {
    throw new ValidationError('Invalid profile response', profile.error);
  }
  return profile.data;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly zodError: import('zod').ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
