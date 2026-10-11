---
ticket: none
scope: parka
summary: Auth double-submit tests hold fetch until asserted
why: Test must prove in-flight dedupe, not race the event loop
date: 2026-09-29
---

- Sign-in and sign-up flow tests “sends only one request when the form is submitted twice” no longer use a 20ms `setTimeout` fetch mock.
- Under turbo/CI load the second `{Enter}` could arrive after the mock resolved, so `exhaustMap` correctly issued a second request and the test flaked.
- The mock now stays pending until the test asserts `fetch` was called once, then resolves so navigation can finish.
