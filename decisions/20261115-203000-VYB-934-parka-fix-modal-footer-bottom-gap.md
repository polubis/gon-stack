---
ticket: VYB-934
scope: parka/ui
summary: Fix modal footer gap, frame drops bottom padding
why: Sticky footer stuck to the padding edge, so the dialog bottom padding left a 20 px strip where scrolled content showed under the footer.
date: 2026-11-15
---

- Measured before: 20 px gap between footer and dialog bottom while scrolled, content visible in it (mobile 390x560, desktop 1280x800/1280x480)
- New `MODAL_PADDING` in `shared/ui/modal-footer.tsx`: `p-5` plus `has-[[data-modal-footer]]:pb-0`, used by every dialog frame that hosts a footer
  - Frames without a footer keep full `p-5`, no per-modal flags
- `ModalFooter` lost the `-mb-5` hack, carries the bottom space itself: `pb-[max(1.25rem,env(safe-area-inset-bottom))]`
- Measured after: 0 px (0.31 px sub-pixel at max scroll in a few forms), no content under footer; frame `overflow` + radius clip the corners
- Test: footer is last child of the scrolled modal, CSS class details no longer asserted
- `ModalFrame` in VYB-935 (PR #128, knowledge module) has to be replaced by `ModalFooter` + `MODAL_PADDING` after merge
