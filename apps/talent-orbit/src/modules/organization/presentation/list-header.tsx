import { copy } from './copy';

export const ListHeader = () => (
  <div data-e2e="organization:list-header">
    <h1 className="text-2xl font-bold text-white">{copy.list.title}</h1>

    <div className="mt-5 flex items-center gap-6 border-b border-slate-800">
      <span
        aria-current="page"
        data-e2e="organization:tab-owned"
        className="border-b-2 border-orange-500 pb-2.5 text-sm font-semibold text-orange-400"
      >
        {copy.list.tabs.owned}
      </span>
      <span
        data-e2e="organization:tab-participating"
        className="border-b-2 border-transparent pb-2.5 text-sm font-medium text-slate-400"
      >
        {copy.list.tabs.participating}
      </span>
    </div>
  </div>
);
