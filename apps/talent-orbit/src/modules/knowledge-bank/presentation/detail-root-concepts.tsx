import {
  Accessibility,
  ChevronRight,
  Gauge,
  Globe2,
  Plus,
  Atom,
} from 'lucide-react';
import { copy } from './copy';

const conceptIcon = [Globe2, Atom, Accessibility, Gauge];

export const DetailRootConcepts = () => (
  <div data-e2e="knowledge-bank:root-concepts" className="flex flex-col gap-4">
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.detail.rootConcepts}
    </h2>

    <div className="flex flex-col gap-3">
      {copy.detail.concepts.map((concept, index) => {
        const Icon = conceptIcon[index];

        return (
          <a
            key={concept.name}
            href="/knowledge-bank-concept-detail/"
            data-e2e={`knowledge-bank:concept-${index}`}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-medium text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="flex-1">{concept.name}</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs text-slate-300">
              {concept.count}
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
          </a>
        );
      })}
    </div>

    <button
      type="button"
      data-e2e="knowledge-bank:add-concept"
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {copy.detail.addConcept}
    </button>
  </div>
);
