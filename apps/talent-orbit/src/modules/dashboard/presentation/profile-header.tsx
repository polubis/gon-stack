import { Bell, Search, User, UserRound } from 'lucide-react';
import { copy } from './copy';

export const ProfileHeader = () => (
  <div data-e2e="dashboard:profile-header">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400 md:hidden">{copy.welcome}</p>
        <h1 className="text-2xl font-bold text-white">{copy.candidateId}</h1>
      </div>

      <div className="hidden items-center gap-4 text-slate-300 md:flex">
        <button
          type="button"
          aria-label="Search"
          data-e2e="dashboard:search"
          className="hover:text-white"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={copy.notificationsLabel}
          data-e2e="dashboard:notifications"
          className="hover:text-white"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={copy.accountLabel}
          data-e2e="dashboard:account"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white"
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <span
      data-e2e="dashboard:role-badge"
      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-500/60 px-3 py-1 text-xs font-semibold text-orange-400"
    >
      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
      {copy.roleBadge}
    </span>
  </div>
);
