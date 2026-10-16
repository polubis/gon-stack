import { describe, expect, it } from 'vitest';
import { tourExpiry, validOutcome } from '../finance-tour';

const NOW = new Date('2026-10-16T12:00:00.000Z');

describe('Finance tour validity works when', () => {
  it('a never finished tour is due', () => {
    expect(validOutcome(null, NOW)).toBeNull();
  });

  it('a finished tour counts until it expires', () => {
    const row = {
      outcome: 'completed',
      expires_at: '2026-10-16T12:00:01.000Z',
    };

    expect(validOutcome(row, NOW)).toBe('completed');
  });

  it('an expired tour is due again', () => {
    const row = { outcome: 'skipped', expires_at: NOW.toISOString() };

    expect(validOutcome(row, NOW)).toBeNull();
  });

  it('a saved outcome stays valid for 30 days', () => {
    const expiry = tourExpiry(NOW);
    const row = { outcome: 'skipped', expires_at: expiry.toISOString() };

    expect(expiry.toISOString()).toBe('2026-11-15T12:00:00.000Z');
    expect(validOutcome(row, new Date('2026-11-15T11:59:59.000Z'))).toBe(
      'skipped',
    );
    expect(validOutcome(row, expiry)).toBeNull();
  });
});
