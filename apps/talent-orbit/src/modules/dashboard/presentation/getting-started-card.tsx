import {
  ChevronRight,
  CircleCheck,
  ClipboardList,
  HelpCircle,
  IdCard,
} from 'lucide-react';
import { copy } from './copy';

const itemIcon = [IdCard, CircleCheck, ClipboardList, HelpCircle];

export const GettingStartedCard = () => (
  <div
    data-e2e="dashboard:getting-started"
    className="hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 md:block"
  >
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-white">{copy.gettingStarted.title}</h2>
      <ClipboardList className="h-5 w-5 text-slate-400" aria-hidden="true" />
    </div>

    <ul className="mt-4 flex flex-col">
      {copy.gettingStarted.items.map((item, index) => {
        const Icon = itemIcon[index];

        return (
          <li key={item.label}>
            <a
              href="#"
              data-e2e={`dashboard:getting-started-${index}`}
              className="flex items-center justify-between gap-3 border-b border-slate-800 py-3 text-sm text-slate-200 last:border-b-0 hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {item.label}
              </span>
              {'trailing' in item ? (
                <span className="text-xs text-slate-400">{item.trailing}</span>
              ) : (
                <ChevronRight
                  className="h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
              )}
            </a>
          </li>
        );
      })}
    </ul>

    <a
      href="#"
      data-e2e="dashboard:explore-assessments"
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
    >
      {copy.exploreAssessments}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </a>
  </div>
);
