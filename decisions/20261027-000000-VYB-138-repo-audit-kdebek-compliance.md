---
ticket: VYB-138
scope: repo
summary: Audit kdebek RODO/security compliance and close small gaps
why: Site must be RODO, GDPR, legal and security compliant; audit found few gaps left after earlier hardening
date: 2026-10-27
tags: [kdebek, rodo, security, headers]
---

- Headers (`public/_headers`)
  - `Permissions-Policy` denies more features (accelerometer, gyroscope, magnetometer, payment, usb, interest-cohort)
  - Added `Cross-Origin-Opener-Policy: same-origin`, `X-Permitted-Cross-Domain-Policies: none`, CSP `upgrade-insecure-requests`
  - `Cross-Origin-Resource-Policy` skipped: could break link previews of own images
- Privacy policy (`copy.ts`)
  - Added statement on no automated decision-making / profiling (art. 13 ust. 2 lit. f RODO)
  - Email correspondence retention set to 30 days; phone data not stored
  - Cookie settings button described as available on every page
  - Booking section: Booksy notification emails to Gmail (name, phone, email, service, date/time), purpose, art. 6(1)(b)/(f), recipients Booksy and Google, US transfer note, 30 days; retention and recipients sections aligned
  - Controller is the client (Kacper Dębek, sole trader), policy written from his side; CEIDG data added: firma KACPER DĘBEK BIURO MASAŻ, NIP 7393979495, REGON 524421871 (public registry, supplied by dev)
  - Booking section clarified: site stores nothing, booking data arrives only via Booksy email to the client's Gmail
  - Last update date set to 27 October 2026
- Cookie settings on policy page
  - `Cookies` gets `manual` prop: banner never auto-opens, settings button always shown; layout now renders it on the policy page too
  - Withdraw/change consent works there (saved to the same storage key); e2e test added
- Audit: already OK
  - Analytics and YouTube load only after consent; reject as easy as accept; consent expires after 12 months; withdraw via reopen button
  - Self-hosted fonts, no third-party cookies, CSP with hashes, HSTS preload, security.txt, policy with controller, bases, recipients, transfers, retention, rights, UODO complaint
- Not done / needs owner
  - 30 days for Booksy emails assumed from email rule; client confirms against any accounting duty
  - Cloudflare DPA must be confirmed by whoever holds the Cloudflare account (client or developer)
  - Headers on production: check after deploy (securityheaders.com); locally verified via `wrangler dev` e2e
