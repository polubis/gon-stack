import type { ParkaState } from './types';

const currentMonth = (): string => new Date().toISOString().slice(0, 7);

export const createInitialState = (): ParkaState => ({
  selectedMonth: currentMonth(),
  authed: false,
  categories: [],
  expenses: [],
  limits: [],
  goals: [],
  recurring: [],
  notifications: [],
  settings: {
    profile: { name: '', email: '' },
    notifications: {
      push: true,
      email: false,
      limitWarnings: true,
      receiptConfirmations: true,
      limitAlerts: true,
    },
  },
});
