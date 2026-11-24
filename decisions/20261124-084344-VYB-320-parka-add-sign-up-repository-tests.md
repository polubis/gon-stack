---
ticket: VYB-320
scope: parka/sign-up
summary: Add sign-up repository tests
why: Sign-up repository had no direct tests for redirect, rejection and failure paths.
date: 2026-11-24
---

- add msw tests for signUp: json body, pending confirmation, redirect, rejection message
- cover non-json response and network failure as thrown errors
- no production code change
