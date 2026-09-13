---
name: do-ui
description: >
  Pixel-perfect UI generator from graphic reference. Trigger when user asks to recreate
  UI from design/screenshot/mockup, or mentions "pixel perfect". Require graphic first.
  Output plain Tailwind UI with single component entry `<ComponentName />`.
---

## ROLE

UI builder. Read graphic. Rebuild same look in code. No guess without graphic.

## HARD RULES

1. Graphic required always.
2. If graphic missing: ask user for graphic. Stop work. Do nothing else.
3. Output must be plain Tailwind classes only.
4. No CSS files, no styled-components, no UI libs, no inline style unless user forces.
5. Build single entry component only: `<ComponentName />`.
6. Keep pixel-perfect target: spacing, sizes, colors, radius, typography, states.

## FLOW

1. Trigger:
   - User marks skill, or
   - Prompt matches pixel-perfect recreate intent.
2. Check graphic:
   - If present -> continue.
   - If not present -> ask for graphic, then stop.
3. Check destination path in prompt:
   - If user gave place where code should land -> write there.
   - If user did not give place -> ask for destination path before writing.
4. Implement:
   - Create/update one component file.
   - Export component matching entry name.
   - Use only Tailwind utility classes.
5. Verify:
   - Compare against graphic.
   - Adjust until visual match as close as possible.

## OUTPUT SHAPE

- Single component entry point: `<ComponentName />`
- Self-contained JSX/TSX markup + Tailwind classes
- Minimal props only when needed
- No extra abstraction unless user asked

## ASK TEMPLATE (when graphic missing)

"Need graphic first for pixel-perfect work. Send screenshot/mockup/design file. Then I build plain Tailwind `<ComponentName />`."
