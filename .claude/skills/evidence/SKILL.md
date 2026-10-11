---
name: evidence
description: Record video proof that a change works. Before/after side-by-side or single-run video with injected highlight boxes and labels. Use when dev asks for proof, evidence, "video", "przed i po", "dowod", "pokaz ze dziala", or when coord must show proof of a UI change.
---

# Evidence

Video proof of UI behavior. Playwright records one page. Highlights + labels injected into DOM. Output one `.webm`.

## Reference (always follow)

- Ideal example video: [references/parka-date-before-after.webm](references/parka-date-before-after.webm)
- Script that made it: [references/record-before-after.mjs](references/record-before-after.mjs)

Copy script structure. Swap scenes, selectors, URLs, captions. Never reinvent.

## When

- Fix/feature visible in UI, dev wants proof
- Bug repro: BEFORE shows bug, AFTER shows fix
- New feature only: single run (no BEFORE), same labels

Not for non-UI change. Use tests.

## Workflow

1. **Scenes.** List 1-3 scenes. Each = one user story + one highlight target. Bug = scene shows bad value BEFORE. Say so if BEFORE cannot show bug (ex: manual add already ok) - show missing capability instead, caption honestly.
2. **BEFORE code.** `git worktree add <scratch>/before HEAD` (uncommitted work stays in main tree = AFTER). Never edit main tree.
3. **Two dev servers.** BEFORE on port A, AFTER on port B, plus tiny wrapper origin C. Start background, wait ready.
4. **Wrapper page.** Served via `context.route(C/**)`. Two `<iframe>` side by side: left red banner `PRZED`, right green banner `PO`. Top bar = scene name. Hidden `#card` overlay for title cards.
5. **Context.** `recordVideo` size = viewport (1920x1040). Fixed `timezoneId`, `locale`. Stub auth cookie + auth user call. Mock whole backend via `context.route('**/api/**')`, one state per origin. Mock answers what OLD/NEW server would return - say so in report.
6. **Run both sides in lockstep.** helper `both(fn)` = `Promise.all` on both frames. Use `data-e2e` locators.
7. **Label.** Per highlight: `mark(frame, locator, caption, good)` then hold, then `unmark`. Colors: bad `#dc2626`, good `#16a34a`.
8. **Title cards** between scenes + closing summary card.
9. **Save.** `page.video().path()` after `context.close()`, copy to `final.webm`.
10. **Verify.** Screenshots every ~2.5s (`shots/`), log real values (`console.log` field values, POST bodies). View screenshots before claiming. Caption must match logged value.
11. **Cleanup.** Stop servers, `git worktree remove --force` + `prune`. Check `git status` same as before. Check `node_modules` junction not re-linked by worktree (run install in main tree only).
12. **Deliver.** Absolute path + `SendUserFile` (`display: render`). Report scenes, limits.

## Label helper

Draws box + caption in frame, `position:fixed`, `pointer-events:none`, max z-index. Caption above element; below if element near top.

```js
const mark = async (frame, loc, caption, good) => {
  const color = good ? '#16a34a' : '#dc2626';
  const el = await loc.first().elementHandle();
  await el.scrollIntoViewIfNeeded();
  await frame.evaluate(([el, caption, color]) => {
    const r = el.getBoundingClientRect();
    const box = document.createElement('div');
    box.className = '__hl';
    box.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;border:4px solid ${color};border-radius:8px`;
    const tag = document.createElement('div');
    tag.className = '__hl';
    tag.textContent = caption;
    tag.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;left:${Math.max(4, r.left - 6)}px;top:${r.top < 70 ? r.bottom + 12 : r.top - 46}px;background:${color};color:#fff;font:700 20px system-ui;padding:6px 12px;border-radius:6px;white-space:nowrap`;
    document.body.append(box, tag);
  }, [el, caption, color]);
};
const unmark = (frame) =>
  frame.evaluate(() => document.querySelectorAll('.__hl').forEach((n) => n.remove()));
```

## Single-run variant (no BEFORE)

Drop wrapper + second server. Use one page, same `mark`/`unmark`/title card helpers, `recordVideo` on context.

## Rules

- Hold each highlight 3-4.5s; title cards 3s. Readable.
- Caption = fact (value, state), short, Polish ok.
- Fixed timezone + locale, else video not reproducible.
- Mock backend, never real data. Personal/sensitive data seen -> stop (`rules/security.md`).
- Never modify source of main tree. Proof only.
- No `ffmpeg` = `.webm` only; do not fake `.mp4`.
- Script paths in reference are absolute to original machine - adapt.
- Report limits honestly: mocked parts, dev server not build, scenes dropped.
- Put video in scratch dir, not repo, unless dev asks to keep.

## Report

- Path of final video
- Per scene: what BEFORE shows, what AFTER shows (logged values)
- Limits + anything repaired (worktree, links)
