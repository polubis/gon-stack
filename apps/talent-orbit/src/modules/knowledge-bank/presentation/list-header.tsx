import { Bell, Search, SlidersHorizontal, User } from 'lucide-react';
import { copy } from './copy';

export const ListHeader = () => (
  <div data-e2e="knowledge-bank:header">
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{copy.list.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{copy.list.subtitle}</p>
      </div>

      <div className="hidden items-center gap-4 text-slate-300 md:flex">
        <button
          type="button"
          aria-label={copy.notificationsLabel}
          data-e2e="knowledge-bank:notifications"
          className="hover:text-white"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={copy.accountLabel}
          data-e2e="knowledge-bank:account"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div className="mt-5 flex items-center gap-2">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={copy.list.searchPlaceholder}
          data-e2e="knowledge-bank:search"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
        />
      </div>
      <button
        type="button"
        aria-label={copy.list.filterLabel}
        data-e2e="knowledge-bank:filter"
        className="hidden h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white md:flex"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
);
