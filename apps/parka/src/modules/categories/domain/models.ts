import type { Brand } from '@repo/type-beast/brand';

export type CategoryId = Brand<string, 'CategoryId'>;

export const CATEGORY_ICON_IDS = [
  'cart',
  'car',
  'receipt',
  'popcorn',
  'heart',
  'dumbbell',
  'home',
  'gift',
  'sparkles',
] as const;

export type CategoryIconId = (typeof CATEGORY_ICON_IDS)[number];

export type Category = {
  id: CategoryId;
  /** Default categories store a `category.<slug>` symbol; user-made ones a plain name. */
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type Editing =
  { mode: 'new' } | { mode: 'edit'; category: Category } | null;

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
