---
name: clone
description: Implement a feature from requirements in the exact style of an ideal example. Trigger on "clone", "implement like", "use X as example", "copy this module's style", "clone <module> and implement <feature>", or "build feature matching <example>". Requires both requirements and an ideal-example reference.
---

## ROLE

Implement functionality from given requirements in the exact code style of a
given ideal example. Always demand both: the requirements and the style source.
This is a doing skill — it writes code.

## INPUTS

Check all inputs before working. Missing required → list all gaps once, then
continue after the user replies. Never ask one at a time.

| #   | Input             | Required | Rule                                                                  |
| --- | ----------------- | -------- | --------------------------------------------------------------------- |
| 1   | **Requirements**  | Yes      | A `feature.md`-style doc or explicit prompt text. Missing → ask.      |
| 2   | **Ideal example** | Yes      | A directory (ideal module) or a single file to mirror. Missing → ask. |
| 3   | **Target path**   | Yes      | Where the new implementation lands. Missing → ask.                    |

## CORE INSTRUCTION

Your goal is to implement functionality based on the given requirements and the
given code style. Always require both.

1. Always read and fully understand the requirements first.
2. Then learn the code style:
   - If the example is a **directory** → read `references/frontend-architecture.md`
     and scan the module tree (layers, naming, file layout) to infer conventions.
   - If the example is a **single file** → infer conventions and style directly
     from that file.
3. Open files inside the example module **only when you do not understand an
   idea** from the architecture guide and folder layout. Prefer the smallest
   reference read that resolves the confusion.
4. The implemented functionality must be 100% compliant with the requirements
   and must match exactly the style you inferred from the ideal example.

## FLOW

1. Resolve requirements + ideal example + target path (ask for any missing).
2. Read requirements fully.
3. Learn style:
   - directory → `frontend-architecture.md` + scan the module (layers, idioms);
   - file → infer style from the file.
4. Map requirements onto the example's layer/folder structure.
5. Implement at the target path, mirroring naming, layering, file layout, and
   idioms of the example. Reuse the example's patterns; introduce nothing new.
6. Reconcile against requirements: every acceptance criterion is covered.

## RULES

1. Require both requirements and a style source; never proceed on one alone.
2. Requirements drive _what_; the ideal example drives _how it looks_.
3. Directory example → module layout + observed code is the style contract.
4. Open example source files only to resolve genuine confusion, not by default.
5. Match the example's structure exactly: folders, file names, layering, idioms.
6. Do not invent new conventions, abstractions, or architecture.
7. Implementation must satisfy 100% of the requirements.
8. If something is unclear:
   - Regular conversation: ask grouped clarification questions.
   - In code: use minimal comments only where non-obvious.
