import { useMemo, useState } from 'react';
import { createHookContext } from '../../libs/power-context';

type ChoiceQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type ScaleQuestion = {
  id: string;
  prompt: string;
  minLabel: string;
  maxLabel: string;
};

export type StepDefinition = {
  stepNumber: number;
  title: string;
  category: string;
  scaleQuestions?: ScaleQuestion[];
  choiceQuestions?: ChoiceQuestion[];
  numericQuestion?: {
    id: string;
    prompt: string;
    min: number;
    max: number;
  };
};

export type Answers = {
  communicationDirect: number;
  communicationHints: number;
  emotionalOpen: number;
  emotionalPrivate: number;
  initiativePlanning: string;
  initiativeGestures: string;
  playfulImportance: number;
  playfulConflictHumor: number;
  planningWeekend: string;
  planningSurprises: string;
  affectionPrivate: number;
  affectionPda: string;
  togetherEvenings: number;
  togetherAloneTime: string;
  conflictApproach: string;
  conflictRaisedVoices: string;
};

export const TOTAL_STEPS = 10;

export const TRAIT_STEPS: StepDefinition[] = [
  {
    stepNumber: 2,
    title: 'How do you talk about problems?',
    category: 'Communication',
    scaleQuestions: [
      {
        id: 'communicationDirect',
        prompt: 'When something bothers you, how likely are you to bring it up directly?',
        minLabel: 'I almost never bring it up',
        maxLabel: 'I say it pretty directly',
      },
      {
        id: 'communicationHints',
        prompt: 'I prefer hints and vibes over direct talks about problems.',
        minLabel: 'Strongly disagree',
        maxLabel: 'Strongly agree',
      },
    ],
  },
  {
    stepNumber: 3,
    title: 'How open are you emotionally?',
    category: 'Emotional openness',
    scaleQuestions: [
      {
        id: 'emotionalOpen',
        prompt: 'How comfortable are you sharing your fears and insecurities with a partner?',
        minLabel: 'Not comfortable',
        maxLabel: 'Very comfortable',
      },
      {
        id: 'emotionalPrivate',
        prompt: 'I like to keep my deeper feelings to myself.',
        minLabel: 'Strongly disagree',
        maxLabel: 'Strongly agree',
      },
    ],
  },
  {
    stepNumber: 4,
    title: 'Who usually starts the romance?',
    category: 'Initiative',
    choiceQuestions: [
      {
        id: 'initiativePlanning',
        prompt: 'How often do you like to be the one who plans romantic activities?',
        options: ['Never', 'Sometimes', 'Often', 'Very often'],
      },
      {
        id: 'initiativeGestures',
        prompt: 'In an ideal relationship, who usually starts romantic gestures?',
        options: ['Mostly my partner', 'We take turns', 'Mostly me'],
      },
    ],
  },
  {
    stepNumber: 5,
    title: 'Playful or more serious?',
    category: 'Playfulness',
    scaleQuestions: [
      {
        id: 'playfulImportance',
        prompt: 'How important is playful teasing and jokes in your relationship?',
        minLabel: 'Not important',
        maxLabel: 'Very important',
      },
      {
        id: 'playfulConflictHumor',
        prompt: 'In conflicts, I prefer to keep things light and defuse with humor.',
        minLabel: 'Strongly disagree',
        maxLabel: 'Strongly agree',
      },
    ],
  },
  {
    stepNumber: 6,
    title: 'Planner or spontaneous?',
    category: 'Planning',
    choiceQuestions: [
      {
        id: 'planningWeekend',
        prompt: 'On a free weekend, I prefer...',
        options: [
          'Planned dates and activities',
          'A mix of planned and spontaneous',
          'Mostly spontaneous decisions',
        ],
      },
      {
        id: 'planningSurprises',
        prompt: 'Last-minute surprises make me feel...',
        options: ['Stressed', 'Neutral', 'Excited'],
      },
    ],
  },
  {
    stepNumber: 7,
    title: 'How do you feel about physical affection?',
    category: 'Affection',
    scaleQuestions: [
      {
        id: 'affectionPrivate',
        prompt: 'How comfortable are you with physical affection (hugs, cuddles, kisses) in private?',
        minLabel: 'Not comfortable',
        maxLabel: 'Very comfortable',
      },
    ],
    choiceQuestions: [
      {
        id: 'affectionPda',
        prompt: 'Public displays of affection (PDA) are...',
        options: ['Uncomfortable', 'Okay in small doses', 'Totally fine', 'I enjoy them a lot'],
      },
    ],
  },
  {
    stepNumber: 8,
    title: 'Time together vs time alone',
    category: 'Togetherness',
    numericQuestion: {
      id: 'togetherEvenings',
      prompt: 'How many evenings per week do you ideally like to spend together?',
      min: 0,
      max: 7,
    },
    choiceQuestions: [
      {
        id: 'togetherAloneTime',
        prompt: 'In a relationship, personal alone time is...',
        options: ['Not important', 'Somewhat important', 'Very important'],
      },
    ],
  },
  {
    stepNumber: 9,
    title: "When there's conflict...",
    category: 'Conflict',
    choiceQuestions: [
      {
        id: 'conflictApproach',
        prompt: 'When conflict appears, I tend to...',
        options: ['Avoid and hope it passes', 'Wait a bit, then talk', 'Talk about it quickly and directly'],
      },
      {
        id: 'conflictRaisedVoices',
        prompt: 'Raised voices in arguments make me want to...',
        options: ['Shut down', 'Stay but feel tense', 'Keep talking to resolve it'],
      },
    ],
  },
];

const INITIAL_ANSWERS: Answers = {
  communicationDirect: 3,
  communicationHints: 3,
  emotionalOpen: 3,
  emotionalPrivate: 3,
  initiativePlanning: '',
  initiativeGestures: '',
  playfulImportance: 3,
  playfulConflictHumor: 3,
  planningWeekend: '',
  planningSurprises: '',
  affectionPrivate: 3,
  affectionPda: '',
  togetherEvenings: 4,
  togetherAloneTime: '',
  conflictApproach: '',
  conflictRaisedVoices: '',
};

function getRomanticVibeTags(answers: Answers): string[] {
  const tags: string[] = [];

  const directnessScore = answers.communicationDirect - (answers.communicationHints - 3);
  if (directnessScore >= 4) tags.push('Direct communicator');
  else if (directnessScore <= 2) tags.push('Gentle, hint-based communicator');
  else tags.push('Balanced communication style');

  const emotionalScore = answers.emotionalOpen - (answers.emotionalPrivate - 3);
  if (emotionalScore >= 4) tags.push('Emotionally open');
  else if (emotionalScore <= 2) tags.push('Emotionally private');
  else tags.push('Emotionally semi-open');

  if (answers.playfulImportance >= 4) tags.push('Playful');
  else if (answers.playfulImportance <= 2) tags.push('More serious tone');
  else tags.push('Balanced playful/serious tone');

  if (answers.affectionPrivate >= 4 && answers.affectionPda !== 'Uncomfortable') {
    tags.push('Affectionate, comfortable with PDA');
  } else if (answers.affectionPrivate >= 4 && answers.affectionPda === 'Okay in small doses') {
    tags.push('Affectionate, moderate with PDA');
  } else {
    tags.push('Reserved with physical affection');
  }

  if (answers.planningWeekend === 'Planned dates and activities') tags.push('Intentional planner');
  else if (answers.planningWeekend === 'Mostly spontaneous decisions') tags.push('Spontaneous energy');
  else tags.push('Balanced planner / spontaneous');

  if (answers.togetherAloneTime === 'Very important') tags.push('Needs alone time');
  else if (answers.togetherEvenings >= 5) tags.push('Values frequent togetherness');
  else tags.push('Balanced togetherness rhythm');

  if (answers.conflictApproach === 'Talk about it quickly and directly') tags.push('Addresses conflict quickly');
  else if (answers.conflictApproach === 'Wait a bit, then talk') tags.push('Talks after a short pause in conflicts');
  else tags.push('Conflict-avoidant by default');

  return tags;
}

function useUserProfileSetup() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [saved, setSaved] = useState(false);

  const currentTraitStep = useMemo(() => TRAIT_STEPS.find((item) => item.stepNumber === step), [step]);
  const vibeTags = useMemo(() => getRomanticVibeTags(answers), [answers]);

  const canContinue = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) {
      const parsedAge = Number(age);
      return name.trim().length > 1 && Number.isInteger(parsedAge) && parsedAge >= 18 && parsedAge <= 120;
    }
    if (step >= 2 && step <= 9 && currentTraitStep?.choiceQuestions) {
      return currentTraitStep.choiceQuestions.every((question) => {
        const value = answers[question.id as keyof Answers];
        return typeof value === 'string' ? value.length > 0 : true;
      });
    }
    return true;
  }, [step, name, age, currentTraitStep, answers]);

  const progressLabel =
    step === 1
      ? 'Basics'
      : step >= 2 && step <= 9
        ? currentTraitStep?.category
        : step === 10
          ? 'Summary'
          : null;

  const handleContinue = () => {
    if (!canContinue) return;
    setSaved(false);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setSaved(false);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleScaleChange = (id: keyof Answers, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleChoiceChange = (id: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return {
    step,
    setStep,
    name,
    setName,
    age,
    setAge,
    answers,
    saved,
    setSaved,
    currentTraitStep,
    vibeTags,
    canContinue,
    progressLabel,
    handleContinue,
    handleBack,
    handleScaleChange,
    handleChoiceChange,
  };
}

export const [UserProfileSetupProvider, useUserProfileSetupContext, UserProfileSetupContext] = createHookContext(
  'UserProfileSetup',
  useUserProfileSetup,
);
