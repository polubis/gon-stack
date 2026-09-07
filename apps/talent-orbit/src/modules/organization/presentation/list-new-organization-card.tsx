import { Plus } from 'lucide-react';
import { copy } from './copy';

export const ListNewOrganizationCard = () => (
  <a
    href="/organization-create/"
    data-e2e="organization:new-organization"
    className="flex items-center gap-3.5 rounded-2xl border border-dashed border-slate-700 p-4 text-slate-300 hover:border-slate-600 hover:text-white"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
      <Plus className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className="flex-1">
      <span className="block text-sm font-semibold">
        {copy.list.newOrganization}
      </span>
      <span className="block text-xs text-slate-400">
        {copy.list.newOrganizationSubtitle}
      </span>
    </span>
  </a>
);
