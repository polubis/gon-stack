---
name: evidence
description: Record video proof that a change works. Before/after side-by-side or single-run video with injected highlight boxes and labels. Use when dev asks for proof, evidence, "video", "przed i po", "dowod", "pokaz ze dziala", or when coord must show proof of a UI change.
---

# Evidence

Video proof of UI behavior. Playwright records one page. Highlights + labels injected into DOM. Output one `.webm`.

## When

- Change visible in UI, dev wants proof
- Bug fix: BEFORE shows bug, AFTER shows fix
- New feature only: single run (no BEFORE), same labels

Not for non-UI change. Use tests.

## Workflow

1. **Scenes.** List 1-3 scenes. Each = one user story + one highlight target. If BEFORE cannot show the bug, show the missing capability instead and caption honestly.
2. **BEFORE code.** `git worktree add <scratch>/before HEAD`. Uncommitted work in main tree = AFTER. Never edit main tree.
3. **Isolate deps.** Worktree must not share `node_modules` with main tree (symlink/junction). Install inside worktree, or run its server without relinking. Removing worktree through shared link deletes main files. After cleanup check main tree still builds/lints.
4. **Two dev servers.** BEFORE on port A, AFTER on port B, plus tiny wrapper origin C. Start in background, wait ready.
5. **Wrapper page.** Served via `context.route(C/**)`. Two `<iframe>` side by side: left red banner `BEFORE`, right green banner `AFTER`. Top bar = scene name. Hidden `#card` overlay for title cards.
6. **Context.** `recordVideo` size = viewport. Fixed `timezoneId` + `locale`. Stub auth if needed. Mock whole backend with `context.route`, one state per origin. Mock answers what old/new server would return - say so in report.
7. **Lockstep.** Helper `both(fn)` = `Promise.all` on both frames. Use stable locators.
8. **Label.** Per highlight: `mark(frame, locator, caption, good)`, hold, `unmark`. Colors: bad `#dc2626`, good `#16a34a`.
9. **Title cards** between scenes + closing summary card.
10. **Save.** `page.video().path()` after `context.close()`, copy to `final.webm`.
11. **Verify.** Screenshot every ~2.5s, log real values (field values, request bodies). View screenshots before claiming. Caption must match logged value.
12. **Cleanup.** Stop servers, `git worktree remove --force`, `git worktree prune`. `git status` must equal state before.
13. **Deliver.** Absolute path + `SendUserFile` (`display: render`). Report scenes, limits.

## Label helper

Box + caption inside frame, `position:fixed`, `pointer-events:none`, max z-index. Caption above element; below if element near top.

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

## Single-run variant

No wrapper, no second server. One page, same `mark`/`unmark`/title card helpers, `recordVideo` on context.

## Rules

- Hold each highlight 3-4.5s; title cards 3s. Readable.
- Caption = fact (value, state), short.
- Fixed timezone + locale, else video not reproducible.
- Mock backend, never real data. Personal/sensitive data seen -> stop (`rules/security.md`).
- Never modify source of main tree. Proof only.
- No `ffmpeg` = `.webm` only; do not fake `.mp4`.
- Video + scripts live in scratch dir, not repo, unless dev asks to keep.
- Report limits honestly: mocked parts, dev server not build, dropped scenes.

## Report

- Path of final video
- Per scene: what BEFORE shows, what AFTER shows (logged values)
- Limits + anything repaired
