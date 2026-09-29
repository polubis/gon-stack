import type { CategoryIconId } from '@/modules/shared/data';

/** Suggested categories; `name` is stored as the `category.<slug>` symbol. */
export const DEFAULT_CATEGORIES: readonly {
  slug: string;
  icon: CategoryIconId;
  color: string;
}[] = [
  { slug: 'groceries', icon: 'cart', color: '#0f7a4f' },
  { slug: 'transport', icon: 'car', color: '#2563eb' },
  { slug: 'bills', icon: 'receipt', color: '#7c3aed' },
  { slug: 'fun', icon: 'popcorn', color: '#c2410c' },
  { slug: 'health', icon: 'heart', color: '#be123c' },
  { slug: 'other', icon: 'sparkles', color: '#4b5a52' },
];
