import { ChevronDown, ChevronsUp, Equal } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { priorityLevel, type PriorityLevel } from '../domain/priority';
import type { Priority } from '../domain/models';

export const PRIORITY_ICON = {
  low: ChevronDown,
  medium: Equal,
  high: ChevronsUp,
} satisfies Record<PriorityLevel, unknown>;

/** Tone per level, never the only cue: the icon and the name always show too. */
export const PRIORITY_TONE: Record<PriorityLevel, string> = {
  low: 'bg-hover-soft text-ink-soft',
  medium: 'bg-warn/10 text-warn',
  high: 'bg-danger-soft text-danger',
};

/** The one mark of a priority: level icon + name in a tinted pill. */
export const PriorityBadge = ({
  priority,
  className,
}: {
  priority: Pick<Priority, 'name' | 'value'>;
  className?: string;
}) => {
  const level = priorityLevel(priority.value);
  const Icon = PRIORITY_ICON[level];
  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        PRIORITY_TONE[level],
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="sr-only">Priorytet: </span>
      <span className="truncate">{priority.name}</span>
    </span>
  );
};
