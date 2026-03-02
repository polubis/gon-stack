import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserProfile,
  ApiError,
  ValidationError,
} from './create-user-profile';

type BasicInfoForm = {
  displayName: string;
  age: string;
};

type RomanticVibeForm = {
  communicationDirectness: number;
  emotionalOpenness: number;
  initiativeInRomance: 'never' | 'sometimes' | 'often' | 'very_often';
  playfulToneImportance: number;
  planningStyle: 'planned' | 'mixed' | 'spontaneous';
  physicalAffectionComfort: number;
  togethernessEveningsPerWeek: number;
  conflictStyle: 'avoid' | 'wait_then_talk' | 'talk_quickly';
};

const basicInfoSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  age: z
    .string()
    .min(1, 'Age is required')
    .refine((value) => !Number.isNaN(Number(value)), 'Age must be a number')
    .transform((value) => Number(value))
    .pipe(
      z
        .number({ invalid_type_error: 'Age must be a number' })
        .int('Age must be a whole number')
        .min(18, 'You must be at least 18')
        .max(120, 'Please enter a valid age')
    ),
});

const romanticVibeSchema = z.object({
  communicationDirectness: z
    .number()
    .min(1, 'Please answer this question')
    .max(5, 'Please answer on a 1–5 scale'),
  emotionalOpenness: z
    .number()
    .min(1, 'Please answer this question')
    .max(5, 'Please answer on a 1–5 scale'),
  initiativeInRomance: z.enum(['never', 'sometimes', 'often', 'very_often'], {
    required_error: 'Please choose an option',
  }),
  playfulToneImportance: z
    .number()
    .min(1, 'Please answer this question')
    .max(5, 'Please answer on a 1–5 scale'),
  planningStyle: z.enum(['planned', 'mixed', 'spontaneous'], {
    required_error: 'Please choose an option',
  }),
  physicalAffectionComfort: z
    .number()
    .min(1, 'Please answer this question')
    .max(5, 'Please answer on a 1–5 scale'),
  togethernessEveningsPerWeek: z
    .number()
    .int('Please use whole evenings')
    .min(0, 'Must be between 0 and 7')
    .max(7, 'Must be between 0 and 7'),
  conflictStyle: z.enum(['avoid', 'wait_then_talk', 'talk_quickly'], {
    required_error: 'Please choose an option',
  }),
});

type RomanticVibeInput = z.infer<typeof romanticVibeSchema>;

const fullFormSchema = basicInfoSchema.and(romanticVibeSchema);
type FullFormValues = z.input<typeof fullFormSchema>;

type RomanticVibeScores = {
  communicationStyle: number;
  emotionalOpenness: number;
  initiativeInRomance: number;
  playfulTone: number;
  planningVsSpontaneity: number;
  physicalAffectionComfort: number;
  togethernessVsIndependence: number;
  conflictStyle: number;
};

function computeRomanticVibeScores(input: RomanticVibeInput): {
  scores: RomanticVibeScores;
  summary: string;
} {
  const toPercentFromFive = (value: number) =>
    Math.round(((value - 1) / 4) * 100);

  const initiativeMap: Record<RomanticVibeInput['initiativeInRomance'], number> =
    {
      never: 0,
      sometimes: 40,
      often: 70,
      very_often: 100,
    };

  const planningMap: Record<RomanticVibeInput['planningStyle'], number> = {
    planned: 100,
    mixed: 50,
    spontaneous: 0,
  };

  const togetherness = Math.round((input.togethernessEveningsPerWeek / 7) * 100);

  const conflictMap: Record<RomanticVibeInput['conflictStyle'], number> = {
    avoid: 0,
    wait_then_talk: 60,
    talk_quickly: 100,
  };

  const scores: RomanticVibeScores = {
    communicationStyle: toPercentFromFive(input.communicationDirectness),
    emotionalOpenness: toPercentFromFive(input.emotionalOpenness),
    initiativeInRomance: initiativeMap[input.initiativeInRomance],
    playfulTone: toPercentFromFive(input.playfulToneImportance),
    planningVsSpontaneity: planningMap[input.planningStyle],
    physicalAffectionComfort: toPercentFromFive(
      input.physicalAffectionComfort
    ),
    togethernessVsIndependence: togetherness,
    conflictStyle: conflictMap[input.conflictStyle],
  };

  const parts: string[] = [];

  parts.push(
    scores.communicationStyle >= 60 ? 'direct communicator' : 'more subtle communicator'
  );

  parts.push(
    scores.emotionalOpenness >= 60 ? 'emotionally open' : 'more reserved with deeper feelings'
  );

  parts.push(
    scores.initiativeInRomance >= 60 ? 'often takes initiative in romance' : 'likes partner or shared initiative'
  );

  parts.push(
    scores.playfulTone >= 60 ? 'playful and light in tone' : 'leans a bit more serious'
  );

  parts.push(
    scores.planningVsSpontaneity >= 60 ? 'prefers planning' : scores.planningVsSpontaneity <= 40 ? 'loves spontaneity' : 'balanced between planning and spontaneity'
  );

  parts.push(
    scores.physicalAffectionComfort >= 60
      ? 'comfortable with physical affection'
      : 'more selective with physical affection'
  );

  parts.push(
    scores.togethernessVsIndependence >= 60
      ? 'enjoys lots of shared time'
      : 'values stronger independence and alone time'
  );

  parts.push(
    scores.conflictStyle >= 60
      ? 'tends to address conflicts directly'
      : 'more inclined to avoid or delay conflict talks'
  );

  const summary = parts.join(', ');

  return { scores, summary };
}

const initialBasicInfo: BasicInfoForm = {
  displayName: '',
  age: '',
};

const initialRomanticVibe: RomanticVibeForm = {
  communicationDirectness: 3,
  emotionalOpenness: 3,
  initiativeInRomance: 'sometimes',
  playfulToneImportance: 3,
  planningStyle: 'mixed',
  physicalAffectionComfort: 3,
  togethernessEveningsPerWeek: 3,
  conflictStyle: 'wait_then_talk',
};

type Step = 1 | 2;

export function ProfileSetupForm() {
  const [step, setStep] = useState<Step>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FullFormValues>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      ...initialBasicInfo,
      ...initialRomanticVibe,
    } as FullFormValues,
  });

  const communicationDirectness = watch('communicationDirectness');
  const emotionalOpenness = watch('emotionalOpenness');
  const initiativeInRomance = watch('initiativeInRomance');
  const playfulToneImportance = watch('playfulToneImportance');
  const planningStyle = watch('planningStyle');
  const physicalAffectionComfort = watch('physicalAffectionComfort');
  const conflictStyle = watch('conflictStyle');

  async function handleNextFromStep1() {
    setSubmitError(null);
    const isValid = await trigger(['displayName', 'age']);
    if (!isValid) {
      return;
    }
    setStep(2);
  }

  function handleBackToStep1() {
    setStep(1);
  }

  async function onSubmit(values: FullFormValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    const parsed = fullFormSchema.parse(values);
    const { displayName, age, ...romanticVibeInput } = parsed;
    const { summary } = computeRomanticVibeScores(
      romanticVibeInput as RomanticVibeInput
    );

    setIsSubmitting(true);
    try {
      const profile = await createUserProfile({
        displayName,
        age,
        romanticVibeRef: summary.slice(0, 480),
      });
      setSuccessMessage(`Profile created. Welcome, ${profile.displayName}!`);
    } catch (err) {
      if (err instanceof ValidationError) {
        setSubmitError(err.message);
        err.zodError.issues.forEach((issue) => {
          const path = issue.path[0];
          if (typeof path === 'string') {
            setError(path as keyof FullFormValues, {
              type: 'server',
              message: issue.message,
            });
            if (path === 'displayName' || path === 'age') {
              setStep(1);
            }
          }
        });
      } else if (err instanceof ApiError) {
        setSubmitError(
          err.status === 404
            ? 'Profile API not available yet.'
            : err.message
        );
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
        (formErrors) => {
          if (formErrors.displayName || formErrors.age) {
            setStep(1);
          }
        }
      )}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full ${
                step === 1 ? 'bg-pink-500' : 'bg-pink-300'
              }`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${
                step === 2 ? 'bg-pink-500' : 'bg-pink-200'
              }`}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {step === 1
              ? 'Step 1 of 2: basic profile details'
              : 'Step 2 of 2: your romantic vibe'}
          </p>
        </div>
        <div className="text-xs font-medium text-gray-500">
          Step {step} / 2
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="displayName"
              type="text"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50"
              placeholder="Your display name"
              aria-invalid={!!errors.displayName}
              aria-describedby={
                errors.displayName ? 'displayName-error' : undefined
              }
              {...register('displayName')}
            />
            {errors.displayName && (
              <p
                id="displayName-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              min={18}
              max={120}
              {...register('age')}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50"
              placeholder="18"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? 'age-error' : undefined}
            />
            {errors.age && (
              <p id="age-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.age.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-800">
              How are you in relationships?
            </h2>
            <p className="text-xs text-gray-500">
              These quick questions build your romantic vibe so matchmaking and
              future games feel more personal.
            </p>
          </div>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-gray-800">
              Communication style
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              When something bothers you, how likely are you to bring it up
              directly?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue('communicationDirectness', value)
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border ${
                    communicationDirectness === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    communicationDirectness === value || undefined
                  }
                >
                  {value}
                </button>
              ))}
            </div>
            {errors.communicationDirectness && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.communicationDirectness.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-gray-800">
              Emotional openness
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              How comfortable are you sharing your fears and insecurities with a
              partner?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue('emotionalOpenness', value)
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border ${
                    emotionalOpenness === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    emotionalOpenness === value || undefined
                  }
                >
                  {value}
                </button>
              ))}
            </div>
            {errors.emotionalOpenness && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.emotionalOpenness.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-gray-800">
              Initiative in romance
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              How often do you like to be the one who plans romantic activities?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['never', 'Never'],
                ['sometimes', 'Sometimes'],
                ['often', 'Often'],
                ['very_often', 'Very often'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue(
                      'initiativeInRomance',
                      value as RomanticVibeForm['initiativeInRomance']
                    )
                  }
                  className={`py-1.5 text-xs rounded-md border ${
                    initiativeInRomance === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    initiativeInRomance === value || undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.initiativeInRomance && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.initiativeInRomance.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-gray-800">
              Playful vs serious tone
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              How important is playful teasing and jokes in your relationship?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue('playfulToneImportance', value)
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border ${
                    playfulToneImportance === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    playfulToneImportance === value || undefined
                  }
                >
                  {value}
                </button>
              ))}
            </div>
            {errors.playfulToneImportance && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.playfulToneImportance.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-gray-800">
              Planning vs spontaneity
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              On a free weekend, you prefer:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                ['planned', 'Planned dates and activities'],
                ['mixed', 'A mix of planned and spontaneous'],
                ['spontaneous', 'Mostly spontaneous decisions'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue(
                      'planningStyle',
                      value as RomanticVibeForm['planningStyle']
                    )
                  }
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md border ${
                    planningStyle === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    planningStyle === value || undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.planningStyle && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.planningStyle.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-gray-800">
              Physical affection comfort
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              How comfortable are you with physical affection (hugs, cuddles,
              kisses) in private?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue(
                      'physicalAffectionComfort',
                      value
                    )
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border ${
                    physicalAffectionComfort === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    physicalAffectionComfort === value || undefined
                  }
                >
                  {value}
                </button>
              ))}
            </div>
            {errors.physicalAffectionComfort && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.physicalAffectionComfort.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-gray-800">
              Togetherness vs independence
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              Ideally, how many evenings per week do you like to spend together
              with a partner?
            </p>
            <div className="flex items-center gap-3">
              <input
                id="togethernessEveningsPerWeek"
                type="number"
                min={0}
                max={7}
                {...register('togethernessEveningsPerWeek', {
                  valueAsNumber: true,
                })}
                disabled={isSubmitting}
                className="w-20 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50 text-sm"
                aria-invalid={!!errors.togethernessEveningsPerWeek}
              />
              <span className="text-xs text-gray-500">evenings per week</span>
            </div>
            {errors.togethernessEveningsPerWeek && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.togethernessEveningsPerWeek.message}
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-gray-800">
              Conflict style
            </legend>
            <p className="text-xs text-gray-500 mb-1">
              When conflict appears, you tend to:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                ['avoid', 'Avoid and hope it passes'],
                ['wait_then_talk', 'Wait a bit, then talk'],
                ['talk_quickly', 'Talk about it quickly and directly'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue(
                      'conflictStyle',
                      value as RomanticVibeForm['conflictStyle']
                    )
                  }
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md border ${
                    conflictStyle === value
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                  }`}
                  aria-pressed={
                    conflictStyle === value || undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.conflictStyle && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.conflictStyle.message}
              </p>
            )}
          </fieldset>
        </div>
      )}

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}
      {successMessage && (
        <p className="text-sm text-green-600" role="status">
          {successMessage}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        {step === 2 ? (
          <button
            type="button"
            onClick={handleBackToStep1}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step === 1 ? (
          <button
            type="button"
            onClick={handleNextFromStep1}
            disabled={isSubmitting}
            className="ml-auto px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white text-sm font-medium rounded-md transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white text-sm font-medium rounded-md transition-colors"
          >
            {isSubmitting ? 'Creating…' : 'Create profile'}
          </button>
        )}
      </div>
    </form>
  );
}

