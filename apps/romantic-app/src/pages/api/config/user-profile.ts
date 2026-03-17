import type { APIRoute } from 'astro';
import type { GetUserProfile } from '../../../shared/contracts/backend/open-schema';

type Response = GetUserProfile['response'];

const GROUPS: Response['groups'] = [
  {
    id: 0,
    key: 'basics',
    label: 'Basics',
    description: 'A few details so your partner knows who you are.',
    questions: [
      {
        id: 0,
        key: 'user-profile.display-name',
        question: 'What should we call you?',
        category: 'Basics',
        constraints: { min: 2, max: 32, required: true },
        type: 'text',
      },
      {
        id: 1,
        key: 'user-profile.age',
        question: 'How old are you?',
        category: 'Basics',
        constraints: { min: 18, max: 120, required: true },
        type: 'numeric',
      },
    ],
  },
  {
    id: 1,
    key: 'communication',
    label: 'Communication',
    description: 'How you talk about problems and preferences.',
    questions: [
      {
        id: 2,
        key: 'communication.bring-up-directly',
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
        question: 'I prefer hints and vibes over direct talks about problems.',
        category: 'Communication',
        constraints: { min: 1, max: 5, required: true },
        type: 'slide',
        badges: { min: 'Strongly disagree', max: 'Strongly agree' },
      },
    ],
  },
  {
    id: 2,
    key: 'emotional-openness',
    label: 'Emotional openness',
    description: 'How you share feelings and vulnerabilities.',
    questions: [
      {
        id: 4,
        key: 'emotional-openness.share-fears',
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
        question: 'I like to keep my deeper feelings to myself.',
        category: 'Emotional openness',
        constraints: { min: 1, max: 5, required: true },
        type: 'slide',
        badges: { min: 'Strongly disagree', max: 'Strongly agree' },
      },
    ],
  },
  {
    id: 3,
    key: 'initiative',
    label: 'Initiative',
    description: 'Who plans and starts romantic moments.',
    questions: [
      {
        id: 6,
        key: 'initiative.plans-romantic-activities',
        question:
          'How often do you like to be the one who plans romantic activities?',
        category: 'Initiative',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
          { value: 'very-often', label: 'Very often' },
        ],
      },
      {
        id: 7,
        key: 'initiative.starts-gestures',
        question:
          'In an ideal relationship, who usually starts romantic gestures?',
        category: 'Initiative',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'mostly-partner', label: 'Mostly my partner' },
          { value: 'take-turns', label: 'We take turns' },
          { value: 'mostly-me', label: 'Mostly me' },
        ],
      },
    ],
  },
  {
    id: 4,
    key: 'playfulness',
    label: 'Playfulness',
    description: 'Teasing, humor, and keeping things light.',
    questions: [
      {
        id: 8,
        key: 'playfulness.teasing-importance',
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
        question:
          'In conflicts, I prefer to keep things light and defuse with humor.',
        category: 'Playfulness',
        constraints: { min: 1, max: 5, required: true },
        type: 'slide',
        badges: { min: 'Strongly disagree', max: 'Strongly agree' },
      },
    ],
  },
  {
    id: 5,
    key: 'planning',
    label: 'Planning',
    description: 'Weekends, spontaneity, and surprises.',
    questions: [
      {
        id: 10,
        key: 'planning.weekend-preference',
        question: 'On a free weekend, I prefer...',
        category: 'Planning',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'planned', label: 'Planned dates and activities' },
          { value: 'mix', label: 'A mix of planned and spontaneous' },
          { value: 'spontaneous', label: 'Mostly spontaneous decisions' },
        ],
      },
      {
        id: 11,
        key: 'planning.last-minute-surprises',
        question: 'Last-minute surprises make me feel...',
        category: 'Planning',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'stressed', label: 'Stressed' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'excited', label: 'Excited' },
        ],
      },
    ],
  },
  {
    id: 6,
    key: 'affection',
    label: 'Affection',
    description: 'Physical touch and PDA.',
    questions: [
      {
        id: 12,
        key: 'affection.physical-private',
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
        question: 'Public displays of affection (PDA) are...',
        category: 'Affection',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'uncomfortable', label: 'Uncomfortable' },
          { value: 'okay-small', label: 'Okay in small doses' },
          { value: 'totally-fine', label: 'Totally fine' },
          { value: 'enjoy', label: 'I enjoy them a lot' },
        ],
      },
    ],
  },
  {
    id: 7,
    key: 'togetherness',
    label: 'Togetherness',
    description: 'Time together and alone time.',
    questions: [
      {
        id: 14,
        key: 'togetherness.evenings-per-week',
        question:
          'How many evenings per week do you ideally like to spend together?',
        category: 'Togetherness',
        constraints: { min: 0, max: 7, required: true },
        type: 'numeric',
      },
      {
        id: 15,
        key: 'togetherness.alone-time',
        question: 'In a relationship, personal alone time is...',
        category: 'Togetherness',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'not-important', label: 'Not important' },
          { value: 'somewhat', label: 'Somewhat important' },
          { value: 'very', label: 'Very important' },
        ],
      },
    ],
  },
  {
    id: 8,
    key: 'conflict',
    label: 'Conflict',
    description: 'How you handle disagreements.',
    questions: [
      {
        id: 16,
        key: 'conflict.approach',
        question: 'When conflict appears, I tend to...',
        category: 'Conflict',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'avoid', label: 'Avoid and hope it passes' },
          { value: 'wait-then-talk', label: 'Wait a bit, then talk' },
          {
            value: 'talk-directly',
            label: 'Talk about it quickly and directly',
          },
        ],
      },
      {
        id: 17,
        key: 'conflict.raised-voices',
        question: 'Raised voices in arguments make me want to...',
        category: 'Conflict',
        constraints: { min: 1, max: 5, required: true },
        type: 'select',
        options: [
          { value: 'shut-down', label: 'Shut down' },
          { value: 'stay-tense', label: 'Stay but feel tense' },
          { value: 'keep-talking', label: 'Keep talking to resolve it' },
        ],
      },
    ],
  },
];

export const GET: APIRoute = async () => {
  const response: GetUserProfile['response'] = { groups: GROUPS };

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2300);
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
