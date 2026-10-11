---
ticket: none
scope: parka
summary: "Expense popup: product rows simplified"
why: Icon, name and total are enough; the subtitle and category name were repeats
date: 2026-10-11
supersedes: 0151
---

- Decision: product row = category icon + name + total. Nothing else.
- Icon slightly smaller (`h-7 w-7`, was `h-8 w-8`).
- Dropped the category name under the product name (mixed-category expenses) and the `qty x unit price` subtitle.
- Supersedes the subtitle rules from 0151. Tests updated: icon present, no category name.
