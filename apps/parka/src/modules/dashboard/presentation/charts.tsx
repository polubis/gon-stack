import { cn } from '@repo/react-kit/cn';
import { money } from '../domain/format';
import { ShowAllFade } from './show-all-fade';

type Slice = { label: string; value: number; color: string };

/**
 * Donut of every slice with its legend. `rows` caps the legend inside a
 * fixed-height box; slices past it add a `onShowAll` button over a fade.
 */
export const Donut = ({
  slices,
  caption,
  rows,
  onShowAll,
}: {
  slices: Slice[];
  caption: string;
  rows?: number;
  onShowAll?: () => void;
}) => {
  const total = Math.max(
    1,
    slices.reduce((s, x) => s + x.value, 0),
  );
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const arcs = slices.reduce<{ slice: Slice; dash: number; offset: number }[]>(
    (acc, slice) => {
      const dash = (slice.value / total) * circ;
      const offset = acc.length
        ? acc[acc.length - 1].offset + acc[acc.length - 1].dash
        : 0;
      return [...acc, { slice, dash, offset }];
    },
    [],
  );
  const overflows = rows !== undefined && slices.length > rows;

  return (
    <figure className="m-0 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label={caption}
      >
        <g transform="rotate(-90 80 80)">
          {arcs.map(({ slice, dash, offset }) => (
            <circle
              key={slice.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
            />
          ))}
        </g>
      </svg>
      <div
        className={cn(
          'relative w-full min-w-0 flex-1',
          rows !== undefined && 'h-48 overflow-hidden',
        )}
      >
        <ul className="space-y-1.5 text-sm">
          {slices.slice(0, rows).map((s) => (
            <li key={s.label} className="flex h-5 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-ink-soft">{s.label}</span>
              <span className="font-medium tabular-nums">{money(s.value)}</span>
              <span className="w-10 text-right text-ink-soft tabular-nums">
                {Math.round((s.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
        {overflows && onShowAll && (
          <ShowAllFade
            onClick={onShowAll}
            data-e2e="dashboard:categories-toggle"
          />
        )}
      </div>
    </figure>
  );
};
