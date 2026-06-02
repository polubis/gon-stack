# Identity & Access

## Refs

1. [Application Domains](../../../../../../documentation/DOMAINS.md)

## Dictionary

- **[guest]** - Unauthenticated user with read-only access to public event data
- **[authenticated_user]** - Logged-in user who can attend events and interact with social features
- **[admin]** - Privileged user with full CRUD access to event catalog management
- **[oauth_provider]** - External authentication service (Google or Facebook) used to verify user identity
- **[session]** - Token-based record of an authenticated user's active login state
- **[access_token]** - Short-lived credential used to authorize API requests
- **[refresh_token]** - Long-lived credential used to obtain a new [access_token] without re-login

## Constraints

- [oauth_provider] scope: `<providers:google,facebook>`, `<mvp:true>`
- [admin] assignment: `<method:manual>`, `<self-registration:disabled>`
- [access_token] lifecycle: `<ttl:short_lived>`, `<storage:httponly_cookie>` <!-- auto -->
- [refresh_token] lifecycle: `<rotation:enabled>`, `<revocation:on_logout>` <!-- auto -->

## DoD

A user can register, log in via email/password or [oauth_provider] (Google, Facebook), maintain a persistent [session], and access role-appropriate features as [guest], [authenticated_user], or [admin].

### Authentication Methods

1. [guest] can browse public event data without logging in.
   1a. No authentication prompt is shown during passive browsing.
2. [authenticated_user] can register with email and password.
   2a. Password must be at least 8 characters and contain at least 1 uppercase letter. <!-- auto -->
   2b. Duplicate email registration returns a descriptive error without disclosing existing account details.
3. [authenticated_user] can log in with email and password.
   3a. Incorrect credentials return a generic error — no disclosure of which field is wrong.
4. [authenticated_user] can authenticate via Google [oauth_provider].
   4a. OAuth consent flow redirects back to the app and establishes a [session].
   4b. If the [oauth_provider] returns an error, the user sees a descriptive failure message.
5. [authenticated_user] can authenticate via Facebook [oauth_provider].
   5a. OAuth consent flow redirects back to the app and establishes a [session].
   5b. If the [oauth_provider] returns an error, the user sees a descriptive failure message.
6. [authenticated_user] can log out, which immediately terminates the active [session] and revokes the [refresh_token].

### Session Management

1. A valid [access_token] is issued upon successful login or [oauth_provider] callback.
   1a. [access_token] is stored client-side in a secure, HttpOnly cookie. <!-- auto -->
2. When the [access_token] expires, the [refresh_token] is used transparently to obtain a new one.
   2a. If the [refresh_token] is expired or invalid, the user is redirected to the login screen.
   2b. The redirect preserves the originally requested URL so the user lands on the intended page after re-login. <!-- auto -->
3. [session] state is preserved across page reloads and browser restarts without requiring re-authentication.

### Authorization & Role Access

1. [guest] can view event listings and event detail pages.
2. [authenticated_user] can attend events, view friends' attendance, and access the personal calendar.
3. [admin] can create, edit, and delete events in the Event Catalog.
   3a. [admin] role is granted manually — no self-registration or self-promotion path exists.
4. Access to a role-gated feature without sufficient permissions is handled as follows:
   4a. [guest] accessing an [authenticated_user]-only feature is redirected to the login screen.
   4b. [authenticated_user] accessing an [admin]-only feature receives a 403 response or equivalent UI block.
