import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from './test';
import { APP_ROUTER } from '@/shared/router/routes';
import { signInAsTestUser } from './session';

const GUTTERS = [
  { width: 390, max: 16 },
  { width: 768, max: 20 },
  { width: 1280, max: 24 },
  { width: 1920, max: 24 },
];

const commands = {
  'i open the ai info screen': async ({ page }: Ctx, width: number) => {
    await page.setViewportSize({ width, height: 800 });
    await signInAsTestUser(page);
    await page.goto(APP_ROUTER.aiInfo());
  },
  'the screen sides stay narrow and the header lines up with the content':
    async ({ page }: Ctx, max: number) => {
      const main = page.getByRole('main');
      await main.waitFor();
      const { side, title } = await page.evaluate(() => {
        const m = document.querySelector('main')!;
        const h = document.querySelector('header')!.firstElementChild!;
        return {
          side: parseFloat(getComputedStyle(m).paddingLeft),
          title:
            h.getBoundingClientRect().left - m.getBoundingClientRect().left,
        };
      });
      expect(side).toBeLessThanOrEqual(max);
      expect(Math.abs(title - side)).toBeLessThanOrEqual(1);
    },
} satisfies CommandRegistry<Ctx>;

for (const { width, max } of GUTTERS) {
  test(`screen side padding stays small at ${width} px`, async ({ e2e }) => {
    const run = interpreter(commands, e2e);
    await run(['i open the ai info screen', width]);
    await run([
      'the screen sides stay narrow and the header lines up with the content',
      max,
    ]);
  });
}
