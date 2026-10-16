import type { Brand } from '@repo/type-beast/brand';
import type { ComponentType } from 'react';

export type WalkthroughStepId = Brand<number, 'WalkthroughStepId'>;

export type WalkthroughStep = {
  id: WalkthroughStepId;
  /** Picture of what the step talks about; decorative for screen readers. */
  illustration: ComponentType;
  title: string;
  body: string;
  cta: string;
};

export type WalkthroughOutcome = 'completed' | 'skipped';
