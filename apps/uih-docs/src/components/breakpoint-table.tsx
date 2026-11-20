import { useEffect, useState } from 'react';

type Row = {
  width: number;
  rem: string;
  device: string;
  scale: string;
  source: string;
};

type Reading = { width: number; scale: string };

const read = (): Reading => ({
  width: window.innerWidth,
  scale: getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-scale')
    .trim(),
});

export const BreakpointTable = ({ rows }: { rows: Row[] }) => {
  const [reading, setReading] = useState<Reading | null>(null);

  useEffect(() => {
    const update = () => setReading(read());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const active = reading
    ? ([...rows].reverse().find((row) => row.width <= reading.width)?.width ??
      rows[0]?.width)
    : undefined;

  return (
    <div className="not-prose" data-e2e="breakpoints">
      <p
        className="text-ink-soft mb-3 text-sm"
        role="status"
        data-e2e="breakpoint-readout"
      >
        {reading
          ? `Viewport ${reading.width}px, --ds-scale ${reading.scale}`
          : 'Measuring viewport'}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Breakpoints and their scale</caption>
          <thead>
            <tr className="border-line border-b">
              <th scope="col" className="py-2 pe-4">
                Breakpoint
              </th>
              <th scope="col" className="py-2 pe-4">
                Device
              </th>
              <th scope="col" className="py-2 pe-4">
                Scale
              </th>
              <th scope="col" className="py-2">
                Step
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.width}
                aria-current={row.width === active ? 'true' : undefined}
                data-e2e={`breakpoint-${row.width}`}
                className="border-line border-b aria-[current=true]:bg-black/5 aria-[current=true]:font-semibold"
              >
                <th scope="row" className="py-2 pe-4 font-[inherit]">
                  {row.width}px <span className="text-ink-soft">{row.rem}</span>
                </th>
                <td className="py-2 pe-4">{row.device}</td>
                <td className="py-2 pe-4">{row.scale}</td>
                <td className="text-ink-soft py-2">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
