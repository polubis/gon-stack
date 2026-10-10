import { useMemo } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';

const collator = new Intl.Collator('pl');

/** Alphabetical by the label the user sees (default `category.<slug>` symbols resolved). */
export const useSortedCategories = <T extends { name: string }>(
  categories: T[],
): T[] =>
  useMemo(
    () =>
      [...categories].sort((a, b) =>
        collator.compare(categoryLabel(a.name), categoryLabel(b.name)),
      ),
    [categories],
  );
