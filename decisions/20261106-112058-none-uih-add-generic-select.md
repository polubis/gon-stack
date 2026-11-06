---
ticket: none
scope: uih
summary: Generic headless Select with Parka theme and docs
why: Shared select for apps - popover on desktop, full screen modal on phones, one global stream for routing
date: 2026-11-06
tags: [uih, select, a11y]
---

- Added `@repo/uih/select`: compound parts (`Root`, `Label`, `Control`, `Trigger`, `Value`, `Clear`, `Icon`, `Content`, `Search`, `List`, `Item`, `ItemIndicator`, `Empty`), `createSelect<T>()` for typed items, `Select` = string instance.
  - Context via `@repo/react-kit/context`; icons from `lucide-react`.
  - `mode="auto"`: modal below `40rem`, popover above. Modal = thumb zone: options stack from bottom, search under them. Popover closes on outside pointerdown; modal pushes one history entry, native Back closes it.
  - APG combobox + listbox, `aria-activedescendant`, arrows/Home/End/Page keys, typeahead, Tab trap in modal, focus return.
  - `List` keeps removed rows as `data-presence="exit"` until animations end; new rows get `enter`.
  - `sound` flag: synthesized Web Audio tone on open/close, no asset.
  - Hidden input via `name` + `itemKey` for native forms.
- Added `@repo/uih/select-stream`: global `subscribe`/`getOpen`/`open`/`close`; opens queued until select mounts.
- Theme: `theme/select.css` (`--ds-select-*` tokens); `tokens.css` switched to Parka palette (AAA text pairs) + dark tokens. Button now green by default.
- Docs: `select.mdx` demos, `/select-headless/` page without theme, sticky stream panel, `src/integration/select-url.ts` mirrors open ids into `?select=` (deep link reopens).
- Tests: uih coverage threshold 100%; uih-docs Playwright e2e (themed, phone, headless, axe WCAG AAA scoped to selects).
- Limits: popover does not flip near viewport bottom; no portal, so `overflow: hidden` ancestors clip it.
