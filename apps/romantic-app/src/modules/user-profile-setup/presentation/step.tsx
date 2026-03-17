import { useEffect, useEffectEvent } from 'react';
import type { ReactNode } from 'react';
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { useContext } from './context';
import type * as Models from '../contracts/models';

type FormValues = Partial<Record<Models.QuestionKey, Models.QuestionValue>>;

const validationErrorMap = {
  required: 'Required field',
  min: 'Value is too low',
  max: 'Value is too high',
};

type QuestionInputProps = {
  question: Models.Question;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
};

const QuestionInput = ({
  question,
  register,
  control,
  setValue,
}: QuestionInputProps) => {
  let questionInputContent: ReactNode;
  const { min, max, required } = question.constraints;

  const watchedValue = useWatch({
    control,
    name: question.key,
    defaultValue:
      question.type === 'text' || question.type === 'select' ? '' : min,
  });

  switch (question.type) {
    case 'text': {
      questionInputContent = (
        <input
          type="text"
          {...register(question.key, {
            required: required ? validationErrorMap.required : false,
            minLength: {
              value: min,
              message: validationErrorMap.min,
            },
            maxLength: {
              value: max,
              message: validationErrorMap.max,
            },
          })}
          minLength={min}
          maxLength={max}
          placeholder="Your answer"
          autoComplete="off"
          className="variant-input w-full px-3 py-2.5 text-sm rounded-md border border-surface-300 bg-surface-100 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400/50"
        />
      );
      break;
    }

    case 'numeric': {
      const numericValue =
        typeof watchedValue === 'number' && Number.isFinite(watchedValue)
          ? watchedValue
          : min;

      questionInputContent = (
        <div className="flex items-center gap-3">
          <input
            type="hidden"
            {...register(question.key, {
              valueAsNumber: true,
              required: required ? validationErrorMap.required : false,
              min: {
                value: min,
                message: validationErrorMap.min,
              },
              max: {
                value: max,
                message: validationErrorMap.max,
              },
            })}
          />
          <button
            type="button"
            className="variant-icon-button"
            onClick={() =>
              setValue(question.key, Math.max(min, numericValue - 1), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-label="Decrease value"
          >
            -
          </button>
          <input
            type="number"
            min={min}
            max={max}
            value={numericValue}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isFinite(nextValue)) {
                setValue(question.key, min, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              setValue(question.key, Math.max(min, Math.min(max, nextValue)), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            className="variant-input w-20 px-3 py-2 text-sm text-center"
          />
          <button
            type="button"
            className="variant-icon-button"
            onClick={() =>
              setValue(question.key, Math.min(max, numericValue + 1), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-label="Increase value"
          >
            +
          </button>
        </div>
      );
      break;
    }

    case 'slide': {
      const slideValue =
        typeof watchedValue === 'number' && Number.isFinite(watchedValue)
          ? watchedValue
          : min;
      const slideRange = max - min || 1;
      const slideProgressRatio = (slideValue - min) / slideRange;
      const sliderThumbSizePx = 16;

      questionInputContent = (
        <div className="flex flex-col gap-3">
          <div className="relative pt-6">
            <input
              type="range"
              {...register(question.key, {
                valueAsNumber: true,
                required: required ? validationErrorMap.required : false,
                min: {
                  value: min,
                  message: validationErrorMap.min,
                },
                max: {
                  value: max,
                  message: validationErrorMap.max,
                },
              })}
              min={min}
              max={max}
              className="w-full h-2 rounded-full appearance-none bg-surface-200 accent-primary-400"
            />
            <span
              className="variant-pill absolute top-0 -translate-x-1/2 text-xs"
              style={{
                left: `calc((100% - ${sliderThumbSizePx}px) * ${slideProgressRatio} + ${sliderThumbSizePx / 2}px)`,
              }}
            >
              {slideValue}
            </span>
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{question.badges.min}</span>
            <span>{question.badges.max}</span>
          </div>
        </div>
      );
      break;
    }

    case 'select': {
      questionInputContent = (
        <div className="flex flex-col gap-2">
          <input
            type="hidden"
            {...register(question.key, {
              required: required ? validationErrorMap.required : false,
            })}
          />
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${
                watchedValue === option.value
                  ? 'variant-option-active'
                  : 'variant-option'
              }`}
              onClick={() =>
                setValue(question.key, option.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      );
      break;
    }
  }

  return questionInputContent;
};

export const Step = () => {
  const ctx = useContext();
  const step = ctx.$step.use();
  const currentGroup = ctx.$currentGroup.use();
  const hasPreviousStep = ctx.$hasPreviousStep.use();

  const form = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const resetStepForm = useEffectEvent(() => {
    const nextValues: FormValues = {};

    for (const question of currentGroup.questions) {
      if (question.type === 'text' || question.type === 'select') {
        nextValues[question.key] = '';
        continue;
      }

      const minValue = question.constraints.min;
      nextValues[question.key] = minValue;
    }

    form.reset(nextValues);
  });

  useEffect(() => {
    resetStepForm();
  }, [step, currentGroup]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        ctx.trigger('[TRIGGER]_NEXT', values);
      })}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-heading font-semibold text-text-primary">
          {currentGroup.label}
        </h2>
        <p className="text-sm text-text-secondary">
          {currentGroup.description}
        </p>
      </div>

      {currentGroup.questions.map((question) => {
        return (
          <div
            key={question.key}
            className="variant-option p-4 flex flex-col gap-3"
          >
            <p className="text-sm text-text-secondary leading-relaxed">
              {question.question}
            </p>

            <QuestionInput
              question={question}
              register={form.register}
              control={form.control}
              setValue={form.setValue}
            />
          </div>
        );
      })}

      <footer
        className={`flex items-center gap-3 ${
          hasPreviousStep ? 'justify-between' : 'justify-end'
        }`}
      >
        {hasPreviousStep && (
          <button
            type="button"
            className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
            onClick={() => ctx.trigger('[TRIGGER]_PREV')}
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          Continue
        </button>
      </footer>
    </form>
  );
};
