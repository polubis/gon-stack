import { InternalServer } from '../core/error-handling';

/** The Data API answers at most this many rows per request. */
export const PAGE_SIZE = 1000;

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

/**
 * Every row a read matches, however many there are. A request stops at the
 * row cap without a word, so a reader that asks once silently drops the rest.
 *
 * `readPage(from, to, total)` reads rows `from..to` of one fixed query.
 * `total` asks for a total order (add the unique key as the last sort key):
 * pages are only safe to stitch together with it. Most reads fit in one
 * request, so that one goes out without it and keeps the order the table
 * gives; only a full first page makes the read start over, paged and ordered.
 */
export const readAllPages = async <T>(
  readPage: (from: number, to: number, total: boolean) => Page<T>,
): Promise<T[]> => {
  const first = await readPage(0, PAGE_SIZE - 1, false);
  if (first.error) throw new InternalServer(first.error);
  if (first.data!.length < PAGE_SIZE) return first.data!;

  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await readPage(from, from + PAGE_SIZE - 1, true);
    if (page.error) throw new InternalServer(page.error);
    rows.push(...page.data!);
    if (page.data!.length < PAGE_SIZE) return rows;
  }
};
