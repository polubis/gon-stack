---
ticket: VYB-855
scope: parka/settings
summary: Run update settings writes together
why: Settings save ran 7 writes and reads one after another, 8 round trips with sign-in.
date: 2026-11-16
---

- Area: update-settings procedure, backend; not covered by VYB-849..854, VYB-301, VYB-306
- Profile, preferences, push delete and device ids read now share one round trip
- Device set upsert overlaps reset then delete (different device ids)
- Measured with fake timers, 25 ms per round trip: 200 ms before, 100 ms after (8 trips to 4, 50%)
- Error order kept: first failure in old order is raised
  - Cost: when an early write fails, later independent writes may already be done (no transaction before either)
- Public request and response unchanged
- Test: latency, push on and failure tests; latency red on old code, green on new; server suites green (213)
