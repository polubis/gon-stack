#!/usr/bin/env node
// Evidence runner: labeled UI image or trimmed/slowed video. Usage: see SKILL.md.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, copyFileSync, appendFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const { values: a } = parseArgs({
  options: {
    scenario: { type: 'string' },
    mode: { type: 'string', default: 'image' }, // image | video
    url: { type: 'string' },
    viewport: { type: 'string', default: '390x844' },
    out: { type: 'string', default: 'evidence' },
    'out-dir': { type: 'string' },
    'playwright-from': { type: 'string', default: '.' }, // dir whose node_modules has @playwright/test
    timezone: { type: 'string', default: 'UTC' },
    locale: { type: 'string', default: 'en-US' },
    'slow-factor': { type: 'string', default: '3' },
  },
});
if (!a.scenario) throw new Error('--scenario required');
if (!['image', 'video'].includes(a.mode)) throw new Error('bad --mode');
if (!a.url) throw new Error('--url required');
if (!a['out-dir']) throw new Error('--out-dir required');

const outDir = resolve(a['out-dir']);
mkdirSync(outDir, { recursive: true });
const logPath = join(outDir, `${a.out}.log.txt`);
writeFileSync(logPath, '');
const [w, h] = a.viewport.split('x').map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { chromium } = createRequire(join(resolve(a['playwright-from']), 'package.json'))('@playwright/test');

const COLORS = { bad: '#dc2626', good: '#16a34a', info: '#2563eb' };

// ---------- labels ----------
const mark = async (page, loc, caption, kind = 'good') => {
  const color = COLORS[kind] ?? COLORS.good;
  const el = await loc.first().elementHandle();
  await el.scrollIntoViewIfNeeded();
  await page.evaluate(([el, caption, color]) => {
    const r = el.getBoundingClientRect();
    const used = (window.__hlUsed ??= []);
    const box = document.createElement('div');
    box.className = '__hl';
    box.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:3px solid ${color};border-radius:8px`;
    const tag = document.createElement('div');
    tag.className = '__hl';
    tag.textContent = `${used.length + 1}. ${caption}`;
    tag.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;max-width:95vw;background:${color};color:#fff;font:700 14px/1.2 system-ui;padding:4px 8px;border-radius:6px`;
    document.body.append(box, tag);
    const tw = tag.offsetWidth, th = tag.offsetHeight;
    const left = Math.min(Math.max(4, r.left - 4), innerWidth - tw - 4);
    let top = r.top < th + 12 ? r.bottom + 8 : r.top - th - 8;
    // push down while overlapping an earlier label
    for (let i = 0; i < 20 && used.some((u) => left < u.x + u.w && left + tw > u.x && top < u.y + u.h && top + th > u.y); i++) top += th + 4;
    tag.style.left = `${left}px`;
    tag.style.top = `${top}px`;
    used.push({ x: left, y: top, w: tw, h: th });
  }, [el, caption, color]);
};
const unmark = (page) => page.evaluate(() => { window.__hlUsed = []; document.querySelectorAll('.__hl').forEach((n) => n.remove()); });

// ---------- ffmpeg: trim + slow (no setpts needed: -itsscale) ----------
const findFfmpeg = () => {
  const ok = (p) => { try { execFileSync(p, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } };
  if (process.env.FFMPEG && ok(process.env.FFMPEG)) return process.env.FFMPEG;
  if (ok('ffmpeg')) return 'ffmpeg';
  const bases = [process.env.PLAYWRIGHT_BROWSERS_PATH, process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'ms-playwright'), join(homedir(), 'Library/Caches/ms-playwright'), join(homedir(), '.cache/ms-playwright')].filter(Boolean);
  for (const b of bases) {
    if (!existsSync(b)) continue;
    for (const d of readdirSync(b).filter((x) => x.startsWith('ffmpeg-')).sort().reverse()) {
      for (const f of readdirSync(join(b, d)).filter((x) => x.startsWith('ffmpeg'))) if (ok(join(b, d, f))) return join(b, d, f);
    }
  }
  return null;
};

// keep only [from, to] seconds (one re-encode; Playwright's bundled ffmpeg has no concat/setpts)
const trim = (ffmpeg, raw, from, to, dest) => {
  const enc = execFileSync(ffmpeg, ['-hide_banner', '-encoders']).toString().includes('libvpx-vp9') ? 'libvpx-vp9' : 'libvpx';
  execFileSync(ffmpeg, ['-y', '-ss', String(from), '-i', raw, '-t', String(to - from), '-an', '-c:v', enc, '-b:v', '2M', dest], { stdio: 'ignore' });
};

// ---------- one run ----------
const run = async (browser, baseUrl, scenario) => {
  const isVideo = a.mode === 'video';
  const tmp = join(outDir, `.tmp-${a.out}`);
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    timezoneId: a.timezone,
    locale: a.locale,
    reducedMotion: isVideo ? 'no-preference' : 'reduce',
    ...(isVideo ? { recordVideo: { dir: tmp, size: { width: w, height: h } } } : {}),
  });
  const t0 = Date.now();
  const page = await ctx.newPage();
  const now = () => (Date.now() - t0) / 1000;
  let tStart = null;
  let tEnd = null;
  let rate = 1;
  let cdp;
  const setRate = async (r) => { rate = r; await (cdp ??= await ctx.newCDPSession(page)).send('Animation.setPlaybackRate', { playbackRate: 1 / r }); };
  const factor = Number(a['slow-factor']);
  const helpers = {
    page, ctx, baseUrl,
    mark: (loc, caption, kind) => mark(page, loc, caption, kind),
    unmark: () => unmark(page),
    hold: (ms = 1500) => sleep(ms * rate),
    log: (k, v) => appendFileSync(logPath, `${k}=${JSON.stringify(v)}\n`),
    // everything before start() is dropped from the video
    start: async () => { tStart = now(); },
    // run fn with animations and holds slowed by factor (video only)
    slow: async (fn, f = factor) => {
      if (!isVideo) return fn();
      await setRate(f);
      try { await fn(); } finally { await setRate(1); }
    },
  };
  try {
    await page.goto(baseUrl);
    await scenario.default(helpers);
    tEnd = now();
    if (!isVideo) await page.screenshot({ path: join(outDir, `${a.out}.png`) });
  } finally {
    const video = page.video();
    await ctx.close();
    if (video) {
      const raw = await video.path();
      const lead = 0.3; // recording starts late, keep a little pre-roll
      const from = Math.max(0, (tStart ?? 0) - lead);
      const to = tEnd ?? from;
      const dest = join(outDir, `${a.out}.webm`);
      const ffmpeg = findFfmpeg();
      if (ffmpeg && tStart !== null) {
        trim(ffmpeg, raw, from, to, dest);
        appendFileSync(logPath, `trimmed from=${from.toFixed(1)}s to=${to.toFixed(1)}s
`);
      } else {
        copyFileSync(raw, dest);
        appendFileSync(logPath, `UNTRIMMED (${ffmpeg ? 'start() not called' : 'no ffmpeg'})
`);
      }
      appendFileSync(logPath, `video=${dest}\n`);
    }
    if (!process.env.KEEP) rmSync(tmp, { recursive: true, force: true });
  }
};

// ---------- main ----------
const scenario = await import(pathToFileURL(resolve(a.scenario)).href);
const browser = await chromium.launch();
try {
  await run(browser, a.url, scenario);
  console.log(`done. log: ${logPath}`);
} finally {
  await browser.close();
}
