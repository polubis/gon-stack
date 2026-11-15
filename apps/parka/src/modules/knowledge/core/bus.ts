import { eda } from '@/libs/eda';
import type { Event } from '../domain/events';

export const createBus = () => eda<Event>();

export type Bus = ReturnType<typeof createBus>;
