---
ticket: none
scope: parka
summary: "Categories: preview moved into name field"
why: Less content; preview kept at zero extra elements
date: 2026-10-09
---

- Top preview card (icon + color + name) repeated what the form fields already show.
- `editor.tsx`: card removed; name input gets a leading round badge with the chosen icon in the chosen color (live). Badge is `aria-hidden`.
- Removed e2e id `categories:form-preview`, unused `Card` import.
- Decision: new rule `ux.md` #9 - no needless duplicates on screen.
