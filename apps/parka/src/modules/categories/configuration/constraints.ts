import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export const FEATURE_NAME = 'Categories';

export const NEW_CATEGORY_NAME = 'Nowa kategoria';

export const COLORS = [
  '#0f7a4f',
  '#2563eb',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#0891b2',
  '#a16207',
  '#4b5a52',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#65a30d',
  '#0d9488',
  '#0284c7',
  '#4f46e5',
  '#c026d3',
  '#db2777',
  '#57534e',
  '#0f172a',
] as const;

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

export const ERROR_CODES = {
  load: 'CATEGORIES_LOAD',
  render: 'CATEGORIES_RENDER',
} as const;
