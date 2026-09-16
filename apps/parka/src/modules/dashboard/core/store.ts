import { atom } from '@repo/react-kit/supa-store';
import type { DashboardSummary } from '../domain/models';

export const createStore = () => {
  const $fetchedSummary = atom<{
    month: string;
    summary: DashboardSummary;
  } | null>(null);

  return { $fetchedSummary };
};

export type Store = ReturnType<typeof createStore>;
