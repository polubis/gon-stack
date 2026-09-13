# Legend

- A = always
- O = optional
- D = when directly mentioned
- I = infer during task

## Coding

1. (A) Turbo minimal code

## Code style

1. (A) Inline exports in order public bottom/private top order

## Git

1. (A) Commit names with feat|fix|refactor|chore: scope format
2. (A) As a unordered list in description scope of changes

## Communication

1. (A) Turbo minimal text
2. (I) Prefer ASCI

## Architecture

1. (A) Modular & domain based
2. (I) Layers in modules per case complexity
3. (I) Presentation/logic
4. (I) Isolation more important than duplication
5. (A) Low coupling

## Styling

1. (A) No raw `px`
2. (A) Design tokens
3. (A) No direct colors/spacing/z-index/fonts
4. (A) Theming in single app/lib file
5. (A) `cn` from `react-kit`

## Testing

1. (A) Black Box/Arrange Act Assert organized
2. (I) No implementation details
3. (A) Short and "like user story" test names
4. (A) No Gherkin
5. (A) Test behaviors/not implementation
6. (A) Verify TypeScript behavior in tests for public interface
7. (A) No internals testing, public behaviors only
8. (A) Test pyramid

### E2E

1. (A) Done via `vibe-test` internal lib
2. (A) Unique type-safe selectors
3. (A) Selectors per "module" and combined in single place
4. (A) Disable animations/images when testing visuals
5. (A) Partial type-safe selectors for dynamic content `range:name:${string|number}`

### Unit/Integration

1. (A) Accessible selectors
2. (A) Do not use `e2e` selectors

## Way of work

1. (A) Each module has `__activity__` and `__decision__`. Either, app root and repo root

## AI

1. (A) Use `/caveman 70%` to reduce text inside any `markdown`
2. (A) Document progress/cost/time in `__activity__` dir per task
3. (A) During modification follow conventions/style around
4. (A) When decision add under `__decision__` dir per task
5. (A) Each session ends with entry in `__activity__` and `__decision__`

## Astro

1. (A) Backend endpoints via builded-in adapaters and type-safe input/output validation

## React

1. (A) `Context API` via `react-kit` utils
2. (A) `useEffectEvent` instead of hacks
3. (A) `ComponentProps` for generic components def merging

## TypeScript

1. (A) Type-safe & Strict
2. (I) Exh checking and disc property

## Security

1. (A) Yield and stop everything when any personal or sensitive data detected
