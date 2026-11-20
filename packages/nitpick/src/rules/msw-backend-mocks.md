## Msw Backend Mocks

1. Backend mocks via `msw` in frontend unit/integration tests. Mock HTTP with `msw` (`setupServer`, `http`, `HttpResponse`), never by replacing `fetch`.
2. Forbidden: `vi.stubGlobal('fetch', ...)`, `globalThis.fetch =`, `global.fetch =`, `window.fetch =`, `self.fetch =`, `vi.spyOn(globalThis | global | window, 'fetch')`.
3. Other browser APIs (`location`, `Notification`, `IntersectionObserver`, canvas...) may still be stubbed.
4. Server lifecycle: `listen({ onUnhandledRequest: 'error' })` in `beforeAll`, `resetHandlers()` in `afterEach`, `close()` in `afterAll`.
5. Assert behavior in UI, not on request internals.
