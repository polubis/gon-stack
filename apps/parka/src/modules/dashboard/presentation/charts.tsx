import { money } from '../domain/format';

type Slice = { label: string; value: number; color: string };

export const Donut = ({
  slices,
  caption,
}: {
  slices: Slice[];
  caption: string;
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

  return (
    <figure className="m-0 flex flex-col items-center gap-4 sm:flex-row">
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
      <ul className="w-full min-w-0 flex-1 space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-ink-soft">{s.label}</span>
            <span className="font-medium tabular-nums">{money(s.value)}</span>
            <span className="w-10 text-right text-ink-soft tabular-nums">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
};
