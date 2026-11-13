import type { Page } from '@playwright/test';

/** 1x1 PNG: the fake backend answers every scan with the same receipt. */
const PHOTO =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Same hand-off as the "Dodaj" menu: the next expense page scans this photo. */
export const stashReceiptPhoto = (page: Page) =>
  page.addInitScript(
    ([data]) =>
      sessionStorage.setItem(
        'parka:receipt-handoff',
        JSON.stringify({
          name: 'receipt.png',
          type: 'image/png',
          data: `data:image/png;base64,${data}`,
        }),
      ),
    [PHOTO],
  );
