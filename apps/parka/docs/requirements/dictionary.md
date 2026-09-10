---
title: Dictionary
type: dictionary
scope: shared
order: 1
deps:
  refs: refs.md
---

# Dictionary

## Actors

- **[anonymous]** - Visitor without a signed-in account.
- **[user]** - Person with a signed-in Parka account.

## Expenses

- **[expense]** - Recorded spending transaction derived from a **[receipt]** or manual entry.
- **[receipt]** - Submitted purchase document processed by AI.
- **[receipt_item]** - Single line item extracted from a **[receipt]**.
- **[category]** - Classification label applied to an **[expense]** or **[receipt_item]**.
- **[payment_method]** - Means used to pay for an **[expense]** (e.g. card ending in masked digits).

## Budgeting

- **[spending_limit]** - Monthly spending cap for the total budget or a specific **[category]**.
- **[savings_goal]** - Target amount and timeline for a planned purchase or savings objective.

## Recurring

- **[recurring_expense]** - Subscription or regular bill tracked on a repeating schedule.

## Analytics

- **[statistics]** - Aggregated spending data over a selectable time range.
- **[monthly_report]** - Period summary of spending activity available for retrieval and export.

## Notifications

- **[notification]** - Alert about limits, receipts, or other account activity.

## Platform

- **[cookie_consent]** - User confirmation of cookies and policy terms.
- **[privacy_policy]** - Document describing platform data handling and user privacy.
- **[ai_receipt_analysis]** - AI processing that extracts and categorizes **[receipt]** data.
- **[data_export]** - Exportable copy of the **[user]**'s financial data.
