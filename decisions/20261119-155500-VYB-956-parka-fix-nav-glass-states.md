---
ticket: VYB-956
scope: parka/navigation
summary: Bottom nav glass explicit per state, eased with motion-reduce
why: After VYB-954 the nav bg and blur were reported missing at rest; make bg and blur explicit per state and guard it with e2e.
date: 2026-11-19
---

- Nav bg and blur are explicit by state: present at rest, transparent and no backdrop-filter while the add menu is open, transitioned (120ms, off under motion-reduce).
- Added -webkit-backdrop-filter to glass utility for Safari.
- Headless chromium already rendered bg and blur at rest, so cause could not be reproduced there; e2e now asserts computed bg and blur at rest, none when open, back after close.
