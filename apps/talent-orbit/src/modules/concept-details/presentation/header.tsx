import { ArrowLeft, MoreVertical, Pencil } from 'lucide-react';
import { copy } from './copy';

export const Header = () => (
  <div
    data-e2e="concept-details:header"
    className="flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <a
        href="/knowledge-bank/frontend-engineering/"
        aria-label={copy.back}
        data-e2e="concept-details:back"
        className="text-slate-300 hover:text-white"
      >
        <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
      </a>
      <h1 className="text-lg font-bold text-white">{copy.name}</h1>
    </div>

    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label={copy.edit}
        data-e2e="concept-details:edit-icon"
        className="text-slate-300 hover:text-white"
      >
        <Pencil className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={copy.moreOptions}
        data-e2e="concept-details:more"
        className="text-slate-300 hover:text-white"
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  </div>
);
