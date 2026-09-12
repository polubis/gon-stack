import type { TriggerEvent } from '@/libs/eda';
import type { WalkthroughStep } from './models';

export type InitPayload = {
  steps: WalkthroughStep[];
  persistenceKey: string;
  resumePersistedOutcome: boolean;
};

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT', InitPayload>
  | TriggerEvent<'[TRIGGER]_NEXT'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_SKIP'>;
