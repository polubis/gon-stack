import { cn } from '@repo/react-kit/cn';
import { priorityLevel, type PriorityLevel } from '../domain/priority';
import type { Priority } from '../domain/models';

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

/** Tone per level, never the only cue: the filled pips and the name always show too. */
export const PRIORITY_TONE: Record<PriorityLevel, string> = {
  low: 'bg-hover-soft text-ink-soft',
  medium: 'bg-warn/10 text-warn',
  high: 'bg-danger-soft text-danger',
};

/** Decorative 1-10 scale: `value` pips filled with the current text color. */
export const PriorityMeter = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    data-level={priorityLevel(value)}
    className={cn('inline-flex shrink-0 items-end gap-0.5', className)}
  >
    {SCALE.map((step) => (
      <span
        key={step}
        data-filled={step <= value}
        className="h-3 w-0.5 rounded-full bg-current opacity-20 data-[filled=true]:opacity-100"
      />
    ))}
  </span>
);

/** The one mark of a priority: tinted pill with the 1-10 pips and the name. */
export const PriorityBadge = ({
  priority,
  compact = false,
  className,
}: {
  priority: Pick<Priority, 'name' | 'value'>;
  /** List views: marker and color only, the name stays for assistive tech. */
  compact?: boolean;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
      PRIORITY_TONE[priorityLevel(priority.value)],
      className,
    )}
  >
    <PriorityMeter value={priority.value} />
    <span className="sr-only">Priorytet: </span>
    <span className={compact ? 'sr-only' : 'truncate'}>{priority.name}</span>
    <span className="sr-only">, {priority.value} z 10</span>
  </span>
);
