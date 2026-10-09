# 0037 - Categories: RWD overflow + centered content (ui rule 7)

```json
{
  "status": "done"
}
```

Icon picker search input + icon grid overflowed the form (clipped on right at 768-1440, grid collapsed to 2 cols at 320). Header sat left while content was centered beside the side panel on big viewports.

- Cause 1: `<fieldset>` default `min-width: min-content`; non-wrapping group chip row widened it. Fix: `min-w-0` in `icon-picker.tsx`, `color-picker.tsx`.
- Cause 2: `ScreenHeader` outside the `max-w-2xl` column. Fix: header + error states wrapped in `mx-auto w-full max-w-2xl md:px-4` in `main.tsx`, `editor.tsx`, `shell.tsx`, so header/list/form align in one centered column.
- Evidence: `docs/rwd/categories/before|after|centered/{add,edit,list}-{320..1920}.png` (before/after: add+edit only). No horizontal overflow at any width.

Decision: new rule `ui.md` #7 - dashboard UIs with side panel center all content (header included).

Reason: UI rules - mobile first, RWD 320...1920, centered content with side panel.
