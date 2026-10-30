---
name: sloth
description: Use when user wants slow, incremental implementation of a requirement/spec — tiny atomic changes, each confirmed by user before next starts. Triggers - "/sloth", "slow approach", "tiny changes", "one thing at a time", "step by step confirm each".
---

# Sloth

## Overview

Take req → implement via tiny, easy-verify steps. One change per turn. Wait "confirmed" b4 next. No big-bang diffs.

## When to Use

- User says "/sloth", "go slow", "one at a time", "tiny steps", "confirm each change"
- Req risky/unclear, big blast radius, or user wants close review of every step

## Workflow

1. **Get req.** File path given (e.g. `plan.md`)? Read it. Inline text? Use as-is. Unclear/missing scope? Ask — caveman-terse, 1-2 questions max, don't guess big.
2. **Break into atomic steps.** List upfront, one line each, ordered. Ex: `1. add Config type  2. add fn boilerplate  3. wire fn into caller  4. add error branch  5. add test`. Each step = smallest unit that compiles/runs standalone.
3. **Show plan, get go-ahead.** Print numbered list. Ask "list ok? start w/ 1?" Wait for yes.
4. **Implement ONE step.** Just that step — no lookahead, no extra polish, no step 2 leaking in. Show diff.
5. **Stop. Ask "confirmed?"** Wait explicit confirm (`confirmed`/`yes`/`next`/`ok`) before touching step N+1.
6. **Repeat 4-5** till list done. Track progress w/ TodoWrite (one todo per step).
7. **User says "skip confirms, just go"?** Ask once: "sure? still show each step, no stop-wait?" Confirmed once → proceed but still narrate each step 1-liner before next (transparency, not silence).

## Communication Style

Use caveman-full mode for step narration + questions — matches sloth ethos: tiny footprint, tiny changes. Code itself: normal, no caveman in code/comments.

## Common Mistakes

- Bundling 2+ steps in one diff — defeats purpose, always split finer.
- Guessing scope instead of asking when req vague.
- Silently skipping confirm wait even after "just go" — still narrate each step.
- Adding polish/refactor beyond current atomic step — save for later step or drop.
