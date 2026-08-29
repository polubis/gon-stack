import { Pencil } from 'lucide-react';
import { ChildConcepts } from './child-concepts';
import { copy } from './copy';
import { Coverage } from './coverage';
import { Header } from './header';
import { Metadata } from './metadata';
import { Parent } from './parent';
import { StatusBanner } from './status-banner';

export const Main = () => (
  <main
    data-e2e="concept-details:main"
    className="min-h-screen bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Header />
      <StatusBanner />
      <Coverage />
      <Parent />
      <ChildConcepts />
      <Metadata />

      <button
        type="button"
        data-e2e="concept-details:edit"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-900"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        {copy.edit}
      </button>
    </div>
  </main>
);
