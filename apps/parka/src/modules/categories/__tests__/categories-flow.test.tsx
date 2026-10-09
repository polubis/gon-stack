import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { Category, CategoryId } from '../domain/models';

const FOOD = { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' };

const NEW_CATEGORY: Category = {
  id: 'c-2' as CategoryId,
  name: 'Culture',
  icon: 'gift',
  color: '#2563eb',
};

const stubApi = (writeResponse: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => ({
      json: async () =>
        init?.method === 'POST' ||
        init?.method === 'PUT' ||
        init?.method === 'DELETE'
          ? writeResponse
          : { code: 200, data: [FOOD] },
    })),
  );

const setup = async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return {
        ctx,
        categories: ctx.useCategories(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load());
  await waitFor(() => expect(view.result.current.categories).toHaveLength(1));
  return view;
};

describe('categories creation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('adds the category and confirms with a toast', async () => {
    stubApi({ code: 201, data: NEW_CATEGORY });
    const view = await setup();

    act(() => view.result.current.ctx.create(NEW_CATEGORY));

    expect(view.result.current.categories).toHaveLength(2);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
    expect(view.result.current.categories).toHaveLength(2);
  });

  it('drops the category and reports an error when creation fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.create(NEW_CATEGORY));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.categories).toHaveLength(1);
  });
});

describe('categories update', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renames the category right away', async () => {
    stubApi({ code: 200, data: { ...FOOD, name: 'Meals' } });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.categories[0]!,
        name: 'Meals',
      }),
    );

    expect(view.result.current.categories[0]!.name).toBe('Meals');
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('restores the old name when saving fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.categories[0]!,
        name: 'Meals',
      }),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.categories[0]!.name).toBe('Food');
  });
});

describe('categories removal', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('removes the category and confirms with a toast', async () => {
    stubApi({ code: 200, ok: true });
    const view = await setup();

    act(() => view.result.current.ctx.remove(FOOD.id as CategoryId));

    expect(view.result.current.categories).toHaveLength(0);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
    expect(view.result.current.categories).toHaveLength(0);
  });

  it('keeps a category in use and explains why', async () => {
    stubApi({ code: 409, type: 'conflict', message: 'in use' });
    const view = await setup();

    act(() => view.result.current.ctx.remove(FOOD.id as CategoryId));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.notice?.message).toContain('przepnij');
    expect(view.result.current.categories).toHaveLength(1);
  });

  it('keeps the category when removal fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.remove(FOOD.id as CategoryId));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.categories).toHaveLength(1);
  });
});
