import { describe, expect, it } from 'vitest';
import { formatCommentTime } from '../domain/comment-time';

/** Local wall-clock time, so the expectation does not depend on the machine zone. */
const at = (...parts: [number, number, number, number, number]) =>
  new Date(...parts).toISOString();

describe('comment time', () => {
  it('shows day, short month, year and time', () => {
    expect(formatCommentTime(at(2026, 9, 24, 10, 0))).toBe(
      '24 paź 2026, 10:00',
    );
  });

  it('keeps a single digit day without padding and minutes padded', () => {
    expect(formatCommentTime(at(2026, 10, 1, 9, 5))).toBe('1 lis 2026, 09:05');
  });

  it('shows midnight as 00:00', () => {
    expect(formatCommentTime(at(2026, 0, 15, 0, 0))).toBe('15 sty 2026, 00:00');
  });

  it('shows the last minute of the year in that year', () => {
    expect(formatCommentTime(at(2026, 11, 31, 23, 59))).toBe(
      '31 gru 2026, 23:59',
    );
  });

  it('shows the first minute of the next year in the next year', () => {
    expect(formatCommentTime(at(2027, 0, 1, 0, 0))).toBe('1 sty 2027, 00:00');
  });
});
