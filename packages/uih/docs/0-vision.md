# Vision

Reader knows what the library is, what it promises, what it refuses to be.

## Terms

- **[headless]** - behavior, state, accessibility, structure with zero required visual opinion
- **[styling_layer]** - optional CSS on top of [headless]. Removable without breaking behavior.
- **[theme]** - set of token values shipped or written by consumer
- **[override_channel]** - one way consumer changes look. e.g. token, class, JS prop
- **[bundle_cost]** - bytes a consumer pays for what they import

## Statement

Composable UI library. 100% [headless] at the core, fully configurable look on top. Ships default [theme] set, never forces one. Works with any styling approach consumer already has.

## Requirements

### Headless

- **HDL-1** MUST separate behavior from look. Component works, accessible and operable, with [styling_layer] absent.
- **HDL-2** MUST NOT require a CSS framework, CSS-in-JS runtime, or build plugin to use any component.
- **HDL-3** MUST expose structure as composable parts. Consumer arranges, omits, wraps, replaces parts.
- **HDL-4** MUST own accessibility and keyboard behavior in core. Consumer styling cannot break it.

### Configurable

- **CFG-1** MUST support every [override_channel] below, alone or combined. Each works without the others.
  - 1A. Token change. Theme or per-component CSS variable.
  - 1B. Theme. Swap whole token set on a scope.
  - 1C. Classes. Consumer class on any component wins.
  - 1D. JS. Props, inline style, render-level control.
  - 1E. Configuration. Library-wide defaults set once, no per-call repetition.
- **CFG-2** MUST be compatible with any consumer styling stack. Tailwind, CSS modules, plain CSS, CSS-in-JS. Verify: each overrides defaults with no `!important`.
- **CFG-3** MUST ship default [theme] set. Themes are data, not code paths. Adding or removing one changes no component.
- **CFG-4** MUST NOT lock consumer into default look. Dropping [styling_layer] entirely is supported.

### Composable

- **CMP-1** MUST build complex components from same public parts consumer gets. No private-only internals.
- **CMP-2** MUST let consumer build new components from [headless] core.

### Size

- **SIZ-1** MUST be tree-shakable. Import one component, pay for one component. `<metric:bundle_cost>`
- **SIZ-2** MUST keep zero side effects at import time. Styles, themes, config load only when asked.
- **SIZ-3** MUST keep runtime dependencies minimal. Prefer platform (CSS, DOM) over code.
- **SIZ-4** MUST move work to CSS where CSS can do it. State, variants, theming, motion not in JS.
- **SIZ-5** MUST treat [bundle_cost] growth as a defect, not a tradeoff by default.

## Non-goals

- Not a design system with one fixed look.
- Not a styling framework or utility-class system.
- Not a bundle of every component. Consumer takes what they use.
