import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator } from '@playwright/test';
import { test } from './test';

const box = async (locator: Locator) => (await locator.boundingBox())!;

const style = (locator: Locator, ...props: string[]) =>
  locator.evaluate(
    (el, names) =>
      Object.fromEntries(
        names.map((name) => [
          name,
          getComputedStyle(el).getPropertyValue(name),
        ]),
      ),
    props,
  );

test.describe('select themed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/select/');
  });

  test('fits its container and opens a parka popover', async ({ getByE2e }) => {
    const root = getByE2e('select-demo:basic');
    const trigger = root.getByRole('combobox', { name: /Fruit/ });
    expect(await style(trigger, 'border-radius', 'min-height')).toEqual({
      'border-radius': '12px',
      'min-height': '44px',
    });
    await trigger.click();
    const popup = root.getByRole('listbox').locator('..');
    await expect(popup).toBeVisible();
    expect((await box(popup)).width).toBeCloseTo((await box(root)).width, 0);
    const look = await style(popup, 'position', 'box-shadow', 'border-radius');
    expect(look.position).toBe('absolute');
    expect(look['box-shadow']).not.toBe('none');
    expect(look['border-radius']).toBe('16px');
    expect(await style(trigger, 'border-color')).toEqual({
      'border-color': 'rgb(11, 110, 70)',
    });
  });

  test('picks with keyboard and shows the clear x left of the chevron', async ({
    page,
    getByE2e,
  }) => {
    const root = getByE2e('select-demo:basic');
    const trigger = root.getByRole('combobox', { name: /Fruit/ });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(root.getByRole('listbox')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('Mango');
    await expect(trigger).toBeFocused();
    const clear = root.getByRole('button', { name: 'Clear fruit' });
    const gap = await clear.evaluate((el) => {
      const chevron = el.nextElementSibling!.getBoundingClientRect();
      return chevron.left - el.getBoundingClientRect().right;
    });
    expect(gap).toBeGreaterThanOrEqual(0);
    await clear.click();
    await expect(trigger).toHaveText('Choose fruit');
    await expect(clear).toBeHidden();
  });

  test('closes on outside click and mirrors open state in the url', async ({
    page,
    getByE2e,
  }) => {
    const root = getByE2e('select-demo:basic');
    await root.getByRole('combobox', { name: /Fruit/ }).click();
    await expect(page).toHaveURL(/\?select=fruit$/);
    await expect(getByE2e('select-demo:stream-count')).toHaveText('1');
    await page.getByRole('heading', { name: 'Select', level: 1 }).click();
    await expect(root.getByRole('listbox')).toBeHidden();
    await expect(page).not.toHaveURL(/select=/);
    await expect(getByE2e('select-demo:stream-count')).toHaveText('0');
    await expect(getByE2e('select-demo:stream-log')).toHaveText(
      'Last: close "fruit"',
    );
  });

  test('reopens from a deep link', async ({ page, getByE2e }) => {
    await page.goto('/select/?select=country');
    await expect(
      getByE2e('select-demo:search').getByRole('listbox'),
    ).toBeVisible();
  });

  test('filters with search and names an empty result', async ({
    page,
    getByE2e,
  }) => {
    const root = getByE2e('select-demo:search');
    await root.getByRole('combobox', { name: /Country/ }).click();
    const search = root.getByRole('combobox', { name: 'Search' });
    await expect(search).toBeFocused();
    await page.keyboard.type('po');
    await expect(root.getByRole('option')).toHaveText(['Poland', 'Portugal']);
    await page.keyboard.type('x');
    await expect(root.getByRole('status')).toHaveText('No results for "pox"');
    await root.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toHaveValue('');
    await expect(root.getByRole('option')).toHaveCount(19);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(root.getByRole('combobox', { name: /Country/ })).toHaveText(
      'Australia',
    );
  });

  test('selects typed objects', async ({ getByE2e }) => {
    const root = getByE2e('select-demo:owner');
    const trigger = root.getByRole('combobox', { name: /Owner/ });
    await expect(trigger).toHaveText('Grace Hopper - Admiral');
    await trigger.click();
    await root.getByRole('option', { name: /Ada Lovelace/ }).click();
    await expect(trigger).toHaveText('Ada Lovelace - Analyst');
  });

  test('adds and removes options live', async ({ getByE2e }) => {
    const root = getByE2e('select-demo:live');
    await root.getByRole('combobox', { name: /Tag/ }).click();
    await getByE2e('select-demo:live-add').click();
    await expect(root.getByRole('option')).toHaveText([
      'Urgent',
      'Inbox',
      'Later',
    ]);
    await getByE2e('select-demo:live-remove').click();
    await expect(root.getByRole('option')).toHaveText(['Inbox', 'Later']);
    await expect(root.getByRole('listbox')).toBeVisible();
  });

  test('plays tones only with the sound flag on', async ({
    page,
    getByE2e,
  }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { tones: number };
      w.tones = 0;
      const create = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () {
        w.tones++;
        return create.call(this);
      };
    });
    await page.reload();
    const tones = () =>
      page.evaluate(() => (window as unknown as { tones: number }).tones);
    const trigger = getByE2e('select-demo:sound').getByRole('combobox', {
      name: /Drink/,
    });
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect.poll(tones).toBe(2);
    await getByE2e('select-demo:sound-toggle').click();
    await trigger.click();
    await page.keyboard.press('Escape');
    expect(await tones()).toBe(2);
  });

  test('follows dark theme tokens and disabled state', async ({ getByE2e }) => {
    const dark = getByE2e('select-demo:dark').getByRole('combobox');
    expect(await style(dark, 'background-color', 'color')).toEqual({
      'background-color': 'rgb(21, 34, 27)',
      color: 'rgb(230, 240, 234)',
    });
    await expect(
      getByE2e('select-demo:disabled').getByRole('combobox'),
    ).toBeDisabled();
  });

  test('passes WCAG AAA checks while open', async ({ page, getByE2e }) => {
    await getByE2e('select-demo:search')
      .getByRole('combobox', { name: /Country/ })
      .click();
    const { violations } = await new AxeBuilder({ page })
      .include('[data-ds-select]')
      .withTags([
        'wcag2a',
        'wcag2aa',
        'wcag2aaa',
        'wcag21a',
        'wcag21aa',
        'wcag22aa',
      ])
      .analyze();
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});

test.describe('select on phones', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('opens full screen and closes on native Back', async ({
    page,
    getByE2e,
  }) => {
    await page.goto('/select/');
    await getByE2e('select-demo:basic')
      .getByRole('combobox', { name: /Fruit/ })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Fruit' });
    await expect(dialog).toBeVisible();
    expect(await box(dialog)).toEqual({ x: 0, y: 0, width: 390, height: 844 });
    await expect(page).toHaveURL(/\?select=fruit$/);
    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/select\/$/);
  });

  test('stacks options from the bottom within thumb reach', async ({
    page,
    getByE2e,
  }) => {
    await page.goto('/select/');
    await getByE2e('select-demo:basic')
      .getByRole('combobox', { name: /Fruit/ })
      .click();
    const options = page.getByRole('dialog').getByRole('option');
    const first = await box(options.first());
    const last = await box(options.last());
    expect(last.y + last.height).toBeGreaterThan(844 - 32);
    expect(first.y).toBeGreaterThan(844 / 2);
  });

  test('keeps search below options, closest to the thumb', async ({
    page,
    getByE2e,
  }) => {
    await page.goto('/select/');
    await getByE2e('select-demo:modal')
      .getByRole('combobox', { name: /Size/ })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Size' });
    const search = await box(dialog.getByRole('combobox', { name: 'Search' }));
    const last = await box(dialog.getByRole('option').last());
    expect(search.y).toBeGreaterThan(last.y + last.height);
    expect(search.y + search.height).toBeGreaterThan(844 - 32);
    await expect(
      dialog.getByRole('combobox', { name: 'Search' }),
    ).toBeFocused();
  });

  test('closes from its own close button', async ({ page, getByE2e }) => {
    await page.goto('/select/');
    await getByE2e('select-demo:basic')
      .getByRole('combobox', { name: /Fruit/ })
      .click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(/\/select\/$/);
  });
});

test.describe('select headless', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/select-headless/');
  });

  test('ships no theme rules', async ({ page }) => {
    const themed = await page.evaluate(() =>
      [...document.styleSheets].some((sheet) =>
        [...sheet.cssRules].some((rule) =>
          rule.cssText.includes('data-ds-select'),
        ),
      ),
    );
    expect(themed).toBe(false);
  });

  test('keeps behaviour with browser defaults only', async ({
    page,
    getByE2e,
  }) => {
    const root = getByE2e('select-demo:headless');
    const trigger = root.getByRole('combobox', { name: /Fruit/ });
    await trigger.click();
    const popup = root.getByRole('listbox').locator('..');
    expect(await style(popup, 'position', 'box-shadow')).toEqual({
      position: 'static',
      'box-shadow': 'none',
    });
    await page.keyboard.type('ch');
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveText('Cherry');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(root.getByRole('listbox')).toBeHidden();
  });
});
