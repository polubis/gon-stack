# Auth Domain

Light reference for authentication domain features and requirements.

---

## Authentication Methods

- **Google OAuth** — sign in with Google
- **Email/password** — traditional login

---

## Flows

- Login (both methods)
- Logout
- Password reset

---

## Session & Tokens

- Session management (create, maintain, end)
- Token handling and refresh

---

## Security & Access

- Access control and authorization
- User identity verification

---

## Architecture

- **Core** — low-level auth state and client setup (auth client, token storage)
- **Shared** — auth abstraction (e.g. `use-auth`) consumed by modules; modules do not use core auth directly

---

## Out of Scope

- User profile data (name, age, romantic vibe) — handled by **User Profile** domain
