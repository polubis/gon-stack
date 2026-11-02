---
ticket: none
scope: repo
summary: Add kdebek footer legal notice and complete policy rights
why: Follow-up legal scan found missing business identification in footer, thin data subject rights text and a misleading dead footer link
date: 2026-11-02
tags: [kdebek, rodo, legal]
---

- Footer: business notice block (firm, NIP, REGON, address) and policy link, from CEIDG data already in policy
- Removed footer "Regulamin" link: no terms page exists, it pointed to Booksy
- Policy (`copy.ts`)
  - Rights listed with RODO articles (15-18, 20, 21), 1 month answer time, how to exercise them
  - Consent withdrawal explained (cookie button or message), art. 7(3)
  - UODO complaint with address; data sources section; update date 2 November 2026
- Unit tests for footer notice and policy content; visual snapshots refreshed
- Scan found OK, unchanged: consent flow, reject parity, headers/CSP, self-hosted fonts, security.txt, no forms on site
- Needs owner/legal: terms (regulamin) page if wanted, accessibility statement not required for sole trader, DPAs (VYB-219/220)
