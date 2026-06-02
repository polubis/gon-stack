# Event Catalog & Event Discovery

## Refs

1. [Application Domains](../../../documentation/DOMAINS.md) — sections 3 (Event Catalog) and 4 (Event Discovery)

## Dictionary

- **[event]** - Core aggregate: name, description, [category], start date & time (required), end date & time (optional), address (street, number, postal code, [city_field]), coordinates (lat/lng), external link (optional), image (optional), [keyword] list, [organizer_info]
- **[event_owner]** - The authenticated user who created a given [event]
- **[admin]** - A user with the Admin role; can manage any [event] regardless of ownership
- **[authenticated_user]** - A user who has completed sign-in and holds an active session
- **[guest]** - An unauthenticated visitor with read-only access
- **[category]** - One of the fixed taxonomy values: Concert, Festival, Sports, Culture, Theatre, Food & Drink
- **[keyword]** - A free-text tag attached to an [event]; entered manually or suggested by LLM
- **[organizer_info]** - Contact or identity details of the entity hosting the [event]; stored as part of the [event] aggregate
- **[city_field]** - Normalized city string stored on each [event]; used as the match target for the city filter
- **[event_detail_page]** - Full read view of a single [event] aggregate; navigated to from the discovery results list
- **[event_card]** - Condensed visual representation of an [event] shown in the discovery results list
- **[date_label]** - Preset time-range option (e.g., Today, This Weekend, This Month) resolved to a concrete date range by the Polish Holiday Calendar domain

## Constraints

- [event] creation: `<role:authenticated_user>`, `<role:admin>`
- [event] update: `<role:event_owner>`, `<role:admin>`
- [event] delete: `<role:event_owner>`, `<role:admin>`
- [event] detail view: `<role:guest>`, `<role:authenticated_user>`, `<role:admin>`
- [event] discovery: `<role:guest>`, `<role:authenticated_user>`, `<role:admin>`
- [event] start_date: `<required:true>`
- [event] end_date: `<required:false>`
- [event] image: `<required:false>`
- [keyword] suggestions: `<provider:LLM>`
- [event] location scope: `<geography:Poland>`

## DoD

An [authenticated_user] can create, edit, and delete events with full attribute data, while any user (including [guest]) can discover events through name, category, city, and date filters and navigate to a full [event_detail_page].

### Event Creation

1. An [authenticated_user] can submit a creation form to create a new [event].
   1a. Required fields: name, [category], start date & time, address (street, number, postal code, [city_field]).
   1b. Optional fields: end date & time, external link, image, [keyword] list, [organizer_info].
2. Location input uses city/address autocomplete: user types, selects from suggestions, and [city_field] plus coordinates (lat/lng) are populated automatically via geocoding.
3. [keyword] input supports both manual entry and LLM-assisted suggestions surfaced inline during creation.
4. [category] selection is restricted to: Concert, Festival, Sports, Culture, Theatre, Food & Drink.
5. Submitting with all required fields valid creates the [event] and navigates the user to the new [event_detail_page].
6. Submitting with any required field missing surfaces a field-level validation error and does not create the [event]. <!-- auto -->

### Event Management

1. An [event_owner] can update any field of their own [event].
2. An [admin] can update any field of any [event].
3. An [event_owner] can delete their own [event]; deletion is permanent with no recovery.
4. An [admin] can delete any [event].
5. A [guest] or non-owner [authenticated_user] has no write access to any [event].

### Event Detail Page

1. The [event_detail_page] displays all [event] aggregate fields: name, description, [category], start date & time, end date & time (when set), address, external link (when set), image (when set), [keyword] list, [organizer_info], attendee count, and friends-attending list.
2. The [event_detail_page] is reachable by clicking an [event_card] in the discovery results list.
3. The [event_detail_page] is accessible to all users including [guest].
4. Edit and delete actions are rendered on the [event_detail_page] only for [event_owner] and [admin].

### Event Discovery — Search

1. The search interface exposes four filter fields: name (free text), [category] (dropdown), city (dropdown), date (dropdown of [date_label] values).
2. The name filter performs a free-text match against the [event] name field.
3. The [category] dropdown lists all valid categories; selecting one limits results to that [category].
4. The city dropdown options are "Cała Polska" (no city filter) and individual cities; filtering matches against the stored [city_field] on each [event].
5. The date dropdown lists preset [date_label] values (Today, This Weekend, This Week, This Month, and dynamic Polish holiday labels); each label resolves to a concrete date range via the Polish Holiday Calendar domain.
6. All four filters can be combined; returned results satisfy every active filter simultaneously.

### Event Discovery — Results

1. Matching events are presented as a scrollable list of [event_card] items.
2. Each [event_card] displays at minimum: event name, [category], start date & time, and [city_field].
3. Clicking an [event_card] navigates to the corresponding [event_detail_page].
4. When no events match the active filters, a visible empty-state message is shown to the user. <!-- auto -->
5. Results are accessible to all users including [guest].
