import { expect } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import {
  installBackend,
  type Seed,
} from '@/modules/dashboard/__e2e__/fake-backend';
import { APP_ROUTER } from '@/shared/router/routes';

const SEED: Seed = { categories: [], expenses: [], limits: [], recurring: [] };

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const commands = {
  'i open the profile editor': async ({ page, getByE2e }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.dashboard());
    await getByE2e('account-menu:trigger').filter({ visible: true }).click();
    await getByE2e('account-menu:edit').click();
  },
  'i see no profile picture': async ({ getByE2e }) => {
    await expect(getByE2e('settings:profile-name')).toBeVisible();
    await expect(getByE2e('settings:avatar-image')).toHaveCount(0);
  },
  'i upload a text file named "notes.png"': async ({ getByE2e }) => {
    await getByE2e('settings:avatar-input').setInputFiles({
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
  'i upload the image "me.png"': async ({ getByE2e }) => {
    await getByE2e('settings:avatar-input').setInputFiles({
      name: 'me.png',
      mimeType: 'image/png',
      buffer: PNG,
    });
  },
  'my picture replaces the default icon': async ({ getByE2e }) => {
    await expect(getByE2e('settings:avatar-image')).toBeVisible();
  },
  'i reload the page': async ({ page }) => {
    await page.reload();
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

test.describe('profile avatar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('an uploaded picture shows in settings and survives reload', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the profile editor'],
      ['i see no profile picture'],
      ['i upload the image "me.png"'],
      ['i see the crop editor'],
      ['i zoom in and rotate the picture'],
      ['i confirm the crop'],
      ['my picture replaces the default icon'],
      ['i reload the page'],
      ['my picture replaces the default icon'],
    );
  });

  test('a file that is not an image is rejected', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the profile editor'],
      ['i upload a text file named "notes.png"'],
      ['i see the error "File must be a JPEG, PNG, WebP or GIF image"'],
      ['i see no profile picture'],
    );
  });

  test('a cancelled crop uploads nothing', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the profile editor'],
      ['i upload the image "me.png"'],
      ['i cancel the crop'],
      ['i see no profile picture'],
    );
  });
});
