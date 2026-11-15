---
ticket: VYB-935
scope: parka/knowledge
summary: Add mocked Knowledge module with a brain fill summary
why: A new module shows knowledge folders tied to brain areas before any backend exists, so the UI can be judged and the API added later.
date: 2026-11-15
tags: [parka, knowledge, mock, ui]
---

- New module `modules/knowledge` follows the frontend architecture: domain, integration, core (EDA), presentation
- Backend is fully mocked behind `KnowledgeGateway` in `integration/contracts.ts`; swapping `repository.ts` gateway for a fetch one is the only change needed later
  - Mock keeps data in memory with a short delay, seeded with 6 folders and 14 nodes
- Layout mirrors finance: summary hero, folders list, statistics; mobile order is the same
- Folder points at one brain area; nodes carry category, priority, tags and learning status (same shape as tasks)
- Hero percent is the mean of the six areas, the number the brain announces
- Brain SVG (`brain-fill.tsx`) delegated to a Fable subagent with a props and token contract: tokens only, role group or img, reduced motion respected
- Brain area click filters folders; success toasts stay silent as in the rest of the app
- Own `ModalFrame` with a pinned footer, since the shared ModalFooter from VYB-934 is not on main yet
- Nav gets a Wiedza item, route `/app/knowledge/`
- Tests: domain unit, screen integration over the mock gateway, nav, brain, 3 e2e without backend
- Evidence: desktop and mobile recordings
