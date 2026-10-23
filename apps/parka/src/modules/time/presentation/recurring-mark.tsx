import { Repeat } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

/** The one mark of a task made by a recurring rule: bare icon in rows, labelled pill in the popup. */
export const RecurringMark = ({ labelled }: { labelled?: boolean }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center gap-1',
      labelled &&
        'rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark',
    )}
    data-e2e="time:recurring-mark"
  >
    <Repeat className="h-3 w-3" aria-hidden="true" />
    <span className={cn(!labelled && 'sr-only')}>Cykliczne</span>
  </span>
);
