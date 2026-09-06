import { Plus } from 'lucide-react';
import { copy } from './copy';
import { ListHeader } from './list-header';
import { ListMobileNav } from './list-mobile-nav';
import { ListSidebar } from './list-sidebar';
import { ListTestCard } from './list-test-card';

export const ListMain = () => (
  <div data-e2e="tests:list-main" className="flex min-h-screen bg-slate-950">
    <ListSidebar />

    <div className="flex-1">
      <ListMobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 md:px-10 md:py-10">
        <ListHeader />

        <div className="flex flex-col gap-3">
          {copy.list.tests.map((test, index) => (
            <ListTestCard key={test.name} index={index} />
          ))}
        </div>

        <a
          href="/tests-name/"
          data-e2e="tests:new-test-mobile"
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400 md:hidden"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {copy.list.newTest}
        </a>
      </main>
    </div>
  </div>
);
