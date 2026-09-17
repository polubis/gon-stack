import { atom } from '@repo/react-kit/supa-store';
import type { Summary } from '../domain/models';

export const createStore = () => {
  const $data = atom<Summary | null>(null);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);

  return { $data, $initializing, $isLoading, $error };
};

export type Store = ReturnType<typeof createStore>;
