---
ticket: VYB-951
scope: parka/ui
summary: Hide scrollbar arrow buttons in rounded modals
why: Recording with real scrollbars showed the square arrow buttons still poked past the rounded corners, so the first fix was not enough.
date: 2026-11-18
supersedes: 20261118-160300-VYB-951-parka-fix-modal-scrollbar-corners
---

- `scroll-in-radius` now also sets a slim webkit scrollbar, hides the arrow buttons and rounds the thumb inside the inset track.
- Thumb uses the `--line-strong` token, so it follows the theme.
- E2E also asserts the scrollbar buttons are hidden.
