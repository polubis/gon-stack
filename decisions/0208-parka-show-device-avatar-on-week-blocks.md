---
ticket: none
scope: parka
summary: Week blocks of time tasks show the device avatar like expense rows
why: A task with an assigned device must show its avatar the same way in every time view, not only in the day list
date: 2026-10-20
tags: [parka, time, tasks, devices, avatar]
---

- Week view blocks (all-day and hour grid) render the shared `DeviceBubble` when the task has a device, same component as expense rows
  - Block accessible name adds `, urządzenie: <name>`; tasks without a device unchanged
- Task row title gets a minimum width so the device badge no longer squeezes it in the narrow all-day column
- Month and year views stay colour dots and counts (no room for avatars)
- Test: week block names the device
