import { useContext } from './context';
import { Alert } from '@/libs/ui/alert';
import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Text } from '@/libs/ui/text';

export const Final = () => {
  const ctx = useContext();
  const steps = ctx.useSteps();
  const isSaving = ctx.useIsSaving();
  const isSaved = ctx.useIsSaved();

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
      <Text.T4>Here&apos;s your romantic vibe</Text.T4>
      <Text.B2>
        This is how we&apos;ll describe your relationship style in the game. You
        can change this later if you want.
      </Text.B2>

      <Card className="flex flex-col gap-3">
        <Text.L1>Full profile summary</Text.L1>
        <div className="max-h-80 overflow-y-auto pr-1">
          <ul className="flex flex-col gap-2.5">
            {summaryItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-2">
                <Text.C1>{item.stepLabel}</Text.C1>
                <Text.B3 className="capitalize">
                  {item.questionKey.replace(/[-_]+/g, ' ')}
                </Text.B3>
                <Text.B2 className="text-text-primary">
                  {typeof item.answer === 'string' && item.answer.trim()
                    ? item.answer
                    : typeof item.answer === 'number'
                      ? item.answer
                      : 'Not set'}
                </Text.B2>
              </Card>
            ))}
          </ul>
        </div>
      </Card>

      {isSaved && (
        <Alert variant="success">
          Profile saved. You are ready to start playing.
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="secondary" onClick={ctx.editAnswers}>
          Edit answers
        </Button>
        <Button type="button" disabled={isSaving} onClick={ctx.saveAnswers}>
          Save profile &amp; start playing
        </Button>
      </div>
    </div>
  );
};
