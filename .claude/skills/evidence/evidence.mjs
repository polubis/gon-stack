#!/usr/bin/env node
// Generic evidence runner. Usage: see SKILL.md. Playwright resolved from --playwright-from (default cwd).
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync, appendFileSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: a } = parseArgs({
  options: {
    scenario: { type: 'string' },
    mode: { type: 'string', default: 'single' }, // single | before-after | shot | responsive
    url: { type: 'string' }, // AFTER / single
    'before-url': { type: 'string' },
    viewport: { type: 'string', default: '390x844' },
    viewports: { type: 'string' }, // responsive: "320,480,768x900"
    out: { type: 'string', default: 'evidence' },
    'out-dir': { type: 'string', default: '.evidences' },
    'playwright-from': { type: 'string', default: '.' }, // dir whose node_modules has @playwright/test
    timezone: { type: 'string', default: 'UTC' },
    locale: { type: 'string', default: 'en-US' },
    backend: { type: 'string' }, // probe URL; unreachable + scenario.mock => mock
    serve: { type: 'string', multiple: true }, // "cmd|readyUrl|cwd"
    worktree: { type: 'string' }, // BEFORE worktree dir (git worktree add HEAD)
    'hold-ms': { type: 'string', default: '3000' },
  },
});
if (!a.scenario) throw new Error('--scenario required');
if (!['single', 'before-after', 'shot', 'responsive'].includes(a.mode)) throw new Error('bad --mode');
if (!a.url) throw new Error('--url required');
if (a.mode === 'responsive' && !a.viewports) throw new Error('--viewports required for responsive');

const sh = (c, o = {}) => execSync(c, { stdio: ['ignore', 'pipe', 'ignore'], ...o }).toString();
let root = process.cwd();
try { root = sh('git rev-parse --show-toplevel').trim(); } catch {}
const outDir = resolve(a['out-dir']);
mkdirSync(outDir, { recursive: true });
const logPath = join(outDir, `${a.out}.log.txt`);
writeFileSync(logPath, '');
const [w, h] = a.viewport.split('x').map(Number);
const holdMs = Number(a['hold-ms']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const git = () => { try { return sh('git status --porcelain', { cwd: root }); } catch { return ''; } };
const gitBefore = git();
const procs = [];
let worktreeDir;

const { chromium } = createRequire(join(resolve(a['playwright-from']), 'package.json'))('@playwright/test');

const ready = async (url, ms = 120000) => {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { if ((await fetch(url)).status < 500) return true; } catch {}
    await sleep(500);
  }
  throw new Error(`not ready: ${url}`);
};
const reachable = async (url) => { try { await fetch(url); return true; } catch { return false; } };
const kill = (p) => {
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${p.pid} /T /F`, { stdio: 'ignore' });
    else process.kill(-p.pid, 'SIGKILL');
  } catch {}
};

const mark = async (page, loc, caption, good = true) => {
  const color = good ? '#16a34a' : '#dc2626';
  const el = await loc.first().elementHandle();
  await el.scrollIntoViewIfNeeded();
  await page.evaluate(([el, caption, color]) => {
    const r = el.getBoundingClientRect();
    const box = document.createElement('div');
    box.className = '__hl';
    box.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;border:4px solid ${color};border-radius:8px`;
    const tag = document.createElement('div');
    tag.className = '__hl';
    tag.textContent = caption;
    tag.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${Math.max(4, r.left - 6)}px;top:${r.top < 70 ? r.bottom + 12 : r.top - 46}px;max-width:95vw;background:${color};color:#fff;font:700 18px system-ui;padding:6px 12px;border-radius:6px`;
    document.body.append(box, tag);
  }, [el, caption, color]);
};
const unmark = (page) => page.evaluate(() => document.querySelectorAll('.__hl').forEach((n) => n.remove()));
const card = async (page, title, sub = '', color = '#111827') => {
  await page.evaluate(([t, s, c]) => {
    document.getElementById('__card')?.remove();
    const d = document.createElement('div');
    d.id = '__card';
    d.style.cssText = `position:fixed;inset:0;z-index:2147483647;background:${c};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font:700 28px system-ui;text-align:center;padding:24px`;
    d.innerHTML = `<div></div><div style="font:500 18px system-ui;opacity:.8"></div>`;
    d.children[0].textContent = t; d.children[1].textContent = s;
    document.body.append(d);
  }, [title, sub, color]);
  await sleep(holdMs);
  await page.evaluate(() => document.getElementById('__card')?.remove());
};

const run = async (browser, phase, baseUrl, scenario, mockOn, vp = { w, h }, shotPath) => {
  const tag = a.mode === 'before-after' ? `${a.out}.${phase}` : a.out;
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    timezoneId: a.timezone,
    locale: a.locale,
    reducedMotion: 'reduce',
    ...(a.mode === 'shot' || a.mode === 'responsive' ? {} : { recordVideo: { dir: join(outDir, `.tmp-${tag}`), size: { width: vp.w, height: vp.h } } }),
  });
  if (mockOn) { await scenario.mock(ctx); appendFileSync(logPath, `[${phase}] backend=MOCK\n`); }
  else appendFileSync(logPath, `[${phase}] backend=REAL\n`);
  const page = await ctx.newPage();
  let frames = 0;
  const helpers = {
    page, ctx, baseUrl, phase, vw: vp.w,
    mark: (loc, caption, good) => mark(page, loc, caption, good),
    unmark: () => unmark(page),
    card: (t, s, c) => card(page, t, s, c),
    hold: (ms = holdMs) => sleep(ms),
    log: (k, v) => appendFileSync(logPath, `[${phase}] ${k}=${JSON.stringify(v)}\n`),
    frame: async (name) => { // max 3 key frames per phase
      if (frames++ >= 3) return;
      await page.screenshot({ path: join(outDir, `${tag}.${name}.png`) });
    },
  };
  try {
    await page.goto(baseUrl);
    if (a.mode === 'single' || a.mode === 'before-after') await helpers.card(phase.toUpperCase(), a.out, phase === 'before' ? '#991b1b' : '#166534');
    await scenario.default(helpers);
    if (a.mode === 'shot') await page.screenshot({ path: join(outDir, `${tag}.png`) });
    if (shotPath) await page.screenshot({ path: shotPath });
  } finally {
    const video = page.video();
    await ctx.close();
    if (video) {
      const dest = join(outDir, `${tag}.webm`);
      copyFileSync(await video.path(), dest);
      appendFileSync(logPath, `[${phase}] video=${dest}\n`);
      rmSync(join(outDir, `.tmp-${tag}`), { recursive: true, force: true });
    }
  }
};

const board = async (browser, shots) => {
  const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const html = `<body style="margin:0;background:#e5e7eb;font-family:system-ui"><div style="display:flex;flex-wrap:wrap;gap:32px;padding:32px;align-items:flex-start;width:2400px;box-sizing:border-box">${shots
    .map((s) => `<figure style="margin:0"><figcaption style="font:700 40px system-ui;margin-bottom:8px;color:#111827">${esc(s.label)}</figcaption><img style="display:block;height:${Math.round(900 * Math.min(1, s.h / Math.max(...shots.map((x) => x.h))))}px;width:auto;border:3px solid #111827;background:#fff" src="data:image/png;base64,${s.b64}"></figure>`)
    .join('')}</div></body>`;
  const p = await browser.newPage({ viewport: { width: 2400, height: 600 } });
  await p.setContent(html);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete));
  const dest = join(outDir, `${a.out}.responsive.png`);
  await p.screenshot({ path: dest, fullPage: true });
  await p.close();
  return dest;
};

let browser;
try {
  if (a.worktree) {
    worktreeDir = resolve(a.worktree);
    execSync(`git worktree add "${worktreeDir}" HEAD`, { cwd: root, stdio: 'ignore' });
  }
  for (const spec of a.serve ?? []) {
    const [cmd, url, cwd] = spec.split('|');
    procs.push(spawn(cmd.replace('{WT}', worktreeDir ?? ''), { shell: true, cwd: cwd?.replace('{WT}', worktreeDir ?? '') ?? process.cwd(), stdio: 'ignore', detached: process.platform !== 'win32' }));
    await ready(url);
  }
  const scenario = await import(pathToFileURL(resolve(a.scenario)).href);
  const backendUp = a.backend ? await reachable(a.backend) : true;
  const mockOn = !backendUp && typeof scenario.mock === 'function';
  if (!backendUp && !mockOn) throw new Error('backend unreachable and scenario has no mock()');
  browser = await chromium.launch();
  if (a.mode === 'responsive') {
    const shots = [];
    for (const spec of a.viewports.split(',').map((x) => x.trim()).filter(Boolean)) {
      const [vw, vh] = spec.split('x').map(Number);
      if (!vw) throw new Error(`bad viewport: ${spec}`);
      const vp = { w: vw, h: vh || 800 };
      const tmp = join(outDir, `.tmp-${a.out}-${vw}.png`);
      appendFileSync(logPath, `[viewport] ${spec}
`);
      await run(browser, `w${vw}`, a.url, scenario, mockOn, vp, tmp);
      shots.push({ label: vh ? `${vw}x${vh}` : String(vw), h: vp.h, b64: readFileSync(tmp).toString('base64') });
      rmSync(tmp, { force: true });
    }
    const dest = await board(browser, shots);
    appendFileSync(logPath, `board=${dest}
`);
    console.log(`board: ${dest}`);
  } else if (a.mode === 'before-after') {
    if (!a['before-url']) throw new Error('--before-url required for before-after');
    await run(browser, 'before', a['before-url'], scenario, mockOn);
    await run(browser, 'after', a.url, scenario, mockOn);
  } else await run(browser, 'after', a.url, scenario, mockOn);
  console.log(`done. log: ${logPath}`);
} finally {
  await browser?.close();
  procs.forEach(kill);
  if (worktreeDir && existsSync(worktreeDir)) {
    try {
      execSync(`git worktree remove --force "${worktreeDir}"`, { cwd: root, stdio: 'ignore' });
      execSync('git worktree prune', { cwd: root });
    } catch {}
  }
  const same = git() === gitBefore;
  appendFileSync(logPath, `git-status-unchanged=${same}\n`);
  console.log(`git status unchanged: ${same}`);
}
