import type {
  CategoryId,
  QuizCategory,
  QuizQuestion,
} from '../../domain/models';

const categories: QuizCategory[] = [
  {
    id: 'relationship-dynamics' as CategoryId,
    key: 'relationship-dynamics',
    label: 'Relationship Dynamics',
    description: 'How both of you behave in the relationship day-to-day.',
  },
  {
    id: 'communication-conflicts' as CategoryId,
    key: 'communication-conflicts',
    label: 'Communication and Conflicts',
    description: 'How you discuss, disagree, and reconnect.',
  },
  {
    id: 'values-life-goals' as CategoryId,
    key: 'values-life-goals',
    label: 'Values and Life Goals',
    description: 'How your future plans and priorities align.',
  },
];

const questions: QuizQuestion[] = [
  {
    id: 'q-relationship-1' as QuizQuestion['id'],
    categoryId: 'relationship-dynamics' as CategoryId,
    prompt: 'How often should couples check in emotionally each week?',
    answerType: 'multiple-choice',
    options: [
      { label: 'Once', value: 'once' },
      { label: '2-3 times', value: 'two-to-three' },
      { label: 'Every day', value: 'daily' },
    ],
    difficulty: 'easy',
    timeLimitSec: 30,
    tip: 'Regular check-ins help prevent hidden friction.',
  },
  {
    id: 'q-relationship-2' as QuizQuestion['id'],
    categoryId: 'relationship-dynamics' as CategoryId,
    prompt: 'How comfortable are you with sharing personal boundaries?',
    answerType: 'scale',
    min: 1,
    max: 5,
    difficulty: 'medium',
    timeLimitSec: 45,
  },
  {
    id: 'q-communication-1' as QuizQuestion['id'],
    categoryId: 'communication-conflicts' as CategoryId,
    prompt: 'Should conflicts be resolved before sleep when possible?',
    answerType: 'yes-no',
    difficulty: 'easy',
    timeLimitSec: 30,
  },
  {
    id: 'q-communication-2' as QuizQuestion['id'],
    categoryId: 'communication-conflicts' as CategoryId,
    prompt: 'What helps you feel heard during disagreement?',
    answerType: 'open-text',
    maxLength: 140,
    difficulty: 'hard',
    timeLimitSec: 90,
  },
  {
    id: 'q-values-1' as QuizQuestion['id'],
    categoryId: 'values-life-goals' as CategoryId,
    prompt: 'How important is long-term planning as a couple?',
    answerType: 'scale',
    min: 1,
    max: 5,
    difficulty: 'medium',
    timeLimitSec: 45,
  },
  {
    id: 'q-values-2' as QuizQuestion['id'],
    categoryId: 'values-life-goals' as CategoryId,
    prompt: 'Pick the biggest shared priority for this year.',
    answerType: 'multiple-choice',
    options: [
      { label: 'Financial stability', value: 'finance' },
      { label: 'Travel and experiences', value: 'travel' },
      { label: 'Family planning', value: 'family' },
    ],
    difficulty: 'hard',
    timeLimitSec: 60,
  },
];

export const getMockCategories = (): QuizCategory[] => categories;

export const getMockQuestionsByCategory = (categoryId: CategoryId): QuizQuestion[] => {
  return questions.filter((question) => question.categoryId === categoryId);
};

export const getShuffledQuestions = (categoryId: CategoryId): QuizQuestion[] => {
  const list = getMockQuestionsByCategory(categoryId).slice();

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const next = list[index];
    list[index] = list[swapIndex];
    list[swapIndex] = next;
  }

  return list;
};
