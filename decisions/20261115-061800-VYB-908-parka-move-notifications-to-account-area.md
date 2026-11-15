---
ticket: VYB-908
scope: parka/layout
summary: Move notifications and settings into the user panel
why: Notifications and the "Więcej" tab cluttered every header and nav; the avatar is the single user area, so count, bell and settings live there.
date: 2026-11-15
tags: [parka, navigation, notifications, ux]
---

- Unread count shows as a badge on the avatar (side nav, bottom nav, dashboard header avatar) in every view
- User panel gets Notifications (with count) and Settings links, closing the panel first, then navigating
- Bell removed from Finance, Time and Settings headers
- "Więcej" tab removed from side and bottom nav; settings reached via the panel, nothing highlighted outside Finance and Time
- Count travels through a small shared store (like profile summary) so shared code never imports the notifications module
- App shell mounts UnreadSync: reloads the total on every route change; notifications view mirrors its own optimistic count
- Evidence: video with stubbed API, 3 unread, panel and settings navigation
