---
ticket: none
scope: parka/testing
summary: Align parka tests with testing rules, drop DOM and request internals
why: Rules say test behavior via accessible queries and UI, not classes, test ids or HTTP method and URL
date: 2026-11-10
tags: [parka, testing, a11y, msw]
---

- Unit: removed `data-e2e` selectors from unit tests; period label read via the accessible value button
- Unit: `className`, `querySelector`, `getByTestId` asserts replaced by roles, names and text (typeahead, account drawer, priority badge, clearable, notification diff, walkthrough, device photo, comment avatars)
- Unit: removed layout-only or decorative-only asserts (overflow, sticky, top offset, pulse, icon, avatar colour, priority pips); not verifiable in jsdom
- Unit: logout push tests moved from `logoutAccount` integration call to the account drawer UI, success and failure
- Request asserts: dropped HTTP method and URL checks in frontend flows; kept saved body and scope (which record, which period) as business contract
- Names: 15 titles over 70 chars or with "should" shortened, user-story style kept
- Types: new `expectTypeOf` and `@ts-expect-error` test for suggestion contracts (public interface)
- Kept on purpose: list-change class asserts (animation contract), `data-theme` on html (theme contract), `closest('li')` row lookup
- Open: 111 raw `getByRole`/`getByText` e2e locators in 13 specs, need typed `data-e2e` ids in components
- Open: account isolation tests still set up form-memory storage directly
