import { useSyncExternalStore } from 'react';
import { getState, subscribe } from './store';
import type { ParkaState } from './types';

const serverSnapshot = getState();

export const useParkaState = (): ParkaState =>
  useSyncExternalStore(subscribe, getState, () => serverSnapshot);

export * from './store';
export * from './selectors';
export * from './format';
export type * from './types';
