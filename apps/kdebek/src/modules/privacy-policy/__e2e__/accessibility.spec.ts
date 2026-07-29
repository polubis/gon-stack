import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { seedAcceptedConsent } from '@/__e2e__/cookie-consent';

const commands = {
  'i have already accepted cookies': (page) => seedAcceptedConsent(page),
  'im on the privacy policy page': (page) =>
    page.goto('/polityka-prywatnosci/'),
  'it should have no wcag violations': async (page) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  },
} satisfies CommandRegistry<Page>;

test('privacy policy page has no automatic wcag violations', async ({
  page,
}) => {
  await interpreter(commands, page)(
    ['i have already accepted cookies'],
    ['im on the privacy policy page'],
    ['it should have no wcag violations'],
  );
});
