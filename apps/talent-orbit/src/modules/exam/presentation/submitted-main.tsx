import { Check, FileText } from 'lucide-react';
import { copy } from './copy';

export const SubmittedMain = () => (
  <main
    data-e2e="exam:submitted-main"
    className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4 py-12 text-center"
  >
    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500">
      <Check
        className="h-14 w-14 text-emerald-400"
        aria-hidden="true"
        strokeWidth={3}
      />
    </div>

    <div>
      <h1 className="text-2xl font-bold text-white">{copy.submitted.title}</h1>
      <p className="mt-1 text-sm text-slate-400">{copy.submitted.subtitle}</p>
    </div>

    <div
      data-e2e="exam:submitted-id"
      className="flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5"
    >
      <FileText
        className="h-5 w-5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
      <span>
        <span className="block text-xs text-slate-400">
          {copy.submitted.idLabel}
        </span>
        <span className="hidden font-mono text-lg font-semibold text-emerald-400 md:block">
          {copy.submitted.id}
        </span>
        <span className="font-mono text-lg font-semibold text-white md:hidden">
          {copy.submitted.idMobile}
        </span>
      </span>
    </div>

    <a
      href="/exams-detail/"
      data-e2e="exam:submitted-done"
      className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-400"
    >
      {copy.submitted.done}
    </a>
  </main>
);
