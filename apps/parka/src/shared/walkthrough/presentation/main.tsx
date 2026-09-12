import { useEffect, type ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';
import type { WalkthroughOutcome, WalkthroughStep } from '../domain/models';
import { Provider, useContext } from './context';
import { Router } from './router';

type MainProps = {
  steps: WalkthroughStep[];
  persistenceKey: string;
  onFinish: (outcome: WalkthroughOutcome) => void;
  skipLabel?: string;
  lastStepFooter?: ReactNode;
  className?: string;
  /**
   * When true, a walkthrough already completed/skipped under this
   * `persistenceKey` stays finished (and `onFinish` fires immediately) on
   * remount instead of showing step one again. Off by default: most
   * callers (e.g. a first-run product intro) want the full walkthrough on
   * every visit to the screen that hosts it.
   */
  resumePersistedOutcome?: boolean;
};

const Content = ({
  steps,
  persistenceKey,
  onFinish,
  skipLabel,
  lastStepFooter,
  className,
  resumePersistedOutcome = false,
}: MainProps) => {
  const ctx = useContext();
  const isFinished = ctx.useIsFinished();
  const outcome = ctx.useOutcome();

  useEffect(() => {
    ctx.init(steps, persistenceKey, resumePersistedOutcome);
    // Runs once per mount: `steps`/`persistenceKey`/`resumePersistedOutcome`
    // are the caller's static walkthrough config, not reactive inputs this
    // effect should re-run on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistenceKey]);

  useEffect(() => {
    if (isFinished && outcome) {
      onFinish(outcome);
    }
  }, [isFinished, outcome, onFinish]);

  if (isFinished) {
    return null;
  }

  return (
    <div
      data-e2e="walkthrough:main"
      className={cn('flex flex-1 flex-col justify-between', className)}
    >
      <Router skipLabel={skipLabel} lastStepFooter={lastStepFooter} />
    </div>
  );
};

export const Main = (props: MainProps) => (
  <Provider>
    <Content {...props} />
  </Provider>
);
