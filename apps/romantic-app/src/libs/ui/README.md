# UX/UI Design Document

## 1. General UX Principles

- **Low-pressure intimacy** — The app deals with sensitive relationship topics. Every screen must feel safe, warm, and non-judgmental. Use soft language, gentle transitions, and allow users to skip or pause at any point without penalty messaging.
- **Mobile-first, thumb-friendly** — Primary usage is two people on their phones sitting together. All interactive targets must be at least 44×44 px, critical actions placed in the bottom half of the viewport, and layouts must work on 360px-wide screens.
- **Simultaneous but private** — During game sessions both players interact at the same time without seeing each other's answers. The UI must clearly communicate "waiting for partner" states and never leak the other player's response before the reveal.
- **Progressive disclosure** — Start with easy, lighthearted categories and surface harder/sensitive topics only when the couple opts in. Difficulty badges and content warnings appear before sensitive questions so users always have informed consent.
- **Playful competition, not pressure** — Scoring (+1/0/−1) and the win condition (10 pts) should feel like a fun game, not a relationship test. Use celebratory micro-animations for matches, neutral treatment for mismatches, and avoid negative/failure language.

## 2. Design System

### Palette

| Token | HEX | Usage |
|---|---|---|
| **primary-500** | `#EC4899` | Primary actions, active states, progress indicators (Tailwind `pink-500`) |
| **primary-600** | `#DB2777` | Hover/pressed state for primary buttons (`pink-600`) |
| **primary-300** | `#F9A8D4` | Inactive progress segments, subtle highlights (`pink-300`) |
| **primary-200** | `#FBCFE8` | Light tint backgrounds, step indicators (`pink-200`) |
| **primary-50** | `#FDF2F8` | Card backgrounds on primary sections (`pink-50`) |
| **secondary-500** | `#8B5CF6` | Accent for categories, badges, secondary CTA (`violet-500`) |
| **secondary-600** | `#7C3AED` | Hover for secondary actions (`violet-600`) |
| **secondary-100** | `#EDE9FE` | Light accent backgrounds (`violet-100`) |
| **success** | `#10B981` | Matched answers, compatibility high (`emerald-500`) |
| **warning** | `#F59E0B` | Time running low, moderate compatibility (`amber-500`) |
| **error** | `#EF4444` | Validation errors, mismatched answers (`red-500`) |
| **info** | `#3B82F6` | Educational tips, informational banners (`blue-500`) |
| **surface-0** | `#FFFFFF` | Page background, card backgrounds |
| **surface-50** | `#F9FAFB` | Alternate section backgrounds (`gray-50`) |
| **surface-100** | `#F3F4F6` | Input backgrounds on disabled, dividers (`gray-100`) |
| **text-primary** | `#111827` | Headings, primary body text (`gray-900`) |
| **text-secondary** | `#374151` | Secondary body text (`gray-700`) |
| **text-tertiary** | `#6B7280` | Captions, placeholders, helper text (`gray-500`) |
| **border-default** | `#D1D5DB` | Input borders, card borders (`gray-300`) |
| **border-hover** | `#F9A8D4` | Hovered input borders (`pink-300`) |

### Typography

#### Font Proposals

The romantic/relationship niche benefits from typefaces that feel warm, personal, and slightly soft — avoiding both sterile corporate sans-serifs and overly decorative scripts. Below are three vetted pairings ranked by recommendation. All are free (Google Fonts) and have excellent language coverage.

**Option A (Recommended): Nunito + DM Sans**
- Headings: **Nunito** (700) — rounded terminals give a friendly, approachable feel without being childish. Excellent for h1–h3.
- Body: **DM Sans** (400, 500) — clean geometric sans with slightly humanist proportions. Highly legible at small sizes (14px body). Good for forms, labels, and long quiz text.
- Why: Nunito's softness aligns with the "low-pressure intimacy" UX principle. DM Sans keeps body text crisp and professional.
- Tailwind v4 setup: `@theme { --font-sans: 'DM Sans', system-ui, sans-serif; --font-heading: 'Nunito', system-ui, sans-serif; }`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Nunito:wght@600;700;800&display=swap`

**Option B: Quicksand + Inter**
- Headings: **Quicksand** (600, 700) — rounded geometric sans with a playful, youthful character. Slightly more casual than Nunito.
- Body: **Inter** (400, 500, 600) — the gold standard for UI body text. Variable font with optical sizing. Already the Tailwind default `font-sans` fallback.
- Why: Quicksand is more playful (fits "gamified" tone), Inter is ultra-safe for body text. Lower risk pairing since Inter is battle-tested.
- Tailwind v4 setup: `@theme { --font-sans: 'Inter', system-ui, sans-serif; --font-heading: 'Quicksand', system-ui, sans-serif; }`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Quicksand:wght@600;700&display=swap`

**Option C: Outfit + Source Sans 3**
- Headings: **Outfit** (500, 600, 700) — modern geometric sans with slight rounding. More neutral than Nunito/Quicksand but still warm.
- Body: **Source Sans 3** (400, 600) — Adobe's open-source humanist sans. Excellent for longer reading passages (educational tips, question text).
- Why: More mature/understated pairing. Suits if the audience skews older (30+) or if the tone should feel less "app-like" and more editorial.
- Tailwind v4 setup: `@theme { --font-sans: 'Source Sans 3', system-ui, sans-serif; --font-heading: 'Outfit', system-ui, sans-serif; }`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Source+Sans+3:wght@400;600&display=swap`

#### Active Font Configuration

Until a final choice is made, the codebase uses the **system font stack** (`font-sans` default). To activate a proposal, add the Google Fonts `<link>` to the Astro layout `<head>` and update `global.css` with the `@theme` block from the chosen option. Apply `font-heading` to headings via a utility class or CSS rule: `h1, h2, h3 { font-family: var(--font-heading); }`.

#### Font Family Roles

- Headings: `--font-heading` (see proposal above, falls back to `font-sans`)
- Body: `--font-sans` (see proposal above, falls back to `system-ui, sans-serif`)
- Mono: `font-mono` (for debug/reference only)

**Type scale (Tailwind utilities):**

| Role | Tailwind class | Size | Weight | Extra |
|---|---|---|---|---|
| h1 | `text-4xl` | 2.25rem (36px) | `font-semibold` | `text-balance` |
| h2 | `text-3xl` | 1.875rem (30px) | `font-semibold` | `text-balance` |
| h3 | `text-2xl` | 1.5rem (24px) | `font-semibold` | `text-balance` |
| h4 | `text-xl` | 1.25rem (20px) | `font-semibold` | `text-balance` |
| h5 | `text-lg` | 1.125rem (18px) | `font-semibold` | `text-balance` |
| h6 | `text-base` | 1rem (16px) | `font-semibold` | `text-balance` |
| body (p1) | `text-base` | 1rem (16px) | `font-normal` | `text-pretty` |
| body-sm (p2) | `text-sm` | 0.875rem (14px) | `font-normal` | `text-pretty` |
| caption | `text-xs` | 0.75rem (12px) | `font-medium` | — |
| label-lg (l1) | `text-sm` | 0.875rem (14px) | `font-semibold` | `uppercase tracking-[0.18em]` |
| label-sm (l2) | `text-xs` | 0.75rem (12px) | `font-medium` | — |

**Line heights:** Tailwind defaults (1.5 for body, 1.25 for headings).
**Letter spacing:** Default except l1 labels which use `tracking-[0.18em]`.

### Spacing & Sizing

- **Base unit:** 4px (`1` in Tailwind = 0.25rem = 4px)
- **Spacing scale:**
  - xs: `1` (4px)
  - sm: `2` (8px)
  - md: `4` (16px)
  - lg: `6` (24px)
  - xl: `8` (32px)
  - 2xl: `12` (48px)
  - 3xl: `16` (64px)
- **Grid system:**
  - Mobile: single column, `px-4` (16px) horizontal padding
  - Tablet+: `max-w-lg` (32rem / 512px) centered for form/card views; `max-w-3xl` (48rem / 768px) for content pages
  - Game views: full-width on mobile, `max-w-md` (28rem / 448px) centered on desktop
- **Min touch target:** 44×44 px (`min-h-11 min-w-11`)

### Component Tokens

**Border radius:**

| Token | Tailwind | Value | Usage |
|---|---|---|---|
| radius-sm | `rounded` | 4px | Small chips, badges |
| radius-md | `rounded-md` | 6px | Inputs, buttons, option cards |
| radius-lg | `rounded-lg` | 8px | Cards, modals |
| radius-xl | `rounded-xl` | 12px | Large cards, bottom sheets |
| radius-full | `rounded-full` | 9999px | Avatars, progress bars, pill badges |

**Shadow scale:**

| Token | Tailwind | Usage |
|---|---|---|
| shadow-sm | `shadow-sm` | Subtle card elevation, inputs on focus |
| shadow-md | `shadow-md` | Floating cards, dropdowns |
| shadow-lg | `shadow-lg` | Modals, bottom sheets |

**Border widths:**
- Default: `border` (1px) with `border-gray-300`
- Focus ring: `ring-2 ring-pink-500`
- Active/selected: `border-pink-500` (1px)

## 3. View-by-View Recommendations

### View: Authentication (Login / Sign Up)

- **Objective:** Users authenticate via Google OAuth or email/password to access the app.
- **Key Components:**
  - App logo and tagline
  - Google OAuth button (full-width, outlined, with Google icon)
  - Divider with "or" text
  - Email input field
  - Password input field
  - "Log in" primary button
  - "Sign up" link / toggle
  - "Forgot password" link
- **Layout:** Single column, vertically centered on viewport. `max-w-sm` (24rem / 384px) card centered horizontally. Logo at top, form fields stacked below. Minimum `py-16` vertical spacing from viewport edges.
- **Interaction Logic:**
  - Google OAuth: redirect flow, show loading spinner on button during redirect
  - Email/password: inline validation on blur. Errors displayed below each field with `text-red-500 text-xs` role="alert"
  - Disable submit button during request (`disabled:opacity-50`)
  - On success: redirect to Profile Setup (if no profile) or Dashboard (if profile exists)
- **Responsive Notes:** Already mobile-first at `max-w-sm`. On very small screens (<360px), reduce horizontal padding to `px-3`.

---

### View: Profile Setup (2-step wizard)

- **Objective:** New users create their profile with name, age, and romantic vibe traits.
- **Key Components:**
  - Step progress indicator (2 segments, colored bar)
  - Step 1: displayName text input, age number input
  - Step 2: 8 romantic vibe questions — scale buttons (1–5), option grids (2-col or 1-col), number input
  - "Next" / "Back" / "Create profile" buttons
  - Validation error messages per field
  - Success / error banners
- **Layout:** Single column, `max-w-lg` centered. Progress bar at top spanning full width. Form fields stacked with `space-y-6`. Navigation buttons at bottom in a flex row (`justify-between`).
- **Interaction Logic:**
  - Step 1 → Step 2: validate name + age via `trigger()` before advancing
  - Step 2 → Submit: full form validation + API call
  - Scale questions: 5 equally-sized buttons in a flex row. Selected = `bg-pink-500 text-white`, unselected = `bg-white border-gray-300`
  - Option questions: grid of pill buttons. Selected state same as scale
  - Server errors: map Zod issues back to fields; if error is on step 1 field, navigate back to step 1
  - Loading state: "Creating..." on submit button, all inputs disabled
- **Responsive Notes:** Scale button row remains 5-across on all widths (each button `flex-1`). Option grids use `grid-cols-2` on mobile for short labels, `grid-cols-1` for long labels.

---

### View: Dashboard (Home)

- **Objective:** Authenticated users see their profile summary, can create/join game rooms, and access settings.
- **Key Components:**
  - Top bar: user avatar (or initials circle), display name, settings gear icon
  - Romantic vibe summary card (compact text summary from profile)
  - "Create Room" primary CTA button (large, full-width on mobile)
  - "Join Room" secondary CTA button (outlined)
  - Room code input field (for joining by code)
  - Recent games list (if any — scrollable, max 5 items shown)
- **Layout:** Single column, `max-w-lg` centered. Top bar fixed at top. Content area with `space-y-6` between sections. CTA buttons stacked on mobile, side-by-side on tablet+.
- **Interaction Logic:**
  - "Create Room" → navigates to Room Lobby as host, generates room code
  - "Join Room" → validates room code input, then navigates to Room Lobby as guest
  - Room code: 6-character alphanumeric, `uppercase` input with `tracking-widest text-center font-mono text-lg`
  - Recent games: tap to view answer history for that session
- **Responsive Notes:** On mobile, CTA buttons are stacked full-width. On `sm:` breakpoint, buttons go side-by-side in a 2-column grid.

---

### View: Room Lobby (Waiting Room)

- **Objective:** Both players gather in a room before starting a game session. Host shares a room code; guest enters it.
- **Key Components:**
  - Room code display (large, monospace, copy-to-clipboard button)
  - Player 1 card (host — name, avatar/initials, "Ready" badge)
  - Player 2 card (guest — placeholder until joined, then name + avatar)
  - "Start Game" button (enabled only when both players are in the room)
  - Category selection grid (8 categories + 3 creative types as selectable cards)
  - Win threshold selector (default 10, options: 10, 15, 20)
- **Layout:** `max-w-md` centered. Room code prominently at top (`text-3xl font-mono tracking-widest text-center`). Two player cards side-by-side below (`grid-cols-2 gap-4`). Category grid below as a scrollable area with `grid-cols-2 gap-3` of cards. Start button fixed at bottom of viewport or at end of scroll.
- **Interaction Logic:**
  - Real-time updates via WebSocket: player join/leave reflected instantly
  - Waiting state: Player 2 card shows pulsing placeholder (`animate-pulse bg-gray-200 rounded-lg`)
  - Category cards: multi-select, each toggles between selected (`bg-violet-100 border-violet-500`) and unselected (`bg-white border-gray-300`)
  - At least 1 category must be selected to enable "Start Game"
  - "Start Game" button: only visible to host. `bg-pink-500 hover:bg-pink-600 text-white`. Disabled with `opacity-50` until conditions met.
- **Responsive Notes:** Player cards stack vertically on very narrow screens (<380px). Category grid stays 2-col on all supported widths.

---

### View: Game Session — Standard Question

- **Objective:** Both players answer a question simultaneously without seeing each other's response.
- **Key Components:**
  - Score bar: both player names + current scores, fixed at top
  - Category badge + difficulty badge (Easy/Medium/Hard with color coding)
  - Question text (centered, `text-lg font-medium`)
  - Answer area (varies by question type):
    - Multiple choice: vertical stack of option buttons
    - Scale (1–5): horizontal button row (same pattern as romantic vibe)
    - Yes/No: two large buttons side-by-side
    - Open text: textarea with character count
  - Timer bar (thin horizontal progress bar, shrinks left-to-right, color shifts green→amber→red)
  - Action buttons: "Skip" (text button), "Save for later" (text button)
  - "Waiting for partner..." overlay (shown after submitting your answer)
- **Layout:** Full viewport height. Score bar sticky at top (48px). Question + answers centered vertically in remaining space. Timer bar fixed at bottom above action buttons. `max-w-md` centered.
- **Interaction Logic:**
  - Timer: starts on question display. Visual bar shrinks. At 75% elapsed, bar turns amber. At 90%, turns red. At 100%, auto-submit empty answer (0 pts).
  - Answer submission: tap option → immediately submit (no confirm step for multiple choice/scale/yes-no). Open text has explicit "Submit" button.
  - After submission: dim the answer area, show "Waiting for partner..." with a subtle spinner
  - Content warning: before hard-level questions in Sexual Intimacy, Trust, or Conflicts categories, show a dismissable banner: "This question touches a sensitive topic. You can skip it anytime."
  - Difficulty badge colors: Easy = `bg-emerald-100 text-emerald-700`, Medium = `bg-amber-100 text-amber-700`, Hard = `bg-red-100 text-red-700`
- **Responsive Notes:** Multiple choice options are full-width stacked on all sizes. Scale row stays horizontal. Open text gets `min-h-[120px]`.

---

### View: Game Session — Drawing Question

- **Objective:** Both players draw a picture simultaneously. LLM image recognition compares drawings.
- **Key Components:**
  - Score bar (same as standard)
  - Question text (e.g., "What is his favorite sport?")
  - Canvas area (square, at least 280×280 px on mobile)
  - Drawing toolbar: brush size (3 options), color palette (8 colors), eraser, undo, clear
  - "Submit Drawing" button
  - Timer bar
- **Layout:** `max-w-md` centered. Question at top. Canvas centered below, constrained to square aspect ratio (`aspect-square max-w-[320px] mx-auto`). Toolbar below canvas as a single horizontal row. Submit button at bottom.
- **Interaction Logic:**
  - Canvas: touch/mouse drawing via HTML5 Canvas or library (Fabric.js / Konva.js)
  - Toolbar buttons: icon-only, 32×32px min, with tooltips on hover (desktop)
  - On submit: capture canvas as PNG, send to backend → LLM image recognition
  - Waiting state after submit: show "Analyzing drawings..." with spinner
  - If LLM match uncertain: show manual yes/no confirmation prompt
- **Responsive Notes:** Canvas width = `min(100vw - 32px, 320px)`. Toolbar wraps to two rows if viewport < 340px.

---

### View: Game Session — Music Question

- **Objective:** Both players enter a song name. If they match, the song plays on YouTube.
- **Key Components:**
  - Score bar (same as standard)
  - Question text (e.g., "What's your favorite song right now?")
  - Text input for song name (`text-lg` for readability)
  - "Submit" button
  - Timer bar
  - YouTube embed (hidden until match, then expands inline)
- **Layout:** Same structure as standard question. Song input centered, full-width within `max-w-md`. YouTube embed appears below the results reveal as a 16:9 iframe.
- **Interaction Logic:**
  - On both answers submitted: compare. If match → auto-play YouTube embed immediately (even before game ends)
  - YouTube player: `aspect-video` container, responsive width. Autoplay with controls visible.
  - If no match: show results normally, no player
- **Responsive Notes:** YouTube embed goes full-bleed on mobile (negative margin to fill screen width). On desktop stays within `max-w-md`.

---

### View: Game Session — Trash Talk Question

- **Objective:** Word guessing game with voice input. One player picks a word, the other guesses via spoken clues.
- **Key Components:**
  - Score bar (same as standard)
  - Phase 1 (Word Picker): 4 word suggestion cards in a 2×2 grid
  - Phase 2 (Guesser): required starting letter displayed large (`text-5xl font-bold text-pink-500`), voice input button (large circular microphone icon), attempt counter (3 dots/circles), spoken word display (live transcription)
  - LLM verification status indicator
  - Timer bar
- **Layout:** `max-w-md` centered. Phase 1: 4 cards as `grid-cols-2 gap-3`, each card `py-6 text-center text-lg`. Phase 2: letter at top center, mic button centered below (`w-20 h-20 rounded-full bg-pink-500`), attempt dots below mic, transcription text below dots.
- **Interaction Logic:**
  - Word Picker phase: tap one of 4 cards → selected card highlights, others fade. Confirm with "Lock in" button.
  - Guesser phase: hold mic button to record (or tap to toggle). Voice recognition transcribes in real-time.
  - LLM verifies each attempt: (1) starts with required letter, (2) not the secret word, (3) attempt count ≤ 3
  - Attempt dots: filled = used, outline = remaining. Color: `bg-gray-300` → `bg-pink-500` as used
  - If cheating detected (wrong letter, said the word, >3 attempts): show red banner "Foul! −1 point" with brief explanation
  - If correct guess: green celebration animation
- **Responsive Notes:** Mic button stays centered and large on all sizes. Word cards remain 2×2 grid.

---

### View: Results Reveal (after each question)

- **Objective:** Show both players' answers side-by-side and the scoring outcome.
- **Key Components:**
  - Player 1 answer card (left)
  - Player 2 answer card (right)
  - Match indicator between cards: checkmark (match, green) or X (mismatch, red) or dash (no answer, gray)
  - Points awarded text (+1 / 0 / −1)
  - Updated score bar (animated count-up)
  - Educational tip card (collapsible, `bg-blue-50 border-blue-200`)
  - "Next Question" button
- **Layout:** Two answer cards side-by-side (`grid-cols-2 gap-4`) within `max-w-md`. Match indicator centered between them (absolute positioned or flex gap). Points and tip below. Next button at bottom.
- **Interaction Logic:**
  - Answers reveal with a flip/fade-in animation (150ms ease-out)
  - Score bar animates the number change (counter animation)
  - Match: brief confetti/sparkle micro-animation on the match icon
  - Educational tip: collapsed by default, "Learn more" text link to expand
  - Auto-advance after 10 seconds if user doesn't tap "Next" (with visible countdown)
  - For drawing questions: show both drawings as images
  - For music questions (match): YouTube player is already playing, show it below results
- **Responsive Notes:** On very narrow screens, answer cards stack vertically instead of side-by-side.

---

### View: Win Celebration Screen

- **Objective:** Celebrate when a player reaches the win threshold (10 points).
- **Key Components:**
  - Winner's name in large text (`text-3xl font-bold`)
  - Trophy / celebration icon (emoji or SVG)
  - Final score display for both players
  - Confetti animation (CSS-based, no heavy library)
  - "Play Again" primary button
  - "View Summary" secondary button
  - "End Session" text link
- **Layout:** Full-viewport centered content. Dark semi-transparent overlay on top of game view. Celebration content in a centered card (`max-w-sm rounded-xl shadow-lg p-8`).
- **Interaction Logic:**
  - Triggered automatically when any player score ≥ win threshold
  - Confetti runs for 3 seconds then stops
  - If a music question matched on the winning round, YouTube player continues playing in background
  - "Play Again" resets scores and returns to category selection
  - "View Summary" goes to Category Summary
- **Responsive Notes:** Card takes full width on mobile with `mx-4` margin. Confetti animation is purely decorative and uses `prefers-reduced-motion: reduce` to disable.

---

### View: Category Summary

- **Objective:** After completing a category (or ending a session), show compatibility statistics.
- **Key Components:**
  - Category name heading
  - Compatibility percentage (large circular progress ring or number)
  - Breakdown by difficulty: easy/medium/hard match rates
  - Question-by-question result list (expandable accordion)
  - "Select Another Category" primary button
  - "End Session" secondary button
  - "Pause Session" text link
- **Layout:** `max-w-lg` centered. Compatibility percentage prominently at top. Difficulty breakdown as 3 horizontal bars or a simple stat row. Question list below as a scrollable accordion. Action buttons at bottom.
- **Interaction Logic:**
  - Compatibility = (matched questions / total answered questions) × 100, displayed as integer %
  - Circular progress ring: animated fill from 0 to final value over 1 second, color-coded (green ≥70%, amber 40–69%, red <40%)
  - Accordion items: tap to expand, shows both players' answers for that question
  - "Pause Session": saves current game state, returns to Dashboard with a "Resume" card
- **Responsive Notes:** Stat row wraps if needed on narrow screens. Accordion is full-width.

---

### View: Answer History

- **Objective:** Users review their past game session answers.
- **Key Components:**
  - Session list (date, partner name, categories played, final scores)
  - Expandable session detail: category-by-category breakdown
  - Individual question/answer pairs with match status
  - Filter by category (horizontal scrollable chip bar)
- **Layout:** `max-w-lg` centered. Session cards stacked vertically with `space-y-3`. Each card is expandable. Filter chips at top, horizontally scrollable with `overflow-x-auto`.
- **Interaction Logic:**
  - Sessions sorted by date (newest first)
  - Tap session card to expand into category breakdown
  - Tap category to see individual Q&A pairs
  - Filter chips: single-select, "All" selected by default
- **Responsive Notes:** Chip bar is touch-scrollable on mobile. Cards are full-width.

---

### View: Settings

- **Objective:** Users manage their profile, preferences, and account.
- **Key Components:**
  - Profile section: edit name, age, re-take romantic vibe quiz
  - Preferences section: notification settings, privacy (who sees answers)
  - Account section: change password, delete account (with confirmation)
  - Feedback link (opens built-in feedback module)
  - Logout button
- **Layout:** `max-w-lg` centered. Sections separated by horizontal dividers (`border-t border-gray-200`). Each section has a heading and a list of setting rows.
- **Interaction Logic:**
  - "Re-take romantic vibe quiz" navigates to Profile Setup step 2
  - "Delete account" shows a confirmation dialog (modal) requiring the user to type their name to confirm
  - Logout: immediate, redirect to Auth view
- **Responsive Notes:** Full-width on mobile. Settings rows are tappable list items with chevron icons.

## 4. Technical Correction Ledger

| Original | Correction | Rationale |
|---|---|---|
| "Friendly, non-intimidating interface" (QUIZ_STRUCTURE.md) | Defined as: soft pink/violet palette, rounded-md corners, `text-sm`/`text-xs` for secondary text, no sharp edges or high-contrast alert patterns outside errors | Vague design goal replaced with concrete token references |
| "Gamified experience" (MVP.md) | Scoring displayed as a persistent top bar during game sessions with animated counter; match = green sparkle micro-animation; mismatch = neutral gray with no negative language | "Gamified" is not a visual spec — translated to specific UI behaviors |
| "Fun and engaging way" (MVP.md) | Playful tone achieved via: pink-500 accent color, confetti on win, micro-animations on reveals (150ms ease-out), friendly copy ("Nice!" / "So close!"), no red/angry states for mismatches | Abstract marketing copy replaced with implementable design decisions |
| "Paint-like interface" for drawing (MVP.md) | Minimal canvas toolbar: 3 brush sizes, 8-color palette, eraser, undo, clear. No layers, no advanced tools. Canvas is square aspect ratio, min 280px | "Paint-like" scoped to MVP-appropriate feature set |
| "Warnings before difficult questions" (QUIZ_STRUCTURE.md) | Dismissable inline banner (`bg-amber-50 border-amber-200 text-sm`) shown before hard-level questions in Sexual Intimacy, Trust, and Conflicts categories only | Clarified which categories trigger warnings and the exact UI pattern |
| "Option for answer anonymity" (QUIZ_STRUCTURE.md) | Not included in MVP view recommendations — the game requires both players to see results. Noted as potential future privacy toggle in Settings | Feature contradicts the core reveal mechanic; deferred rather than designed in |
| "Real-time game format with deadlines" (MVP.md) | Timer implemented as a thin horizontal progress bar at bottom of question view, color-transitioning green→amber→red. Auto-submits empty answer at 0. No countdown number displayed to reduce anxiety | "Deadlines" translated to a specific, low-pressure visual timer |
| "Educational tips and explanations" (MVP.md) | Collapsible card below results reveal, `bg-blue-50 border-blue-200`, collapsed by default with "Learn more" toggle. Does not block progression. | Ensures tips don't interrupt game flow |
| "2+ players (pairs)" (MVP.md) | All game views designed strictly for 2 players. UI layouts (grid-cols-2 for answers, 2 player cards) do not accommodate 3+ players | MVP states "pairs" throughout; 2-player constraint clarified to avoid over-engineering |
