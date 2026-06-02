---
version: 1.1
updated: 26.05.2026
---

# Application Domains

This document defines the core domains in the Event Search App application.

---

## 1. Identity & Access

**Responsibility:** User authentication, authorization, session management, and role-based access control.

**Key Concepts:**

- Google OAuth integration
- Facebook OAuth integration
- Email/password authentication
- Login/logout flows
- Session management and token refresh
- Role model: Guest, Authenticated User, Admin
- Access control per feature (browse vs. attend vs. manage)

**Out of Scope:**

- User profile data (handled by User Profile domain)

---

## 2. User Profile

**Responsibility:** User profile data, preferences, and attendance privacy settings.

**Key Concepts:**

- Display name and avatar
- Global attendance visibility toggle (public / private)
- Per-event attendance visibility override
- Profile completeness
- Friend list reference (owned by Social domain)

**Out of Scope:**

- Authentication flows (handled by Identity & Access domain)
- Friend relationship management (handled by Social domain)

---

## 3. Event Management

**Responsibility:** Creating, editing, and deleting events — the authoritative write-side for event data.

**Key Concepts:**

- Event aggregate: name, description, category, start date & time (required), end date & time (optional), address (street, number, postal code, city), coordinates (lat/lng), external link, optional image, keywords
- Location input: city/address autocomplete — user types, picks from suggestions, city + coordinates filled automatically via geocoding
- Category taxonomy: Concert, Festival, Sports, Culture, Theatre, Food & Drink
- Keyword tagging (manual + AI-assisted suggestions via LLM)
- All authenticated users can create events
- Event owners can update and delete their own events
- Admins can update and delete any event
- Organizer info

**Out of Scope:**

- Event discovery, search, and browsing (handled by Event Discovery domain)
- Attendance tracking (handled by Attendance domain)

---

## 4. Event Discovery

**Responsibility:** Browsing, searching, filtering, and viewing event details.

**Key Concepts:**

- Poland-only scope
- Search bar with four fields: name (free text), category (dropdown), location/city (dropdown), date (preset labels resolving to date ranges)
- City/location filter matches against the normalized city field stored on each event; options: "Cała Polska" (no filter) or a specific city
- Date filter uses preset labels (Today, This Weekend, This Week, This Month, etc.) rather than a raw date range picker
- Scrollable list of event cards displaying search results
- Event detail page: full read view of a single event aggregate — name, description, category, date & time, address, external link, image, keywords, organizer info, attendee count, and friends attending; navigated to from the event list

**Out of Scope:**

- Event data management (handled by Event Management domain)

---

## 5. Attendance

**Responsibility:** Tracking which authenticated users are attending which events, and exposing aggregate counts.

**Key Concepts:**

- Attend / un-attend an event
- Attendance record stored to user profile
- Public attendee count (integer, visible to all users)
- Friends-attending list (names/avatars, visible to authenticated users only)
- Per-event privacy override (public / private attendance)

**Out of Scope:**

- Friend relationship resolution (handled by Social domain)
- Calendar view of attended events (handled by Personal Calendar domain)

---

## 6. Social

**Responsibility:** Friend relationship management and friend-to-event invitation flow.

**Key Concepts:**

- Friend discovery by username or email
- Friend request lifecycle: send → accept / decline
- Bidirectional friendship model
- Friend network (used by Attendance and Personal Calendar domains)
- Event invite: authenticated user selects friends and sends invite
- Invite triggers an in-app notification (dispatched to Notification domain)

**Out of Scope:**

- Notification delivery (handled by Notification domain)
- Attendance state of friends (handled by Attendance domain)

---

## 7. Personal Calendar

**Responsibility:** Calendar views aggregating the user's own events and friends' public events.

**Key Concepts:**

- My Attended Events calendar — events the user has marked as attending
- Friends' Public Events calendar — events friends (with public attendance) are attending
- Export to device calendar (iCal/Google Calendar) — available to all users, no auth required
- Shared calendar view (authenticated users only)

**Out of Scope:**

- Attendance state resolution (handled by Attendance domain)
- Friend network resolution (handled by Social domain)

---

## 8. Notification

**Responsibility:** In-app notification delivery and feed management.

**Key Concepts:**

- Notification types (MVP): event invite from a friend
- Notification bell / feed UI
- Mark as read
- No push or email notifications for MVP (future iteration)

**Out of Scope:**

- Invite trigger logic (handled by Social domain)

---

## 9. Saved Events

**Responsibility:** Bookmarking events for later and presenting the authenticated user's saved event list.

**Key Concepts:**

- Save / unsave an event (bookmark, not attendance)
- Saved events list: paginated, sorted by event start date ascending
- Visible only to the owning user (private by default, no sharing)
- Save action available from event cards (list view) and event detail page
- Visual indicator on event cards and detail page showing whether the event is already saved
- Saved events that have passed are retained but visually marked as past

**Out of Scope:**

- Attendance tracking (handled by Attendance domain)
- Calendar aggregation of saved events (handled by Personal Calendar domain)
- Authentication and session (handled by Identity & Access domain)

---

## Domain Interactions

```
Identity & Access → User Profile (creates profile after first authentication)
Identity & Access → Event Discovery (determines available features: guest vs. auth)
Identity & Access → Event Management (Admin role gates CRUD operations)

User Profile → Attendance (privacy settings applied to attendance visibility)
User Profile → Social (display name/avatar used in friend and invite flows)

Event Management → Event Discovery (provides event data for search results and detail page)

Event Discovery → Attendance (friends-attending filter on event list)
Event Discovery → Event Management (reads event aggregates for detail page)

Attendance → Personal Calendar (attended events populate calendar view)
Attendance → Social (friends' public attendance exposed to their network)

Social → Notification (friend invite dispatches in-app notification)
Social → Personal Calendar (friends' public events visible in shared calendar)

Notification → Social (notification links back to the originating event invite)

Identity & Access → Saved Events (only authenticated users can save events)
Saved Events → Event Management (reads event aggregates to populate the saved list)
Saved Events → Personal Calendar (saved events surfaced as a calendar source)
```

---
