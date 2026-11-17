import { localDay } from '@/shared/date/date';

/** One task moved from a day to another, at the instant it happened. */
export type Move = { taskId: string; at: string };

export type MoveStats = {
  /** Moves made in the period, one task moved twice counts twice. */
  total: number;
  /** Different tasks among them. */
  tasks: number;
};

/** Moves made on the days from `from` to `to` (inclusive) in `timeZone`. */
export const moveStats = (
  moves: readonly Move[],
  from: string,
  to: string,
  timeZone?: string,
): MoveStats => {
  const inside = moves.filter((move) => {
    const day = localDay(move.at, timeZone);
    return day >= from && day <= to;
  });
  return {
    total: inside.length,
    tasks: new Set(inside.map((move) => move.taskId)).size,
  };
};
