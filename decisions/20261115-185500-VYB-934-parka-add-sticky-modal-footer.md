---
ticket: VYB-934
scope: parka/ui
summary: Add shared sticky ModalFooter and ux-modal-footer rule
why: Modal actions scrolled away with long forms; one shared sticky footer keeps them reachable and consistent.
date: 2026-11-15
---

- Rule `ux-modal-footer` added in `.nitpick/config.ts`, synced via `pnpm nitpick:sync`
- New `shared/ui/modal-footer.tsx`: sticky bottom, solid `bg-card`, gradient only on top edge via `before:`
  - Bleeds over `p-5` dialog padding, so it needs a `p-5` dialog
- Applied to all parka modal footers (time, categories, dashboard, access-tokens, settings, expense-form, image-editor, form-memory)
- Fullscreen description editor and cookie preferences skipped: layout already pins actions
