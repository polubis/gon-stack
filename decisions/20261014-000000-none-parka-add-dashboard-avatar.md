---
ticket: none
scope: parka
summary: Show the user avatar in the dashboard header
why: Finance view had only a generic profile icon, the picture is already known from settings
date: 2026-10-14
tags: [dashboard, avatar, ux]
---

- Dashboard header shows the user avatar in one place, linking to settings; default icon when none or load fails
  - Avatar loaded once on dashboard load by `load-avatar` handler (`$avatar` in store, `useAvatar` in facade)
- Shared fetch in `shared/avatar` (`fetchAvatar`, `Avatar` model) used by dashboard and settings
  - Settings `repository.ts` drops its own `fetchAvatar`
- Dashboard test backend answers `/api/avatar`; load-everything test counts the extra read
