import { ArrowLeft, Orbit } from 'lucide-react';
import { copy } from './copy';

export const DetailHeader = () => (
  <div
    data-e2e="organization:detail-header"
    className="flex items-center gap-3"
  >
    <a
      href="/organization/"
      aria-label={copy.detail.back}
      data-e2e="organization:detail-back"
      className="text-slate-300 hover:text-white"
    >
      <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
    </a>

    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
      <Orbit className="h-7 w-7" aria-hidden="true" />
    </span>

    <div>
      <h1 className="text-lg font-bold text-white">{copy.detail.name}</h1>
      <span className="mt-1 inline-flex rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400">
        {copy.detail.badge}
      </span>
    </div>
  </div>
);
