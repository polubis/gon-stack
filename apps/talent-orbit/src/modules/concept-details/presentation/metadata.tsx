import { BarChart3 } from 'lucide-react';
import { copy } from './copy';

export const Metadata = () => (
  <div data-e2e="concept-details:metadata" className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.metadata.label}
    </h2>

    <div className="flex flex-col divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-slate-400">
          {copy.metadata.difficulty.label}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <BarChart3 className="h-4 w-4 text-orange-500" aria-hidden="true" />
          {copy.metadata.difficulty.value}
        </span>
      </div>
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-slate-400">
          {copy.metadata.tags.label}
        </span>
        <span className="flex flex-wrap justify-end gap-2">
          {copy.metadata.tags.value.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-white"
            >
              {tag}
            </span>
          ))}
        </span>
      </div>
    </div>
  </div>
);
