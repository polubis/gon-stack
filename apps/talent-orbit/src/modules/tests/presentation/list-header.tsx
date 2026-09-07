import { Plus, Search } from 'lucide-react';
import { copy } from './copy';

export const ListHeader = () => (
  <div data-e2e="tests:header">
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{copy.list.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{copy.list.subtitle}</p>
      </div>
    </div>

    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder={copy.list.searchPlaceholder}
          data-e2e="tests:search"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <a
        href="/tests-name/"
        data-e2e="tests:new-test-desktop"
        className="hidden items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 md:flex"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {copy.list.newTest}
      </a>
    </div>
  </div>
);
