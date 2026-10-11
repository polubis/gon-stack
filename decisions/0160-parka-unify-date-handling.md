---
ticket: none
scope: parka/dates
summary: Unify date handling in local datetime and UTC
why: UTC midnight showed as 02:00 in Poland and UTC day/month slicing put expenses on the wrong day
date: 2026-10-11
tags: [dates, timezone, forms]
---

- New `shared/date/date.ts` is the one date util, replacing the 3 duplicated format copies
  - Instants stay UTC ISO; day/month read in the viewer zone via `Intl`, plain `YYYY-MM-DD` never shifts
  - Black-box tests with zone shifts around midnight, year edge and DST
- Expense form uses a required `datetime-local` input, prefilled with now, stored as UTC ISO, unchanged value keeps the stored instant
  - Day-only scanned receipt date stays a plain day on the server and gets the current local time on the client, never midnight UTC
- Recurring payments are calendar days (DB `date` column): form sends plain `YYYY-MM-DD`, derived charges start at local midnight
- Local day/month fixed in period, dashboard/reports/expenses formats, handlers, expense detail link
- Dashboard bucketing: client sends its IANA `tz`, server counts days in that zone (default UTC)
  - Trade-off: one extra optional query param and a one-day wider DB range, in exchange for exact edges per user; a zone-less client still gets UTC days
