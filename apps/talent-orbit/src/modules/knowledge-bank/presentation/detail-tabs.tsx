import { copy } from './copy';

const tabs = [
  { label: copy.detail.tabs.overview, active: true },
  { label: copy.detail.tabs.graph, active: false },
  { label: copy.detail.tabs.concepts, active: false },
];

export const DetailTabs = () => (
  <nav
    aria-label={copy.detail.name}
    data-e2e="knowledge-bank:detail-tabs"
    className="flex items-center gap-6 border-b border-slate-800"
  >
    {tabs.map(({ label, active }) => (
      <a
        key={label}
        href="#"
        aria-current={active ? 'page' : undefined}
        data-e2e={`knowledge-bank:detail-tab-${label.toLowerCase()}`}
        className={`border-b-2 pb-3 text-sm font-medium ${
          active
            ? 'border-orange-500 text-orange-400'
            : 'border-transparent text-slate-400 hover:text-white'
        }`}
      >
        {label}
      </a>
    ))}
  </nav>
);
