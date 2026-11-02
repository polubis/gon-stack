---
ticket: none
scope: parka
summary: Limit period swipe to touch devices
why: Swipe gesture must not run where the main pointer is a mouse
date: 2026-10-30
tags: [swipe, touch]
---

- Period swipe (time and dashboard) starts only when `(pointer: coarse)` matches
  - No `matchMedia` (tests) keeps swipe on
  - Step buttons and pickers stay the keyboard path
- Test: swipe ignored when the main pointer is a mouse
