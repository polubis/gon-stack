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

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const commands = {
  'i open the settings': async ({ page }) => {
    await signInAsTestUser(page);
    await installBackend(page, SEED);
    await page.goto(APP_ROUTER.settings());
  },
  'i see no profile picture': async ({ getByE2e }) => {
    await expect(getByE2e('settings:name')).toBeVisible();
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
  'i reload the settings': async ({ page }) => {
    await page.reload();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('profile avatar', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('an uploaded picture shows in settings and survives reload', async ({
    e2e,
  }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i see no profile picture'],
      ['i upload the image "me.png"'],
      ['my picture replaces the default icon'],
      ['i reload the settings'],
      ['my picture replaces the default icon'],
    );
  });

  test('a file that is not an image is rejected', async ({ e2e }) => {
    await interpreter(commands, e2e)(
      ['i open the settings'],
      ['i upload a text file named "notes.png"'],
      ['i see the error "File must be a JPEG, PNG, WebP or GIF image"'],
      ['i see no profile picture'],
    );
  });
});
