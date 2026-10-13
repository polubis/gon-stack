---
ticket: none
scope: parka
summary: Category pick no longer crashes the form on a translated page
why: Real user on a translated (Polish) page got removeChild error screen after picking a category
date: 2026-10-13
tags: [select, radix, translation, remove-child, regression]
---

- Root cause: Radix `Select.Value` portals the chosen item text into a bare text node; page translation wraps text in `<font>`, so React's in-place text swap hit `removeChild` on a detached node and the module error boundary fired
- Fix: shared `Select` renders the selected label itself in a `key={value}` span, so React replaces a whole element, never a text node
- Covers every `Select` (category, payment, product category)
- Test: vibe-test e2e wraps text nodes in `<font>` (live, via observer) at 390px, picks categories twice, expects no error screen
- Document language set to `pl` (`lang`, `og:locale`)
