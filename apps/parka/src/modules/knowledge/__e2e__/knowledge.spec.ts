import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';

/** Knowledge module is fully mocked: no backend, only a signed-in session. */

const commands = {
  'i open the knowledge page': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await page.goto(APP_ROUTER.knowledge());
    await page.waitForLoadState('networkidle');
    await expect(getByE2e('knowledge:folders')).toBeVisible();
  },
  'i see the brain summary and the folders': async ({ getByE2e }) => {
    await expect(getByE2e('knowledge:hero')).toBeVisible();
    await expect(getByE2e('knowledge:brain')).toBeVisible();
    await expect(getByE2e('knowledge:folders')).toBeVisible();
    await expect(getByE2e('knowledge:stats')).toBeVisible();
  },
  'i add a node': async ({ getByE2e, page }) => {
    const trigger = getByE2e('knowledge:add-trigger');
    if (await trigger.isVisible()) await trigger.click();
    else await getByE2e('knowledge:add-fab').click();
    await getByE2e('knowledge:node-title').fill('Idiomy angielskie');
    await getByE2e('knowledge:node-save').click();
    await expect(getByE2e('knowledge:node-dialog')).toBeHidden();
    await expect(page.getByText('Idiomy angielskie')).toBeVisible();
  },
  'i search for nothing': async ({ getByE2e }) => {
    await getByE2e('knowledge:search').fill('zzz');
    await expect(getByE2e('knowledge:empty-search')).toContainText('zzz');
  },
} satisfies CommandRegistry<Ctx>;

test.describe('knowledge', () => {
  test('the page shows the brain summary, folders and statistics', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the knowledge page'],
      ['i see the brain summary and the folders'],
    );
  });

  test('a node can be added', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the knowledge page'],
      ['i add a node'],
    );
  });

  test('an empty search names the phrase', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the knowledge page'],
      ['i search for nothing'],
    );
  });
});
