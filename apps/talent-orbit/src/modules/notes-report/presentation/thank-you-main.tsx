import { Check, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { copy } from './copy';
import { Sidebar } from './sidebar';

export const ThankYouMain = () => (
  <div
    data-e2e="notes-report:thank-you-main"
    className="flex min-h-screen bg-slate-950"
  >
    <Sidebar />

    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
      <div className="hidden items-center gap-2 self-start px-4 text-sm font-semibold text-orange-400 md:flex">
        <UserCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
        {copy.thankYou.badge}
      </div>

      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500">
        <Check
          className="h-14 w-14 text-emerald-400"
          aria-hidden="true"
          strokeWidth={3}
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">{copy.thankYou.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{copy.thankYou.subtitle}</p>
        <p className="text-sm text-slate-400">{copy.thankYou.subtitleLine2}</p>
      </div>

      <a
        href="/"
        data-e2e="notes-report:thank-you-exit"
        className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 md:bg-transparent md:text-orange-400 md:border-orange-500 md:hover:bg-orange-500/10"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {copy.thankYou.exit}
      </a>

      <p className="flex max-w-sm items-center gap-2 text-xs text-slate-400">
        <ShieldCheck
          className="h-4 w-4 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
        {copy.thankYou.privacyNote}
      </p>
    </main>
  </div>
);
