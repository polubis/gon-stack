---
ticket: VYB-322
scope: parka/auth
summary: Add auth repository, device cleanup and summary tests
why: Shared auth integration and summary stores had no direct tests for failure and account-switch paths.
date: 2026-11-26
---

- add msw tests for fetchAuth, fetchAccounts, switchAccount, logoutAccount: mapping, rejection messages, request bodies
- cover reconcileDevice: other account wipes form memory and push, same account keeps data, push failure tolerated
- cover unread and profile summary stores: publish, merge, no re-render on equal value
- no production code change
