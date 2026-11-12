---
ticket: VYB-237
scope: parka/ui
summary: Select and typeahead go full-screen on mobile, popovers live in URL
why: Mobile needs a focused picker; Back/Forward must drive every popover on every screen size
date: 2026-11-12
---

- `useIsMobile` uses native `matchMedia` (width below 40rem, or coarse pointer below 64rem); no library needed.
- `PickerScreen` is the shared full-screen modal (`h-dvh`, fixed height); `Select`, `SelectPopover` and `Typeahead` render it on mobile, dropdown on desktop.
- Typeahead on mobile keeps a plain input; the star opens the picker with a focused filter input on top.
- `usePopoverOpen` now keeps every popover in the URL modal stack on all sizes (Back/Forward, stacking, reload restore).
- Popovers are `modal`: outside click only dismisses and never reaches the element below. Side effect: the rest of the page is aria-hidden while open.
- `modal-stack` re-applies query changes made while a popover was open after its Back, so picking a period and closing no longer reverts it.
- Chained close plus open in period control now uses `openModal` (replace), as the hook documents.
- Task menu ids carry `useId`: a repeating task shows in several week rows and shared ids opened and dismissed them together.
- Typeahead list on desktop stays inline (not in URL); only popovers and selects were in scope.
