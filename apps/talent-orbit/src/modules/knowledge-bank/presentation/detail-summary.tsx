import { Lock } from 'lucide-react';
import { copy } from './copy';

export const DetailSummary = () => (
  <div data-e2e="knowledge-bank:detail-summary" className="flex flex-col gap-4">
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.detail.summary}
    </h2>

    <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
      {copy.detail.stats.map((stat) => (
        <div
          key={stat.label}
          data-e2e={`knowledge-bank:stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-4 last:hidden md:last:block"
        >
          <span className="block text-2xl font-bold text-white">
            {stat.value}
          </span>
          <span className="block text-xs text-slate-400">{stat.label}</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <span className="block text-xs text-slate-400">
          {copy.detail.visibility.label}
        </span>
        <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white">
          <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {copy.detail.visibility.value}
        </span>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <span className="block text-xs text-slate-400">
          {copy.detail.owner.label}
        </span>
        <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
            T
          </span>
          {copy.detail.owner.value}
        </span>
      </div>
    </div>
  </div>
);
