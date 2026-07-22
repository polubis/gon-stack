import type { Schema } from '@/shared/server-contracts/schemas/save-user-profile-answers';
import type { Schema as ConfigSchema } from '@/shared/server-contracts/schemas/get-user-profile-questions';
import {
  type Answers,
  type Step,
  type StepId,
  type StepKey,
} from '../domain/models';
import { toQuestion } from './mappers';
import type { InferOut } from '@/shared/server-contracts/extraction';

export const getConfig = async (signal: AbortSignal): Promise<Step[]> => {
  const response = await fetch('/api/config/user-profile', {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch config');
  }

  const data = (await response.json()) as InferOut<ConfigSchema['out'], 200>;

  return data.groups.map((group) => ({
    id: group.id as StepId,
    key: group.key as StepKey,
    label: group.label,
    description: group.description,
    questions: group.questions.map(toQuestion),
  }));
};

const getErrorMessage = (
  data:
    | InferOut<Schema['out'], 400>
    | InferOut<Schema['out'], 401>
    | InferOut<Schema['out'], 500>
    | null,
) => {
  if (data && 'message' in data) {
    return data.message;
  }

  return 'Failed to save profile answers.';
};

export const saveUserProfileAnswers = async (
  answers: Answers,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch('/api/user-profile/save-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
    signal,
  });

  const data = (await response.json()) as InferOut<Schema['out']>;

  if (data.code === 200) {
    return;
  }

  throw new Error(getErrorMessage(data));
};
