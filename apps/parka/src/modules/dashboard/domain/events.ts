import type { TriggerEvent } from '@/libs/eda';
import type { Month, Range } from './models';

export type Event = TriggerEvent<
  '[TRIGGER]_LOAD',
  { month: Month; range: Range }
>;
