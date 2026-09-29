export const CATEGORIES_E2E_IDS = [
  'categories:main',
  'categories:new',
  'categories:list',
  'categories:form',
  'categories:form-name',
  'categories:form-icon',
  'categories:form-color',
  'categories:form-save',
  'categories:add-defaults',
  'categories:load-error',
  'categories:toast',
] as const;

export type CategoriesE2eDynamicId =
  | `categories:row:${string | number}`
  | `categories:add-default:${string | number}`;

export type CategoriesE2eId =
  (typeof CATEGORIES_E2E_IDS)[number] | CategoriesE2eDynamicId;
