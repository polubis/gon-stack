import type { TriggerEvent } from '@/libs/eda';
import type { Month } from './models';

export type Event = TriggerEvent<'[TRIGGER]_LOAD', { month: Month }>;
