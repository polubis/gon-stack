import {
  Accessibility,
  Atom,
  ChevronRight,
  Database,
  Gauge,
  Globe2,
} from 'lucide-react';
import { copy } from './copy';

const conceptIcon = {
  React: Atom,
  Accessibility,
  Performance: Gauge,
  'State Management': Database,
  'Web Platform': Globe2,
} as const;

const accentClasses = {
  sky: { badge: 'bg-sky-500/10 text-sky-400', concept: 'text-sky-400' },
  rose: { badge: 'bg-rose-500/10 text-rose-400', concept: 'text-rose-400' },
  violet: {
    badge: 'bg-violet-500/10 text-violet-400',
    concept: 'text-violet-400',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-400',
    concept: 'text-emerald-400',
  },
} as const;

export const ListQuestionCard = ({ index }: { index: number }) => {
  const item = copy.list.questions[index];
  const accent = accentClasses[item.accent];
  const ConceptIcon = conceptIcon[item.concept];

  return (
    <a
      href="/questions-library-detail/"
      data-e2e={`questions-library:card-${index}`}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <span
        className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold md:flex ${accent.badge}`}
      >
        {item.typeCode}
      </span>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:hidden ${accent.badge}`}
      >
        <ConceptIcon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex-1">
        <span className="hidden text-sm font-semibold text-white md:block">
          {item.title}
        </span>
        <span className="hidden text-xs text-slate-400 md:block">
          {item.typeLabel}
        </span>

        <span className="block text-sm font-semibold text-white md:hidden">
          {item.question}
        </span>
        <span
          className={`mt-1 flex items-center gap-1.5 text-xs font-medium md:hidden ${accent.concept}`}
        >
          <ConceptIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {item.concept}
        </span>
      </span>

      <span className="hidden flex-col items-end md:flex">
        <span className="text-xs text-slate-400">
          {copy.list.linkedConcept}
        </span>
        <span className={`text-sm font-semibold ${accent.concept}`}>
          {item.concept}
        </span>
      </span>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </a>
  );
};
