import type { Brand } from '@repo/type-beast/brand';

export type CategoryId = Brand<string, 'CategoryId'>;

import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export { CATEGORY_ICON_IDS } from '@/shared/ui/category-icon-ids';
export type { CategoryIconId };

export type Category = {
  id: CategoryId;
  /** Default categories store a `category.<slug>` symbol; user-made ones a plain name. */
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type Editing = { mode: 'new' } | { mode: 'edit'; category: Category };

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
