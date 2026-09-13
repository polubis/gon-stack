---
name: mti
description: >
  Make Technical Interview report. Takes raw interviewer notes about a candidate
  and produces a fully filled markdown report using the standard interview report template.
  Trigger when user provides interview notes, Q&A logs, or candidate feedback and wants a formatted report.
---

## ROLE

Raw interviewer input → audit report. Mocked/practice context, not hiring. No invented facts. Infer only what notes clearly imply. Ask for missing critical data first.

## INPUT

Candidate name, role, date, Q&A per topic, task notes, impressions. Any mix.

## STEPS

1. **Parse** — name, role, date, Q&A by topic, task notes, impressions.
2. **Gaps** — name/role missing → ask. Rest: infer or note minimal.
3. **Classify** — per question: ✅ full/accurate | ⚠️ right dir, missed detail (note what) | ❌ wrong/unknown.
4. **Section scores** — after each table: knowledge level 1–10 + one-line rationale.
5. **Gaps & Study Plan** — ❌/⚠️ only, grouped by topic. One bullet per concept: precise name + what was wrong + one concrete action to close it.
6. **Rate** — `Junior` / `Junior–Mid` / `Mid` / `Mid–Senior` / `Senior`. Base on correctness spread, task quality, depth. Thin input → ask first.
7. **Write** — every section filled. Specific, concrete. No filler.
8. **Output** — full report as markdown block.

## REPORT TEMPLATE

```markdown
# Technical Interview Report — {Candidate Name}

## 1. Report Date

**Date:** {YYYY-MM-DD}
**Interviewer:** {Interviewer Name}
**Position:** {Role Applied For}

## 2. Interview Description

{2–3 paragraphs. P1: scope, format, count. P2: performance — accuracy, depth, standouts. P3: thin-coverage areas + overall read.}

## 3. Asked Questions (RAW)

> ✅ Correct | ⚠️ Partially correct | ❌ Incorrect / Unknown

### {Topic Name}

| #   | Question | Result | Notes |
| --- | -------- | ------ | ----- |

{rows}

**Knowledge level: {1–10}** — {one-line rationale}

_(Repeat per topic)_

## 4. Practical Task Overview

**Task given:** {2–3 sentences: task, constraints, technologies.}

### Problems Observed

{bullet list}

### Positives

{bullet list}

## 5. Judgement and Summary

**Rating:** `{Junior | Junior–Mid | Mid | Mid–Senior | Senior}`

**Primary reasons:**

{3 concrete bullet points}

**Argumentation:**

{2–3 paragraphs. Strengths → specific gaps → highest-risk gaps. 2–4 sentences each. Tied to specific moments.}

## 6. Knowledge Level Summary

| Topic   | Score  |
| ------- | ------ |
| {Topic} | {1–10} |

**Overall score: {avg}/10**

## 7. Gaps & Study Plan

> One entry per ❌/⚠️ concept. Precise name → what the gap is → one concrete action to close it. No links.

### {Topic}

- **{Precise Concept Name}** — {what it is and what was wrong}; {one concrete action}.

_(Repeat per topic with gaps; omit clean topics)_

## 8. Growth Roadmap

{3–5 sentences, 2nd person. Level → next band → focus areas → timeline. No HR language. Actions live in §7.}
```

## RULES

- No footer, no meta commentary outside report.
- No placeholders — every bracket replaced.
- ⚠️ rows: note what was incomplete and why.
- ✅ rows: `—` in Notes unless worth highlighting.
- Gaps & Study Plan: ❌/⚠️ only. One bullet = concept name + gap + action. No links.
- Knowledge level: 1–10 per topic, after table, with rationale.
- Summary table: all topics + average.
- Growth Roadmap: no HR language. Narrative only — no action list.
- Seniority rating: §5 + echoed in summary.
- §7 concept names: precise only. "Microtask queue" ✅ — "JavaScript async" ❌. "infer in conditional types" ✅ — "TypeScript generics" ❌. Every entry tied to a specific ❌/⚠️.

### Anti-AI-tell rules

- Write as interviewer's account. No mention of notes, input, data points, inference.
- Banned phrases: "as recorded", "based on the input", "depth is inferred from", "a single data point", "insufficient data to establish".
- No inline note citations (e.g. `interviewer's note: "..."`).
- Low-coverage topics: state narrow scope in rationale. Don't explain why scoring is limited.
- No text walls: §2 max 3 paragraphs, §5 Argumentation max 3 paragraphs, each paragraph max 4 sentences.
