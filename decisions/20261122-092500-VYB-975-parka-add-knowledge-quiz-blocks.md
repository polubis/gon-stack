---
ticket: VYB-975
scope: parka/knowledge
summary: Add safe quiz blocks to lesson markdown
why: Lessons needed interactive checks without storing answers or opening an HTML injection path.
date: 2026-11-22
tags: [knowledge, quiz, markdown, mcp]
---

- `quiz` fenced block in lesson markdown, items split by `---`, types text, single, multiple
  - invalid quiz source falls back to a plain code block
- answers live in component state only, status shows correct or incorrect after check
- parsed to React elements, no raw HTML; text input has clear button
- MCP course authoring guide teaches the quiz block, drops the separate answers reel advice
  - reel body descriptions of create_knowledge_lesson and update_knowledge_reel mention quiz blocks
  - guide test checks the section, the guide example was parsed by the real quiz parser once
- unit tests cover all three types, reset on remount and invalid source
- video evidence: use of quiz and its authoring in the reel editor, attached to the ticket
