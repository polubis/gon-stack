import { atom } from '@repo/react-kit/supa-store';

export const createStore = () => {
  const $pending = atom(false);
  const $error = atom<string | null>(null);
  const $redirected = atom(false);
  const $awaitingConfirmation = atom(false);

  return { $pending, $error, $redirected, $awaitingConfirmation };
};

export type Store = ReturnType<typeof createStore>;
