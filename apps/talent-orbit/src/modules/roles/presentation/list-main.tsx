import { copy } from './copy';
import { ListHeader } from './list-header';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { UserRow } from './user-row';

export const ListMain = () => (
  <div data-e2e="roles:list-main" className="flex min-h-screen bg-slate-950">
    <Sidebar />

    <div className="flex-1">
      <MobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 pb-10 md:max-w-4xl md:px-10 md:py-10">
        <ListHeader />

        <div className="hidden grid-cols-[auto_1fr_8rem_8rem] gap-4 px-4 text-xs font-semibold text-slate-400 md:grid">
          <span aria-hidden="true" />
          <span>{copy.list.columns.user}</span>
          <span>{copy.list.columns.role}</span>
          <span>{copy.list.columns.status}</span>
        </div>

        <div
          role="radiogroup"
          aria-label={copy.list.title}
          className="flex flex-col gap-3"
        >
          {copy.list.users.map((user) => (
            <UserRow key={user.id} {...user} />
          ))}
        </div>
      </main>
    </div>
  </div>
);
