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
   - If the example is a **directory** → look for `AGENTS.md` in it and read it.
   - If the example is a **single file** → infer conventions and style directly
     from that file.
3. If `AGENTS.md` contains extra references, use them **only when you do not
   understand an idea**. If something explains a concept well enough, do not open
   the referenced file; if you do not understand the idea, read it.
4. The implemented functionality must be 100% compliant with the requirements
   and must match exactly the style you inferred from the ideal example.

## FLOW

1. Resolve requirements + ideal example + target path (ask for any missing).
2. Read requirements fully.
3. Learn style:
   - directory → read its `AGENTS.md` (architecture rules, conventions, links);
   - file → infer style from the file.
4. Map requirements onto the example's layer/folder structure.
5. Implement at the target path, mirroring naming, layering, file layout, and
   idioms of the example. Reuse the example's patterns; introduce nothing new.
6. Reconcile against requirements: every acceptance criterion is covered.

## RULES

1. Require both requirements and a style source; never proceed on one alone.
2. Requirements drive _what_; the ideal example drives _how it looks_.
3. Directory example → `AGENTS.md` is the primary style contract.
4. Open `AGENTS.md` references only to resolve genuine confusion, not by default.
5. Match the example's structure exactly: folders, file names, layering, idioms.
6. Do not invent new conventions, abstractions, or architecture.
7. Implementation must satisfy 100% of the requirements.
8. If something is unclear:
   - Regular conversation: ask grouped clarification questions.
   - In code: use minimal comments only where non-obvious.
