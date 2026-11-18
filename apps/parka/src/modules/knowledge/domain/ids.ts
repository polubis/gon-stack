/** Placeholder id of an item the server has not stored yet (swapped on answer). */
export const TEMP_PREFIX = 'tmp-';

export const newTempId = <T extends string>(): T =>
  `${TEMP_PREFIX}${crypto.randomUUID()}` as T;

export const isTempId = (id: string): boolean => id.startsWith(TEMP_PREFIX);
