---
ticket: none
scope: repo
summary: Evidence skill saves proofs to gitignored root .evidences/
why: Proofs are artifacts; one fixed ignored dir keeps them out of commits and out of the repo root
date: 2026-10-14
tags: [evidence, skill, gitignore]
---

- `evidence` skill: final video + screenshots saved only to root `.evidences/`; skill checks `.gitignore` has `/.evidences/`
  - Scripts stay in scratch dir
- `.gitignore`: add `/.evidences/`
- Existing proof moved to `.evidences/`; tracked `stacked-modals-proof.webm` removed from repo root
