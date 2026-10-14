Backend mocks via `msw` in frontend unit/integration tests.

- Mock HTTP with `msw` (`setupServer`, `http`, `HttpResponse`), never by replacing `fetch`.
- Forbidden: `vi.stubGlobal('fetch', ...)`, `globalThis.fetch =`, `global.fetch =`, `window.fetch =`, `self.fetch =`, `vi.spyOn(globalThis | global | window, 'fetch')`.
- Other browser APIs (`location`, `Notification`, `IntersectionObserver`, canvas...) may still be stubbed.
- Server lifecycle: `listen({ onUnhandledRequest: 'error' })` in `beforeAll`, `resetHandlers()` in `afterEach`, `close()` in `afterAll`.
- Assert behavior in UI, not on request internals.
