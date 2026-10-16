import { useEffect, useEffectEvent, type KeyboardEvent } from 'react';
import { cn } from '@repo/react-kit/cn';
import type { WalkthroughOutcome, WalkthroughStep } from '../domain/models';
import { Provider, useContext } from './context';
import { Router } from './router';

type MainProps = {
  steps: WalkthroughStep[];
  /** Fires once the walkthrough ends; persisting the outcome is up to the caller. */
  onFinish: (outcome: WalkthroughOutcome) => void;
  skipLabel?: string;
  className?: string;
};

const Content = ({ steps, onFinish, skipLabel, className }: MainProps) => {
  const ctx = useContext();
  const isFinished = ctx.useIsFinished();
  const outcome = ctx.useOutcome();
  const isLastStep = ctx.useIsLastStep();
  const finish = useEffectEvent(onFinish);

  useEffect(() => {
    ctx.init(steps);
    // Runs once per mount: `steps` is the caller's static walkthrough
    // config, not a reactive input this effect should re-run on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFinished && outcome) {
      finish(outcome);
    }
  }, [isFinished, outcome]);

  // Arrows page through the steps; finishing stays an explicit click.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') ctx.prev();
    if (event.key === 'ArrowRight' && !isLastStep) ctx.next();
  };

  if (isFinished) {
    return null;
  }

  return (
    <div
      data-e2e="walkthrough:main"
      onKeyDown={onKeyDown}
      className={cn('flex flex-1 flex-col justify-between', className)}
    >
      <Router skipLabel={skipLabel} />
    </div>
  );
};

export const Main = (props: MainProps) => (
  <Provider>
    <Content {...props} />
  </Provider>
);
