---
ticket: VYB-953
scope: parka/knowledge
summary: Pick knowledge catalog instead of date range
why: Knowledge is browsed by catalog, not by study day; arrows and swipe now cycle catalogs and the brain card became a plain done/undone summary.
date: 2026-11-19
---

- Date range control replaced by a catalog picker: arrows step to next/previous catalog round and round, never disabled, middle opens the list
- Swipe left/right on touch moves to next/previous catalog (own small hook, period swipe stays for finance and time)
- Picked catalog lives in the `catalog` URL param; it is shown from loaded data, so switching never reloads
- Topic lists now load without a study-day range: a catalog lists all its topics, dated or not
- Catalog toggle removed from the filters drawer (picker owns it) and no longer counts as an active filter
- Brain hero removed with its area maths; plain summary shows finished vs unfinished topics like time and finance
- Evidence: one recording, Before frames of the old build inserted ahead of After; swipe not recorded (needs coarse pointer), covered by unit test
