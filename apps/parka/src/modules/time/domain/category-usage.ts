import type { BacklogTask, Category, Task } from './models';

/** Categories by how many of the given tasks use them; ties keep the given order. */
export const sortByUsage = (
  categories: Category[],
  tasks: Pick<Task | BacklogTask, 'categoryId'>[],
): Category[] => {
  const counts = new Map<string, number>();
  for (const { categoryId } of tasks)
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  return [...categories].sort(
    (a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0),
  );
};
