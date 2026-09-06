import { ArrowLeft, MoreVertical } from 'lucide-react';
import { copy } from './copy';

export const DetailHeader = () => (
  <div
    data-e2e="knowledge-bank:detail-header"
    className="flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <a
        href="/knowledge-bank/"
        aria-label={copy.detail.back}
        data-e2e="knowledge-bank:detail-back"
        className="text-slate-300 hover:text-white"
      >
        <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
      </a>
      <h1 className="text-lg font-bold text-white">{copy.detail.name}</h1>
    </div>

    <button
      type="button"
      aria-label={copy.detail.moreOptions}
      data-e2e="knowledge-bank:detail-more"
      className="text-slate-300 hover:text-white md:hidden"
    >
      <MoreVertical className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);
