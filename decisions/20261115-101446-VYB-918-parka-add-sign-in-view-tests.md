---
ticket: VYB-918
scope: parka/sign-in
summary: Add sign-in view tests for states, clear buttons and retries
why: Sign-in had flow, selectors and mapper tests only; pending state, retry, clearing and static controls were uncovered.
date: 2026-11-15
tags: [parka, sign-in, testing]
---

- Picked sign-in: logic already covered by selectors, mappers and flow tests, gaps were in the view
- New view tests via msw: pending button disabled, redirect target /app/, default rejection message, retry clears old error, validation message dropped
- Also: clear buttons empty and refocus fields, social buttons disabled, sign-up link
- Required fields are only a visual marker (form is noValidate), so no required-attribute test
- Only tests added, no production code changed
