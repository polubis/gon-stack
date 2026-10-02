import type { GoalId, LimitId, RecurringId } from './models';

const randomPart = (): string => crypto.randomUUID();

export const newLimitId = (): LimitId => `limit-${randomPart()}` as LimitId;

export const newGoalId = (): GoalId => `goal-${randomPart()}` as GoalId;

export const newRecurringId = (): RecurringId =>
  `recurring-${randomPart()}` as RecurringId;
