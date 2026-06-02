# Event Management

## Refs

1. [Application Domains](../../../documentation/DOMAINS.md)

## Dictionary

- **[event_aggregate]** - The core event entity composed of: name, description, category, start_date_time, end_date_time (optional), address (street, number, postal_code, city), coordinates (lat/lng), external_link, image (optional), keywords, and organizer_info
- **[event_owner]** - The [authenticated_user] who originally created a given event
- **[authenticated_user]** - A user who has completed login via any supported auth provider; can create events
- **[admin]** - A privileged role that can update and delete any event regardless of ownership
- **[category]** - One of the fixed taxonomy values: Concert, Festival, Sports, Culture, Theatre, Food & Drink
- **[keyword]** - A descriptive tag attached to an event; entered manually or accepted from AI-assisted suggestions
- **[geocoding]** - The automatic resolution of a selected city/address into lat/lng coordinates
- **[organizer_info]** - Data identifying the person or organization responsible for an event

## Constraints

- [event_aggregate] create: `<role:authenticated_user>`
- [event_aggregate] update/delete own: `<role:event_owner>`
- [event_aggregate] update/delete any: `<role:admin>`
- [event_aggregate] fields: `<field:name required>`, `<field:start_date_time required>`, `<field:category required>`, `<field:end_date_time optional>`, `<field:image optional>`
- [category] values: `<enum:Concert|Festival|Sports|Culture|Theatre|Food&Drink>`
- [keyword] source: `<type:manual>`, `<type:ai_suggested>`
- coordinates: `<source:geocoding>` <!-- auto -->

## DoD

Authenticated users can create, edit, and delete events with all required fields, location autocomplete with automatic geocoding, category selection, and manual or AI-assisted keyword tagging; event owners manage their own events while admins can manage any event.

### Event Creation

1. An [authenticated_user] can open an event creation form and submit a new [event_aggregate].
   1a. Form collects: name (required), description, [category] (required), start_date_time (required), end_date_time (optional), address with autocomplete, external_link, image (optional), [keyword] list, [organizer_info].
   1b. On successful submit the submitting user becomes the [event_owner] of the new event.
2. Submitting the form with any required field missing displays a field-level validation error and does not persist the event.
3. A successfully created event is immediately visible in the Event Discovery domain. <!-- auto -->

### Event Editing

1. An [event_owner] can open the edit form for their own event and update any field.
   1a. Changes are saved atomically; partial saves are not permitted. <!-- auto -->
2. An [admin] can open the edit form for any event and update any field.
3. A user who is neither the [event_owner] nor an [admin] has no access to the edit form for that event.

### Event Deletion

1. An [event_owner] can delete their own event.
   1a. Deletion requires explicit confirmation before the event is permanently removed. <!-- auto -->
2. An [admin] can delete any event.
3. A user who is neither the [event_owner] nor an [admin] is not presented with a delete option for that event.

### Location Input & Geocoding

1. The address field provides city/address autocomplete; after the user selects a suggestion, the city field and coordinates are populated automatically via [geocoding].
2. Coordinates (lat/lng) are never entered manually — they are always derived via [geocoding] from the selected address. <!-- auto -->
3. If [geocoding] returns no result, the form shows an inline error and blocks submission until a valid address with resolved coordinates is selected. <!-- auto: insufficient context -->

### Category & Keyword Tagging

1. The [category] field renders as a dropdown containing exactly the six taxonomy values defined by `<enum:Concert|Festival|Sports|Culture|Theatre|Food&Drink>`.
2. [keyword] tags can be added manually by typing free text into the keyword input.
3. The form offers AI-assisted [keyword] suggestions generated via LLM; the user can accept or dismiss each suggestion individually.
   3a. Accepting a suggestion appends it to the [keyword] list; dismissing it removes it from the suggestion panel without adding it. <!-- auto -->
4. The [keyword] field is optional; an [event_aggregate] can be saved with zero keywords. <!-- auto -->
