import { expect, type Browser } from '@playwright/test';
import { interpreter, type CommandRegistry } from '@repo/vibe-test';
import { test } from '../../__e2e__/test.js';
import type { E2eId } from '../../__e2e__/selectors.js';
import type { ButtonSize } from '../index.js';

type Measure = { height: number; font: number; padding: number };
type Row = {
  width: number;
  scale: number;
  root: number;
  shot: string;
  sizes: Record<ButtonSize, Measure>;
};
type Ctx = { browser: Browser; baseURL: string };

const SIZES: ButtonSize[] = ['s', 'm', 'l'];

// Device scale each breakpoint must resolve to. 640, 1024, 1440 inherit the step below.
const BREAKPOINTS = [
  { width: 320, scale: 0.875 },
  { width: 480, scale: 0.9375 },
  { width: 640, scale: 0.9375 },
  { width: 768, scale: 1 },
  { width: 1024, scale: 1 },
  { width: 1280, scale: 1.0625 },
  { width: 1440, scale: 1.0625 },
  { width: 1920, scale: 1.125 },
];

// Tablet (scale 1, root 16px) is the reference every other row is compared with.
const REFERENCE: Record<ButtonSize, Measure> = {
  s: { height: 32, font: 12, padding: 16 },
  m: { height: 44, font: 14, padding: 20 },
  l: { height: 52, font: 16, padding: 24 },
};

const TOLERANCE = 0.5;

const rows: Row[] = [];

const board = (): string => `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;font:14px/1.4 system-ui,sans-serif;background:#fff;color:#111;width:max-content}
h1{font-size:18px;margin:0 0 16px}
table{border-collapse:collapse}
th,td{border-bottom:1px solid #ddd;padding:10px 16px;text-align:left;vertical-align:middle;white-space:nowrap}
th{background:#f3f3f6}
td.num{font-variant-numeric:tabular-nums}
</style>
<h1>Button: scale per breakpoint and size</h1>
<table data-board><tr><th>Viewport</th><th>--ds-scale</th><th>html font</th><th>Buttons (1:1)</th><th>s h / font / px</th><th>m h / font / px</th><th>l h / font / px</th><th>ratio s / m / l</th></tr>
${rows
  .map((row) => {
    const ratio = SIZES.map((size) =>
      (row.sizes[size].height / REFERENCE[size].height).toFixed(3),
    ).join(' / ');
    const cells = SIZES.map((size) => {
      const { height, font, padding } = row.sizes[size];
      return `<td class="num">${height}px / ${font}px / ${padding}px</td>`;
    }).join('');
    return `<tr><td class="num"><b>${row.width}px</b></td><td class="num">${row.scale}</td><td class="num">${row.root}px</td><td><img alt="" src="data:image/png;base64,${row.shot}"></td>${cells}<td class="num">${ratio}</td></tr>`;
  })
  .join('')}</table>`;

const commands = {
  'i capture the buttons at breakpoint': async (
    { browser, baseURL }: Ctx,
    width: number,
  ) => {
    const page = await browser.newPage({
      baseURL,
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const byE2e = (id: E2eId) => page.getByTestId(id);

    await page.goto('/responsive/');
    await page.evaluate(() => document.fonts.ready);

    const shot = (await byE2e('button:board-row').screenshot()).toString(
      'base64',
    );
    const { scale, root } = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        scale: Number(style.getPropertyValue('--ds-scale')),
        root: parseFloat(style.fontSize),
      };
    });
    const entries = await Promise.all(
      SIZES.map(async (size) => {
        const measure = await byE2e(`button:board:${size}`).evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            height: Number(el.getBoundingClientRect().height.toFixed(1)),
            font: parseFloat(style.fontSize),
            padding: parseFloat(style.paddingInlineStart),
          };
        });
        return [size, measure] as const;
      }),
    );

    rows.push({
      width,
      scale,
      root,
      shot,
      sizes: Object.fromEntries(entries) as Record<ButtonSize, Measure>,
    });
    await page.close();
  },
  'every row should use its device scale': () => {
    for (const { width, scale } of BREAKPOINTS) {
      const row = rows.find((candidate) => candidate.width === width);
      expect(row?.scale, `scale at ${width}px`).toBe(scale);
      expect(row?.root, `root font at ${width}px`).toBe(16 * scale);
    }
  },
  'every size should be scaled from the tablet reference': () => {
    for (const row of rows) {
      for (const size of SIZES) {
        const { height, font, padding } = row.sizes[size];
        const reference = REFERENCE[size];
        const at = `${size} at ${row.width}px`;
        expect(
          Math.abs(height - reference.height * row.scale),
          `height ${at}`,
        ).toBeLessThan(TOLERANCE);
        expect(font, `font ${at}`).toBeCloseTo(reference.font * row.scale, 2);
        expect(padding, `padding ${at}`).toBeCloseTo(
          reference.padding * row.scale,
          2,
        );
      }
    }
  },
  'the board should match the visual baseline': async ({ browser }: Ctx) => {
    const page = await browser.newPage({
      viewport: { width: 1400, height: 900 },
      reducedMotion: 'reduce',
    });

    await page.setContent(board());
    await expect(page.locator('[data-board]')).toHaveScreenshot(
      'button-scale-board.png',
      { animations: 'disabled' },
    );
    await page.close();
  },
} satisfies CommandRegistry<Ctx>;

test.describe('button scale board', () => {
  test('every breakpoint and size scales and matches the baseline', async ({
    browser,
    baseURL,
  }) => {
    rows.length = 0;
    const capture = BREAKPOINTS.map(
      ({ width }): ['i capture the buttons at breakpoint', number] => [
        'i capture the buttons at breakpoint',
        width,
      ],
    );

    await interpreter(commands, { browser, baseURL: baseURL ?? '' })(
      ...capture,
      ['every row should use its device scale'],
      ['every size should be scaled from the tablet reference'],
      ['the board should match the visual baseline'],
    );
  });
});
