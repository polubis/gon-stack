import { useContext } from './context';

export const Final = () => {
  const ctx = useContext();
  const steps = ctx.$steps.use();
  const isSaving = ctx.$isSaving.use();
  const isSaved = ctx.$isSaved.use();

  const summaryItems = steps.flatMap((step) =>
    step.questions.map((question) => {
      const answer =
        question.type === 'select'
          ? (question.options.find((option) => option.value === question.value)
              ?.label ?? question.value)
          : question.value;

      return {
        id: `${step.key}-${question.key}`,
        stepLabel: step.label,
        questionKey: question.key,
        answer,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-5">
      <h4 className="t4">Here&apos;s your romantic vibe</h4>
      <p className="b2">
        This is how we&apos;ll describe your relationship style in the game. You
        can change this later if you want.
      </p>

      <div className="variant-option p-4 flex flex-col gap-3">
        <p className="l1">Full profile summary</p>
        <div className="max-h-80 overflow-y-auto pr-1">
          <ul className="flex flex-col gap-2.5">
            {summaryItems.map((item) => (
              <li
                key={item.id}
                className="variant-option p-3 flex flex-col gap-2"
              >
                <p className="c1">{item.stepLabel}</p>
                <p className="b3 capitalize">
                  {item.questionKey.replace(/[-_]+/g, ' ')}
                </p>
                <p className="b2 text-text-primary">
                  {typeof item.answer === 'string' && item.answer.trim()
                    ? item.answer
                    : typeof item.answer === 'number'
                      ? item.answer
                      : 'Not set'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isSaved && (
        <p className="b2 text-success">
          Profile saved. You are ready to start playing.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
          onClick={() => ctx.trigger('[TRIGGER]_EDIT_ANSWERS')}
        >
          Edit answers
        </button>
        <button
          type="button"
          className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
          disabled={isSaving}
          onClick={() => ctx.trigger('[TRIGGER]_SAVE_ANSWERS')}
        >
          Save profile &amp; start playing
        </button>
      </div>
    </div>
  );
};
