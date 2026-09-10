import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Fails the test if the current page has any WCAG 2.0/2.1 A or AA violations. */
export const expectNoA11yViolations = async (page: Page): Promise<void> => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
};
