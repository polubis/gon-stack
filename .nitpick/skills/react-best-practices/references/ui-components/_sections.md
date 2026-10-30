# Section Definitions

This file defines the rule categories for React UI component best practices. Rules are organized by their category and priority.

---

## 1. Component API Design

**Impact:** CRITICAL
**Description:** Props API shape, TypeScript types, and controlled/uncontrolled state patterns. Getting the API wrong forces callers to work around the component or add unnecessary state.

**Files:** `props-api.md`, `controlled-uncontrolled.md`, `ref-as-prop-react-19.md`

---

## 2. Design System & Tokens

**Impact:** HIGH
**Description:** CSS custom properties, semantic color tokens, and theming conventions. Hardcoded values break theming and make global design changes require mass find-replace.

**Files:** `design-tokens.md`

---

## 3. Accessibility & UX States

**Impact:** HIGH
**Description:** Hover, focus-visible, disabled, and active/pressed state styles. Missing states cause broken UX — invisible focus rings, clickable-looking disabled buttons, no press feedback.

**Files:** `interactive-states.md`

---

## 4. Styling Patterns

**Impact:** MEDIUM-HIGH
**Description:** Class name composition with `cn()`, variant style branching. Bypassing `tailwind-merge` leads to unpredictable overrides and duplicate utilities.

**Files:** `cn-classnames.md`, `variants.md`

---

## 5. Component Architecture

**Impact:** MEDIUM-HIGH
**Description:** Compound component exports, shared state via context, multi-part component patterns. Poor architecture forces prop-drilling and couples sub-parts unnecessarily.

**Files:** `compound-components.md`, `context-shared-state.md`

---

## 6. Code Organization

**Impact:** MEDIUM
**Description:** File section structure, typography ownership rules. Consistent organization makes components scannable; mixing shared type classes into component definitions removes style independence.

**Files:** `file-structure.md`, `typography.md`

---

## 7. Animation & Motion

**Impact:** LOW
**Description:** Transition property selection and duration calibration. Mismatched durations make the UI feel inconsistent — fast hover, slow press, or laggy focus ring.

**Files:** `transitions.md`
