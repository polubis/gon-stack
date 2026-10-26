---
ticket: none
scope: repo
summary: Update privacy policy copy for YouTube, Cloudflare, logs
why: RODO audit item 2 found the policy missed YouTube click-to-load, Cloudflare, server logs, outbound links
date: 2026-10-26
tags: [privacy, rodo, kdebek]
---

- Privacy policy copy (`privacy-policy/presentation/copy.ts`, renderer `content.tsx`)
  - YouTube embed (youtube-nocookie) loads only after "Załaduj film"; Google receives IP + technical data as separate controller; link to policies.google.com/privacy
  - Cloudflare: hosting/CDN processor under DPA, Web Analytics only after consent; possible US transfer via EU-US DPF or SCC
  - Server logs (IP, user agent, time, URL) kept 7 days, then deleted (owner confirmed)
  - Google privacy policy is a real external link; `content.tsx` paragraphs may mix strings and `{href,label}` links (target blank, noopener)
  - Removed "funkcjonalne i marketingowe" purpose claim; no such cookies exist
  - New section 5 on outbound links (Booksy, Google, Facebook, Instagram, LinkedIn, YouTube); later sections renumbered, ids unchanged
  - lastUpdated set to 26 października 2026
- Open for owner: art. 9 health-data documentation not described
