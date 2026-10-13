import { describe, expect, it } from 'vitest';
import { toNotification } from '../integration/mappers';

describe('notifications mapper', () => {
  it('keeps a typed notification with its payload and read state', () => {
    const n = toNotification({
      id: 'n-1',
      kind: 'category-created',
      title: 'Dodano kategorię',
      body: 'Kawa',
      createdAt: '2026-10-12T10:00:00.000Z',
      read: false,
      payload: { category: { name: 'Kawa', icon: 'coffee', color: '#fff' } },
    });

    expect([n.id, n.kind, n.read, n.payload]).toEqual([
      'n-1',
      'category-created',
      false,
      { category: { name: 'Kawa', icon: 'coffee', color: '#fff' } },
    ]);
  });

  it('keeps a legacy notification without payload', () => {
    const n = toNotification({
      id: 'n-2',
      kind: 'other',
      title: 'Stare',
      body: '',
      createdAt: '2026-10-12T10:00:00.000Z',
      read: true,
      payload: null,
    });

    expect([n.kind, n.payload, n.read]).toEqual(['other', null, true]);
  });
});
