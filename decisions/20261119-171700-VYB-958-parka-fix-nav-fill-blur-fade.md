---
ticket: VYB-958
scope: parka/navigation
summary: Nav fill and blur fade together on one element
why: With the add menu open the blur vanished but the fill stayed on the user device; opacity on a backdrop-filter element is engine dependent.
date: 2026-11-19
tags: [navigation, safari]
---

- Cause not reproduced: Chromium fades both right; WebKit cannot start here (host libs missing), user device likely Safari
- Likely cause: opacity on the backdrop-filter element, engines cut the blur layer and keep the fill
- Fill, blur and ring now transition as three properties on the nav itself, no opacity on it
- Nav children fade with own opacity, nav still slides with translate, wrapper flips visibility after
- Closed state untouched: plain glass utility, hidden classes apply only while the menu is open
- Off under motion-reduce
- e2e guards both states by computed fill, blur and ring
- Rejected: repeating VYB-954 slot move and VYB-956 explicit always-on overrides, both broke the closed state
