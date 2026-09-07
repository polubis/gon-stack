import { copy } from './copy';

export const Coverage = () => (
  <div data-e2e="concept-details:coverage" className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.coverage.label}
    </h2>
    <p className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
      {copy.coverage.value}
    </p>
  </div>
);
