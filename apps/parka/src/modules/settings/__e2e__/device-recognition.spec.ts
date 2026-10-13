import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const PHONE = {
  name: 'Chrome on Android',
  type: 'mobile',
  model: 'SM-S918B',
  os: 'Android 14',
  browser: 'Chrome',
  screen: '412×915',
};

// Two identical phones, only the ids differ.
const SEED: Seed = {
  categories: [
    { id: 'cat-1', name: 'Spożywcze', icon: 'cart', color: '#0f7a4f' },
  ],
  expenses: [
    {
      id: 'e-1',
      merchant: 'Kawiarnia',
      date: new Date().toISOString(),
      amount: 25,
      categoryId: 'cat-1',
      paymentMethod: 'Karta',
      source: 'manual',
      device: { id: 'device-1', ...PHONE },
      items: [],
    },
    {
      id: 'e-2',
      merchant: 'Piekarnia',
      date: new Date().toISOString(),
      amount: 8,
      categoryId: 'cat-1',
      paymentMethod: 'Karta',
      source: 'manual',
      device: { id: 'device-2', ...PHONE },
      items: [],
    },
  ],
  limits: [],
  recurring: [],
};

const commands = {
  'i open the settings on the phone "device-1"': async ({ page }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem('parka:device-id', 'device-1'),
    );
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.settings());
  },
  'both phones show the same model': async ({ getByE2e }) => {
    for (const id of ['device-1', 'device-2'])
      await expect(getByE2e(`settings:device:${id}`)).toContainText(
        'SM-S918B · Android 14 · Chrome',
      );
  },
  'the phones have different colors': async ({ getByE2e }) => {
    const color = (id: string) =>
      getByE2e(`settings:device:${id}`)
        .locator('[data-device-color]')
        .first()
        .getAttribute('data-device-color');
    expect(await color('device-1')).not.toBe(await color('device-2'));
  },
  'each phone shows its short id': async ({ getByE2e }) => {
    await expect(getByE2e('settings:device:device-1')).toContainText('#ce-1');
    await expect(getByE2e('settings:device:device-2')).toContainText('#ce-2');
  },
  'i name the second phone "Telefon Ani"': async ({ getByE2e }) => {
    const input = getByE2e('settings:device-name:device-2');
    await input.fill('Telefon Ani');
    await input.press('Enter');
    await expect(getByE2e('settings:device:device-2')).toContainText(
      'Telefon Ani',
    );
  },
  'only the first phone is marked as this device': async ({ getByE2e }) => {
    await expect(getByE2e('settings:device-this:device-1')).toBeVisible();
    await expect(getByE2e('settings:device-this:device-2')).toHaveCount(0);
  },
  'i press identify this device': async ({ getByE2e }) => {
    await getByE2e('settings:identify-device').click();
  },
  'the first phone is highlighted and announced': async ({ getByE2e }) => {
    const row = getByE2e('settings:device:device-1');
    await expect(row).toHaveAttribute('data-highlighted', 'true');
    await expect(row).toBeFocused();
    await expect(getByE2e('settings:device-announcement')).toContainText(
      'To urządzenie: SM-S918B · Android 14 · Chrome',
    );
  },
  'i open the expenses': async ({ page, getByE2e }) => {
    await page.goto(APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:main')).toBeVisible();
  },
  'the "Piekarnia" row shows "Telefon Ani"': async ({ getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix('dashboard:expense:').filter({ hasText: 'Piekarnia' }),
    ).toContainText('Telefon Ani');
  },
  'the "Kawiarnia" row shows the model': async ({ getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix('dashboard:expense:').filter({ hasText: 'Kawiarnia' }),
    ).toContainText('SM-S918B · Android 14 · Chrome');
  },
} satisfies CommandRegistry<Ctx>;

test.describe('device recognition', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('two identical phones can be told apart and identified', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the settings on the phone "device-1"'],
      ['both phones show the same model'],
      ['the phones have different colors'],
      ['each phone shows its short id'],
      ['only the first phone is marked as this device'],
      ['i name the second phone "Telefon Ani"'],
      ['i press identify this device'],
      ['the first phone is highlighted and announced'],
      ['i open the expenses'],
      ['the "Piekarnia" row shows "Telefon Ani"'],
      ['the "Kawiarnia" row shows the model'],
    );
  });
});
