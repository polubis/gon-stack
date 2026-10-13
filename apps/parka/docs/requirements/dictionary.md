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
- **[profile_avatar]** - Image uploaded by **[user]** as their picture; stored as WebP variants of 32, 64, 128 and 256 pixels.
- **[device]** - Browser installation an **[expense]** was created from: stable id, readable name, type (mobile, desktop, tablet).
- **[device_avatar]** - Picture chosen by **[user]** to recognise a **[device]**; one of a fixed set, stored per account.
- **[device_photo]** - Image uploaded by **[user]** to recognise a **[device]**; stored as WebP variants of 32, 64, 128 and 256 pixels, shown instead of **[device_avatar]**.
- **[image_editor]** - Dialog opened after a valid image is picked: **[user]** selects the square area, zoom and rotation; confirming uploads the edited image.
- **[device_details]** - Facts the browser reports about a **[device]**: model code (when exposed), operating system with version, browser, screen resolution.
- **[device_color]** - Colour derived automatically from the **[device]** id, taken from a fixed set of theme colours.
- **[device_label]** - Name a **[device]** is shown under: the custom name of **[user]**, else a name built from **[device_details]**.
- **[payment_method]** - Means used to pay for an **[expense]** (e.g. card ending in masked digits).

## Budgeting

- **[spending_limit]** - Monthly spending cap for the total budget or a specific **[category]**.

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
