import { expect, type Page } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test, type Ctx } from '@/__e2e__/test';
import { registerAndConfirm } from '@/__e2e__/mailbox';
import { localDay } from '@/shared/date/date';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import {
  attachmentDelete,
  attachmentLink,
  attachmentThumb,
  commentEdit,
  moveItem,
  taskDelete,
  taskDone,
  taskEdit,
  taskInfo,
  taskMore,
} from './locators';

/**
 * Time module against the real Supabase backend: a fresh account gets the
 * default categories and priorities, creates / completes / edits / deletes a
 * task, and every change survives a reload (Postgres round trip under RLS).
 */

const EMAIL = `e2e-time-${Date.now()}@parka.test`;
const VIEWS_EMAIL = `e2e-time-views-${Date.now()}@parka.test`;
const RECURRING_EMAIL = `e2e-time-recurring-${Date.now()}@parka.test`;
const BACKLOG_EMAIL = `e2e-time-backlog-${Date.now()}@parka.test`;
const DESCRIPTION_EMAIL = `e2e-time-description-${Date.now()}@parka.test`;
const POPOVER_EMAIL = `e2e-time-popover-${Date.now()}@parka.test`;
const ATTACHMENT_EMAIL = `e2e-time-attachment-${Date.now()}@parka.test`;
const COMMENT_EMAIL = `e2e-time-comment-${Date.now()}@parka.test`;
const OPEN_ONLY_EMAIL = `e2e-time-open-only-${Date.now()}@parka.test`;
const UPFRONT_EMAIL = `e2e-time-upfront-${Date.now()}@parka.test`;
const BAR_EMAIL = `e2e-time-backlog-bar-${Date.now()}@parka.test`;
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

/** A short moving clip recorded from a canvas (WebM), `seconds` long. */
const makeVideo = async (page: Page, seconds: number): Promise<Buffer> => {
  const bytes = await page.evaluate(async (length) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const g = canvas.getContext('2d')!;
    const recorder = new MediaRecorder(canvas.captureStream(30), {
      mimeType: 'video/webm',
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    const stopped = new Promise((resolve) => (recorder.onstop = resolve));
    recorder.start();
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const draw = () => {
        const t = performance.now() - startedAt;
        g.fillStyle = `hsl(${(t / 10) % 360} 70% 50%)`;
        g.fillRect(0, 0, 320, 180);
        g.fillStyle = '#fff';
        g.fillRect((t / 5) % 300, 80, 20, 20);
        if (t < length * 1000) requestAnimationFrame(draw);
        else resolve();
      };
      draw();
    });
    recorder.stop();
    await stopped;
    return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
  }, seconds);
  return Buffer.from(bytes);
};

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

  'i register an account for the views': async (ctx) => {
    await registerAndConfirm(ctx, VIEWS_EMAIL, PASSWORD);
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
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:backlog-new').click();

    await getByE2e('time:backlog-name').fill('Dentysta E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await expect(getByE2e('time:empty')).toBeVisible();
    await reload(page);
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName(
      'Backlog, zadań: 1',
    );
  },

  'i edit the backlog task and it stays in the backlog': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('time:backlog-open').click();
    await taskEdit(getByE2ePrefix, 'Dentysta E2E').click();

    await getByE2e('time:backlog-name').fill('Dentysta piątek E2E');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:backlog-save').click(),
    ]);
    await reload(page);
    await expect(page).toHaveURL(/modal=backlog/);
    await expect(taskEdit(getByE2ePrefix, 'Dentysta piątek E2E')).toBeVisible();
    await getByE2e('time:modal-close:backlog').click();
  },

  'one click moves the backlog task to today and it stays there': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('time:backlog-open').click();
    await expect(page).toHaveURL(/modal=backlog/);
    await taskMore(getByE2ePrefix, 'Dentysta piątek E2E').click();
    await Promise.all([
      synced(page, 'PUT', 200),
      moveItem(getByE2ePrefix, 'Przenieś na dziś').click(),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await getByE2e('time:modal-close:backlog').click();
    await open(page, APP_ROUTER.time({ date: localDay(new Date()) }));
    await expect(taskEdit(getByE2ePrefix, 'Dentysta piątek E2E')).toBeVisible();
    await expect(getByE2e('time:backlog-open')).toHaveAccessibleName('Backlog');
  },

  'a picked day moves another backlog task there': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:backlog-new').click();
    await getByE2e('time:backlog-name').fill('Auto E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:backlog-save').click(),
    ]);
    await getByE2e('time:backlog-open').click();
    await taskMore(getByE2ePrefix, 'Auto E2E').click();
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2ePrefix('time:task-date:').fill(NEXT_WEEK),
    ]);
    await expect(getByE2e('time:backlog-empty')).toBeVisible();
    await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
    await expect(taskEdit(getByE2ePrefix, 'Auto E2E')).toBeVisible();
  },

  'i register an account for popover actions': async (ctx) => {
    await registerAndConfirm(ctx, POPOVER_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
    await ctx.page.setViewportSize({ width: 390, height: 844 });
  },

  'i add a task from the add menu and its form stays open': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-fab').click();
    await getByE2e('time:add-option:task-new').click();
    await page.waitForTimeout(500);
    const dialog = getByE2e('time:task-dialog');
    await expect(dialog).toBeVisible();
    await getByE2e('time:task-name').fill('Menu E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(taskEdit(getByE2ePrefix, 'Menu E2E')).toBeVisible();
  },

  'the delete confirmation from the task menu stays open until answered':
    async ({ page, getByE2e, getByE2ePrefix }) => {
      await taskMore(getByE2ePrefix, 'Menu E2E').click();
      await taskDelete(getByE2ePrefix).click();
      await page.waitForTimeout(500);
      await expect(getByE2e('time:delete-dialog')).toBeVisible();
      await expect(page).toHaveURL(/modal=task-delete/);
      await Promise.all([
        synced(page, 'DELETE', 200),
        getByE2e('time:delete-confirm').click(),
      ]);
      await expect(getByE2e('time:empty')).toBeVisible();
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
    await getByE2e('time:empty-add').click();
    await getByE2e('time:category-select').click();
    await expect(page.getByRole('option', { name: 'Praca' })).toBeVisible();
    await expect(
      page.getByRole('option', { name: 'Odpoczynek' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(getByE2e('time:priority-select')).toContainText('Średni');
    await expect(page).toHaveURL(/modal=task-new/);
  },

  'i add a task and it survives a reload': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2e('time:task-name').fill('Raport E2E');
    await getByE2e('time:priority-select').click();
    await page.getByRole('option', { name: 'Wysoki' }).click();
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await expect(taskEdit(getByE2ePrefix, 'Raport E2E')).toBeVisible();
    await reload(page);
    await expect(taskEdit(getByE2ePrefix, 'Raport E2E')).toBeVisible();
  },

  'the task keeps the device it was created on': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    const more = taskMore(getByE2ePrefix, 'Raport E2E');
    const menu = page.getByRole('menu');
    // Escape is only handled once focus is inside the menu; pressed earlier it
    // is lost and the open menu then blocks the next click.
    const closeMenu = async () => {
      await expect(menu.getByRole('menuitem').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
    };
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await closeMenu();
    await reload(page);
    await more.click();
    await expect(getByE2e('time:task-row-device').first()).toBeVisible();
    await closeMenu();
    await taskEdit(getByE2ePrefix, 'Raport E2E').click();
    await expect(getByE2e('time:task-device')).toContainText('device-');
    await getByE2e('time:task-cancel').click();
  },

  'i complete the task and it stays done after a reload': async ({
    page,
    getByE2ePrefix,
  }) => {
    const box = taskDone(getByE2ePrefix, 'Raport E2E');
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toBeChecked();
    await reload(page);
    await expect(taskDone(getByE2ePrefix, 'Raport E2E')).toBeChecked();
  },

  'i rename the task': async ({ page, getByE2e, getByE2ePrefix }) => {
    await taskEdit(getByE2ePrefix, 'Raport E2E').click();
    const title = getByE2e('time:task-name');
    await title.fill('Raport kwartalny');
    await Promise.all([
      synced(page, 'PUT', 200),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(taskEdit(getByE2ePrefix, 'Raport kwartalny')).toBeVisible();
  },

  'the month view marks the day and the year view counts it': async ({
    page,
    getByE2e,
  }) => {
    await open(page, APP_ROUTER.timeMonth({ date: DAY }));
    await expect(getByE2e(`time:month-day:${DAY}`)).toHaveAccessibleName(
      'wtorek, 20 października, 1 zadanie',
    );
    await open(page, APP_ROUTER.timeYear({ date: DAY }));
    await expect(getByE2e('time:year-month:9')).toContainText('1 zadanie');
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
    await getByE2e('period-control:kind').click();
    await page.keyboard.press('End');
    await expect(getByE2e('period-control:today')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`date=${localDay(new Date())}`));
    await expect(getByE2e('period-control:today')).toHaveCount(0);
  },

  'i delete the task after confirming': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await taskEdit(getByE2ePrefix, 'Raport kwartalny').click();
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
    async ({ page, getByE2e, getByE2ePrefix }) => {
      await open(page, APP_ROUTER.time({ date: DAY }));
      await getByE2e('time:empty-add').click();
      await getByE2e('time:task-name').fill('Siłownia E2E');
      await getByE2e('time:recurring-toggle').click();
      await Promise.all([
        synced(page, 'POST', 201),
        getByE2e('time:task-save').click(),
      ]);
      const occurrence = taskEdit(getByE2ePrefix, 'Siłownia E2E');
      await expect(occurrence).toBeVisible();
      await expect(getByE2e('time:recurring-mark')).toHaveCount(1);
      await reload(page);
      await expect(occurrence).toHaveCount(1);
      await taskMore(getByE2ePrefix, 'Siłownia E2E').click();
      await expect(getByE2e('time:task-row-device')).toHaveCount(0);
      await page.keyboard.press('Escape');
    },

  'the series reaches the following weeks and never revives a deleted task':
    async ({ page, getByE2e, getByE2ePrefix }) => {
      await open(page, APP_ROUTER.time({ date: NEXT_WEEK }));
      const occurrence = taskEdit(getByE2ePrefix, 'Siłownia E2E');
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
    getByE2ePrefix,
  }) => {
    await taskEdit(getByE2ePrefix, 'Siłownia E2E').click();
    await getByE2e('time:recurring-stop').click();
    await Promise.all([
      synced(page, 'DELETE', 200),
      getByE2e('time:delete-confirm').click(),
    ]);
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    await open(page, APP_ROUTER.time({ date: DAY }));
    await expect(taskEdit(getByE2ePrefix, 'Siłownia E2E')).toBeVisible();
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
    // Rules are materialized to the end of the loaded year: those stay too.
    await open(page, APP_ROUTER.time({ date: AFTER_LATER }));
    await expect(taskEdit(getByE2ePrefix, 'Siłownia E2E')).toBeVisible();
    await expect(getByE2e('time:recurring-mark')).toHaveCount(0);
  },

  'i register an account for descriptions': async (ctx) => {
    await registerAndConfirm(ctx, DESCRIPTION_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task with a 160 characters title and a description': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:task-new').click();
    await getByE2e('time:task-name').fill(LONG_TITLE);
    await getByE2e('time:description-input').fill(LONG_DESCRIPTION);
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await reload(page);
    await expect(taskEdit(getByE2ePrefix, LONG_TITLE)).toBeVisible();
  },

  'the description shows only in the details, in full': async ({
    getByE2e,
    getByE2ePrefix,
  }) => {
    await expect(
      getByE2ePrefix('time:task:').filter({ hasText: 'Linia 1' }),
    ).toHaveCount(0);
    await taskInfo(getByE2ePrefix, LONG_TITLE).click();
    await expect(getByE2e('time:description-full')).toContainText('Linia 12');
  },

  'i register an account for attachments': async (ctx) => {
    await registerAndConfirm(ctx, ATTACHMENT_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i attach a file to a task and it survives a reload': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:task-new').click();
    await getByE2e('time:task-name').fill('Zadanie z plikiem E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await taskInfo(getByE2ePrefix, 'Zadanie z plikiem E2E').click();
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
    await expect(attachmentLink(getByE2ePrefix, 'notatka.txt')).toBeVisible();
    await reload(page);
    await expect(attachmentLink(getByE2ePrefix, 'notatka.txt')).toBeVisible();
  },

  'the attachment opens with its content and a wrong type is refused': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    const link = attachmentLink(getByE2ePrefix, 'notatka.txt');
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
    getByE2ePrefix,
  }) => {
    await attachmentDelete(getByE2ePrefix, 'notatka.txt').click();
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
    async ({ page, getByE2e, getByE2ePrefix }) => {
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

      const thumb = attachmentThumb(getByE2ePrefix, 'wakacje.webp');
      await expect(thumb).toBeVisible();
      const href = await attachmentLink(
        getByE2ePrefix,
        'wakacje.webp',
      ).getAttribute('href');
      const dimensions = await page.evaluate(async (url) => {
        const bitmap = await createImageBitmap(await (await fetch(url)).blob());
        return [bitmap.width, bitmap.height];
      }, href!);
      expect(dimensions).toEqual([2000, 1400]);

      await thumb.click();
      await expect(page).toHaveURL(/modal=attachment-view/);
      const viewer = getByE2e('time:attachment-viewer');
      await expect(viewer).toBeVisible();
      const media = getByE2e('time:attachment-media');
      await expect(media).toBeVisible();
      await expect(media).toHaveAccessibleName('wakacje.webp');
      await page.keyboard.press('Escape');
      await expect(viewer).toBeHidden();
      await expect(page).not.toHaveURL(/attachment-view/);
    },

  'a video is trimmed in the browser, uploaded with progress and opened from its thumbnail':
    async ({ page, getByE2e, getByE2ePrefix }) => {
      const clip = await makeVideo(page, 3);
      await getByE2e('time:attachment-input').setInputFiles({
        name: 'demo.webm',
        mimeType: 'video/webm',
        buffer: clip,
      });
      const trim = getByE2e('time:attachment-trim');
      await expect(trim).toBeVisible();
      await expect(page).toHaveURL(/modal=attachment-trim/);
      await expect(getByE2e('time:trim-length')).toBeVisible({
        timeout: 20_000,
      });

      await getByE2e('time:trim-start').fill('1');
      await expect(getByE2e('time:trim-length')).toBeVisible();
      await Promise.all([
        page.waitForResponse(
          (r) =>
            r.url().includes('/attachments/') &&
            r.request().method() === 'POST' &&
            r.status() === 201,
          { timeout: 90_000 },
        ),
        getByE2e('time:trim-save').click(),
      ]);
      await expect(trim).toBeHidden();

      const thumb = attachmentThumb(getByE2ePrefix, 'demo.webm');
      await expect(thumb).toBeVisible({ timeout: 60_000 });
      await thumb.click();
      await expect(page).toHaveURL(/modal=attachment-view/);
      const player = getByE2e('time:attachment-media');
      await expect(player).toBeVisible();
      expect(await player.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(
        false,
      );
      await page.keyboard.press('Escape');
      await reload(page);
      await expect(attachmentThumb(getByE2ePrefix, 'demo.webm')).toBeVisible();
    },

  'the mcp server lists, adds a reduced photo through a ticket and deletes attachments':
    async ({ page }) => {
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
                uploadUrl: string;
              };
            };
          }
        ).result;
      };

      const tasks = await call('list_tasks', {});
      const taskId = tasks.structuredContent.items[0]!.id;
      const before = await call('list_task_attachments', { taskId });
      const photo = await makePhoto(page, 2000, 1400);
      const issued = await call('request_attachment_upload', {
        taskId,
        name: 'mcp.jpg',
        mimeType: 'image/jpeg',
      });
      expect(issued.isError).toBeFalsy();
      const sent = await page.request.post(issued.structuredContent.uploadUrl, {
        headers: { 'Content-Type': 'image/jpeg' },
        data: photo,
      });
      expect(sent.status()).toBe(201);
      const added = {
        structuredContent: (await sent.json()) as {
          id: string;
          size: number;
          name: string;
          mime: string;
          originalSize: number;
        },
      };
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

      const refused = await call('request_attachment_upload', {
        taskId,
        name: 'virus.exe',
        mimeType: 'application/x-msdownload',
      });
      expect(refused.isError).toBe(true);

      const removed = await call('delete_task_attachment', {
        id: added.structuredContent.id,
        confirm: true,
      });
      expect(removed.structuredContent).toMatchObject({ deleted: true });
      expect((await page.request.get(href)).status()).toBe(404);
    },
  'the mcp server takes a big video through a one-time upload url': async ({
    page,
  }) => {
    const created = await page.request.post(API_ROUTER.mcpTokens(), {
      data: { name: 'E2E wideo', ttlDays: 1 },
    });
    const { token } = ((await created.json()) as { data: { token: string } })
      .data;
    const headers = { Authorization: `Bearer ${token}` };
    const listed = await page.request.post(API_ROUTER.mcp(), {
      headers,
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'list_tasks', arguments: {} },
      },
    });
    const taskId = (
      (await listed.json()) as {
        result: { structuredContent: { items: { id: string }[] } };
      }
    ).result.structuredContent.items[0]!.id;
    const video = Buffer.concat([
      await makeVideo(page, 2),
      Buffer.alloc(3 * 1024 * 1024),
    ]);
    const requestUrl = async (name: string, mimeType: string) => {
      const issued = await page.request.post(API_ROUTER.mcp(), {
        headers,
        data: {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'request_attachment_upload',
            arguments: { taskId, name, mimeType },
          },
        },
      });
      return (
        (await issued.json()) as {
          result: { structuredContent: { uploadUrl: string } };
        }
      ).result.structuredContent.uploadUrl;
    };
    const url = await requestUrl('agent.webm', 'video/webm');

    const added = await page.request.post(url, {
      headers: { 'Content-Type': 'video/webm' },
      data: video,
    });
    expect(added.status()).toBe(201);
    const attachment = (await added.json()) as {
      id: string;
      size: number;
      mime: string;
    };
    expect(attachment).toMatchObject({
      mime: 'video/webm',
      size: video.length,
    });
    const stored = await page.request.get(
      API_ROUTER.timeAttachmentById(attachment.id),
    );
    expect(stored.status()).toBe(200);
    expect((await stored.body()).length).toBe(video.length);

    const reused = await page.request.post(url, {
      headers: { 'Content-Type': 'video/webm' },
      data: video,
    });
    expect(reused.status()).toBe(401);
    const wrongType = await page.request.post(
      await requestUrl('agent2.webm', 'video/webm'),
      {
        headers: { 'Content-Type': 'application/zip' },
        data: Buffer.from('z'),
      },
    );
    expect(wrongType.status()).toBe(415);
    const forged = await page.request.post(
      `${new URL(url).origin}${API_ROUTER.mcpUploads()}?ticket=parka_up_${'0'.repeat(64)}`,
      { headers: { 'Content-Type': 'video/webm' }, data: video },
    );
    expect(forged.status()).toBe(401);

    await page.request.delete(API_ROUTER.timeAttachmentById(attachment.id));
  },
  'i register an account for comments': async (ctx) => {
    await registerAndConfirm(ctx, COMMENT_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i comment on a task and the comment survives a reload': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:task-new').click();
    await getByE2e('time:task-name').fill('Zadanie z komentarzem E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await taskInfo(getByE2ePrefix, 'Zadanie z komentarzem E2E').click();
    await expect(getByE2e('time:comments')).toContainText('Brak komentarzy');
    await getByE2e('time:comment-add').click();
    await getByE2e('time:comment-input').fill('Pierwszy komentarz E2E');
    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/comments/') && r.status() === 201,
      ),
      getByE2e('time:comment-save').click(),
    ]);
    await reload(page);
    await expect(getByE2e('time:comments')).toContainText(
      'Pierwszy komentarz E2E',
    );
  },

  'the mcp bot comments under its token name and a rename follows': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    const created = await page.request.post(API_ROUTER.mcpTokens(), {
      data: { name: 'Bot E2E', ttlDays: 1 },
    });
    const { token, item } = (
      (await created.json()) as {
        data: { token: string; item: { id: string } };
      }
    ).data;
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
              botName: string;
              botRef: string;
            };
          };
        }
      ).result;
    };
    const tasks = await call('list_tasks', {});
    const taskId = tasks.structuredContent.items[0]!.id;
    const added = await call('add_task_comment', {
      taskId,
      body: 'Komentarz bota E2E',
    });
    expect(added.structuredContent).toMatchObject({
      botName: 'Bot E2E',
      botRef: item.id.replace(/-/g, '').slice(0, 8),
    });
    expect(JSON.stringify(added)).not.toContain(token);

    // Renaming left the UI with VYB-198; the endpoint still serves the rename.
    const renamed = await page.request.patch(`/api/mcp-tokens/${item.id}/`, {
      data: { name: 'Bot po zmianie' },
    });
    expect(renamed.status()).toBe(200);

    await open(page, APP_ROUTER.accessTokens());
    await expect(
      getByE2ePrefix('access-tokens:row:').filter({
        hasText: 'Bot po zmianie',
      }),
    ).toBeVisible();

    await open(page, APP_ROUTER.time({ date: DAY }));
    await taskInfo(getByE2ePrefix, 'Zadanie z komentarzem E2E').click();
    const comments = getByE2e('time:comments');
    await expect(comments).toContainText('Komentarz bota E2E');
    await expect(comments).toContainText('Bot po zmianie');
    await expect(comments).toContainText('Bot MCP');
    await expect(comments).not.toContainText(token);
  },

  'the owner edits the bot comment and its avatar splits': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await commentEdit(getByE2ePrefix, 'Bot po zmianie').click();
    await getByE2e('time:comment-input').fill('Komentarz bota po edycji');
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/time/comments/') &&
          r.request().method() === 'PUT' &&
          r.status() === 200,
      ),
      getByE2e('time:comment-save').click(),
    ]);
    await expect(
      getByE2ePrefix(
        'time:comment-avatar:',
        getByE2ePrefix('time:comment:').filter({ hasText: 'Bot po zmianie' }),
      ),
    ).toHaveAccessibleName(/^Autorzy:/);
    await expect(getByE2e('time:comments')).toContainText('(edytowano)');
  },

  'i delete a comment after confirming and it stays gone': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await getByE2ePrefix('time:comment-delete:', getByE2e('time:comments'))
      .first()
      .click();
    await expect(page).toHaveURL(/modal=comment-delete/);
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/time/comments/') &&
          r.request().method() === 'DELETE' &&
          r.status() === 200,
      ),
      getByE2e('time:delete-confirm').click(),
    ]);
    await reload(page);
    await expect(getByE2e('time:comments')).toContainText('Komentarze (1)');
  },

  'i register an account for upfront loading': async (ctx) => {
    await registerAndConfirm(ctx, UPFRONT_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a task to the day': async ({ page, getByE2e }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:empty-add').click();
    await getByE2e('time:task-name').fill('Z góry E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
  },

  'moving between days and back reads the list only once': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    const reads: string[] = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (request.method() === 'GET' && pathname === '/api/time/')
        reads.push(request.url());
    });
    await reload(page);
    await expect(taskInfo(getByE2ePrefix, 'Z góry E2E')).toBeVisible();
    await getByE2e('period-control:next').click();
    await expect(getByE2e('time:empty')).toBeVisible();
    await getByE2e('period-control:prev').click();
    await expect(taskInfo(getByE2ePrefix, 'Z góry E2E')).toBeVisible();
    expect(reads).toHaveLength(1);
    expect(new URL(reads[0]!).searchParams.get('from')).toBeNull();
  },

  'i register an account for the backlog bar': async (ctx) => {
    await registerAndConfirm(ctx, BAR_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'a long backlog keeps the add button flush with the bottom of the dialog':
    async ({ page, getByE2e }) => {
      for (let i = 0; i < 14; i++) {
        const res = await page.request.post(API_ROUTER.timeBacklog(), {
          data: {
            id: `task-bar-${i}`,
            key: null,
            title: `Zadanie backlogu ${i}`,
            description: null,
            categoryId: 'work',
            priorityId: 'medium',
            device: null,
          },
        });
        expect(res.status()).toBe(201);
      }
      await open(page, `${APP_ROUTER.time({ date: DAY })}&modal=backlog`);
      const dialog = getByE2e('time:backlog-dialog');
      const add = getByE2e('time:backlog-add');
      await expect(add).toBeVisible();
      const scrolls = await dialog.evaluate(
        (el) => el.scrollHeight > el.clientHeight,
      );
      expect(scrolls).toBe(true);
      const gap = async () => {
        const [d, b] = await Promise.all([
          dialog.boundingBox(),
          add.boundingBox(),
        ]);
        return d!.y + d!.height - (b!.y + b!.height);
      };
      // Padding of the dialog (20 px) plus its border, no extra empty band.
      expect(await gap()).toBeLessThanOrEqual(22);
      await dialog.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
      expect(await gap()).toBeLessThanOrEqual(22);
    },

  'i register an account for the open-only filter': async (ctx) => {
    await registerAndConfirm(ctx, OPEN_ONLY_EMAIL, PASSWORD);
    await ctx.page.waitForLoadState('networkidle');
  },

  'i add a done task and an open task to the day': async ({
    page,
    getByE2e,
    getByE2ePrefix,
  }) => {
    await open(page, APP_ROUTER.time({ date: DAY }));
    await getByE2e('time:empty-add').click();
    await getByE2e('time:task-name').fill('Zrobione E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    await getByE2e('time:add-trigger').click();
    await getByE2e('time:add-option:task-new').click();
    await getByE2e('time:task-name').fill('Otwarte E2E');
    await Promise.all([
      synced(page, 'POST', 201),
      getByE2e('time:task-save').click(),
    ]);
    const box = taskDone(getByE2ePrefix, 'Zrobione E2E');
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    await Promise.all([synced(page, 'PUT', 200), box.click()]);
    await expect(box).toBeChecked();
  },

  'the open-only switch hides done tasks and keeps the choice after a reload':
    async ({ page, getByE2e, getByE2ePrefix }) => {
      const toggle = getByE2e('time:open-only-toggle');
      await expect(taskInfo(getByE2ePrefix, 'Zrobione E2E')).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
      await expect(taskInfo(getByE2ePrefix, 'Zrobione E2E')).toHaveCount(0);
      await expect(taskInfo(getByE2ePrefix, 'Otwarte E2E')).toBeVisible();
      await reload(page);
      await expect(toggle).toHaveAttribute('aria-checked', 'true');
      await expect(taskInfo(getByE2ePrefix, 'Zrobione E2E')).toHaveCount(0);
      await expect(taskInfo(getByE2ePrefix, 'Otwarte E2E')).toBeVisible();
    },
  'the open-only row hugs the list edge on a wide screen': async ({
    page,
    getByE2e,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const row = await getByE2e('time:open-only').boundingBox();
    const toggle = await getByE2e('time:open-only-toggle').boundingBox();
    expect(row && toggle).toBeTruthy();
    expect(toggle!.x - row!.x).toBeLessThan(200);
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
  );
});

// Split off the first flow: one test covering both took about 27 s of the 30 s
// test timeout on an idle machine, and timed out whenever the backend was busy.
test('time views and deleting a task work against the real Supabase backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for the views'],
    ['the day view of an empty account names the day'],
    ['the new account starts with default categories and priorities'],
    ['i add a task and it survives a reload'],
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
    ['the description shows only in the details, in full'],
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
    [
      'the mcp server lists, adds a reduced photo through a ticket and deletes attachments',
    ],
  );
});

test('task comments, bot comments and renamed tokens on the real backend', async ({
  e2e,
}) => {
  test.setTimeout(150_000);
  await interpreter(commands, e2e)(
    ['i register an account for comments'],
    ['i comment on a task and the comment survives a reload'],
    ['the mcp bot comments under its token name and a rename follows'],
    ['the owner edits the bot comment and its avatar splits'],
    ['i delete a comment after confirming and it stays gone'],
  );
});

test('a modal opened from a popover action stays open on a phone', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for popover actions'],
    ['i add a task from the add menu and its form stays open'],
    ['the delete confirmation from the task menu stays open until answered'],
  );
});

test('the open-only filter hides done tasks on the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for the open-only filter'],
    ['i add a done task and an open task to the day'],
    [
      'the open-only switch hides done tasks and keeps the choice after a reload',
    ],
    ['the open-only row hugs the list edge on a wide screen'],
  );
});

test('moving between days reads the tasks once on the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for upfront loading'],
    ['i add a task to the day'],
    ['moving between days and back reads the list only once'],
  );
});

test('the backlog add button sits flush with the dialog bottom on the real backend', async ({
  e2e,
}) => {
  await interpreter(commands, e2e)(
    ['i register an account for the backlog bar'],
    ['a long backlog keeps the add button flush with the bottom of the dialog'],
  );
});
