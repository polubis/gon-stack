import { describe, expect, it } from 'vitest';
import { moveStats } from '../domain/moves';

const move = (taskId: string, at: string) => ({ taskId, at });

describe('move stats', () => {
  it('counts the moves made on the days of the period', () => {
    const moves = [
      move('t-1', '2026-10-20T10:00:00.000Z'),
      move('t-1', '2026-10-21T10:00:00.000Z'),
      move('t-2', '2026-10-21T11:00:00.000Z'),
      move('t-3', '2026-10-27T10:00:00.000Z'),
    ];

    const stats = moveStats(moves, '2026-10-19', '2026-10-25', 'UTC');

    expect(stats).toEqual({ total: 3, tasks: 2 });
  });

  it('is zero for a period without moves', () => {
    expect(moveStats([], '2026-10-01', '2026-10-31', 'UTC')).toEqual({
      total: 0,
      tasks: 0,
    });
  });

  it('sorts a move into the day of the viewer, not of the server', () => {
    const late = [move('t-1', '2026-10-20T23:30:00.000Z')];

    expect(
      moveStats(late, '2026-10-21', '2026-10-21', 'Europe/Warsaw'),
    ).toEqual({ total: 1, tasks: 1 });
    expect(
      moveStats(late, '2026-10-20', '2026-10-20', 'Europe/Warsaw'),
    ).toEqual({ total: 0, tasks: 0 });
  });
});
