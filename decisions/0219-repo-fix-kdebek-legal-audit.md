---
ticket: none
scope: repo
summary: Fix kdebek cookie consent per legal audit
why: Consent flow lacked reject option and contradicted the policy
date: 2026-10-22
tags: [kdebek, rodo, cookies]
---

- Cookie banner: equal "Odrzuć" button; categories cut to necessary + performance; consent v2 expires after 12 months
  - E2E and seeds updated, reject-all test added
- Withdrawing performance consent reloads the page so a running analytics script stops
  - New analytics specs: reject-all, expired consent, withdrawal
- Privacy policy: cookies section and update date only
