import { useEffect, useEffectEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useContext } from './context';
import { QuestionInput } from './question-input';
import { Answers } from '../contracts/models';

export const Step = () => {
  const ctx = useContext();
  const activeStepIndex = ctx.$activeStepIndex.use();
  const activeStep = ctx.$activeStep.use();
  const hasPreviousStep = ctx.$hasPreviousStep.use();

  const form = useForm<Answers>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const resetStepForm = useEffectEvent(() => {
    const nextValues: Answers = {};

    for (const question of activeStep.questions) {
      if (question.type === 'text' || question.type === 'select') {
        nextValues[question.key] = '';
        continue;
      }

      const minValue = question.min;
      nextValues[question.key] = minValue;
    }

    form.reset(nextValues);
  });

  useEffect(() => {
    resetStepForm();
  }, [activeStepIndex, activeStep]);

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
          {activeStep.label}
        </h2>
        <p className="text-sm text-text-secondary">
          {activeStep.description}
        </p>
      </div>

      {activeStep.questions.map((question) => {
        return (
          <div
            key={question.key}
            className="variant-option p-4 flex flex-col gap-3"
          >
            <p className="text-sm text-text-secondary leading-relaxed">
              {question.label}
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
