import { Repeat } from 'lucide-react';

/** The one mark of a task made by a recurring rule: list rows and popup alike. */
export const RecurringMark = () => (
  <span
    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark"
    data-e2e="time:recurring-mark"
  >
    <Repeat className="h-3 w-3" aria-hidden="true" />
    <span className="max-sm:sr-only">Cykliczne</span>
  </span>
);
