import {
  Accessibility,
  Atom,
  ChevronRight,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { copy } from './copy';

const accentClasses = {
  sky: 'bg-sky-500/10 text-sky-400',
  violet: 'bg-violet-500/10 text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
} as const;

const cardIcon = { sky: Atom, violet: Accessibility, emerald: Atom } as const;

export const ListTestCard = ({ index }: { index: number }) => {
  const item = copy.list.tests[index];
  const Icon = cardIcon[item.accent];

  return (
    <a
      href="/tests-name/"
      data-e2e={`tests:card-${index}`}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[item.accent]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">
          {item.name}
        </span>
        <span className="mt-0.5 block text-xs text-slate-400">
          {item.description}
        </span>
        <span className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {item.questions} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {item.minutes} min
          </span>
        </span>
      </span>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </a>
  );
};
