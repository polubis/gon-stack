---
ticket: VYB-976
scope: parka
summary: Add unified metadata management in every module
why: Categories, priorities, tags and catalogs were managed differently per module, priorities had no edit or delete.
date: 2026-11-22
tags: [ux, metadata, priorities]
---

- rule `ux-metadata-management` in nitpick: one list modal per entity, menu opens the list, forms show shared `ManageLink`
- time: priorities got update and delete (endpoints, handlers, list, edit and delete dialogs), no migration, 409 when in use
  - add menu opens categories and priorities lists, pickers show "Zarządzaj" instead of "Nowy"
- expenses: add menu opens the categories list, expense form shows "Zarządzaj" and refreshes categories after the list closes
- knowledge: topic form "+ Katalog" and "+ Tag" replaced by "Zarządzaj katalogami" and "Zarządzaj tagami"
- shared `ManageLink` replaces per-module link styles, `picker-link.ts` removed
