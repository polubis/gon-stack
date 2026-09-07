import { CheckCircle2, X } from 'lucide-react';
import { copy } from './copy';

export const StatusBanner = () => (
  <div
    data-e2e="concept-details:status-banner"
    className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-800 bg-emerald-950 px-4 py-3"
  >
    <span className="flex items-center gap-2.5 text-sm font-semibold text-emerald-400">
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
      {copy.status.added}
    </span>
    <button
      type="button"
      aria-label={copy.status.dismiss}
      data-e2e="concept-details:status-dismiss"
      className="text-emerald-400 hover:text-emerald-200"
    >
      <X className="h-4.5 w-4.5" aria-hidden="true" />
    </button>
  </div>
);
