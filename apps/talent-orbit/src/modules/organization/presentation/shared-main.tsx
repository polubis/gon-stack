import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Database,
  Share2,
} from 'lucide-react';
import { copy } from './copy';

const resourceIcon = [Share2, Database, Share2];

const accentClasses = {
  orange: 'bg-orange-500/10 text-orange-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-400',
} as const;

export const SharedMain = () => (
  <main
    data-e2e="organization:shared-main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        <a
          href="/organization-share/"
          aria-label={copy.shared.back}
          data-e2e="organization:shared-back"
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-5.5 w-5.5" aria-hidden="true" />
        </a>
        <h1 className="text-lg font-bold text-white">{copy.shared.title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-bold text-white">
          {copy.shared.organization}
        </span>
      </div>

      <nav
        aria-label={copy.shared.title}
        data-e2e="organization:shared-tabs"
        className="flex items-center gap-6 border-b border-slate-800"
      >
        <a
          href="#"
          aria-current="page"
          data-e2e="organization:shared-tab-banks"
          className="border-b-2 border-orange-500 pb-2.5 text-sm font-semibold text-orange-400"
        >
          {copy.shared.tabs.banks}
        </a>
        <a
          href="#"
          data-e2e="organization:shared-tab-questions"
          className="border-b-2 border-transparent pb-2.5 text-sm font-medium text-slate-400 hover:text-white"
        >
          {copy.shared.tabs.questions}
        </a>
        <a
          href="#"
          data-e2e="organization:shared-tab-tests"
          className="border-b-2 border-transparent pb-2.5 text-sm font-medium text-slate-400 hover:text-white"
        >
          {copy.shared.tabs.tests}
        </a>
      </nav>

      <div className="flex flex-col gap-3">
        {copy.shared.resources.map((resource, index) => {
          const Icon = resourceIcon[index];

          return (
            <a
              key={resource.name}
              href={index === 0 ? '/organization-share-confirmation/' : '#'}
              data-e2e={`organization:shared-resource-${index}`}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[resource.accent]}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-white">
                  {resource.name}
                </span>
                <span className="block text-xs text-slate-400">
                  Shared by anonymous team ID: {resource.teamId}
                </span>
              </span>
              <ChevronRight
                className="h-4.5 w-4.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </a>
          );
        })}
      </div>
    </div>
  </main>
);
