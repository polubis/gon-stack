## Msw Backend Mocks

1. (A) Backend mocks via `msw` in frontend unit/integration tests. Mock HTTP with `msw` (`setupServer`, `http`, `HttpResponse`), never by replacing `fetch`.
2. (A) Forbidden: `vi.stubGlobal('fetch', ...)`, `globalThis.fetch =`, `global.fetch =`, `window.fetch =`, `self.fetch =`, `vi.spyOn(globalThis | global | window, 'fetch')`.
3. (A) Other browser APIs (`location`, `Notification`, `IntersectionObserver`, canvas...) may still be stubbed.
4. (A) Server lifecycle: `listen({ onUnhandledRequest: 'error' })` in `beforeAll`, `resetHandlers()` in `afterEach`, `close()` in `afterAll`.
5. (A) Assert behavior in UI, not on request internals.
