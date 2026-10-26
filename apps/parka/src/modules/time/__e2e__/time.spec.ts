import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { localDay } from '@/shared/date/date';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';

/**
 * Time module against the real Supabase backend: a fresh account gets the
 * default categories and priorities, creates / completes / edits / deletes a
 * task, and every change survives a reload (Postgres round trip under RLS).
 */

const EMAIL = `e2e-time-${Date.now()}@parka.test`;
const RECURRING_EMAIL = `e2e-time-recurring-${Date.now()}@parka.test`;
const BACKLOG_EMAIL = `e2e-time-backlog-${Date.now()}@parka.test`;
const DESCRIPTION_EMAIL = `e2e-time-description-${Date.now()}@parka.test`;
const ATTACHMENT_EMAIL = `e2e-time-attachment-${Date.now()}@parka.test`;
const PASSWORD = 'secret123';
const ATTACHMENT_TEXT = 'Treść załącznika E2E';
const LONG_TITLE = `Długi tytuł ${'x'.repeat(147)}`;
const LONG_DESCRIPTION = Array.from(
  { length: 12 },
  (_, i) => `Linia ${i + 1}`,
).join('\n');
const DAY = '2026-10-20';
const NEXT_WEEK = '2026-10-27';
const LATER = '2026-11-03';
const AFTER_LATER = '2026-11-10';

const open = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const reload = async (page: Page): Promise<void> => {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(150);
};

const synced = (page: Page, method: string, status: number) =>
  page.waitForResponse(
    (r) =>
      r.url().includes('/api/time/') &&
      r.request().method() === method &&
      r.status() === status,
  );

/** A noisy test photo drawn on a canvas and saved as a near-lossless JPEG. */
const makePhoto = async (
  page: Page,
  width: number,
  height: number,
): Promise<Buffer> => {
  const bytes = await page.evaluate(
    async ([w, h]) => {
      const canvas = document.createElement('canvas');
      canvas.width = w!;
      canvas.height = h!;
      const g = canvas.getContext('2d')!;
      const gradient = g.createLinearGradient(0, 0, w!, h!);
      gradient.addColorStop(0, '#1d4ed8');
      gradient.addColorStop(1, '#f59e0b');
      g.fillStyle = gradient;
      g.fillRect(0, 0, w!, h!);
      for (let i = 0; i < 600; i++) {
        g.fillStyle = `hsla(${(i * 37) % 360} 80% 50% / 0.5)`;
        g.beginPath();
        g.arc((i * 997) % w!, (i * 631) % h!, 20 + ((i * 13) % 160), 0, 7);
        g.fill();
      }
      const pixels = g.getImageData(0, 0, w!, h!);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const n = ((i * 2654435761) >>> 24) % 24;
        pixels.data[i] = Math.min(255, pixels.data[i]! + n);
        pixels.data[i + 1] = Math.min(255, pixels.data[i + 1]! + n);
      }
      g.putImageData(pixels, 0, 0);
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 1),
      );
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    },
    [width, height],
  );
  return Buffer.from(bytes);
};

const commands = {
  'i register a new account': async (ctx) => {
    await registerAndConfirm(ctx, EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i register an account for the backlog': async (ctx) => {
    await registerAndConfirm(ctx, BACKLOG_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task to the backlog and it survives a reload': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Do backlogu' }).click();
    const form = getByE2e('time:backlog-form');
    await form.getByRole('textbox', { name: 'Nazwa' }).fill('Dentysta E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await expect(getByE2e('time:toast')).toHaveText('Dodano do backlogu.');
    await expect(getByE2e('time:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName(
      'Backlog, zadań: 1',
    );
  },

  'i edit the backlog task and it stays in the backlog': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:backlog-open').click();
    await page
      .getByRole('button', { name: 'Edytuj zadanie z backlogu: Dentysta E2E' })
      .click();
    const form = getByE2e('time:backlog-form');
    await form
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Dentysta piątek E2E');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:backlog-save').click(),
    ]);
    await reload(page);
    await expect(page).toHaveURL(/modal=backlog/);
    await expect(
      page.getByRole('button', {
        name: 'Edytuj zadanie z backlogu: Dentysta piątek E2E',
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Zamknij' }).click();
  },

  'one click moves the backlog task to today and it stays there': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:backlog-open').click();
    await expect(page).toHaveURL(/modal=backlog/);
    await page
      .getByRole('button', { name: 'Więcej: Dentysta piątek E2E' })
      .click();
    await Promise.all([
      synced(page, 'PUT', 200),
      page
        .getByRole('menuitem', {
          name: 'Przenieś na dziś: Dentysta piątek E2E',
        })
        .click(),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await page.getByRole('button', { name: 'Zamknij' }).click();
    await open(page, APP_ROUTER.time({ date: localDay(new Date()) }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Dentysta piątek E2E' }),
    ).toBeVisible();
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName('Backlog');
  },

  'a picked day moves another backlog task there': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Do backlogu' }).click();
    await getByE2e('time:backlog-form')
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Auto E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await getByE2e('time:backlog-open').click();
    await page.getByRole('button', { name: 'Więcej: Auto E2E' }).click();
    await Promise.all([
      synced(page, 'PUT', 200),
      page.getByLabel('Przenieś na wybrany dzień: Auto E2E').fill(NEXT_WEEK),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Auto E2E' }),
    ).toBeVisible();
  },

  'i register an account for recurring tasks': async (ctx) => {
    await registerAndConfirm(ctx, RECURRING_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'the day view of an empty account names the day': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(getByE2e('time:empty')).toContainText(
      'wtorek, 20 października 2026',
    );
  },

  'the new account starts with default categories and priorities': async ({
    page,
    getByE2e,
  }) => {
    await getByE2e('time:empty').getByRole('button').click();
    const dialog = getByE2e('time:task-dialog');
    await expect(dialog.getByRole('radio', { name: 'Praca' })).toBeVisible();
    await expect(
      dialog.getByRole('radio', { name: 'Odpoczynek' }),
    ).toBeVisible();
    await expect(dialog.getByRole('radio', { name: 'Średni' })).toBeChecked();
    await expect(page).toHaveURL(/modal=task-new/);
  },

  'i add a task and it survives a reload': async ({ page, getByE2e }) => {
    const dialog = getByE2e('time:task-dialog');
    await dialog.getByRole('textbox', { name: 'Nazwa' }).fill('Raport E2E');
    await dialog.getByRole('radio', { name: 'Wysoki' }).check({ force: true });
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(getByE2e('time:toast')).toHaveText('Dodano zadanie.');
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport E2E' }),
    ).toBeVisible();
    await reload(page);
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport E2E' }),
    ).toBeVisible();
  },

  'the task keeps the device it was created on': async ({ page, getByE2e }) => {
    const more = page.getByRole('button', { name: 'Więcej: Raport E2E' });
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await reload(page);
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport E2E' })
      .click();
    await expect(getByE2e('time:task-device')).toContainText('device-');
    await getByE2e('time:task-dialog')
      .getByRole('button', { name: 'Anuluj' })
      .click();
  },

  'i complete the task and it stays done after a reload': async ({ page }) => {
    const box = page.getByRole('checkbox', { name: 'Zrobione: Raport E2E' });
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toBeChecked();
    await reload(page);
    await expect(
      page.getByRole('checkbox', { name: 'Zrobione: Raport E2E' }),
    ).toBeChecked();
  },

  'i rename the task': async ({ page, getByE2e }) => {
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport E2E' })
      .click();
    const dialog = getByE2e('time:task-dialog');
    const title = dialog.getByRole('textbox', { name: 'Nazwa' });
    await title.fill('Raport kwartalny');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Raport kwartalny' }),
    ).toBeVisible();
  },

  'the month view marks the day and the year view counts it': async ({
    page,
  }) => {
    await open(page, APP_ROUTER.timeMonth({ date: DAY }));
    await expect(
      page.getByLabel('wtorek, 20 października, 1 zadanie'),
    ).toBeVisible();
    await open(page, APP_ROUTER.timeYear({ date: DAY }));
    await expect(
      page.getByRole('heading', { name: 'Październik' }).locator('..'),
    ).toContainText('1 zadanie');
  },

  'the next day is empty and navigation keeps the date in the address': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('period-control:next').click();
    await expect(getByE2e('time:empty')).toContainText(
      'środa, 21 października 2026',
    );
    await expect(page).toHaveURL(/date=2026-10-21/);
  },

  'the range menu returns to today from another period': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.timeWeek({ date: '2026-05-05' }));
    await page.getByRole('button', { name: /Zakres:/ }).click();
    await page.keyboard.press('End');
    await expect(getByE2e('period-control:today')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`date=${localDay(new Date())}`));
    await expect(page.getByRole('list', { name: 'Zakres' })).toBeHidden();
  },

  'i delete the task after confirming': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Raport kwartalny' })
      .click();
    await getByE2e('time:task-delete').click();
    await expect(getByE2e('time:delete-dialog')).toBeVisible();
    await Promise.all([
      synced(page, 'DELETE', 200),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('time:empty')).toBeVisible();
  },

  'the api lists no tasks after the delete': async ({ page }) => {
    const res = await page.request.get(
      API_ROUTER.time({ from: '2026-01-01', to: '2026-12-31' }),
    );
    expect(res.status()).toBe(200);
    expect(
      ((await res.json()) as { data: { tasks: unknown[] } }).data.tasks,
    ).toEqual([]);
  },

  'i add a weekly recurring task and its first occurrence appears once':
    async ({ page, getByE2e }) => {
      await open(page, APP_ROUTER.time({ date: DAY }));
      await getByE2e('time:empty').getByRole('button').click();
      const dialog = getByE2e('time:task-dialog');
      await dialog.getByRole('textbox', { name: 'Nazwa' }).fill('Siłownia E2E');
      await dialog.getByRole('switch', { name: 'Powtarzaj' }).click();
      await Promise.all([
        synced(page, 'POST', 201),
        getByE2e('time:task-save').click(),
      ]);
      const occurrence = page.getByRole('button', {
        name: 'Edytuj zadanie: Siłownia E2E',
      });
      await expect(occurrence).toBeVisible();
      await expect(getByE2e('time:recurring-mark')).toHaveCount(1);
      await reload(page);
      await expect(occurrence).toHaveCount(1);
      await page.getByRole('button', { name: 'Więcej: Siłownia E2E' }).click();
      await expect(getByE2e('time:task-row-device')).toHaveCount(0);
      await page.keyboard.press('Escape');
    },

  'the series reaches the following weeks and never revives a deleted task':
    async ({ page, getByE2e }) => {
      await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
      const occurrence = page.getByRole('button', {
        name: 'Edytuj zadanie: Siłownia E2E',
      });
      await expect(occurrence).toBeVisible();

      await occurrence.click();
      await getByE2e('time:task-delete').click();
      await Promise.all([
        synced(page, 'DELETE', 200),
        getByE2e('time:delete-confirm').click(),
      ]);
      await open(page, APP_ROUTER.time({ date: LATER }));
      await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
      await expect(getByE2e('time:empty')).toBeVisible();
      await open(page, APP_ROUTER.time({ date: LATER }));
      await expect(occurrence).toBeVisible();
    },

  'i end the series and its tasks stay as ordinary ones': async ({
    page,
    getByE2e,
  }) => {
    await page
      .getByRole('button', { name: 'Edytuj zadanie: Siłownia E2E' })
      .click();
    await getByE2e('time:recurring-stop').click();
    await Promise.all([
      synced(page, 'DELETE', 200),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(
      page.getByRole('button', { name: 'Edytuj zadanie: Siłownia E2E' }),
    ).toBeVisible();
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    await open(page, APP_ROUTER.time({ date: AFTER_LATER }));
    await expect(getByE2e('time:empty')).toBeVisible();
  },

  'i register an account for descriptions': async (ctx) => {
    await registerAndConfirm(ctx, DESCRIPTION_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task with a 160 characters title and a description': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Zadanie', exact: true }).click();
    const dialog = getByE2e('time:task-dialog');
    await dialog.getByRole('textbox', { name: 'Nazwa' }).fill(LONG_TITLE);
    await dialog
      .getByRole('textbox', { name: 'Opis (opcjonalnie)' })
      .fill(LONG_DESCRIPTION);
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(
      page.getByRole('button', { name: `Edytuj zadanie: ${LONG_TITLE}` }),
    ).toBeVisible();
  },

  'the description shows only in the details and opens in full': async ({
    page,
    getByE2e,
  }) => {
    await expect(page.getByText('Linia 1', { exact: true })).toHaveCount(0);
    await page
      .getByRole('button', { name: `Szczegóły zadania: ${LONG_TITLE}` })
      .click();
    await expect(getByE2e('time:description-clamp')).toBeVisible();
    await getByE2e('time:description-more').click();
    await expect(getByE2e('time:description-full')).toContainText('Linia 12');
  },

  'i register an account for attachments': async (ctx) => {
    await registerAndConfirm(ctx, ATTACHMENT_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i attach a file to a task and it survives a reload': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await page
      .getByRole('button', { name: 'Dodaj', exact: true })
      .first()
      .click();
    await page.getByRole('menuitem', { name: 'Zadanie', exact: true }).click();
    await getByE2e('time:task-dialog')
      .getByRole('textbox', { name: 'Nazwa' })
      .fill('Zadanie z plikiem E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await page
      .getByRole('button', { name: 'Szczegóły zadania: Zadanie z plikiem E2E' })
      .click();
    await expect(getByE2e('time:attachments')).toContainText(
      'Brak załączników',
    );
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/attachments/') && r.status() === 201,
      ),
      getByE2e('time:attachment-input').setInputFiles({
        name: 'notatka.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(ATTACHMENT_TEXT),
      }),
    ]);
    await expect(
      getByE2e('time:attachments').getByRole('link', { name: 'notatka.txt' }),
    ).toBeVisible();
    await reload(page);
    await expect(
      getByE2e('time:attachments').getByRole('link', { name: 'notatka.txt' }),
    ).toBeVisible();
  },

  'the attachment opens with its content and a wrong type is refused': async ({
    page,
    getByE2e,
  }) => {
    const link = getByE2e('time:attachments').getByRole('link', {
      name: 'notatka.txt',
    });
    const href = await link.getAttribute('href');
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(ATTACHMENT_TEXT);

    await getByE2e('time:attachment-input').setInputFiles({
      name: 'virus.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ'),
    });
    await expect(getByE2e('time:toast')).toContainText('virus.exe');
    await expect(getByE2e('time:attachments')).toContainText('(1/5)');
  },

  'i delete the attachment after confirming and it stays gone': async ({
    page,
    getByE2e,
  }) => {
    await page.getByRole('button', { name: 'Usuń plik notatka.txt' }).click();
    await expect(page).toHaveURL(/modal=attachment-delete/);
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/time/attachments/') &&
          r.request().method() === 'DELETE' &&
          r.status() === 200,
      ),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:attachments')).toContainText(
      'Brak załączników',
    );
    await reload(page);
    await expect(getByE2e('time:attachments')).toContainText(
      'Brak załączników',
    );
  },
  'a big photo is reduced in quality, keeps its size and opens full screen':
    async ({ page, getByE2e }) => {
      const original = await makePhoto(page, 2000, 1400);
      expect(original.length).toBeLessThanOrEqual(5 * 1024 * 1024);

      const [response] = await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes('/attachments/') &&
            r.request().method() === 'POST',
          { timeout: 90_000 },
        ),
        getByE2e('time:attachment-input').setInputFiles({
          name: 'wakacje.jpg',
          mimeType: 'image/jpeg',
          buffer: original,
        }),
      ]);
      const { data } = (await response.json()) as {
        data: {
          name: string;
          size: number;
          mime: string;
          originalSize: number;
        };
      };
      expect(data.mime).toBe('image/webp');
      expect(data.name).toBe('wakacje.webp');
      expect(data.originalSize).toBe(original.length);
      expect(data.size).toBeLessThan(original.length / 2);
      expect(data.size).toBeLessThanOrEqual(5 * 1024 * 1024);

      const thumb = getByE2e('time:attachments').getByRole('button', {
        name: 'Otwórz podgląd: wakacje.webp',
      });
      await expect(thumb).toBeVisible();
      const href = await getByE2e('time:attachments')
        .getByRole('link', { name: 'wakacje.webp' })
        .getAttribute('href');
      const dimensions = await page.evaluate(async (url) => {
        const bitmap = await createImageBitmap(await (await fetch(url)).blob());
        return [bitmap.width, bitmap.height];
      }, href!);
      expect(dimensions).toEqual([2000, 1400]);

      await thumb.click();
      await expect(page).toHaveURL(/modal=attachment-view/);
      const viewer = getByE2e('time:attachment-viewer');
      await expect(viewer).toBeVisible();
      await expect(
        viewer.getByRole('img', { name: 'wakacje.webp' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(viewer).toBeHidden();
      await expect(page).not.toHaveURL(/attachment-view/);
    },

  'the mcp server lists, adds a reduced photo and deletes attachments': async ({
    page,
  }) => {
    const created = await page.request.post(API_ROUTER.mcpTokens(), {
      data: { name: 'E2E załączniki', ttlDays: 1 },
    });
    const { token } = ((await created.json()) as { data: { token: string } })
      .data;
    const call = async (name: string, args: Record<string, unknown>) => {
      const response = await page.request.post(API_ROUTER.mcp(), {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name, arguments: args },
        },
      });
      expect(response.status()).toBe(200);
      return (
        (await response.json()) as {
          result: {
            isError?: boolean;
            structuredContent: {
              items: { id: string }[];
              id: string;
              size: number;
            };
          };
        }
      ).result;
    };

    const tasks = await call('list_tasks', {});
    const taskId = tasks.structuredContent.items[0]!.id;
    const before = await call('list_task_attachments', { taskId });
    const photo = await makePhoto(page, 2000, 1400);
    const added = await call('add_task_attachment', {
      taskId,
      name: 'mcp.jpg',
      mimeType: 'image/jpeg',
      contentBase64: photo.toString('base64'),
    });
    expect(added.isError).toBeFalsy();
    expect(added.structuredContent).toMatchObject({
      name: 'mcp.webp',
      mime: 'image/webp',
      originalSize: photo.length,
    });
    expect(added.structuredContent.size).toBeLessThan(photo.length / 2);

    const after = await call('list_task_attachments', { taskId });
    expect(after.structuredContent.items).toHaveLength(
      before.structuredContent.items.length + 1,
    );
    const href = API_ROUTER.timeAttachmentById(added.structuredContent.id);
    expect((await page.request.get(href)).status()).toBe(200);

    const refused = await call('add_task_attachment', {
      taskId,
      name: 'virus.exe',
      mimeType: 'text/plain',
      contentBase64: 'not base64!!',
    });
    expect(refused.isError).toBe(true);

    const removed = await call('delete_task_attachment', {
      id: added.structuredContent.id,
      confirm: true,
    });
    expect(removed.structuredContent).toMatchObject({ deleted: true });
    expect((await page.request.get(href)).status()).toBe(404);
  },
} satisfies CommandRegistry<Ctx>;

test('time works against the real Supabase backend', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i register a new account'],
    ['the day view of an empty account names the day'],
    ['the new account starts with default categories and priorities'],
    ['i add a task and it survives a reload'],
    ['the task keeps the device it was created on'],
    ['i complete the task and it stays done after a reload'],
    ['i rename the task'],
    ['the month view marks the day and the year view counts it'],
    ['the next day is empty and navigation keeps the date in the address'],
    ['the range menu returns to today from another period'],
    ['i delete the task after confirming'],
    ['the api lists no tasks after the delete'],
  );
});

test('task description and long title survive the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for descriptions'],
    ['i add a task with a 160 characters title and a description'],
    ['the description shows only in the details and opens in full'],
  );
});

test('backlog tasks move to the board on the real backend', async ({ e2e }) => {
  await interpreter(commands, e2e)(
    ['i register an account for the backlog'],
    ['i add a task to the backlog and it survives a reload'],
    ['i edit the backlog task and it stays in the backlog'],
    ['one click moves the backlog task to today and it stays there'],
    ['a picked day moves another backlog task there'],
  );
});

test('recurring time tasks follow their series on the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for recurring tasks'],
    ['i add a weekly recurring task and its first occurrence appears once'],
    ['the series reaches the following weeks and never revives a deleted task'],
    ['i end the series and its tasks stay as ordinary ones'],
  );
});

test('task attachments upload, open and delete on the real backend', async ({
  e2e,
}) => {
  test.setTimeout(150_000);
  await interpreter(commands, e2e)(
    ['i register an account for attachments'],
    ['i attach a file to a task and it survives a reload'],
    ['the attachment opens with its content and a wrong type is refused'],
    ['i delete the attachment after confirming and it stays gone'],
    ['a big photo is reduced in quality, keeps its size and opens full screen'],
    ['the mcp server lists, adds a reduced photo and deletes attachments'],
  );
});
