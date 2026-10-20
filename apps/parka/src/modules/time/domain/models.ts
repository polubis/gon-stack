import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Category = {
  id: string;
  name: string;
  icon: CategoryIconId;
  /** User-picked hex colour (data, not a theme token). */
  color: string;
};

/** A priority is a name plus a weight: 1 (least) .. 10 (most) important. */
export type Priority = { id: string; name: string; value: number };
