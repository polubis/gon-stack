import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { createFieldConfig } from '../configuration/validation';
import { Button } from '@/libs/ui/button';
import { Input } from '@/libs/ui/input';
import { Slider } from '@/libs/ui/slider';
import type { Question } from '../domain/models';
import type { Answers } from '../domain/models';

export type QuestionInputProps = {
  question: Question;
  control: Control<Answers>;
  register: UseFormRegister<Answers>;
  setValue: UseFormSetValue<Answers>;
};

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
        <Input
          type="text"
          {...register(fieldName, createFieldConfig({ required, min, max }))}
          minLength={min}
          maxLength={max}
          placeholder="Your answer"
          autoComplete="off"
          className="b2"
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
          <Button
            type="button"
            variant="secondary"
            className="min-w-10 px-0"
            onClick={() =>
              setValue(fieldName, Math.max(min, numericValue - 1), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-label="Decrease value"
          >
            -
          </Button>
          <Input
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
            className="w-20 b2 text-center"
          />
          <Button
            type="button"
            variant="secondary"
            className="min-w-10 px-0"
            onClick={() =>
              setValue(fieldName, Math.min(max, numericValue + 1), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-label="Increase value"
          >
            +
          </Button>
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
            <Button
              key={option.value}
              type="button"
              variant={watchedValue === option.value ? 'primary' : 'secondary'}
              className={`w-full justify-start text-left normal-case tracking-normal ${
                watchedValue === option.value ? '' : 'opacity-90'
              }`}
              onClick={() =>
                setValue(fieldName, option.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              {option.label}
            </Button>
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
