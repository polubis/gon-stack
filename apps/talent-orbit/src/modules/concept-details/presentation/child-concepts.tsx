import { ChevronRight, GitBranch } from 'lucide-react';
import { copy } from './copy';

export const ChildConcepts = () => (
  <div
    data-e2e="concept-details:child-concepts"
    className="flex flex-col gap-4"
  >
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.childConcepts.label} ({copy.childConcepts.items.length})
    </h2>

    <div className="flex flex-col gap-3">
      {copy.childConcepts.items.map((concept) => (
        <a
          key={concept.name}
          href="#"
          data-e2e={`concept-details:child-${concept.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-medium text-white"
        >
          <GitBranch
            className="h-4.5 w-4.5 shrink-0 text-emerald-400"
            aria-hidden="true"
          />
          <span className="flex-1">{concept.name}</span>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs text-slate-300">
            {concept.count}
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
        </a>
      ))}
    </div>
  </div>
);
