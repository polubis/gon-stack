import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { Provider, useContext } from '../presentation/context';

const FOOD = { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' };
const TRAVEL = { id: 'c-2', name: 'Travel', icon: 'plane', color: '#2563eb' };

class FakeEventSource {
  static last: FakeEventSource | undefined;
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  constructor() {
    FakeEventSource.last = this;
  }
  close() {}
  emit(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

const server = setupServer();
let stored = [FOOD];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
  FakeEventSource.last = undefined;
  stored = [FOOD];
});
afterAll(() => server.close());

const setup = async () => {
  vi.stubGlobal('EventSource', FakeEventSource);
  server.use(
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: stored }),
    ),
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return { ctx, categories: ctx.useCategories() };
    },
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider>{children}</Provider>
      ),
    },
  );
  act(() => view.result.current.ctx.load());
  await waitFor(() => expect(view.result.current.categories).toHaveLength(1));
  return view;
};

const changeFromOutside = (domain: 'time' | 'finance') =>
  act(() => FakeEventSource.last?.emit({ domain }));

describe('finance live refresh', () => {
  it('shows a category added from another device without a reload', async () => {
    const view = await setup();

    stored = [FOOD, TRAVEL];
    changeFromOutside('finance');

    await waitFor(() => expect(view.result.current.categories).toHaveLength(2));
  });

  it('ignores a change of the time domain', async () => {
    const view = await setup();

    stored = [FOOD, TRAVEL];
    changeFromOutside('time');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(view.result.current.categories).toHaveLength(1);
  });
});
