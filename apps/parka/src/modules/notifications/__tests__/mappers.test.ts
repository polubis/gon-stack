import { describe, expect, it } from 'vitest';
import { toNotification } from '../integration/mappers';

const dto = (kind: string) => ({
  id: 'n-1',
  kind,
  title: 'Title',
  body: 'Body',
  ageDays: 2,
});

describe('notifications mapper', () => {
  it('keeps a known kind', () => {
    expect(toNotification(dto('recurring')).kind).toBe('recurring');
  });

  it('falls back to other for an unknown kind', () => {
    expect(toNotification(dto('mystery')).kind).toBe('other');
  });

  it('copies the text and age', () => {
    const n = toNotification(dto('limit-alert'));

    expect([n.id, n.title, n.body, n.ageDays]).toEqual([
      'n-1',
      'Title',
      'Body',
      2,
    ]);
  });
});
