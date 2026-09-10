import { money } from '@/modules/shared/data';

type BarDatum = { label: string; value: number };

export const BarChart = ({
  data,
  caption,
  highlightLast = true,
}: {
  data: BarDatum[];
  caption: string;
  highlightLast?: boolean;
}) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  const H = 128;
  return (
    <figure className="m-0">
      <figcaption className="sr-only">{caption}</figcaption>
      <div className="flex items-end gap-1.5" style={{ height: H }}>
        {data.map((d, i) => {
          const h = Math.max(3, (d.value / max) * H);
          const isLast = highlightLast && i === data.length - 1;
          return (
            <div
              key={d.label}
              className={`flex-1 rounded-t-md ${isLast ? 'bg-brand' : 'bg-brand-soft'}`}
              style={{ height: h }}
              title={`${d.label}: ${money(d.value)}`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[10px] text-ink-soft"
          >
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
};

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
    <figure className="m-0 flex items-center gap-5">
      <svg
        viewBox="0 0 160 160"
        className="h-36 w-36 shrink-0"
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
      <ul className="flex-1 space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-ink-soft">{s.label}</span>
            <span className="font-medium tabular-nums">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
};
