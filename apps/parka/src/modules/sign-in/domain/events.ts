import type { TriggerEvent } from '@/libs/eda';
import type { Credentials } from './models';

export type Event = TriggerEvent<
  '[TRIGGER]_SUBMIT',
  { credentials: Credentials }
>;
