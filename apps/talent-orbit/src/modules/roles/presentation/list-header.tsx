import { Bell, Search, User } from 'lucide-react';
import { copy } from './copy';

export const ListHeader = () => (
  <div data-e2e="roles:list-header">
    <div className="flex items-start justify-between">
      <h1 className="text-2xl font-bold text-white">{copy.list.title}</h1>

      <div className="hidden items-center gap-4 text-slate-300 md:flex">
        <button
          type="button"
          aria-label={copy.notificationsLabel}
          data-e2e="roles:notifications"
          className="hover:text-white"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={copy.notificationsLabel}
          data-e2e="roles:account"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div className="mt-5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={copy.list.searchPlaceholder}
          data-e2e="roles:search"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {copy.list.filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            aria-pressed={index === 0}
            data-e2e={`roles:filter-${filter.toLowerCase()}`}
            className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold ${
              index === 0
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  </div>
);
