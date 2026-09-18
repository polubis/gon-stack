## Testing

1. (A) Black Box/Arrange Act Assert organized
2. (I) No implementation details
3. (A) Short and "like user story" test names
4. (A) No Gherkin
5. (A) Test behaviors/not implementation
6. (A) Verify TypeScript behavior in tests for public interface
7. (A) No internals testing, public behaviors only
8. (A) Test pyramid

### Unit/Integration

1. (A) Accessible selectors
2. (A) Do not use `e2e` selectors

### E2E

1. (A) Done via `vibe-test` internal lib
2. (A) Unique type-safe selectors
3. (A) Selectors per "module" and combined in single place
4. (A) Disable animations/images when testing visuals
5. (A) Partial type-safe selectors for dynamic content `range:name:${string|number}`
