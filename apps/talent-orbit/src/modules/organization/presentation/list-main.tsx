import { copy } from './copy';
import { ListHeader } from './list-header';
import { ListNewOrganizationCard } from './list-new-organization-card';
import { ListOrganizationCard } from './list-organization-card';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';

export const ListMain = () => (
  <div
    data-e2e="organization:list-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <div className="flex-1">
      <MobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 md:px-10 md:py-10">
        <ListHeader />

        <div className="flex flex-col gap-3">
          {copy.list.organizations.map((organization, index) => (
            <ListOrganizationCard key={organization.slug} index={index} />
          ))}

          <ListNewOrganizationCard />
        </div>
      </main>
    </div>
  </div>
);
