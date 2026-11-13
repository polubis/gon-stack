---
name: evidence
description: Visual proof of UI change via script. One labeled image for pure UI change, or labeled recording trimmed to key part and slowed at key moment. Use when dev asks for proof, evidence, "video", "dowod", "pokaz ze dziala".
---

# Evidence

Script `evidence.mjs` does heavy lift. Agent writes tiny scenario.

## Pick

- Pure UI look (spacing, color, copy, layout): `--mode image`. One PNG, changed components boxed + numbered labels.
- Interaction, animation, flow: `--mode video`. One `<out>.webm`, labeled, trimmed, slowed.
- Image first. Video only if change needs time to be seen.

## Run

```
node <skill>/evidence.mjs --scenario <file.mjs> --mode image|video --url <URL> --out <name> --out-dir .evidences/<KEY> [--viewport 390x844] [--slow-factor 3] [--timezone UTC] [--locale en-US] [--playwright-from <dir>]
```

- `<KEY>`: tracker key, `none` or `pr-<id>`. Required. Missing -> ask.
- One run on `--url`. Scenario does the change from prompt.
- Output only to `--out-dir`. Scenario + temp files in scratch dir.

## Scenario

```js
export default async ({ page, mark, unmark, start, slow, hold, log }) => {
  await page.getByRole('link', { name: 'Tasks' }).click(); // setup, cut from video
  await start();                                           // video begins here
  await mark(page.getByRole('button', { name: 'Add' }), 'New button', 'good');
  await slow(async () => {                                 // key moment, slowed
    await page.getByRole('button', { name: 'Add' }).click();
    await mark(page.getByRole('dialog'), 'Dialog slides in');
    await hold(1500);
  });
  log('dialogs', await page.getByRole('dialog').count());
};
```

- `mark(locator, caption, kind)`: box + numbered label. Kind `good` green, `bad` red, `info` blue. Labels never overlap. Stays until `unmark()`.
- `start()`: all before it cut from video. Call once, right before key part. No-op in image.
- `slow(fn, factor?)`: CSS animations + `hold` run at `1/factor` inside `fn`. Default 3.
- `hold(ms)`: pause so label readable.
- `log(key, value)`: line in `<out>.log.txt`.

## Rules

- Image: mark every changed component. Caption = short fact.
- Video: 1-3 moments, ~10 s. No login/navigation/idle in recording. Slow only the change.
- JS-driven animation not slowed. Label it, `hold` longer.
- Trim needs ffmpeg (`FFMPEG` env, PATH, or Playwright bundled). None -> untrimmed `.webm`, say so. Never fake `.mp4`.
- Personal/sensitive data visible -> stop (`rules/security.md`).

## Verify

Read log, view 2-3 frames. Caption must match logged value. Never claim unseen.

## Report

- Absolute paths under `.evidences/<KEY>/`: image or video + log
- Per mark/moment: what changed
- Limits: untrimmed, JS animation not slowed
