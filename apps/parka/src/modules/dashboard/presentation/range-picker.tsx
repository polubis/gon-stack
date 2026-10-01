import { cn } from '@repo/react-kit/cn';
import { RANGE_LABEL, RANGES } from '../configuration/constraints';
import type { Range } from '../domain/models';

export const RangePicker = ({
  range,
  onRangeChange,
}: {
  range: Range;
  onRangeChange: (range: Range) => void;
}) => (
  <div
    className="flex gap-1 overflow-x-auto lg:col-span-3"
    role="tablist"
    aria-label="Zakres czasu"
  >
    {RANGES.map((r) => (
      <button
        key={r}
        type="button"
        role="tab"
        aria-selected={r === range}
        data-e2e={`dashboard:range:${r}`}
        onClick={() => onRangeChange(r)}
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
          r === range
            ? 'bg-brand text-on-brand'
            : 'border border-line-strong bg-card text-ink-soft',
        )}
      >
        {RANGE_LABEL[r]}
      </button>
    ))}
  </div>
);
