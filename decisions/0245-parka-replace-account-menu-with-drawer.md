---
ticket: none
scope: parka
summary: Replace account menu with drawer, move profile edit there
why: Account actions and profile belong together; the user icon shows the avatar and Wiecej drops user items
date: 2026-10-26
tags: [account, drawer, navigation, settings]
---

- User icon opens an account drawer instead of a popover menu
  - Drawer lives in the URL modal stack: Back, Escape or X closes it, reload restores it
  - Header shows avatar, name, email and an "Edytuj profil" button
  - Bottom keeps the former menu options: account switch, add account, sign out, sign out of all
  - Counts as an overlay, so the mobile bottom nav hides while it is open
- Nav button shows the uploaded avatar instead of the icon once set
- Profile (picture and name only) moved from the Wiecej settings page into a profile modal stacked over the drawer
  - E-mail is read-only in the drawer header; dropped from the settings contract, mapper and server upsert
- Settings page lost the profile card and the link to expense categories
  - Categories stay reachable from the dashboard
- Tests: drawer open/close/Back/deep link/avatar, profile modal, settings without profile and categories link; e2e specs follow the new entry point
