import { BarChart3, ChevronRight } from 'lucide-react';
import { copy } from './copy';

export const MobileExploreRow = () => (
  <a
    href="#"
    data-e2e="dashboard:mobile-explore-assessments"
    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-medium text-slate-200 md:hidden"
  >
    <span className="flex items-center gap-2.5">
      <BarChart3 className="h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
      {copy.exploreAssessments}
    </span>
    <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
  </a>
);
