import { Plus } from 'lucide-react';
import { copy } from './copy';

export const ListNewBankCard = () => (
  <>
    <a
      href="/knowledge-bank-create/"
      data-e2e="knowledge-bank:new-bank-mobile"
      className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 md:hidden"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {copy.list.newBank}
    </a>

    <a
      href="/knowledge-bank-create/"
      data-e2e="knowledge-bank:new-bank-desktop"
      className="hidden items-center gap-3.5 rounded-2xl border border-dashed border-slate-700 p-4 text-slate-300 hover:border-slate-600 hover:text-white md:flex"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
        <Plus className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{copy.list.newBank}</span>
        <span className="block text-xs text-slate-400">
          {copy.list.newBankSubtitle}
        </span>
      </span>
    </a>
  </>
);
