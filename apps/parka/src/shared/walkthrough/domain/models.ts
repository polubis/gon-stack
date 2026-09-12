import type { Brand } from '@repo/type-beast/brand';
import type { ComponentType } from 'react';

export type WalkthroughStepId = Brand<number, 'WalkthroughStepId'>;

export type WalkthroughStep = {
  id: WalkthroughStepId;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  body: string;
  cta: string;
};

export type WalkthroughOutcome = 'completed' | 'skipped';
