import '@testing-library/jest-dom';
import { server } from './mock-server';
import { cleanup } from '@testing-library/react';
import { ports } from '@repo/ecosystem-resources/ports';

vi.stubEnv(
  'PUBLIC_SUPABASE_URL',
  `http://127.0.0.1:${ports['supabase-romantic-app'].api}`,
);
vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'dasdsa-dadasd-231edd');

server.listen({ onUnhandledRequest: 'error' });

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
