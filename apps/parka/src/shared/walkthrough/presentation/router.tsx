import { useContext } from './context';
import { StepView } from './step-view';
import { ProgressDots } from './progress-dots';
import { PrimaryAction } from './primary-action';
import { PrevAction } from './prev-action';
import { SkipAction } from './skip-action';

type RouterProps = {
  skipLabel?: string;
};

export const Router = ({ skipLabel }: RouterProps) => {
  const ctx = useContext();
  const isFinished = ctx.useIsFinished();
  const hasPrevious = ctx.useHasPreviousStep();

  if (isFinished) {
    return null;
  }

  // Two equal slots on every step: secondary left, primary right.
  return (
    <>
      <div className="flex flex-1 flex-col items-center text-center">
        <StepView />
        <ProgressDots />
      </div>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {hasPrevious ? <PrevAction /> : <SkipAction label={skipLabel} />}
        <PrimaryAction />
      </div>
    </>
  );
};
