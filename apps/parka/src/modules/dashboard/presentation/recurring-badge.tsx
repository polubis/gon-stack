import { Repeat } from 'lucide-react';

/** The one mark of a recurring expense: list rows and popups alike. */
export const RecurringBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark">
    <Repeat className="h-3 w-3" aria-hidden="true" />
    Cykliczny
  </span>
);
