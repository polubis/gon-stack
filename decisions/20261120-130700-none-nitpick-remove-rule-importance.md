---
ticket: none
scope: nitpick
summary: Remove rule importance tags and the AODI legend
why: 71 of 74 rules were A and the tag never affected checks; conditions belong in the rule text, not a prefix.
date: 2026-11-20
---

- Dropped `importance` (type and required field) from `RuleUnit`; docs no longer print `(A)`/`(I)` before rules
- Deleted the AODI legend: `rules/aodi-framework.{md,ts}`, `AODI_LEGEND`, the `## Rule files` legend block and the `aodi-framework` ref
- Removed `importance` from `.nitpick/config.ts` (74 rules) and the built-in rules; agents no longer read the legend
- `config()` generics now infer unit ids from keys (`G`, `I`) instead of reverse-mapping rule objects, because a rule with only a callback `doc` lost its id once `importance` was gone
- README: removed `importance`, legend and `aodiFramework` import docs
