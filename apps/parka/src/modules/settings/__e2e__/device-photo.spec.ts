import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

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
      device: { id: 'device-1', name: 'Chrome on Windows', type: 'desktop' },
      items: [],
    },
  ],
  limits: [],
  recurring: [],
};

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const commands = {
  'i open the settings': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.settings());
  },
  'i see no photo for "Chrome on Windows"': async ({ getByE2e }) => {
    await expect(getByE2e('settings:device:device-1')).toBeVisible();
    await expect(
      getByE2e('settings:device:device-1').locator('img[data-device-photo]'),
    ).toHaveCount(0);
  },
  'i upload the image "desk.png" for "Chrome on Windows"': async ({
    getByE2e,
  }) => {
    await getByE2e('settings:device-photo-input:device-1').setInputFiles({
      name: 'desk.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
  },
  'i upload a text file named "notes.png" for "Chrome on Windows"': async ({
    getByE2e,
  }) => {
    await getByE2e('settings:device-photo-input:device-1').setInputFiles({
      name: 'notes.png',
      mimeType: 'image/png',
      buffer: Buffer.from('not an image'),
    });
  },
  'i see the error "File must be a JPEG, PNG, WebP or GIF image"': async ({
    getByE2e,
  }) => {
    await expect(getByE2e('settings:toast')).toContainText(
      'File must be a JPEG, PNG, WebP or GIF image',
    );
  },
  'the settings show my photo for "Chrome on Windows"': async ({
    getByE2e,
  }) => {
    await expect(
      getByE2e('settings:device:device-1').locator('img[data-device-photo]'),
    ).toBeVisible();
  },
  'i open the expenses': async ({ page, getByE2e }) => {
    await page.goto(APP_ROUTER.dashboard());
    await expect(getByE2e('dashboard:main')).toBeVisible();
  },
  'the "Kawiarnia" row shows my photo': async ({ getByE2ePrefix }) => {
    await expect(
      getByE2ePrefix('dashboard:expense:')
        .filter({ hasText: 'Kawiarnia' })
        .locator('img[data-device-photo]'),
    ).toBeVisible();
  },
  'i see the crop editor': async ({ getByE2e }) => {
    await expect(getByE2e('image-editor:dialog')).toBeVisible();
  },
  'i zoom in and rotate the picture': async ({ getByE2e }) => {
    await getByE2e('image-editor:zoom').fill('2');
    await getByE2e('image-editor:rotate-right').click();
  },
  'i confirm the crop': async ({ getByE2e }) => {
    await getByE2e('image-editor:confirm').click();
  },
  'i cancel the crop': async ({ getByE2e }) => {
    await getByE2e('image-editor:cancel').click();
    await expect(getByE2e('image-editor:dialog')).toHaveCount(0);
  },
} satisfies CommandRegistry<Ctx>;

test.describe('device photo', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a photo uploaded in settings shows next to the expense', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i see no photo for "Chrome on Windows"'],
      ['i upload the image "desk.png" for "Chrome on Windows"'],
      ['i see the crop editor'],
      ['i zoom in and rotate the picture'],
      ['i confirm the crop'],
      ['the settings show my photo for "Chrome on Windows"'],
      ['i open the expenses'],
      ['the "Kawiarnia" row shows my photo'],
    );
  });

  test('a file that is not an image is rejected', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i upload a text file named "notes.png" for "Chrome on Windows"'],
      ['i see the error "File must be a JPEG, PNG, WebP or GIF image"'],
      ['i see no photo for "Chrome on Windows"'],
    );
  });

  test('a cancelled crop uploads nothing', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i upload the image "desk.png" for "Chrome on Windows"'],
      ['i cancel the crop'],
      ['i see no photo for "Chrome on Windows"'],
    );
  });
});
