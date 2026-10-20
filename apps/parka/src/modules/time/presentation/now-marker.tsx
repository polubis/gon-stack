import { NOW_TIME, type Task } from '../configuration/constraints';

/** Index of the last timed task already started at `NOW_TIME` (the "now" row), or -1. */
export const nowIndexOf = (tasks: readonly Task[]) =>
  tasks.findLastIndex(
    (task) => task.slot.kind === 'timed' && task.slot.at <= NOW_TIME,
  );

/** Static current-time line between two task rows (`li`). */
export const NowMarker = () => (
  <li className="flex items-center gap-2 text-danger">
    <span className="sr-only">Teraz {NOW_TIME}</span>
    <span className="text-xs font-semibold tabular-nums" aria-hidden="true">
      {NOW_TIME}
    </span>
    <span
      className="h-2.5 w-2.5 shrink-0 animate-now-pulse rounded-full bg-danger-strong motion-reduce:animate-none"
      aria-hidden="true"
    />
    <span
      className="h-0.5 flex-1 rounded-full bg-danger-strong"
      aria-hidden="true"
    />
  </li>
);

/** Decorative line across an hour-grid cell at the minute of `NOW_TIME`. */
export const NowLine = ({ offset }: { offset: string }) => (
  <span
    aria-hidden="true"
    style={{ top: offset }}
    className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
  >
    <span className="h-2 w-2 shrink-0 -translate-x-1/2 animate-now-pulse rounded-full bg-danger-strong motion-reduce:animate-none" />
    <span className="h-0.5 flex-1 bg-danger-strong" />
  </span>
);

/** Time label for the hour-axis cell, aligned with the line. */
export const NowAxisLabel = ({ offset }: { offset: string }) => (
  <span
    style={{ top: offset }}
    className="pointer-events-none absolute right-1 -translate-y-1/2 text-xs font-semibold tabular-nums text-danger"
  >
    <span className="sr-only">Teraz </span>
    {NOW_TIME}
  </span>
);
