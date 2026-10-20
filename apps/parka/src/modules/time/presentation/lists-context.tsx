import { useState } from 'react';
import { context } from '@repo/react-kit/context';
import { CATEGORIES, PRIORITIES } from '../configuration/constraints';
import type { Category, Priority } from '../domain/models';
import { sortPriorities } from '../domain/priority';

/**
 * Local (non-persisted) categories and priorities of the screen. `newCategory`
 * / `newPriority` hold the last created item so a task form below it can
 * select it.
 */
export const [Provider, useContext] = context('TimeLists', () => {
  const [categories, setCategories] = useState<readonly Category[]>(CATEGORIES);
  const [priorities, setPriorities] = useState<readonly Priority[]>(
    sortPriorities(PRIORITIES),
  );
  const [newCategory, setNewCategory] = useState<Category>();
  const [newPriority, setNewPriority] = useState<Priority>();

  return {
    categories,
    priorities,
    newCategory,
    newPriority,
    createCategory: (input: Omit<Category, 'id'>) => {
      const item = { ...input, id: `custom-${categories.length}` };
      setCategories([...categories, item]);
      setNewCategory(item);
    },
    createPriority: (input: Omit<Priority, 'id'>) => {
      const item = { ...input, id: `custom-${priorities.length}` };
      setPriorities(sortPriorities([...priorities, item]));
      setNewPriority(item);
    },
  };
});
