import { Controller, useWatch } from 'react-hook-form';
import { createFieldConfig } from '../configuration/validation';
import type { QuestionInputProps } from '../contracts/props';
import { Slider } from '../../../libs/ui/slider';

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
          className="variant-input w-full px-3 py-2.5 b2 rounded-md border border-surface-300 bg-surface-100 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-400/50"
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
            className="variant-input w-20 px-3 py-2 b2 text-center"
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
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={question.value}
          rules={createFieldConfig({ required, min, max, valueAsNumber: true })}
          render={({ field }) => {
            const slideValue =
              typeof field.value === 'number' && Number.isFinite(field.value)
                ? field.value
                : min;

            return (
              <Slider.Root
                min={min}
                max={max}
                value={[slideValue]}
                onValueChange={(nextValue) => {
                  const nextSlideValue = nextValue[0];
                  if (typeof nextSlideValue !== 'number') {
                    return;
                  }

                  field.onChange(nextSlideValue);
                }}
                onValueCommit={() => field.onBlur()}
                className="pt-7"
                aria-label={question.label}
              >
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumbs
                  showValueLabel
                  formatValueLabel={(value) => value}
                />
              </Slider.Root>
            );
          }}
        />
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
