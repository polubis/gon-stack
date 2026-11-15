---
ticket: VYB-921
scope: parka/settings
summary: Add unit tests for settings mappers, repository and browser push
why: The settings module had flow tests only; DTO mapping, the API client error paths and browser push state were uncovered.
date: 2026-11-15
tags: [parka, settings, testing]
---

- Picked settings: 29 source files, 8 test files
- mappers: fields kept, unknown fields dropped, round trip to dto, no avatar is null, avatar variants kept
- repository: load, save, avatar and device photo upload, push subscription, server message on every failure, aborted load
- push: unsupported, unconfigured, blocked, off, on states; enable with granted and dismissed prompt; incomplete subscription; resubscribe; disable
- HTTP mocked with msw; browser push APIs stubbed (allowed, not fetch)
- Multipart uploads asserted by raw body, jsdom File is not an undici File
- Only tests added, no production code changed
- Existing tsc errors (`Array.at`, iteration target) left as is, not in scope
