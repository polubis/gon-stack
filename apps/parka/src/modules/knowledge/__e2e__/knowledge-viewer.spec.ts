import { expect, type Locator, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { APP_ROUTER } from '@/shared/router/routes';
import {
  reelMedia,
  reelUpload,
  topicPlay,
  topicRow,
  topicToggle,
} from './locators';

/**
 * Knowledge against the real Supabase backend: the demo course loads, a
 * lesson opens in the full-screen viewer, reels are swiped with a real
 * pointer drag, swiping down moves to the next lesson, and a picture
 * uploaded in the editor shows up in the reel.
 */

const EMAIL = `e2e-knowledge-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const FIRST = '1. Projects and the dashboard';
const SECOND = '2. Postgres tables and SQL';

/** 1x1 PNG. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** Real pointer drag from the middle of `box`. */
const drag = async (page: Page, box: Locator, dx: number, dy: number) => {
  const rect = (await box.boundingBox())!;
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 5 });
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
  await page.mouse.up();
};

const commands = {
  'i register and load the demo course': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.goto(APP_ROUTER.knowledge());
    await ctx.getByE2e('knowledge:empty-demo').click();
    await expect(ctx.getByE2e('knowledge:list')).toBeVisible();
  },

  'i see the brain hero and the lessons': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await expect(getByE2e('knowledge:hero')).toBeVisible();
    await expect(getByE2e('knowledge:brain')).toBeVisible();
    await expect(topicRow(getByE2ePrefix, FIRST)).toBeVisible();
  },

  'i open the first lesson': async ({ getByE2e, getByE2ePrefix }) => {
    await topicToggle(getByE2ePrefix, FIRST).click();
    await topicPlay(getByE2ePrefix, FIRST).click();
    await expect(getByE2e('knowledge:reel-viewer')).toBeVisible();
    await expect(getByE2e('knowledge:viewer-status')).toHaveText(
      /^Rolka 1 z \d+$/,
    );
  },

  'i swipe left and right between reels': async ({ page, getByE2e }) => {
    const stage = getByE2e('knowledge:viewer-stage');
    await drag(page, stage, -200, 0);
    await expect(getByE2e('knowledge:viewer-status')).toHaveText(
      /^Rolka 2 z \d+$/,
    );
    await drag(page, stage, 200, 0);
    await expect(getByE2e('knowledge:viewer-status')).toHaveText(
      /^Rolka 1 z \d+$/,
    );
  },

  'i swipe down past the last reel into the next lesson': async ({
    page,
    getByE2e,
  }) => {
    const status = getByE2e('knowledge:viewer-status');
    for (let i = 0; i < 20; i++) {
      if ((await status.textContent()) === 'Lekcja ukończona') break;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(80);
    }
    await expect(getByE2e('knowledge:viewer-complete')).toBeVisible();
    await drag(page, getByE2e('knowledge:viewer-stage'), 0, 200);
    await expect(getByE2e('knowledge:viewer-title')).toHaveText(SECOND);
    await expect(status).toHaveText(/^Rolka 1 z \d+$/);
  },

  'i close the viewer': async ({ page, getByE2e }) => {
    await page.keyboard.press('Escape');
    await expect(getByE2e('knowledge:reel-viewer')).toBeHidden();
  },

  'i filter the lessons by a phrase': async ({ getByE2e, getByE2ePrefix }) => {
    await getByE2e('knowledge:filters-open').click();
    await getByE2e('knowledge:filter-query').fill('Row Level');
    await getByE2e('knowledge:filters-apply').click();
    await expect(getByE2ePrefix('knowledge:topic:')).toHaveCount(1);
  },

  'i upload a picture to a reel and see it in the viewer': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('knowledge:filters-open').click();
    await getByE2e('knowledge:filters-clear').click();
    await getByE2e('knowledge:filters-apply').click();
    await topicToggle(getByE2ePrefix, FIRST).click();
    await getByE2ePrefix(
      'knowledge:topic-reels:',
      topicRow(getByE2ePrefix, FIRST),
    ).click();
    await expect(getByE2e('knowledge:reels-dialog')).toBeVisible();
    const sent = page.waitForResponse(
      (r) => r.url().includes('/media/') && r.request().method() === 'POST',
    );
    await reelUpload(getByE2ePrefix).setInputFiles({
      name: 'diagram.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
    expect((await sent).status()).toBe(201);
    await expect(reelMedia(getByE2ePrefix).getByRole('img')).toBeVisible();
    await page.keyboard.press('Escape');
    await topicPlay(getByE2ePrefix, FIRST).click();
    await expect(
      getByE2e('knowledge:viewer-stage').getByRole('img', {
        name: 'Ilustracja do rolki 1',
      }),
    ).toBeVisible();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('knowledge viewer', () => {
  test.setTimeout(120_000);

  test('a learner swipes through a lesson, moves on to the next one and adds a picture', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i register and load the demo course'],
      ['i see the brain hero and the lessons'],
      ['i open the first lesson'],
      ['i swipe left and right between reels'],
      ['i swipe down past the last reel into the next lesson'],
      ['i close the viewer'],
      ['i filter the lessons by a phrase'],
      ['i upload a picture to a reel and see it in the viewer'],
    );
  });
});
