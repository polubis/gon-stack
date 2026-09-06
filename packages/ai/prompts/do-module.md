@packages/ai/rules/ @packages/ai/skills/framework/skills/do-ui/
Implement new module -> <module-name> in same code style -> pixel perfect  
for [N] provided designs, rwd, only static UI -> pixel perfect, use
Playwright MCP to verify (always).
Put it under apps/talent-orbit/src/modules -> <module-name>

<path-to-desktop-design-a.png>
<path-to-mobile-design-a.png>
<path-to-desktop-design-b.png> (if a 2nd variant/part exists)
<path-to-mobile-design-b.png>

Notes for next time:

- List all image paths in the message (attach/reference them) — that's what  
  triggers do-ui's "graphic required" check.
- If the flow has multiple steps/parts like this one, say so explicitly (e.g.
  "part 1 of 2") so I know to build multiple screens under one module rather
  than one component.
- I'll infer the destination path from the sibling modules if you don't  
  specify one, but naming it explicitly (like you did) skips a question.
