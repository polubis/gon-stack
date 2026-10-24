---
ticket: none
scope: parka/time
summary: Fix backlog scroll, mobile keyboard, push drift, device avatar
why: Backlog modal had two scrolls, modals hid under the soft keyboard, push toggled off by itself and new items lacked the device avatar until reload
date: 2026-10-23
tags: [parka, bugfix, modal, push, device-avatar]
---

- Backlog modal: removed inner list scroll, the dialog is the only scroller
- Modals and keyboard
  - `trackKeyboardInset` publishes `--kb-inset` from `visualViewport`; started in app shell
  - Bottom-anchored modals lift above it and shrink to the free height; viewport meta `interactive-widget=resizes-content`
- Push
  - Root cause: saved "push on" outlived the device subscription (browser expiry, 404/410 cleanup, account switch), toggle needs both
  - `sync-push` handler resubscribes silently and re-registers when choice is on and permission granted; `pushsubscriptionchange` in `sw.js`
- Device avatar
  - Root cause: new tasks kept the draft device (no avatar/photo) until reload; server answer was dropped
  - Created task/backlog task now takes the saved device from the response; dashboard header avatar reloads on every load
- Tests: keyboard inset, backlog single scroll, push self-heal, new task device avatar
