import { describe, expect, it } from 'vitest';
import { formatWhen, maskToken } from '../domain/format';

describe('access tokens format', () => {
  it('masks a token to its first and last characters', () => {
    expect(maskToken('Ab12', 'xy89')).toBe('parka_mcp_Ab12…xy89');
  });

  it('never shows more than hint and tail of the secret', () => {
    const masked = maskToken('Zq8x', 'Yb6k');

    expect(masked).toBe('parka_mcp_Zq8x…Yb6k');
    expect(masked).not.toContain('Kd3m');
  });

  it('shows a moment as a day and an hour', () => {
    expect(formatWhen('2026-10-19T12:30:00.000Z')).toMatch(
      /^\S+ 19 paź 2026, \d{1,2}:\d{2}$/,
    );
  });
});
