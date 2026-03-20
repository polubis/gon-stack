# UX/UI Design Document

## 1. General UX Principles

- **Clarity over density** — One primary action per screen where possible. Use clear labels and avoid jargon. Empty states explain what to do next.
- **Mobile-first, touch-friendly** — Primary use on small screens. Interactive targets at least 44×44 px; key actions in thumb reach. Layouts work from 360px width up.
- **Fast feedback** — Every action gets immediate visual feedback (loading, success, error). Inline validation; no dead-ends.
- **Consistent patterns** — Reuse the same components for similar tasks (e.g. all list rows, all form fields) so the app feels predictable.

## 2. Design System

### Palette

| Token | HEX | Usage |
|---|---|---|
| **primary-500** | `#2563EB` | Primary actions, links, active states (Tailwind `blue-500`) |
| **primary-600** | `#1D4ED8` | Hover/pressed for primary buttons (`blue-600`) |
| **primary-100** | `#DBEAFE` | Light backgrounds, selected row tint (`blue-100`) |
| **secondary-500** | `#64748B` | Secondary actions, labels (`slate-500`) |
| **success** | `#10B981` | Success messages, completed state (`emerald-500`) |
| **warning** | `#F59E0B` | Warnings, optional hints (`amber-500`) |
| **error** | `#EF4444` | Errors, destructive actions (`red-500`) |
| **info** | `#3B82F6` | Informational banners (`blue-500`) |
| **surface-0** | `#FFFFFF` | Page and card backgrounds |
| **surface-50** | `#F8FAFC` | Alternate section background (`slate-50`) |
| **surface-100** | `#F1F5F9` | Disabled inputs, dividers (`slate-100`) |
| **text-primary** | `#0F172A` | Headings, primary text (`slate-900`) |
| **text-secondary** | `#475569` | Secondary text (`slate-600`) |
| **text-tertiary** | `#64748B` | Captions, placeholders (`slate-500`) |
| **border-default** | `#E2E8F0` | Input and card borders (`slate-200`) |
| **border-hover** | `#94A3B8` | Hovered borders (`slate-400`) |

### Typography

#### Font Proposals

A small productivity-style app benefits from clear, neutral type. Below are two pairings; both are free (Google Fonts) and widely supported.

**Option A (Recommended): Inter + Inter**
- Headings and body: **Inter** (400, 500, 600) — neutral, highly legible. Single font keeps the UI calm and consistent.
- Tailwind v4 setup: `@theme { --font-sans: 'Inter', system-ui, sans-serif; --font-heading: 'Inter', system-ui, sans-serif; }`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap`

**Option B: Plus Jakarta Sans + Inter**
- Headings: **Plus Jakarta Sans** (600, 700) — slightly more character for titles.
- Body: **Inter** (400, 500) — same as above for body text.
- Tailwind v4 setup: `@theme { --font-sans: 'Inter', system-ui, sans-serif; --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif; }`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Plus+Jakarta+Sans:wght@600;700&display=swap`

#### Active Font Configuration

Use the **system font stack** until a choice is made. To activate a proposal: add the Google Fonts `<link>` in the app layout `<head>`, then set the `@theme` block in the global stylesheet. Apply `--font-heading` to headings via `h1, h2, h3 { font-family: var(--font-heading); }`.

#### Font Family Roles

- Headings: `--font-heading` (fallback: `font-sans`)
- Body: `--font-sans` (fallback: `system-ui, sans-serif`)
- Mono: `font-mono` (code or IDs only)

**Type scale (Tailwind):**

| Role | Tailwind | Size | Weight |
|---|---|---|---|
| h1 | `text-2xl` | 1.5rem (24px) | `font-semibold` |
| h2 | `text-xl` | 1.25rem (20px) | `font-semibold` |
| h3 | `text-lg` | 1.125rem (18px) | `font-semibold` |
| body | `text-base` | 1rem (16px) | `font-normal` |
| body-sm | `text-sm` | 0.875rem (14px) | `font-normal` |
| caption | `text-xs` | 0.75rem (12px) | `font-medium` |
| label | `text-sm` | 0.875rem (14px) | `font-medium` |

**Line heights:** Default (1.5 body, 1.25 headings). **Letter spacing:** Default.

### Spacing & Sizing

- **Base unit:** 4px (Tailwind `1` = 0.25rem)
- **Spacing scale:** xs `1` (4px), sm `2` (8px), md `4` (16px), lg `6` (24px), xl `8` (32px), 2xl `12` (48px)
- **Content width:** Mobile single column, `px-4`; tablet+ `max-w-xl` (36rem) centered for forms and lists
- **Min touch target:** 44×44 px (`min-h-11 min-w-11`)

### Component Tokens

**Border radius:** sm `rounded` (4px), md `rounded-md` (6px), lg `rounded-lg` (8px), full `rounded-full` for pills/avatars.

**Shadows:** sm (cards, inputs on focus), md (dropdowns), lg (modals).

**Borders:** Default 1px `border-slate-200`. Focus: `ring-2 ring-blue-500`. Selected: `border-blue-500`.

## 3. View-by-View Recommendations

### View: Sign In

- **Objective:** User signs in (e.g. email/password or OAuth) to access the app.
- **Key Components:** Logo, email input, password input, primary "Sign in" button, "Sign up" / "Forgot password" links.
- **Layout:** Single column, centered. `max-w-sm` card. Logo top, form stacked, spacing `space-y-4`. Min `py-12` from viewport edges.
- **Interaction Logic:** Inline validation on blur; errors below field with `text-red-500 text-xs` role="alert". Disable submit during request. On success, redirect to List (or onboarding if first time).
- **Responsive:** Same layout; on &lt;360px use `px-3`.

---

### View: List (Home)

- **Objective:** User sees their items and can add or open one.
- **Key Components:** Header (title + primary "Add" button), list of items (title + optional meta per row), empty state message when no items, settings/account entry (e.g. icon in header).
- **Layout:** Full-width list; `max-w-xl` centered. Header sticky. List scrollable. Each row min height 44px, tappable full width.
- **Interaction Logic:** Tap row → open Item detail. Tap "Add" → open Item detail (create). Empty state: short copy + "Add your first item" CTA.
- **Responsive:** List full width within container; rows stack vertically.

---

### View: Item Detail (Create / Edit)

- **Objective:** User creates a new item or edits an existing one.
- **Key Components:** Form fields (per MVP: e.g. title, optional description, optional status), "Save" primary button, "Cancel" or "Back" link, delete control (edit only, with confirmation).
- **Layout:** Single column form, `max-w-xl`. Fields `space-y-4`. Actions at bottom (Save + Cancel in a row).
- **Interaction Logic:** Inline validation; errors below fields. Save disabled until valid. On submit: loading state on button, then redirect to List or stay with success toast. Delete: confirm dialog (e.g. "Delete this item?") then redirect to List.
- **Responsive:** Form full width; buttons stack on very small screens if needed.

---

### View: Settings

- **Objective:** User changes preferences or account (e.g. profile, notifications, sign out).
- **Key Components:** Section headings, list of settings rows (label + value or toggle), "Sign out" at bottom.
- **Layout:** `max-w-xl` centered. Sections with `border-t border-slate-200`; rows min 44px height.
- **Interaction Logic:** Toggles and links behave immediately or open a sub-screen. Sign out: confirm if required, then redirect to Sign In.
- **Responsive:** Full-width rows; tappable with chevrons where navigation applies.

## 4. Technical Correction Ledger

| Original | Correction | Rationale |
|----------|------------|-----------|
| "Simple and clean" | Primary blue palette, `rounded-md` on inputs/buttons, consistent `text-sm`/`text-xs` for secondary text | Turned into concrete tokens |
| "Easy to use" | One primary CTA per view; 44px min touch targets; inline validation and loading states | Translated to measurable UX rules |
| "Responsive" | Single column + `max-w-xl` content; `px-4` on mobile; break at 640px if needed | Defined layout and breakpoint behavior |
| "Clear feedback" | Inline errors with role="alert"; disabled submit during request; success/error toasts or redirect | Specified feedback patterns |
