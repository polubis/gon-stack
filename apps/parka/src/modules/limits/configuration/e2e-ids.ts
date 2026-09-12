export const LIMITS_E2E_IDS = [
  'limits:main',
  'limits:category-list',
  'limits:new',
  'limits:total',
  'limits:total-amount',
  'limits:total-save',
  'limits:total-edit',
  'limits:form',
  'limits:form-category',
  'limits:form-amount',
  'limits:form-save',
] as const;

export type LimitsE2eId = (typeof LIMITS_E2E_IDS)[number];

export const GOALS_E2E_IDS = [
  'goals:list',
  'goals:new',
  'goals:form',
  'goals:form-name',
  'goals:form-target',
  'goals:form-months',
  'goals:form-save',
] as const;

export type GoalsE2eId = (typeof GOALS_E2E_IDS)[number];
