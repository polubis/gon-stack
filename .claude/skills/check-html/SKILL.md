---
name: check-html
description: >
  Accessibility auditor for HTML markup or live URLs. Trigger on "check accessibility",
  "audit a11y", "review HTML", "check-html", or pasted URL/code for a11y review.
deps:
  mcps:
    - playwright # navigate + screenshot + axe in browser
    - a11y # axe-core scan, contrast, ARIA validation (public: npx a11y-mcp)
    - a11y-expert # WCAG mapping, fixes, APG patterns (no public package — see SETUP)
---

## SETUP

Run once before use.

### playwright

Bundled with Claude Code. No install.

### a11y

Add to `.claude/settings.local.json` (project) or `~/.claude/settings.json` (global):

```json
{
  "mcpServers": {
    "a11y": {
      "command": "npx",
      "args": ["-y", "a11y-mcp"],
      "type": "stdio"
    }
  },
  "permissions": {
    "allow": ["mcp__a11y__*"]
  }
}
```

Restart Claude Code after.

### a11y-expert

No public package. Two options:

- **Omit** — fallback to built-in WCAG knowledge (lower precision, no APG refs).
- **a11ypulse** — commercial MCP, covers audit + expert in one. [Setup](https://www.a11ypulse.com/features/mcp-server/), register as `"a11y-expert"` in `mcpServers`.

## ROLE

Orchestrator. Scan via `a11y`. Fixes via `a11y-expert` or built-in WCAG fallback. Own no a11y rules.

## INPUTS

| #   | Input        | Required | Rule                                                          |
| --- | ------------ | -------- | ------------------------------------------------------------- |
| 1   | **Target**   | Yes      | URL or HTML/JSX/TSX. Missing → ask "Paste code or URL." stop. |
| 2   | **Scope**    | No       | `full` (default) or `quick`. Unknown → warn + use `full`.     |
| 3   | **Language** | No       | `html`/`jsx`/`tsx`. Missing → infer (see LANGUAGE INFERENCE). |

## PRE-FLIGHT

Check `deps.mcps` before work.

| MCP           | Missing                                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `playwright`  | Hard stop.                                                                                                                         |
| `a11y`        | Hard stop. See SETUP → a11y.                                                                                                       |
| `a11y-expert` | Soft warn. Continue with built-in WCAG fallback. Print: `⚠ a11y-expert not found — fixes use built-in WCAG knowledge (see SETUP).` |

Hard stop:

```
Cannot run — missing MCP(s): <name>. See SETUP in skill file.
```

## TARGET DETECTION

Order:

1. `http://` or `https://` → URL.
2. `localhost` or `127.0.0.1` (any port) → URL, prepend `http://`.
3. `file://` → URL.
4. Otherwise → code.

Ambiguous → ask "URL or code snippet?" once, stop.

## LANGUAGE INFERENCE

- `React.FC`, `interface`, `.tsx` hint → `tsx`.
- `className=`, `{...}`, JSX self-close (`<Foo />`) → `jsx`.
- Otherwise → `html`.

Pass inferred language to `a11y-expert`.

## INPUT GUARD

Reject with `Cannot audit — target is not HTML/JSX/TSX markup.` if:

- Pure CSS (no HTML tags).
- Pure JS/TS (no JSX/HTML tags).
- Empty or whitespace.
- URL returns non-`text/html` Content-Type (e.g. JSON API).

## FLOW

**URL:**

1. `playwright` navigate.
   - 4xx/5xx → `Navigation failed: HTTP <status>.` stop.
   - Timeout >15 s → `Navigation failed: timeout.` stop.
   - Auth wall → `Navigation failed: requires authentication.` stop.
2. `playwright` screenshot → attach to report.
3. `a11y` full audit → collect violations.
4. Batch violations → `a11y-expert` or built-in fallback → WCAG, explanation, fix.
5. Render report.

**Code:**

1. `a11y` audit on markup.
2. Batch violations → `a11y-expert` or built-in fallback → WCAG, explanation, fix.
3. Render report.

## OUTPUT SHAPE

```
### Accessibility Report — <target>
> scope: <full|quick> · language: <html|jsx|tsx>

**Summary:** N findings — X critical · Y serious · Z moderate · W minor
```

0 findings → `No accessibility issues detected.` End.

\>50 findings → group by WCAG principle (Perceivable / Operable / Understandable / Robust) with counts. List critical + serious individually only. Note: `Showing critical/serious in full. Moderate/minor grouped.`

---

**Finding block** (repeat, sorted critical → serious → moderate → minor):

````
#### [SEVERITY] title
- **WCAG:** <criterion> (<level>)
- **Element:** `<selector or snippet>`
- **Problem:** one sentence from `a11y`.
- **Fix** (from `a11y-expert`):
```jsx|tsx|html
corrected code
` ``
````

---

**Cannot verify automatically** — `a11y` items needing manual check. Omit if empty.

`quick` scope → add `Quick scope — moderate/minor suppressed.` at top.

## RULES

1. Pre-flight first. Hard stop if MCP missing.
2. Never invent severity. Scan = `a11y`. Fixes = `a11y-expert` or built-in fallback.
3. Batch all findings to `a11y-expert` — one call, not per-finding.
4. Always pass language to `a11y-expert`.
5. Deduplicate by element + WCAG criterion.
6. Ask all missing inputs in one message.
