import type { ReactNode } from 'react';
import { useContext } from './context';
import { StepView } from './step-view';
import { ProgressDots } from './progress-dots';
import { PrimaryAction } from './primary-action';
import { SkipAction } from './skip-action';

type RouterProps = {
  skipLabel?: string;
  lastStepFooter?: ReactNode;
};

export const Router = ({ skipLabel, lastStepFooter }: RouterProps) => {
  const ctx = useContext();
  const isFinished = ctx.useIsFinished();
  const isLastStep = ctx.useIsLastStep();

  if (isFinished) {
    return null;
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <StepView />
        <ProgressDots />
      </div>
      <div className="space-y-3">
        <PrimaryAction />
        {isLastStep && lastStepFooter ? (
          lastStepFooter
        ) : (
          <SkipAction label={skipLabel} />
        )}
      </div>
    </>
  );
};
