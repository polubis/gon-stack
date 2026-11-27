---
ticket: VYB-323
scope: parka/access-tokens
summary: Add tests for token limit, expiry labels, name rules and secret copy
why: Daily test routine; access-tokens had the weakest test-to-source ratio in parka modules.
date: 2026-11-27
---

- Gaps found: token limit (10) UI, expiry and last-used labels, name trim and 60-char cap, secret copy to clipboard.
- Added black-box UI tests with msw, accessible selectors only.
- Success toast test had no assertion; success is silent by design, so it now asserts the secret dialog shows and no toast.
