import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire('C:/Users/polub/gon-stack/apps/parka/package.json');
const { chromium } = require('@playwright/test');

const OUT = process.env.OUT_DIR;
const BEFORE = 'http://localhost:4401';
const AFTER = 'http://localhost:4402';
const WRAP = 'http://localhost:4400';
const SUPABASE = 'http://localhost:54321';
const W = 1920;
const H = 1040;

const b64u = (s) => Buffer.from(s).toString('base64url');
const USER = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@parka.test',
  app_metadata: {},
  user_metadata: {},
  created_at: '2025-01-01T00:00:00Z',
};
const EXP = 4_102_444_800;
const session = {
  access_token: [b64u('{"alg":"HS256","typ":"JWT"}'), b64u(JSON.stringify({ sub: USER.id, exp: EXP })), 'e2e'].join('.'),
  refresh_token: 'e2e-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: EXP,
  user: USER,
};

const CATEGORY = { id: 'cat-1', name: 'Spozywcze', icon: 'cart', color: '#0f7a4f' };
const state = { [BEFORE]: [], [AFTER]: [] };

const json = (route, body) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const wrapperHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#111;font-family:system-ui,sans-serif;color:#fff;overflow:hidden}
#bar{height:56px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600;background:#1f2937;letter-spacing:.3px}
.cols{display:flex;height:calc(100% - 56px)}
.col{flex:1;display:flex;flex-direction:column;min-width:0}
.col+.col{border-left:4px solid #111}
.lab{height:44px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700}
.lab.b{background:#b91c1c}.lab.a{background:#15803d}
iframe{flex:1;border:0;background:#fff;width:100%}
#card{position:fixed;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;background:#0b1220;z-index:99;text-align:center;padding:40px}
#card h1{font-size:54px;margin:0 0 20px}#card p{font-size:30px;margin:0;color:#cbd5e1}
</style></head><body>
<div id="bar">Parka</div>
<div class="cols">
<div class="col"><div class="lab b">PRZED (git HEAD)</div><iframe id="fb" src="${BEFORE}/app/"></iframe></div>
<div class="col"><div class="lab a">PO (zmiany)</div><iframe id="fa" src="${AFTER}/app/"></iframe></div>
</div><div id="card"></div></body></html>`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    timezoneId: 'Europe/Warsaw',
    locale: 'pl-PL',
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: 'base64-' + b64u(JSON.stringify(session)),
      domain: 'localhost',
      path: '/',
    },
  ]);
  await context.route(`${SUPABASE}/auth/v1/user`, (r) => json(r, USER));
  await context.route(`${WRAP}/**`, (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: wrapperHtml }),
  );

  // Mocked backend, one state per origin. Scan answers like the old/new server.
  await context.route('**/api/**', async (route) => {
    const req = route.request();
    const origin = new URL(req.url()).origin;
    if (origin !== BEFORE && origin !== AFTER) return route.fallback();
    const url = new URL(req.url());
    const method = req.method();
    const [, , collection] = url.pathname.split('/');
    if (collection === 'dashboard')
      return json(route, {
        code: 200,
        data: {
          total: 0, change: 0, previousTotal: 0, userName: 'Anna', transactions: 0,
          dailyAverage: 0, series: [], previousSeries: [], monthlyLimit: null, categories: [],
        },
      });
    if (collection === 'settings')
      return json(route, {
        code: 200,
        data: {
          profile: { name: '', email: '' },
          notifications: { push: true, email: false, limitWarnings: true, receiptConfirmations: true, limitAlerts: true },
        },
      });
    if (collection === 'notifications') return json(route, { code: 200, data: [] });
    if (collection === 'receipts')
      return json(route, {
        code: 200,
        data: {
          merchant: 'Biedronka',
          // old server: day -> midnight UTC instant; new server: plain day
          date: origin === BEFORE ? '2025-04-10T00:00:00.000Z' : '2025-04-10',
          amount: 42.5,
          paymentMethod: 'Karta',
          items: [{ name: 'Chleb', unitPrice: 42.5, quantity: 1, discount: 0, category: { status: 'assigned', categoryId: CATEGORY.id } }],
        },
      });
    const list = { categories: [CATEGORY], limits: [], recurring: [] };
    if (method === 'GET') {
      if (collection === 'expenses') return json(route, { code: 200, data: state[origin] });
      if (collection in list) return json(route, { code: 200, data: list[collection] });
      return route.fallback();
    }
    if (method === 'DELETE') return json(route, { code: 200, ok: true });
    const body = req.postDataJSON();
    if (collection === 'expenses') {
      state[origin] = [...state[origin].filter((e) => e.id !== body.id), body];
      console.log(origin, method, 'expense.date =', body.date);
    }
    return json(route, { code: method === 'POST' ? 201 : 200, data: body });
  });

  const page = await context.newPage(); globalThis.__page = page;
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  fs.mkdirSync(OUT + '/shots', { recursive: true });
  let n = 0;
  const tick = setInterval(() => page.screenshot({ path: `${OUT}/shots/s${String(n++).padStart(3, '0')}.png` }).catch(() => {}), 2500);
  await page.goto(WRAP + '/');
  await page.waitForLoadState('load');
  await sleep(500);

  const fh = { b: await (await page.$('#fb')).contentFrame(), a: await (await page.$('#fa')).contentFrame() };
  const frames = () => fh;
  const E = (f, id) => f.locator(`[data-e2e="${id}"]`);

  const title = async (h, p, ms = 3000) => {
    await page.evaluate(([h, p]) => {
      const c = document.getElementById('card');
      c.innerHTML = `<h1>${h}</h1><p>${p}</p>`;
      c.style.display = 'flex';
    }, [h, p]);
    await sleep(ms);
    await page.evaluate(() => (document.getElementById('card').style.display = 'none'));
  };
  const bar = (t) => page.evaluate((t) => (document.getElementById('bar').textContent = t), t);

  // red box + caption, drawn inside the frame around the located element
  const mark = async (frame, loc, caption, good) => {
    const color = good ? '#16a34a' : '#dc2626';
    const el = await loc.first().elementHandle();
    await el.scrollIntoViewIfNeeded();
    await frame.evaluate(([el, caption, color]) => {
      const r = el.getBoundingClientRect();
      const box = document.createElement('div');
      box.className = '__hl';
      box.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;border:4px solid ${color};border-radius:8px;box-shadow:0 0 0 4px rgba(255,255,255,.7)`;
      const tag = document.createElement('div');
      tag.className = '__hl';
      tag.textContent = caption;
      const below = r.top < 70;
      tag.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${Math.max(4, r.left - 6)}px;${below ? `top:${r.bottom + 12}px` : `top:${r.top - 46}px`};background:${color};color:#fff;font:700 20px system-ui;padding:6px 12px;border-radius:6px;white-space:nowrap`;
      document.body.append(box, tag);
    }, [el, caption, color]);
  };
  const unmark = (frame) => frame.evaluate(() => document.querySelectorAll('.__hl').forEach((n) => n.remove()));

  const both = (fn) => {
    const { b, a } = frames();
    return Promise.all([fn(b, 'b'), fn(a, 'a')]);
  };
  const settle = async () => {
    await sleep(900);
  };
  const goto = (path) =>
    both(async (f, s) => {
      await f.goto((s === 'b' ? BEFORE : AFTER) + path);
      await f.waitForLoadState('networkidle').catch(() => {});
    });

  // ---------- Scene 1: scanned receipt with day-only date ----------
  await title('Scena 1', 'Skan paragonu z data bez godziny (2025-04-10)<br>Strefa czasowa przegladarki: Europe/Warsaw');
  await bar('Scena 1: skan paragonu z sama data 2025-04-10');
  await goto('/app/expenses/new/');
  await settle();
  await both((f) =>
    E(f, 'expenses-management:upload-input').setInputFiles({ name: 'paragon.png', mimeType: 'image/png', buffer: PNG }),
  );
  await both((f) => E(f, 'expense-form:merchant').waitFor({ state: 'visible', timeout: 20000 }));
  await sleep(1200);
  const { b: fb1, a: fa1 } = frames();
  console.log('before date field:', await E(fb1, 'expense-form:date').inputValue(), await E(fb1, 'expense-form:date').getAttribute('type'));
  console.log('after date field:', await E(fa1, 'expense-form:date').inputValue(), await E(fa1, 'expense-form:date').getAttribute('type'));
  await mark(fb1, E(fb1, 'expense-form:date'), 'tylko data, brak godziny', false);
  await mark(fa1, E(fa1, 'expense-form:date'), 'data + godzina = teraz', true);
  await sleep(3500);
  await both((f) => unmark(f));
  await both((f) => E(f, 'expense-form:save').click());
  await both((f) => E(f, 'dashboard:main').waitFor({ state: 'visible', timeout: 20000 }));
  await sleep(1500);
  await both(async (f) => {
    await E(f, 'dashboard:expenses').scrollIntoViewIfNeeded().catch(() => {});
    await f.locator('[data-e2e^="dashboard:expense:"]').filter({ hasText: 'Biedronka' }).first().click();
    await E(f, 'dashboard:detail').waitFor({ state: 'visible' });
  });
  await sleep(1000);
  const { b: fb2, a: fa2 } = frames();
  const timeRe = /\d{2}\.\d{2}\.\d{4}.*\d{2}:\d{2}/;
  console.log('before detail:', await fb2.locator('[data-e2e="dashboard:detail"]').innerText().then((t) => t.split('\n').slice(0, 4).join(' | ')));
  console.log('after detail:', await fa2.locator('[data-e2e="dashboard:detail"]').innerText().then((t) => t.split('\n').slice(0, 4).join(' | ')));
  const tb = fb2.locator('[data-e2e="dashboard:detail"]').getByText(timeRe).first();
  const ta = fa2.locator('[data-e2e="dashboard:detail"]').getByText(timeRe).first();
  await mark(fb2, tb, '02:00 - bledne (polnoc UTC)', false);
  await mark(fa2, ta, 'prawdziwa godzina (teraz)', true);
  await sleep(4000);
  await both((f) => unmark(f));
  await page.keyboard.press('Escape');
  await sleep(600);

  // ---------- Scene 2: manual expense ----------
  await title('Scena 2', 'Reczne dodanie wydatku<br>PO: pole "Data i godzina" - domyslnie teraz, wymagane, edytowalne');
  await bar('Scena 2: reczne dodanie wydatku');
  await goto('/app/expenses/new/');
  await settle();
  for (const f of [frames().b, frames().a]) {
    await E(f, 'expense-form:merchant').fill('');
    await E(f, 'expense-form:merchant').pressSequentially('Kawiarnia', { delay: 70 });
    await E(f, 'expense-form:amount').fill('');
    await E(f, 'expense-form:amount').pressSequentially('25', { delay: 100 });
  }
  await sleep(600);
  const { b: fb3, a: fa3 } = frames();
  console.log('manual before field:', await E(fb3, 'expense-form:date').getAttribute('type'), await E(fb3, 'expense-form:date').inputValue());
  console.log('manual after field:', await E(fa3, 'expense-form:date').getAttribute('type'), await E(fa3, 'expense-form:date').inputValue());
  await mark(fb3, E(fb3, 'expense-form:date'), 'tylko data (bez godziny)', false);
  await mark(fa3, E(fa3, 'expense-form:date'), 'wypelnione: teraz (data + godzina)', true);
  await sleep(3500);
  await unmark(fa3); await unmark(fb3);
  // AFTER: required - clear and try to save
  await fa3.evaluate(() => {
    const i = document.querySelector('[data-e2e="expense-form:date"]');
    i.focus();
  });
  await E(fa3, 'expense-form:date').fill('');
  await sleep(500);
  const reqProp = await E(fa3, 'expense-form:date').evaluate((i) => i.required);
  await E(fa3, 'expense-form:save').click();
  await sleep(700);
  const stillForm = await E(fa3, 'expense-form:form').isVisible();
  const invalid = await E(fa3, 'expense-form:date').evaluate((i) => !i.validity.valid);
  console.log('after cleared: required=', reqProp, 'formStillVisible=', stillForm, 'invalid=', invalid);
  await mark(fa3, E(fa3, 'expense-form:date'), 'puste = wymagane, zapis zablokowany', false);
  await sleep(3000);
  await unmark(fa3);
  // AFTER: edit to a chosen time
  await E(fa3, 'expense-form:date').fill('2026-10-11T14:30');
  await sleep(500);
  await mark(fa3, E(fa3, 'expense-form:date'), 'edycja: 14:30', true);
  await sleep(2000);
  await unmark(fa3);
  await both((f) => E(f, 'expense-form:save').click());
  await both((f) => E(f, 'dashboard:main').waitFor({ state: 'visible', timeout: 20000 }));
  await sleep(1500);
  await both(async (f) => {
    await f.locator('[data-e2e^="dashboard:expense:"]').filter({ hasText: 'Kawiarnia' }).first().click();
    await E(f, 'dashboard:detail').waitFor({ state: 'visible' });
  });
  await sleep(1000);
  const { b: fb4, a: fa4 } = frames();
  const tb2 = fb4.locator('[data-e2e="dashboard:detail"]').getByText(timeRe).first();
  const ta2 = fa4.locator('[data-e2e="dashboard:detail"]').getByText(timeRe).first();
  console.log('manual before detail:', await tb2.innerText(), '| after:', await ta2.innerText());
  await mark(fb4, tb2, 'godzina nieedytowalna (bez pola)', false);
  await mark(fa4, ta2, 'zapisana godzina = 14:30', true);
  await sleep(4500);
  await both((f) => unmark(f));

  await title('Podsumowanie', 'Skan paragonu z sama data: PRZED 02:00 (polnoc UTC), PO prawdziwa godzina<br>Reczny wydatek: PRZED brak pola godziny, PO "Data i godzina" - wymagane i edytowalne', 3500);

  clearInterval(tick);
  const vid = page.video();
  await context.close();
  const file = await vid.path();
  fs.copyFileSync(file, path.join(OUT, 'final.webm'));
  await browser.close();
  console.log('VIDEO', path.join(OUT, 'final.webm'));
}

main().catch(async (e) => {
  try { await globalThis.__page?.screenshot({ path: process.env.OUT_DIR + '/err.png' }); } catch {}
  console.error(e);
  process.exit(1);
});
