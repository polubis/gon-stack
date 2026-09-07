import { copy } from './copy';

export const Parent = () => (
  <div
    data-e2e="concept-details:parent"
    className="flex flex-col gap-3 border-b border-slate-800 pb-6"
  >
    <h2 className="text-sm font-semibold text-slate-400">
      {copy.parent.label}
    </h2>
    <p className="text-sm font-medium">
      <a
        href="/knowledge-bank/frontend-engineering/"
        data-e2e="concept-details:parent-bank"
        className="text-orange-400 hover:text-orange-300"
      >
        {copy.parent.bank}
      </a>
      <span className="mx-1.5 text-slate-400">/</span>
      <span className="text-slate-300">{copy.parent.concept}</span>
    </p>
  </div>
);
