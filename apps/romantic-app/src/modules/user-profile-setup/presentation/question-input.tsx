import { useWatch } from 'react-hook-form';
import {
  createFieldConfig,
  VALIDATION_ERROR_MAP,
} from '../configuration/validation';
import type { QuestionInputProps } from '../contracts/props';

export const QuestionInput = ({
  question,
  register,
  control,
  setValue,
}: QuestionInputProps) => {
  const { min, max, required } = question;
  const fieldName = question.key;

  const watchedValue = useWatch({
    control,
    name: fieldName,
    defaultValue: question.value,
  });

  switch (question.type) {
    case 'text': {
      return (
        <input
          type="text"
          {...register(fieldName, createFieldConfig({ required, min, max }))}
          minLength={min}
          maxLength={max}
          placeholder="Your answer"
          autoComplete="off"
          className="variant-input w-full px-3 py-2.5 text-sm rounded-md border border-surface-300 bg-surface-100 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400/50"
        />
      );
    }

    case 'numeric': {
      const numericValue =
        typeof watchedValue === 'number' && Number.isFinite(watchedValue)
          ? watchedValue
          : min;

      return (
        <div className="flex items-center gap-3">
          <input
            type="hidden"
            {...register(
              fieldName,
              createFieldConfig({ required, min, max, valueAsNumber: true }),
            )}
          />
          <button
            type="button"
            className="variant-icon-button"
            onClick={() =>
              setValue(fieldName, Math.max(min, numericValue - 1), {
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
                setValue(fieldName, min, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              setValue(fieldName, Math.max(min, Math.min(max, nextValue)), {
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
              setValue(fieldName, Math.min(max, numericValue + 1), {
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
    }

    case 'slide': {
      const slideValue =
        typeof watchedValue === 'number' && Number.isFinite(watchedValue)
          ? watchedValue
          : min;
      const slideRange = max - min || 1;
      const slideProgressRatio = (slideValue - min) / slideRange;
      const sliderThumbSizePx = 16;

      return (
        <div className="flex flex-col gap-3">
          <div className="relative pt-6">
            <input
              type="range"
              {...register(
                fieldName,
                createFieldConfig({ required, min, max, valueAsNumber: true }),
              )}
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
            <span>{question.min}</span>
            <span>{question.max}</span>
          </div>
        </div>
      );
    }

    case 'select': {
      return (
        <div className="flex flex-col gap-2">
          <input
            type="hidden"
            {...register(fieldName, createFieldConfig({ required }))}
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
                setValue(fieldName, option.value, {
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
    }

    default: {
      const exhaustiveCheck: never = question;
      return exhaustiveCheck;
    }
  }
};
