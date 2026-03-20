import type { GetUserProfile } from '../../../shared/contracts/backend/open-schema';
import {
  type Question,
  QuestionId,
  QuestionKey,
  type Answers,
  Step,
  StepId,
  StepKey,
} from '../contracts/models';

const toQuestion = (
  question: GetUserProfile['response']['groups'][number]['questions'][number],
): Question => {
  const baseQuestion = {
    id: question.id as QuestionId,
    key: question.key as QuestionKey,
    type: question.type,
    label: question.label,
    min: question.constraints.min,
    max: question.constraints.max,
    required: question.constraints.required,
  } as const;

  switch (question.type) {
    case 'numeric':
      return {
        ...baseQuestion,
        type: 'numeric',
        value: question.value,
      };
    case 'slide':
      return {
        ...baseQuestion,
        type: 'slide',
        value: question.value,
      };
    case 'text':
      return {
        ...baseQuestion,
        type: 'text',
        value: question.value,
      };
    case 'select':
      return {
        ...baseQuestion,
        type: 'select',
        value: question.value,
        options: question.options,
      };
    default: {
      const unhandledQuestionType: never = question;
      return unhandledQuestionType;
    }
  }
};

export const getConfig = async (signal: AbortSignal): Promise<Step[]> => {
  const response = await fetch('/api/config/user-profile', { signal });

  if (!response.ok) {
    throw new Error('Failed to fetch config');
  }

  const data = (await response.json()) as GetUserProfile['response'];

  return data.groups.map((group) => ({
    id: group.id as StepId,
    key: group.key as StepKey,
    label: group.label,
    description: group.description,
    questions: group.questions.map(toQuestion),
  }));
};

export const saveUserProfileAnswers = async (
  answers: Answers,
  signal?: AbortSignal,
): Promise<void> => {
  await fetch('/api/user-profile/save-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
    signal,
  });
};
