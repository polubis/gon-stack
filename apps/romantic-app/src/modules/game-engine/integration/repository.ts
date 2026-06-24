import type {
  AnswerResult,
  AnswerValue,
  Category,
  CategoryId,
  Question,
  QuestionId,
  QuestionType,
} from '../contracts/models';

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

const CATEGORIES: Category[] = [
  {
    id: 'values' as CategoryId,
    label: 'Values & Beliefs',
    description: 'Core convictions that shape how you see the world.',
    questionCount: 6,
  },
  {
    id: 'lifestyle' as CategoryId,
    label: 'Lifestyle',
    description: 'Everyday rhythms, habits, and preferences.',
    questionCount: 6,
  },
  {
    id: 'intimacy' as CategoryId,
    label: 'Intimacy',
    description: 'Closeness, affection, and emotional connection.',
    questionCount: 6,
  },
  {
    id: 'future' as CategoryId,
    label: 'Future Plans',
    description: 'Dreams, goals, and what comes next.',
    questionCount: 6,
  },
  {
    id: 'money' as CategoryId,
    label: 'Money',
    description: 'How you earn, save, spend, and worry.',
    questionCount: 6,
  },
  {
    id: 'family' as CategoryId,
    label: 'Family',
    description: 'Parents, siblings, children — now and later.',
    questionCount: 6,
  },
  {
    id: 'communication' as CategoryId,
    label: 'Communication',
    description: 'How you talk, listen, and handle conflict.',
    questionCount: 6,
  },
  {
    id: 'fun' as CategoryId,
    label: 'Fun & Play',
    description: 'What makes you laugh, rest, and recharge.',
    questionCount: 6,
  },
];

const timeForDifficulty = (d: Question['difficulty']): number =>
  d === 'easy' ? 45 : d === 'medium' ? 75 : 105;

const q = (
  id: string,
  categoryId: CategoryId,
  text: string,
  type: QuestionType,
  difficulty: Question['difficulty'],
  extra: Partial<Question> = {},
): Question => ({
  id: id as QuestionId,
  categoryId,
  text,
  type,
  difficulty,
  timeLimitSeconds: timeForDifficulty(difficulty),
  ...extra,
});

const QUESTIONS_BY_CATEGORY: Record<string, Question[]> = {
  values: [
    q(
      'v1',
      'values' as CategoryId,
      'Honesty matters more than kindness.',
      'yes_no',
      'medium',
      {
        educationalTip:
          'Values questions reveal deep priorities — not right or wrong answers.',
      },
    ),
    q(
      'v2',
      'values' as CategoryId,
      'How important is spirituality to you?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'v3',
      'values' as CategoryId,
      'Which matters most?',
      'multiple_choice',
      'easy',
      {
        options: [
          { label: 'Freedom', value: 'freedom' },
          { label: 'Security', value: 'security' },
          { label: 'Adventure', value: 'adventure' },
          { label: 'Belonging', value: 'belonging' },
        ],
      },
    ),
    q(
      'v4',
      'values' as CategoryId,
      'Describe what integrity means to you.',
      'open_text',
      'hard',
      {
        maxLength: 200,
      },
    ),
    q(
      'v5',
      'values' as CategoryId,
      'I believe people can change.',
      'yes_no',
      'easy',
    ),
    q(
      'v6',
      'values' as CategoryId,
      'How strongly do you value tradition?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  lifestyle: [
    q(
      'l1',
      'lifestyle' as CategoryId,
      'Are you a morning person?',
      'yes_no',
      'easy',
    ),
    q(
      'l2',
      'lifestyle' as CategoryId,
      'Ideal weekend vibe?',
      'multiple_choice',
      'easy',
      {
        options: [
          { label: 'Quiet home day', value: 'home' },
          { label: 'Outdoor adventure', value: 'adventure' },
          { label: 'Social gathering', value: 'social' },
          { label: 'City exploration', value: 'city' },
        ],
      },
    ),
    q(
      'l3',
      'lifestyle' as CategoryId,
      'How tidy do you like your home?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'l4',
      'lifestyle' as CategoryId,
      'I need alone time every day.',
      'yes_no',
      'easy',
    ),
    q(
      'l5',
      'lifestyle' as CategoryId,
      'Describe your perfect evening.',
      'open_text',
      'medium',
      {
        maxLength: 150,
      },
    ),
    q(
      'l6',
      'lifestyle' as CategoryId,
      'How active is your ideal lifestyle?',
      'scale',
      'easy',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  intimacy: [
    q(
      'i1',
      'intimacy' as CategoryId,
      'Physical touch is my love language.',
      'yes_no',
      'medium',
    ),
    q(
      'i2',
      'intimacy' as CategoryId,
      'How comfortable are you with vulnerability?',
      'scale',
      'hard',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'i3',
      'intimacy' as CategoryId,
      'Which makes you feel most loved?',
      'multiple_choice',
      'medium',
      {
        options: [
          { label: 'Words of affirmation', value: 'words' },
          { label: 'Quality time', value: 'time' },
          { label: 'Acts of service', value: 'service' },
          { label: 'Physical touch', value: 'touch' },
        ],
      },
    ),
    q(
      'i4',
      'intimacy' as CategoryId,
      'Write a message you wish you heard more often.',
      'open_text',
      'hard',
      {
        maxLength: 200,
      },
    ),
    q(
      'i5',
      'intimacy' as CategoryId,
      'Eye contact during serious talks feels natural.',
      'yes_no',
      'medium',
    ),
    q(
      'i6',
      'intimacy' as CategoryId,
      'How openly do you express affection in public?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  future: [
    q('f1', 'future' as CategoryId, 'Do you want children?', 'yes_no', 'hard'),
    q(
      'f2',
      'future' as CategoryId,
      'Where would you most like to live?',
      'multiple_choice',
      'medium',
      {
        options: [
          { label: 'Big city', value: 'city' },
          { label: 'Small town', value: 'town' },
          { label: 'Countryside', value: 'countryside' },
          { label: 'By the sea', value: 'sea' },
        ],
      },
    ),
    q(
      'f3',
      'future' as CategoryId,
      'How important is career ambition?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'f4',
      'future' as CategoryId,
      'Describe your dream life in 10 years.',
      'open_text',
      'hard',
      {
        maxLength: 250,
      },
    ),
    q(
      'f5',
      'future' as CategoryId,
      'Marriage is important to me.',
      'yes_no',
      'hard',
    ),
    q(
      'f6',
      'future' as CategoryId,
      'How much do you plan vs improvise?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  money: [
    q(
      'm1',
      'money' as CategoryId,
      'I prefer saving over spending.',
      'yes_no',
      'easy',
    ),
    q(
      'm2',
      'money' as CategoryId,
      'How do you handle unexpected expenses?',
      'multiple_choice',
      'medium',
      {
        options: [
          { label: 'Emergency fund', value: 'fund' },
          { label: 'Credit card', value: 'credit' },
          { label: 'Borrow from family', value: 'family' },
          { label: 'Stress about it', value: 'stress' },
        ],
      },
    ),
    q(
      'm3',
      'money' as CategoryId,
      'How open are you about finances?',
      'scale',
      'hard',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'm4',
      'money' as CategoryId,
      'Splitting bills 50/50 feels right.',
      'yes_no',
      'medium',
    ),
    q(
      'm5',
      'money' as CategoryId,
      'What is the best purchase you ever made?',
      'open_text',
      'easy',
      {
        maxLength: 150,
      },
    ),
    q(
      'm6',
      'money' as CategoryId,
      'How much do you worry about money?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  family: [
    q(
      'fm1',
      'family' as CategoryId,
      'I am close with my parents.',
      'yes_no',
      'medium',
    ),
    q(
      'fm2',
      'family' as CategoryId,
      'Holidays should be spent with family.',
      'yes_no',
      'medium',
    ),
    q(
      'fm3',
      'family' as CategoryId,
      'Which family role fits you?',
      'multiple_choice',
      'medium',
      {
        options: [
          { label: 'Peacemaker', value: 'peacemaker' },
          { label: 'Provider', value: 'provider' },
          { label: 'Rebel', value: 'rebel' },
          { label: 'Caretaker', value: 'caretaker' },
        ],
      },
    ),
    q(
      'fm4',
      'family' as CategoryId,
      'Share a family tradition you love.',
      'open_text',
      'easy',
      {
        maxLength: 150,
      },
    ),
    q(
      'fm5',
      'family' as CategoryId,
      'How involved should in-laws be in our life?',
      'scale',
      'hard',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'fm6',
      'family' as CategoryId,
      'Raising kids is a 50/50 job.',
      'yes_no',
      'hard',
    ),
  ],
  communication: [
    q(
      'c1',
      'communication' as CategoryId,
      'I prefer to talk problems out immediately.',
      'yes_no',
      'medium',
    ),
    q(
      'c2',
      'communication' as CategoryId,
      'How do you handle conflict?',
      'multiple_choice',
      'hard',
      {
        options: [
          { label: 'Confront head-on', value: 'confront' },
          { label: 'Take space first', value: 'space' },
          { label: 'Write it out', value: 'write' },
          { label: 'Avoid if possible', value: 'avoid' },
        ],
      },
    ),
    q(
      'c3',
      'communication' as CategoryId,
      'How good a listener are you?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'c4',
      'communication' as CategoryId,
      'Silence feels comfortable between us.',
      'yes_no',
      'medium',
    ),
    q(
      'c5',
      'communication' as CategoryId,
      'Describe what makes you feel heard.',
      'open_text',
      'hard',
      {
        maxLength: 200,
      },
    ),
    q(
      'c6',
      'communication' as CategoryId,
      'How often should couples check in emotionally?',
      'scale',
      'medium',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
  fun: [
    q('fn1', 'fun' as CategoryId, 'I love surprises.', 'yes_no', 'easy'),
    q(
      'fn2',
      'fun' as CategoryId,
      'Ideal vacation?',
      'multiple_choice',
      'easy',
      {
        options: [
          { label: 'Beach relaxation', value: 'beach' },
          { label: 'Mountain hiking', value: 'mountain' },
          { label: 'City culture', value: 'city' },
          { label: 'Road trip', value: 'roadtrip' },
        ],
      },
    ),
    q(
      'fn3',
      'fun' as CategoryId,
      'How adventurous is your sense of humor?',
      'scale',
      'easy',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
    q(
      'fn4',
      'fun' as CategoryId,
      'Share the funniest story from your week.',
      'open_text',
      'easy',
      {
        maxLength: 150,
      },
    ),
    q(
      'fn5',
      'fun' as CategoryId,
      'Dancing in public — yes or no?',
      'yes_no',
      'easy',
    ),
    q(
      'fn6',
      'fun' as CategoryId,
      'How important is laughter in a relationship?',
      'scale',
      'easy',
      {
        scaleMin: 1,
        scaleMax: 5,
      },
    ),
  ],
};

export const getCategories = async (
  signal?: AbortSignal,
): Promise<Category[]> => {
  await delay(200, signal);
  return CATEGORIES;
};

export const getQuestionsByCategory = async (
  categoryId: CategoryId,
  signal?: AbortSignal,
): Promise<Question[]> => {
  await delay(400, signal);
  const list = QUESTIONS_BY_CATEGORY[categoryId as string];
  if (!list) throw new Error(`No questions for category ${categoryId}`);
  return list;
};

export const evaluateAnswers = (
  a1: AnswerValue,
  a2: AnswerValue,
  type: QuestionType,
): AnswerResult => {
  if (a1 === null || a2 === null) return 'no_answer';

  if (type === 'multiple_choice' || type === 'yes_no') {
    return a1 === a2 ? 'match' : 'mismatch';
  }

  if (type === 'scale') {
    const n1 = Number(a1);
    const n2 = Number(a2);
    return Math.abs(n1 - n2) <= 1 ? 'match' : 'mismatch';
  }

  // open_text: naive match — first 3 chars case-insensitive. Good enough for mock.
  const s1 = String(a1).trim().toLowerCase().slice(0, 3);
  const s2 = String(a2).trim().toLowerCase().slice(0, 3);
  if (!s1 || !s2) return 'no_answer';
  return s1 === s2 ? 'match' : 'mismatch';
};

export const generateMockPartnerAnswer = (question: Question): AnswerValue => {
  if (question.type === 'yes_no') {
    return Math.random() < 0.6 ? 'yes' : 'no';
  }
  if (question.type === 'multiple_choice' && question.options?.length) {
    const idx = Math.floor(Math.random() * question.options.length);
    return question.options[idx]!.value;
  }
  if (question.type === 'scale') {
    const min = question.scaleMin ?? 1;
    const max = question.scaleMax ?? 5;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const samples = ['love', 'life', 'home', 'family', 'peace', 'joy'];
  return samples[Math.floor(Math.random() * samples.length)]!;
};

export const randomPartnerDelayMs = (): number =>
  1000 + Math.floor(Math.random() * 2000);
