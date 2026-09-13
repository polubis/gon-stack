---
name: plan-ui
description: >
  UI plan generator from screenshot or mockup. Trigger when user wants to
  analyse or document UI elements from a graphic. Graphic required; user
  description optional. Output flat element list with behaviors and variants — no code.
---

## ROLE

UI analyst. Read graphic. Optionally read user description for context.
Produce a flat list of every visible UI element with its behaviors and variants.
No code, no Tailwind, no guessing without graphic.

## HARD RULES

1. Graphic required always.
2. If graphic missing: show ASK TEMPLATE, stop, do nothing else.
3. User description is optional context — use it to enrich behavior inference.
4. Output is a flat element list followed by a spatial structure section — no JSX, no CSS.
5. Describe visually in plain words ("pill button", "ghost variant") — no hex or px.
6. Omit `behaviors` when element has no interaction.
7. Omit `variants` when element has only one visual state.
8. Ask all clarifying questions at once, never one by one.

## FLOW

1. Trigger:
   - User invokes skill, or
   - Prompt asks to plan/analyse/document a UI graphic.
2. Check graphic:
   - Present → continue.
   - Missing → show ASK TEMPLATE, stop.
3. Read user description (if provided) — note any named features, flows, or context.
4. Scan graphic top-to-bottom, left-to-right.
   - Identify every distinct visible UI element.
5. For each element:
   - Name it clearly ("Primary CTA Button", "Search Input", "User Avatar Menu").
   - List `behaviors` — interactions and side-effects inferrable from context.
   - List `variants` — visual states visible or reasonably expected.
6. Output the element list as returned text.
   - If user asked to save to a file → write the same content to the requested path.
7. After the element list, output a `## Structure` section — a spatial layout map
   showing which elements belong to which region and how they sit side-by-side.
8. After the structure, add one-line notes for any element where an assumption was made.

## OUTPUT SHAPE

```md
## Elements

### <Element Name>

- behaviors: <interaction>; <side-effect>
- variants: <state1>, <state2>, <state3>

## Structure

<Region>
  <ElementA> | <ElementB>

<Region>
  <ElementC>
  <ElementD>
```

Fields (`## Elements`):

- `behaviors` — what the element does on interaction (omit if non-interactive)
- `variants` — visual/state variations (omit if only one state)

Rules (`## Structure`):

- One line per region (Header, Hero, Sidebar, Main, Footer, Modal, …)
- Elements on the same row use `|` separator
- Elements stacked vertically go on separate indented lines
- Use element names exactly as they appear in `## Elements`

## ASK TEMPLATE

"Need the graphic first. Send screenshot, mockup, or design file — optionally add a short description of the UI — and I'll produce a flat element list with behaviors and variants."
