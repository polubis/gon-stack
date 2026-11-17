---
ticket: VYB-943
scope: parka/knowledge
summary: Fix brain widget progress, add cortex split and touched stats
why: Hero progress was a mean of six areas so empty areas skewed it and disagreed with the stats card
date: 2026-11-17
tags: [knowledge, ui]
---

- Hero progress now fillOf(all nodes), same number as Postep nauki; BrainFill takes optional total for its aria label
- Added cortex vs cerebellum+brainstem fill line (CORTEX_AREA_IDS, cortexSplit)
- Added summaryOf and KnowledgeSummaryDto matching summary of GET /api/knowledge/ from PR 143; mock has no reels so they are 0
- Hero counters are Ruszone (learning+learned), Opanowane, Nieruszone; started = touched is an assumption, check against VYB-941 semantics in VYB-942
- Built only on mock gateway, no files of open PRs 140-143 touched, so no conflicts expected
- Card order left as is: hero, folders, stats already mirrors dashboard layout
