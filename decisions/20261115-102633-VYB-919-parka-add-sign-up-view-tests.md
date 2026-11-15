---
ticket: VYB-919
scope: parka/sign-up
summary: Add sign-up view tests for retry, pending lock and clear button
why: The sign-up module had tests for mappers, selectors and the main flow only; pending state, retries and secondary controls were uncovered.
date: 2026-11-15
tags: [parka, sign-up, testing]
---

- Picked sign-up: existing tests covered mappers, selectors and the happy and error flows
- Added view tests via msw: pending lock, sent credentials, default rejection message, garbage response
- Retry after rejection succeeds, confirmation notice dropped on next rejection, validation error removed after a valid send
- Sign-in link, disabled social buttons, masked password and clear button checked by accessible roles and labels
- Only tests added, no production code changed
