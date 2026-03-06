import type { APIRoute } from 'astro';
import { GetUserProfile } from '../../../shared/contracts/backend/open-schema';

const QUESTIONS: GetUserProfile['response']['questions'] = [
  {
    id: 0,
    key: 'user-profile.display-name',
    version: 'v1',
    question: 'What should we call you?',
    category: 'Basics',
    constraints: { min: 2, max: 32, required: true },
    type: 'text',
  },
  {
    id: 1,
    key: 'user-profile.age',
    version: 'v1',
    question: 'How old are you?',
    category: 'Basics',
    constraints: { min: 18, max: 120, required: true },
    type: 'numeric',
  },
  {
    id: 2,
    key: 'communication.bring-up-directly',
    version: 'v1',
    question:
      'When something bothers you, how likely are you to bring it up directly?',
    category: 'Communication',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: {
      min: 'I almost never bring it up',
      max: 'I say it pretty directly',
    },
  },
  {
    id: 3,
    key: 'communication.hints-over-talks',
    version: 'v1',
    question: 'I prefer hints and vibes over direct talks about problems.',
    category: 'Communication',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Strongly disagree', max: 'Strongly agree' },
  },
  {
    id: 4,
    key: 'emotional-openness.share-fears',
    version: 'v1',
    question:
      'How comfortable are you sharing your fears and insecurities with a partner?',
    category: 'Emotional openness',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Not comfortable', max: 'Very comfortable' },
  },
  {
    id: 5,
    key: 'emotional-openness.keep-feelings-private',
    version: 'v1',
    question: 'I like to keep my deeper feelings to myself.',
    category: 'Emotional openness',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Strongly disagree', max: 'Strongly agree' },
  },
  {
    id: 6,
    key: 'initiative.plans-romantic-activities',
    version: 'v1',
    question:
      'How often do you like to be the one who plans romantic activities?',
    category: 'Initiative',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 7,
    key: 'initiative.starts-gestures',
    version: 'v1',
    question: 'In an ideal relationship, who usually starts romantic gestures?',
    category: 'Initiative',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 8,
    key: 'playfulness.teasing-importance',
    version: 'v1',
    question:
      'How important is playful teasing and jokes in your relationship?',
    category: 'Playfulness',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Not important', max: 'Very important' },
  },
  {
    id: 9,
    key: 'playfulness.conflict-humor',
    version: 'v1',
    question:
      'In conflicts, I prefer to keep things light and defuse with humor.',
    category: 'Playfulness',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Strongly disagree', max: 'Strongly agree' },
  },
  {
    id: 10,
    key: 'planning.weekend-preference',
    version: 'v1',
    question: 'On a free weekend, I prefer...',
    category: 'Planning',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 11,
    key: 'planning.last-minute-surprises',
    version: 'v1',
    question: 'Last-minute surprises make me feel...',
    category: 'Planning',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 12,
    key: 'affection.physical-private',
    version: 'v1',
    question:
      'How comfortable are you with physical affection (hugs, cuddles, kisses) in private?',
    category: 'Affection',
    constraints: { min: 1, max: 5, required: true },
    type: 'slide',
    badges: { min: 'Not comfortable', max: 'Very comfortable' },
  },
  {
    id: 13,
    key: 'affection.pda',
    version: 'v1',
    question: 'Public displays of affection (PDA) are...',
    category: 'Affection',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 14,
    key: 'togetherness.evenings-per-week',
    version: 'v1',
    question:
      'How many evenings per week do you ideally like to spend together?',
    category: 'Togetherness',
    constraints: { min: 0, max: 7, required: true },
    type: 'numeric',
  },
  {
    id: 15,
    key: 'togetherness.alone-time',
    version: 'v1',
    question: 'In a relationship, personal alone time is...',
    category: 'Togetherness',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 16,
    key: 'conflict.approach',
    version: 'v1',
    question: 'When conflict appears, I tend to...',
    category: 'Conflict',
    constraints: { required: true },
    type: 'select',
  },
  {
    id: 17,
    key: 'conflict.raised-voices',
    version: 'v1',
    question: 'Raised voices in arguments make me want to...',
    category: 'Conflict',
    constraints: { required: true },
    type: 'select',
  },
];

export const GET: APIRoute = async () => {
  const response: GetUserProfile['response'] = { questions: QUESTIONS };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
