import { CheckCircle2, ShieldCheck, UserCog } from 'lucide-react';
import { copy } from './copy';

export const ConfirmationMain = () => (
  <main
    data-e2e="roles:confirmation-main"
    className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-6 md:px-10 md:py-10"
  >
    <div className="flex w-full max-w-md flex-col gap-6">
      <div
        data-e2e="roles:confirmation-success"
        className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-800 bg-emerald-500/10 p-6 text-center"
      >
        <CheckCircle2
          className="h-11 w-11 text-emerald-400"
          aria-hidden="true"
        />
        <span className="text-lg font-bold text-emerald-400">
          {copy.confirmation.title}
        </span>
        <span className="text-sm text-emerald-200/80">
          {copy.confirmation.subtitle}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3.5 pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
            U
          </span>
          <span>
            <span className="block text-xs font-semibold text-slate-400">
              {copy.confirmation.userLabel}
            </span>
            <span className="block text-base font-bold text-white">
              {copy.confirmation.userId}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3.5 border-t border-slate-800 pt-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <UserCog className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-semibold text-slate-400">
              {copy.confirmation.newRoleLabel}
            </span>
            <span className="block text-base font-bold text-emerald-400">
              {copy.confirmation.newRole}
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <span>
          <span className="block text-sm font-semibold text-white">
            {copy.confirmation.recordedTitle}
          </span>
          <span className="block text-xs text-slate-400">
            {copy.confirmation.recordedSubtitle}
          </span>
        </span>
      </div>

      <a
        href="/roles/"
        data-e2e="roles:confirmation-done"
        className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {copy.confirmation.done}
      </a>
    </div>
  </main>
);
