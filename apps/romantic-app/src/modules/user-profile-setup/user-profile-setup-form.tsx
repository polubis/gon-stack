import { useMemo, useState } from 'react';

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

type StepDefinition = {
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

type Answers = {
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

const TOTAL_STEPS = 10;

const TRAIT_STEPS: StepDefinition[] = [
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

export function UserProfileSetupForm() {
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

  return (
    <section id="user-profile-setup" className="w-full max-w-2xl variant-card p-6 md:p-8 flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="variant-pill">Profile setup</div>
          {step > 0 && (
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}{progressLabel ? ` - ${progressLabel}` : ''}
            </p>
          )}
        </div>
        {step > 0 && (
          <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
              style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        )}
      </header>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
            Let&apos;s set up your relationship profile
          </h1>
          <p className="text-text-secondary">
            Takes about 3-5 minutes. Your answers stay private in your room.
          </p>
          <div className="variant-option p-4 text-sm text-text-secondary leading-relaxed">
            We&apos;ll start with a few basics, then some quick questions about how you are in relationships. Ready?
          </div>
          <button
            type="button"
            className="variant-button-primary w-full md:w-auto md:self-end py-2.5 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
            onClick={handleContinue}
          >
            Let&apos;s go
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">First, tell us who you are</h2>
          <p className="text-sm text-text-secondary">Your partner will see this during games.</p>
          <div className="variant-option p-4 text-sm text-text-secondary">What should we call you?</div>
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-name" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex"
              autoComplete="name"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div className="variant-option p-4 text-sm text-text-secondary">
            And how old are you{name.trim() ? `, ${name.trim()}` : ''}?
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-age" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Age
            </label>
            <input
              id="profile-age"
              type="number"
              min={18}
              max={120}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="29"
              className="variant-input w-full px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="variant-button-ghost py-2.5 px-4 text-sm font-semibold" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step >= 2 && step <= 9 && currentTraitStep && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">{currentTraitStep.title}</h2>

          {currentTraitStep.scaleQuestions?.map((question) => {
            const value = answers[question.id as keyof Answers] as number;
            const sliderRatio = (value - 1) / 4;
            const sliderThumbSizePx = 16;
            return (
              <div key={question.id} className="variant-option p-4 flex flex-col gap-3">
                <p className="text-sm text-text-secondary leading-relaxed">{question.prompt}</p>
                <div className="relative pt-7">
                  <span
                    className="variant-pill absolute top-0 -translate-x-1/2"
                    style={{ left: `calc((100% - ${sliderThumbSizePx}px) * ${sliderRatio} + ${sliderThumbSizePx / 2}px)` }}
                  >
                    {value}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={value}
                    onChange={(event) => handleScaleChange(question.id as keyof Answers, Number(event.target.value))}
                    className="w-full accent-primary-400"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <span>{question.minLabel}</span>
                  <span>{question.maxLabel}</span>
                </div>
              </div>
            );
          })}

          {currentTraitStep.numericQuestion && (
            <div className="variant-option p-4 flex flex-col gap-3">
              <p className="text-sm text-text-secondary leading-relaxed">{currentTraitStep.numericQuestion.prompt}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="variant-icon-button"
                  onClick={() =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.max(
                        currentTraitStep.numericQuestion?.min ?? 0,
                        Number(answers[currentTraitStep.numericQuestion?.id as keyof Answers]) - 1,
                      ),
                    )
                  }
                  aria-label="Decrease evenings"
                >
                  -
                </button>
                <input
                  type="number"
                  min={currentTraitStep.numericQuestion.min}
                  max={currentTraitStep.numericQuestion.max}
                  value={answers[currentTraitStep.numericQuestion.id as keyof Answers] as number}
                  onChange={(event) =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.max(
                        currentTraitStep.numericQuestion?.min ?? 0,
                        Math.min(currentTraitStep.numericQuestion?.max ?? 7, Number(event.target.value)),
                      ),
                    )
                  }
                  className="variant-input w-20 px-3 py-2 text-sm text-center"
                />
                <button
                  type="button"
                  className="variant-icon-button"
                  onClick={() =>
                    handleScaleChange(
                      currentTraitStep.numericQuestion?.id as keyof Answers,
                      Math.min(
                        currentTraitStep.numericQuestion?.max ?? 7,
                        Number(answers[currentTraitStep.numericQuestion?.id as keyof Answers]) + 1,
                      ),
                    )
                  }
                  aria-label="Increase evenings"
                >
                  +
                </button>
                <span className="text-sm text-text-secondary">evenings per week</span>
              </div>
            </div>
          )}

          {currentTraitStep.choiceQuestions?.map((question) => {
            const selected = answers[question.id as keyof Answers] as string;
            return (
              <div key={question.id} className="variant-option p-4 flex flex-col gap-3">
                <p className="text-sm text-text-secondary leading-relaxed">{question.prompt}</p>
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => {
                    const isSelected = selected === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm ${
                          isSelected ? 'variant-option-active' : 'variant-option'
                        }`}
                        onClick={() => handleChoiceChange(question.id as keyof Answers, option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="variant-button-ghost py-2.5 px-4 text-sm font-semibold" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Next trait
            </button>
          </div>
        </div>
      )}

      {step === 10 && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-heading font-semibold text-text-primary">
            Here&apos;s your romantic vibe{name.trim() ? `, ${name.trim()}` : ''}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            This is how we&apos;ll describe your relationship style in the game. You can change this later if you want.
          </p>

          <div className="variant-option p-4 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Basic profile</p>
            <p className="text-text-primary text-sm">Name: {name.trim() || 'Not set'}</p>
            <p className="text-text-primary text-sm">Age: {age || 'Not set'}</p>
          </div>

          <div className="variant-option p-4 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">Romantic vibe tags</p>
            <div className="flex flex-wrap gap-2">
              {vibeTags.map((tag) => (
                <span key={tag} className="variant-pill variant-pill-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {saved && (
            <p className="text-sm text-success">Profile saved. You are ready to start playing.</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
              onClick={() => setStep(1)}
            >
              Edit answers
            </button>
            <button
              type="button"
              className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
              onClick={() => setSaved(true)}
            >
              Save profile &amp; start playing
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
