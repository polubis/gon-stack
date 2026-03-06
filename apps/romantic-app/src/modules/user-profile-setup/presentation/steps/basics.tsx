import { FieldError, useForm } from 'react-hook-form';
import { useContext } from '../context';
import { StepComponent } from './models';

type BasicsForm = {
  name: string;
  age: string;
};

type ValidatorType = 'min' | 'max' | 'pattern' | 'required';

const validators = {
  name: {
    min: (value: string) => value.trim().length >= 2,
    max: (value: string) => value.trim().length <= 32,
  },
  age: {
    pattern: (value: string) => /^\d+$/.test(value.trim()),
    min: (value: string) => Number(value.trim()) >= 18,
    max: (value: string) => Number(value.trim()) <= 120,
  },
} satisfies Record<
  keyof BasicsForm,
  Record<string, (value: string) => boolean>
>;

const basicsTypeMessageMap: Record<ValidatorType, string> = {
  required: 'Required',
  pattern: 'Invalid format',
  min: 'Value is too small',
  max: 'Value is too large',
};

const resolveBasicsErrorMessage = (error?: FieldError): string =>
  error ? (basicsTypeMessageMap[error.type] ?? 'Invalid value') : '';

export const Basics: StepComponent = () => {
  const ctx = useContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BasicsForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: ctx.$name.get() ?? '',
      age: ctx.$age.get()?.toString() ?? '',
    },
  });

  const onSubmit = handleSubmit(() => {
    ctx.next();
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <h2 className="text-2xl font-heading font-semibold text-text-primary">
        First, tell us who you are
      </h2>
      <p className="text-sm text-text-secondary">
        Your partner will see this during games.
      </p>
      <div className="variant-option p-4 text-sm text-text-secondary">
        What should we call you?
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <label
            htmlFor="profile-name"
            className="text-xs uppercase tracking-[0.14em] text-text-tertiary"
          >
            Name
          </label>
        </div>
        <div className="relative">
          <input
            id="profile-name"
            type="text"
            placeholder="Alex"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'profile-name-error' : undefined}
            className="variant-input w-full px-3 py-2.5 text-sm"
            style={
              errors.name
                ? {
                    borderColor: 'var(--color-error)',
                    boxShadow:
                      '0 0 0 1px color-mix(in srgb, var(--color-error) 40%, transparent), 0 0 14px color-mix(in srgb, var(--color-error) 55%, transparent)',
                  }
                : undefined
            }
            {...register('name', {
              required: true,
              validate: validators.name,
            })}
          />
        </div>
        <p
          id="profile-name-error"
          className={`mt-1 min-h-4 text-xs ${
            errors.name ? 'text-error opacity-100' : 'opacity-0'
          }`}
          role={errors.name ? 'alert' : undefined}
        >
          {resolveBasicsErrorMessage(errors.name)}
        </p>
      </div>
      <div className="variant-option p-4 text-sm text-text-secondary">
        How old are you?
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <label
            htmlFor="profile-age"
            className="text-xs uppercase tracking-[0.14em] text-text-tertiary"
          >
            Age
          </label>
        </div>
        <div className="relative">
          <input
            id="profile-age"
            type="number"
            min={18}
            max={120}
            placeholder="29"
            inputMode="numeric"
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? 'profile-age-error' : undefined}
            className="variant-input w-full px-3 py-2.5 text-sm"
            style={
              errors.age
                ? {
                    borderColor: 'var(--color-error)',
                    boxShadow:
                      '0 0 0 1px color-mix(in srgb, var(--color-error) 40%, transparent), 0 0 14px color-mix(in srgb, var(--color-error) 55%, transparent)',
                  }
                : undefined
            }
            {...register('age', {
              required: true,
              validate: validators.age,
            })}
          />
        </div>
        <p
          id="profile-age-error"
          className={`mt-1 min-h-4 text-xs ${
            errors.age ? 'text-error opacity-100' : 'opacity-0'
          }`}
          role={errors.age ? 'alert' : undefined}
        >
          {resolveBasicsErrorMessage(errors.age)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
          onClick={ctx.prev}
        >
          Back
        </button>
        <button
          type="submit"
          className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isValid || isSubmitting}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

Basics.label = 'Basics';
