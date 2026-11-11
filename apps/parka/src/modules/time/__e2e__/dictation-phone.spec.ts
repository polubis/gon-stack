import { expect, type Page } from '@playwright/test';
import { test } from '@/__e2e__/test';
import { signInAsTestUser } from '@/__e2e__/session';
import { APP_ROUTER } from '@/shared/router/routes';

/**
 * Voice dictation on a phone: speech streams into the preview, which keeps the
 * newest words in view and is taller than before. Recorded as the evidence of
 * VYB-241 (video is kept by Playwright under test-results/).
 */

const DAY = '2026-10-20';
const PHONE_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36';

test.use({
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
  userAgent: PHONE_UA,
  video: { mode: 'on', size: { width: 412, height: 915 } },
});

/** Replaces SpeechRecognition with a driver the test feeds phrases into. */
const fakeSpeech = () => {
  type Handler = ((e: unknown) => void) | null;
  const w = window as unknown as Record<string, unknown>;
  let current: { onresult: Handler; onend: (() => void) | null } | null = null;
  const register = (rec: NonNullable<typeof current>) => {
    current = rec;
  };
  class Recognition {
    lang = '';
    continuous = false;
    interimResults = false;
    onresult: Handler = null;
    onerror: ((e: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    constructor() {
      register(this);
    }
    start() {}
    stop() {
      this.onend?.();
    }
    abort() {}
  }
  // Chromium ships an unprefixed SpeechRecognition too; the hook prefers it.
  w.SpeechRecognition = Recognition;
  w.webkitSpeechRecognition = Recognition;
  // Like the browser: each result event carries every segment of the session so far.
  const segments: string[] = [];
  w.__say = (phrase: string) => {
    segments.push(phrase);
    current?.onresult?.({
      results: segments.map((transcript) => [{ transcript }]),
    });
  };
};

const stubTime = async (page: Page) => {
  await page.route(
    (url) => url.pathname === '/api/time/',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            categories: [
              {
                id: 'work',
                name: 'Praca',
                icon: 'briefcase',
                color: '#2563eb',
              },
            ],
            priorities: [{ id: 'medium', name: 'Średni', value: 5 }],
            statuses: [{ id: 'in_progress', name: 'W trakcie' }],
            tasks: [],
            backlog: [],
          },
        }),
      }),
  );
};

const SENTENCES = [
  'Przygotować raport za październik',
  'i wysłać go do księgowej',
  'przed piątkiem rano',
  'dołączyć faktury z trzech ostatnich tygodni',
  'oraz sprawdzić, czy wszystkie wydatki mają kategorię',
  'a potem uzupełnić opisy przy każdej pozycji tak, żeby było jasne',
  'co dokładnie zostało zrobione i kto to zatwierdził',
  'następnie przejrzeć zaległe płatności od dostawców',
  'i oznaczyć te, które czekają na potwierdzenie z banku',
  'na koniec zapisać krótkie podsumowanie w zadaniu',
  'żeby w poniedziałek nikt nie musiał szukać po mailach',
  'i można było od razu przejść do kolejnego etapu',
];

test('dictated notes follow the speech on a phone', async ({
  page,
  getByE2e,
}) => {
  await page.addInitScript(fakeSpeech);
  await page.addInitScript(() =>
    window.localStorage.setItem('parka:device-id', 'device-phone'),
  );
  await signInAsTestUser(page);
  await stubTime(page);
  await page.goto(`${APP_ROUTER.time()}?date=${DAY}`);

  await getByE2e('time:empty-add').click();

  await getByE2e('time:task-name').fill('Raport');

  await getByE2e('dictation:start:Opis').click();
  const preview = getByE2e('dictation:preview');
  await expect(preview).toBeVisible();
  for (const sentence of SENTENCES) {
    await page.evaluate(
      (s) =>
        (window as unknown as { __say: (...a: string[]) => void }).__say(s),
      sentence,
    );
    await page.waitForTimeout(400);
  }
  // Edit at the top of the long preview while listening: the view must stay there.
  await preview.click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.type('Ważne: ');
  const afterEdit = await preview.evaluate((el) => ({
    scrollTop: el.scrollTop,
    max: el.scrollHeight - el.clientHeight,
  }));
  expect(afterEdit.scrollTop).toBeLessThan(afterEdit.max - 20);

  await page.evaluate(
    (s) => (window as unknown as { __say: (...a: string[]) => void }).__say(s),
    'na tym kończymy',
  );
  await page.waitForTimeout(400);

  const height = await preview.evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const { scrollTop, scrollHeight, clientHeight } = await preview.evaluate(
    (el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }),
  );
  expect(scrollHeight).toBeGreaterThan(clientHeight);
  expect(scrollTop + clientHeight).toBeGreaterThanOrEqual(scrollHeight - 2);
  expect(height).toBeGreaterThanOrEqual(128);

  await page.waitForTimeout(600);
  await getByE2e('dictation:insert').click();
  await expect(getByE2e('time:description-input')).toHaveValue(
    `Ważne: ${[...SENTENCES, 'na tym kończymy'].join(' ')}`,
  );
});

test('a pause and resume on a phone does not repeat the dictated words', async ({
  page,
  getByE2e,
}) => {
  await page.addInitScript(fakeSpeech);
  await page.addInitScript(() =>
    window.localStorage.setItem('parka:device-id', 'device-phone'),
  );
  await signInAsTestUser(page);
  await stubTime(page);
  await page.goto(`${APP_ROUTER.time()}?date=${DAY}`);

  await getByE2e('time:empty-add').click();

  await getByE2e('time:task-name').fill('Raport');

  const say = (phrase: string) =>
    page.evaluate(
      (s) =>
        (window as unknown as { __say: (...a: string[]) => void }).__say(s),
      phrase,
    );

  await getByE2e('dictation:start:Opis').click();
  await say('prawda');
  await say('kup mleko');
  await getByE2e('dictation:toggle').click();
  await getByE2e('dictation:toggle').click();
  await say('i chleb');
  await getByE2e('dictation:insert').click();

  await expect(getByE2e('time:description-input')).toHaveValue(
    'prawda kup mleko i chleb',
  );
});
