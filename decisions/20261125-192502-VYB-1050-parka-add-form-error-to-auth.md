---
ticket: VYB-1050
scope: parka/sign-in
summary: Auth form errors follow the error display pattern
why: Sign-in and sign-up showed a bare English line, breaking the icon-title-code-description-retry-back error rule.
date: 2026-11-25
---

- Add shared FormError (icon, title, tech code, description, retry, back) in shared/ui
- Retry shown only for server rejection, validation error asks to edit fields instead
- Sign-in and sign-up use it, selectors return a structured view instead of a string
- Validation copy translated to Polish, sign-up subtitle no longer says log in
- Tests updated, retry flow covered in both views
