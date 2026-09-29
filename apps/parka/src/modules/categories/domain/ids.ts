import type { CategoryId } from './models';

/** Client-generated id, valid for the server (`min(1)`). */
export const newCategoryId = (): CategoryId =>
  `cat-${crypto.randomUUID()}` as CategoryId;
