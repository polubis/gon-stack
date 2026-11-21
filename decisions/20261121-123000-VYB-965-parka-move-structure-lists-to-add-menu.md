---
ticket: VYB-965
scope: parka
summary: Move knowledge structure lists from badges to Dodaj menu
why: Kategorie, Katalogi and Tagi buttons cluttered the topic listing. Dodaj now opens those lists, each leading to its add view.
date: 2026-11-21
tags: [knowledge, ux]
---

- Removed Kategorie/Katalogi/Tagi buttons from the Tematy card in knowledge main
- Add menu options Katalogi, Kategorie, Tagi open the browse list modals instead of the new-form modals
- List dialog already has Dodaj leading to the form, so create flow stays two clicks deeper
- Topic and backlog topic options still open the form directly
- Test: add category now goes via menu then list then form; new test asserts no structure buttons
