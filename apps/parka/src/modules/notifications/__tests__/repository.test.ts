import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NOTIFICATIONS_MAX_DELETE } from '@schemas/notifications';
import type { NotificationId } from '../domain/models';
import {
  deleteMany,
  fetchNotifications,
  putRead,
} from '../integration/repository';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const signal = () => new AbortController().signal;
const ids = (count: number) =>
  Array.from({ length: count }, (_, i) => `n-${i}` as NotificationId);

describe('notifications repository', () => {
  it('maps the first page with cursor and unread count', async () => {
    server.use(
      http.get('/api/notifications/', () =>
        HttpResponse.json({
          code: 200,
          data: [
            {
              id: 'n-1',
              kind: 'category-created',
              title: 'Dodano kategorię',
              body: 'Kawa',
              createdAt: '2026-10-12T10:00:00.000Z',
              read: false,
              payload: {
                category: { name: 'Kawa', icon: 'coffee', color: '#fff' },
              },
            },
          ],
          nextCursor: 'c-2',
          unread: 3,
        }),
      ),
    );

    const page = await fetchNotifications(null, 20, signal());

    expect([page.items.map((n) => n.id), page.nextCursor, page.unread]).toEqual(
      [['n-1'], 'c-2', 3],
    );
  });

  it('asks the next page with the cursor and limit', async () => {
    let query = '';
    server.use(
      http.get('/api/notifications/', ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({
          code: 200,
          data: [],
          nextCursor: null,
          unread: 0,
        });
      }),
    );

    await fetchNotifications('c-2', 10, signal());

    const params = new URLSearchParams(query);
    expect([params.get('cursor'), params.get('limit')]).toEqual(['c-2', '10']);
  });

  it('omits the cursor on the first page', async () => {
    let query = '';
    server.use(
      http.get('/api/notifications/', ({ request }) => {
        query = new URL(request.url).search;
        return HttpResponse.json({
          code: 200,
          data: [],
          nextCursor: null,
          unread: 0,
        });
      }),
    );

    await fetchNotifications(null, 10, signal());

    expect(new URLSearchParams(query).has('cursor')).toBe(false);
  });

  it('fails the list with the server message', async () => {
    server.use(
      http.get('/api/notifications/', () =>
        HttpResponse.json({ code: 401, message: 'Sesja wygasła' }),
      ),
    );

    await expect(fetchNotifications(null, 20, signal())).rejects.toThrow(
      'Sesja wygasła',
    );
  });

  it('marks one notification as read', async () => {
    server.use(
      http.put('/api/notifications/n-1/', () =>
        HttpResponse.json({ code: 200 }),
      ),
    );

    await expect(putRead('n-1' as NotificationId)).resolves.toBeUndefined();
  });

  it('fails marking as read with the server message', async () => {
    server.use(
      http.put('/api/notifications/n-1/', () =>
        HttpResponse.json({ code: 404, message: 'Brak powiadomienia' }),
      ),
    );

    await expect(putRead('n-1' as NotificationId)).rejects.toThrow(
      'Brak powiadomienia',
    );
  });

  it('deletes a long selection in chunks the endpoint accepts', async () => {
    const sizes: number[] = [];
    server.use(
      http.delete('/api/notifications/', async ({ request }) => {
        const body = (await request.json()) as { ids: string[] };
        sizes.push(body.ids.length);
        return HttpResponse.json({ code: 200 });
      }),
    );

    await deleteMany(ids(NOTIFICATIONS_MAX_DELETE * 2 + 5));

    expect(sizes.sort((a, b) => b - a)).toEqual([
      NOTIFICATIONS_MAX_DELETE,
      NOTIFICATIONS_MAX_DELETE,
      5,
    ]);
  });

  it('sends nothing when the selection is empty', async () => {
    let calls = 0;
    server.use(
      http.delete('/api/notifications/', () => {
        calls += 1;
        return HttpResponse.json({ code: 200 });
      }),
    );

    await deleteMany([]);

    expect(calls).toBe(0);
  });

  it('fails the delete when any chunk fails', async () => {
    server.use(
      http.delete('/api/notifications/', () =>
        HttpResponse.json({ code: 500, message: 'Nie udało się usunąć' }),
      ),
    );

    await expect(deleteMany(ids(2))).rejects.toThrow('Nie udało się usunąć');
  });
});
