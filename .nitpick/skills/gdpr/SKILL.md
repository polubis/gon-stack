---
name: gdpr
description: >
  GDPR/RODO document pack from the real app: scans code, DB schema and config for personal data,
  processors and retention, then drafts RoPA, privacy policy, DPA (art. 28), DPIA screening, TOMs,
  data subject rights procedure and breach procedure. Use when dev says "rodo", "gdpr", "DPA",
  "polityka prywatnosci", "RoPA", "DPIA", "paczka dokumentow prawnych", or invokes /gdpr.
---

# GDPR / RODO pack

Drafts only. Not legal advice. Every output opens with: `DRAFT - requires review by a qualified lawyer / DPO`.
Facts come from the repo. Unknown fact = `[TODO: <what>]`. Never invent controller data, retention, legal basis, processor terms.

## Inputs (ask once, only what repo cannot answer)

- App (`apps/<name>`), doc language (default: language of the app, else EN).
- Controller: legal name, address, contact, DPO (if any). Role: controller or processor for the client.
- Jurisdiction extras (PL: UODO, art. 8 child age 16; others: ask).
- Out dir (default `docs/legal/<app>/`).

## Step 1 - Scan (read-only)

Collect, with file path as source for each finding:

| Area | Where to look |
| --- | --- |
| Data categories | DB migrations/schema (`supabase/migrations`), Zod/domain types, forms, auth profile fields |
| Special categories (art. 9), children | health, biometrics, politics, beliefs, minors in schema/UI/copy |
| Collection points | forms, auth, file/avatar/receipt upload, analytics, cookies, localStorage |
| Processors / recipients | `package.json`, env/config, SDK imports: hosting, Supabase, email, analytics, payments, AI/OCR APIs |
| Transfers outside EEA | processor regions, US vendors, CDN, AI APIs |
| Retention / deletion | cron jobs, delete endpoints, soft-delete, storage lifecycle |
| Data subject rights | export/delete/rectify endpoints and UI |
| Security measures | RLS policies, auth, encryption, rate limits, audit/logs, backups |
| Existing legal pages | privacy-policy, cookies, terms pages in the app |

Log a table: data item | purpose (inferred) | source file | stored where | recipient. Mark guesses `(inferred)`.
Personal data found in repo fixtures/logs/real rows = stop, report, do not copy into docs.

## Step 2 - Gaps report

Before drafting list: missing legal basis, no deletion path, no export, unknown retention, non-EEA transfer without safeguard, cookies without consent, art. 9 data, children. Each gap = severity + fix suggestion + file.

## Step 3 - Draft pack

One markdown file each, same facts reused (single data inventory, no divergence):

1. `01-ropa.md` - record of processing (art. 30): purpose, categories of subjects/data, recipients, transfers, retention, TOMs ref. Per processing activity.
2. `02-privacy-policy.md` - art. 13/14 notice: controller, purposes + legal basis (art. 6), recipients, transfers + safeguards (SCC/adequacy), retention, rights (art. 15-22), complaint to authority, automated decisions. Plain language.
3. `03-dpa.md` - art. 28(3) agreement: subject matter, duration, nature/purpose, data types, subjects, controller instructions, confidentiality, security (art. 32), sub-processors (prior authorisation, list), assistance with rights/breach/DPIA, deletion/return, audit, transfers. Annexes: A processing details, B TOMs, C sub-processor list. Needed when the client is controller and we are processor, or when we engage a processor.
4. `04-dpia-screening.md` - art. 35 checklist (EDPB nine criteria). Verdict: DPIA required / not required + reasoning. Required -> outline DPIA sections.
5. `05-toms.md` - technical and organisational measures from real findings (RLS, auth, encryption, backups, access, logging), plus gaps.
6. `06-data-subject-rights.md` - procedure: channel, identity check, 1 month deadline (+2 months extension), per-right steps mapped to app endpoints.
7. `07-breach-procedure.md` - detect, assess, notify authority within 72 h (art. 33), notify subjects (art. 34), internal register, roles.
8. `00-gaps.md` - gaps report from step 2.

Skip a file only when clearly not applicable (e.g. no DPA when no processors); say why in `00-gaps.md`.

## Rules

- Cite article numbers; do not paraphrase law into new obligations.
- Legal basis per purpose is dev/lawyer decision: propose one, mark `(proposed)`.
- Consent only for what truly needs it (non-essential cookies, marketing); never default to consent.
- Docs for people: plain wording, tables, short. Placeholders visible: grep `TODO` must list every open fact.
- Never write real personal data, secrets, keys into docs.
- Do not change app code; code gaps go to the report (or backlog tasks if worker flow says so).

## Done check

- Every claim traces to a file or is marked `(inferred)`/`[TODO]`.
- Same processors/retention/purposes across all files.
- Report to dev: pack path, count of TODOs, top gaps, what needs lawyer.
