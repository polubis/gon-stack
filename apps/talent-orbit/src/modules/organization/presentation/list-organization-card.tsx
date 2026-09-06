import { ChevronRight, Sparkles, Building2, Users } from 'lucide-react';
import { copy } from './copy';

const orgIcon = [Building2, Sparkles, Users];

const accentClasses = {
  orange: 'bg-orange-500/10 text-orange-400',
  sky: 'bg-sky-500/10 text-sky-400',
  violet: 'bg-violet-500/10 text-violet-400',
} as const;

const badgeClasses = {
  Owner: 'bg-orange-500/10 text-orange-400',
  Participating: 'bg-slate-800 text-slate-300',
} as const;

export const ListOrganizationCard = ({ index }: { index: number }) => {
  const organization = copy.list.organizations[index];
  const Icon = orgIcon[index];

  return (
    <a
      href={`/organization/${organization.slug}/`}
      data-e2e={`organization:card-${index}`}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[organization.accent]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex-1">
        <span className="block text-sm font-semibold text-white">
          {organization.name}
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClasses[organization.badge]}`}
          >
            {organization.badge}
          </span>
          <span className="text-xs text-slate-400">{organization.members}</span>
        </span>
      </span>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </a>
  );
};
