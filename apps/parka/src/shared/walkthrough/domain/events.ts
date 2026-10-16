import type { TriggerEvent } from '@/libs/eda';
import type { WalkthroughStep } from './models';

export type Event =
  | TriggerEvent<'[TRIGGER]_INIT', { steps: WalkthroughStep[] }>
  | TriggerEvent<'[TRIGGER]_NEXT'>
  | TriggerEvent<'[TRIGGER]_PREV'>
  | TriggerEvent<'[TRIGGER]_SKIP'>;
