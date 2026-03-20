import { useForm } from 'react-hook-form';
import { useContext } from './context';
import { QuestionInput } from './question-input';

const StepForm = () => {
  const ctx = useContext();
  const activeStep = ctx.$activeStep.use();
  const hasPreviousStep = ctx.$hasPreviousStep.use();
  const stepAnswers = ctx.$stepAnswers.use();

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: stepAnswers,
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        ctx.trigger('[TRIGGER]_NEXT', values);
      })}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h4 className="t4">{activeStep.label}</h4>
        <p className="b2">{activeStep.description}</p>
      </div>

      {activeStep.questions.map((question) => {
        return (
          <div
            key={question.key}
            className="variant-option p-4 flex flex-col gap-3"
          >
            <p className="b2">
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

export const Step = () => {
  const ctx = useContext();
  const activeStepIndex = ctx.$activeStepIndex.use();

  return <StepForm key={activeStepIndex} />;
};
