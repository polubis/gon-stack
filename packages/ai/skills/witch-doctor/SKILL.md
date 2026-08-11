---
name: witch-doctor
description: Use when asked to audit, evaluate, review, or score a module's or codebase's quality — architecture, coupling, SOLID compliance, circular deps, barrel exports, style consistency, over-engineering — and produce a scored JSON or Markdown report.
---

# Code Quality Audit

## Overview

Audit module across 4 category: dependency architecture, module organization, design principles, code consistency. Score each 1-10, roll to overall score. Every issue gets 1-sentence fix + short real-world story showing consequence. Optional auto-fix via subagent.

## When to Use

- "audit/evaluate/review/score this module" or "check code quality"
- "how coupled is X", "any circular deps", "check SOLID", "check tree-shaking"
- Pre-merge architecture sanity check on a feature/module

## Workflow

1. **Resolve target.** Module path given in prompt? Use it. Not given? Ask user which path/module to audit — don't guess.
2. **Resolve rules.** Ask if ADR doc exists (path) w/ arch rules for this module/repo. Given? Read it, treat as ground truth — its rules override the built-in heuristics below, note any conflict as an issue itself. Not given? Fall back to **Built-in Heuristics** section.
3. **Resolve output.** Ask (unless already stated) report location + format (`json` or `markdown`). Default location if user has no preference: `reports/quality-audit-<module-slug>-<yyyy-mm-dd>.<ext>` in repo root.
4. **Resolve auto-fix.** Initial prompt already asked for fix/auto-fix/apply? Set `autoFix.requested = true`, skip asking again at step 8 — do it. Not mentioned? Ask at step 8 instead.
5. **Gather data.** Run `node scripts/find-circular-deps.js <module>` for cycles. Read module files (Grep/Read/Explore for larger modules). Check every metric in the table below against ADR rules (if given) or Built-in Heuristics (if not).
6. **Score.** Rate each of 4 category 1-10 per rubric below. `overallScore = round(avg(4 category scores), 1)`.
7. **Build issue list.** Per issue: `category`, `metric`, `severity` (high/medium/low), `file`, `line`, one-sentence `summary`, `story` (1-2 sentence, format below), one-sentence `fix`.
8. **Auto-fix (conditional).** `autoFix.requested` false? Ask user now, yes/no. Either path yes? Spawn `Agent` (isolation: `worktree`) — prompt = exact issue+fix list, scope pinned to "apply only these listed fixes, no extra refactor." Record outcome in `autoFix.applied` / `autoFix.appliedIssueIds`. Tell user the worktree path/branch to review — never push or merge yourself.
9. **Write report** to location + format from step 3. `json` = schema below verbatim. `markdown` = same data, category headings + issue table.

## Categories & Metrics

| Category                | Metric                  | #   | Detection                                                                                                                                |
| ----------------------- | ----------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency Architecture | Circular deps           | 1   | `scripts/find-circular-deps.js`                                                                                                          |
| Dependency Architecture | Layering violations     | 2   | infer layers from folder names, flag imports going "backwards" (low layer → high layer)                                                  |
| Dependency Architecture | Coupling                | 3   | count distinct external modules a file reaches into; flag concrete-only imports w/o abstraction                                          |
| Dependency Architecture | Cross-boundary refs     | 5   | module reaching into unrelated feature/domain folder, bypassing shared/packages                                                          |
| Module Organization     | Collocation             | 6   | test/style/types for a unit living far from the unit, inconsistent w/ rest of repo                                                       |
| Module Organization     | Barrel exports          | 9   | `index.ts` re-exporting whole submodule when only 1 named export used elsewhere; barrel-of-barrels chains                                |
| Design Principles       | SOLID                   | 7   | see per-letter heuristics below                                                                                                          |
| Design Principles       | Over-engineering factor | 8   | abstraction/indirection layers vs actual variability points                                                                              |
| Code Consistency        | Style differences       | 4   | mixed fn-decl/arrow/const, mixed var/let/const, mixed conditional-className patterns, mixed default/named export for same kind of module |

## Scoring Rubric (per category, 1-10)

| Score | Meaning                     |
| ----- | --------------------------- |
| 10    | no issues found             |
| 8-9   | cosmetic/minor only         |
| 6-7   | moderate, no urgent risk    |
| 4-5   | real risk, fix soon         |
| 2-3   | severe, active liability    |
| 1     | category effectively broken |

## Issue Story Format

Pattern: `Imagine [persona] [does ordinary thing] → [concrete bad outcome] because [root cause].` Keep to 1-2 sentences, name the mechanism not just the vibe.

Examples:

- _(circular dep)_ "Imagine adding one field to `UserModel` — the build hangs silently because `UserModel → OrderModel → UserModel` forms a cycle nothing catches until CI times out."
- _(high coupling)_ "Imagine Josh changes the internals of `PaymentService` — three unrelated components break overnight because they imported past its public API straight into internals."
- _(barrel export)_ "Imagine shipping a page that uses one helper — the whole 40kb `utils/index.ts` barrel rides along in the client bundle because the bundler can't see past the re-export."

## Built-in Heuristics (used when no ADR given)

**Layering:** infer layers from folders (e.g. `ui/` → `hooks/` → `services/` → `api/` → `lib/data/`). Flag any import from a lower layer into a higher one.

**Coupling:** >~8-10 direct external module imports in one file = flag. File importing concrete implementations everywhere, no interface/type seam = flag.

**Cross-boundary refs:** module importing files from an unrelated feature/domain tree, not via `shared/`/`packages/` = flag.

**Collocation:** unit's test/styles/types scattered away from the unit itself, and inconsistent with how the rest of the repo does it = flag.

**Barrel exports:** `export * from './x'` re-exporting a whole submodule for one named import elsewhere = flag. Chain of barrels importing barrels = flag (harder to trace, worse for tree-shaking).

**SOLID:**

- SRP: file/class doing >1 unrelated responsibility (unrelated method groups, mixed concerns disproportionate to file's stated purpose)
- OCP: growing switch/if-chain keyed on a type that clearly will keep growing
- LSP: subclass/impl narrowing or violating parent's contract
- ISP: huge interface forcing unrelated methods on every implementer
- DIP: high-level module importing a concrete low-level module directly instead of an abstraction

**Over-engineering factor:** count abstraction/indirection layers (factories, strategies, generic configs) vs actual variation points in the code. Indirection count clearly exceeding real variability = flag, cite what a direct version would look like.

**Style differences:** mixed function-declaration/arrow/const across similar files; mixed `var`/`let`/`const`; mixed conditional-className patterns (`cn()` helper vs raw ternary string); mixed default/named export for the same kind of module.

## Report Schema (JSON)

```json
{
  "module": "path/to/module",
  "generatedAt": "ISO-8601",
  "rulesSource": "path/to/ADR.md | built-in heuristics",
  "categories": {
    "dependencyArchitecture": {
      "score": 7,
      "metrics": [
        "circularDeps",
        "layeringViolations",
        "coupling",
        "crossBoundaryRefs"
      ]
    },
    "moduleOrganization": {
      "score": 8,
      "metrics": ["collocation", "barrelExports"]
    },
    "designPrinciples": { "score": 6, "metrics": ["solid", "overEngineering"] },
    "codeConsistency": { "score": 9, "metrics": ["styleDifferences"] }
  },
  "overallScore": 7.5,
  "issues": [
    {
      "id": "ISSUE-1",
      "category": "dependencyArchitecture",
      "metric": "coupling",
      "severity": "high",
      "file": "src/module/service.ts",
      "line": 42,
      "summary": "Service reaches into 12 unrelated modules directly",
      "story": "Imagine Josh changes the internals of PaymentService — three unrelated components break overnight because they imported past its public API straight into internals.",
      "fix": "Route external access through a single public index.ts instead of deep imports."
    }
  ],
  "autoFix": {
    "requested": false,
    "applied": false,
    "appliedIssueIds": [],
    "worktreePath": null,
    "subagentSummary": null
  }
}
```

Markdown format = same fields, one `##` heading per category (score in heading), then `## Issues` as a table (`id | severity | file:line | summary | fix`), stories as a blockquote under each row. `## Overall Score` section at end.

## Circular-Dep Script

`scripts/find-circular-deps.js` — zero-dependency Node script (no `npm install`, no `package.json` change), Tarjan SCC over a static import/require graph.

```
node scripts/find-circular-deps.js <targetDir> [--ext .ts,.tsx,.js,.jsx]
```

Outputs JSON: `{ root, filesScanned, cyclesFound, cycles: [[file,file,...], ...] }`. Only resolves relative (`./`, `../`) specifiers — bare/aliased imports (`@/...`, package names) skipped by design, note as a limitation in the report if module relies heavily on path aliases.

## Common Mistakes

- Skipping step 1/2 questions and guessing module/rules — ask, don't assume.
- Scoring without running the circular-dep script — always run it, even for small modules.
- Auto-fixing directly on the current branch — always isolate in a worktree, always let user review before merge.
- Padding `story` with fluff instead of naming the actual mechanism (import graph, bundler behavior, contract break).
