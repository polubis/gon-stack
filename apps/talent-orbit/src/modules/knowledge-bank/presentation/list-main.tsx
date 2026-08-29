import { copy } from './copy';
import { ListBankCard } from './list-bank-card';
import { ListHeader } from './list-header';
import { ListMobileNav } from './list-mobile-nav';
import { ListNewBankCard } from './list-new-bank-card';
import { ListSidebar } from './list-sidebar';

export const ListMain = () => (
  <div
    data-e2e="knowledge-bank:list-main"
    className="flex min-h-screen bg-slate-950"
  >
    <ListSidebar />

    <div className="flex-1">
      <ListMobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 md:px-10 md:py-10">
        <ListHeader />

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-400">
            {copy.list.yourBanks}
          </h2>

          <div className="flex flex-col gap-3">
            {copy.list.banks.map((bank, index) => (
              <ListBankCard key={bank.name} index={index} />
            ))}

            <ListNewBankCard />
          </div>
        </div>
      </main>
    </div>
  </div>
);
