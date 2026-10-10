import { Repeat } from 'lucide-react';

/** The one mark of a recurring expense: list rows and popups alike. */
export const RecurringBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark">
    <Repeat className="h-3 w-3" aria-hidden="true" />
    Cykliczny
  </span>
);

/** Subtle list-row mark: a repeat glyph on the avatar corner, label for screen readers only. */
export const RecurringMark = () => (
  <span className="absolute -right-0.5 -bottom-0.5 grid h-5 w-5 place-items-center rounded-full border border-line-strong bg-card text-brand-dark">
    <Repeat className="h-3 w-3" aria-hidden="true" />
    <span className="sr-only">Cykliczny</span>
  </span>
);
