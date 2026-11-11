import type { Ctx } from './test';

/** Locators shared by the e2e specs; every one resolves through typed `data-e2e` ids. */

type Prefixer = Ctx['getByE2ePrefix'];

export const expenseRow = (prefix: Prefixer, text: string | RegExp) =>
  prefix('dashboard:expense:').filter({ hasText: text });

export const categoryRow = (prefix: Prefixer, name: string) =>
  prefix('categories:row:').filter({ hasText: name });
