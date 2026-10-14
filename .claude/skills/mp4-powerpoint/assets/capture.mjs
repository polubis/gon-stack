// node capture.mjs <deck.html> <out.mp4> [--stills] [--at ms,ms,...] [--fps 30]
//   --stills  one PNG per slide (at 80% of slide) -> <deck dir>/stills/
//   --at      PNGs at given ms (transitions, morphs)  -> <deck dir>/at/
//   default   every frame -> <deck dir>/frames/, then ffmpeg -> <out.mp4>
// Needs (in this dir): npm i playwright ffmpeg-static ffprobe-static && npx playwright install chromium
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i < 0 ? undefined : args[i + 1]; };
const [html, out] = args.filter((a, i) => !a.startsWith('--') && !['--at', '--fps'].includes(args[i - 1]));
if (!html) throw new Error('usage: node capture.mjs <deck.html> <out.mp4> [--stills] [--at ms,..] [--fps 30]');
const dir = dirname(resolve(html));
const FPS = Number(opt('--fps') ?? 30);
const fresh = (d) => { rmSync(d, { recursive: true, force: true }); mkdirSync(d); return d; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('pageerror', e.message); process.exitCode = 1; });
await page.goto(pathToFileURL(resolve(html)).href + '?capture=1');
await page.evaluate(() => window.ready);
const total = await page.evaluate(() => window.TOTAL_MS);
const shot = async (ms, path) => { await page.evaluate((m) => window.renderAt(m), ms); await page.screenshot({ path }); };

if (args.includes('--stills')) {
  const d = fresh(join(dir, 'stills'));
  const mids = await page.evaluate(() => window.SLIDE_MID_MS);
  for (const [i, ms] of mids.entries()) await shot(ms, join(d, `slide-${i + 1}.png`));
  console.log('stills', d, mids.length);
} else if (opt('--at')) {
  const d = fresh(join(dir, 'at'));
  for (const ms of opt('--at').split(',').map(Number)) await shot(ms, join(d, `t${ms}.png`));
  console.log('at', d);
} else {
  if (!out) throw new Error('out.mp4 required');
  const d = fresh(join(dir, 'frames'));
  const n = Math.round((total / 1000) * FPS);
  for (let f = 0; f < n; f++) {
    await shot((f * 1000) / FPS, join(d, `f${String(f).padStart(5, '0')}.png`));
    if (f % 150 === 0) console.log(f, '/', n);
  }
  let ff = 'ffmpeg';
  try { ff = (await import('ffmpeg-static')).default ?? ff; } catch {}
  const r = spawnSync(ff, ['-y', '-framerate', String(FPS), '-i', join(d, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-crf', '18', '-r', String(FPS), '-movflags', '+faststart', '-an', resolve(out)], { stdio: 'inherit' });
  console.log('ffmpeg exit', r.status, resolve(out));
  if (r.status !== 0) process.exitCode = 1;
}
await browser.close();
