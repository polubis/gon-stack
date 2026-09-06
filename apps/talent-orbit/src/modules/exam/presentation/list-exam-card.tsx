import { CalendarCheck, ChevronRight, Users } from 'lucide-react';
import { copy } from './copy';

const iconAccent = {
  calendar: 'bg-violet-500/10 text-violet-400',
  'check-blue': 'bg-blue-500/10 text-blue-400',
  'check-green': 'bg-emerald-500/10 text-emerald-400',
} as const;

const statusTone = {
  Upcoming: 'bg-emerald-500/10 text-emerald-400',
  Live: 'bg-orange-500/10 text-orange-400',
  Closed: 'bg-slate-700/50 text-slate-300',
} as const;

export const ListExamCard = ({ index }: { index: number }) => {
  const item = copy.list.exams[index];

  return (
    <a
      href="/exams-detail/"
      data-e2e={`exam:list-card-${index}`}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconAccent[item.icon]}`}
      >
        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">
          {item.name}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {item.date}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {item.candidates} candidates
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone[item.status]}`}
          >
            {item.status}
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
