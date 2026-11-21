---
ticket: VYB-964
scope: parka/knowledge
summary: Reel viewer text selection, end-screen lesson nav, fullscreen textarea
why: Text could not be selected on phones, lesson buttons cluttered every reel, long texts lacked a full-screen editor.
date: 2026-11-21
tags: [knowledge, reels, mobile]
---

- Viewer stage uses select-text; pointer captured only after the axis locks as a swipe, so long press can select
- Removed prev/next lesson row from reel nav; end screen offers next and previous lesson
- New shared ExpandableTextarea, fullscreen editor stacked via URL modal, reused from time pattern
- Applied to reel editor, new reel, lesson and catalog descriptions
- Time DescriptionField left as is, not migrated to the shared component
