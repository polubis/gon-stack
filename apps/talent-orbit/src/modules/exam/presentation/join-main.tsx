import { ArrowRight, Eye, Link2, Lock, ShieldCheck, User } from 'lucide-react';
import { copy } from './copy';

export const JoinMain = () => (
  <main
    data-e2e="exam:join-main"
    className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-4 py-12"
  >
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange-500">
        <div className="h-6 w-6 rounded-full bg-orange-500" />
      </div>
      <span className="text-sm font-bold tracking-[0.22em] text-white">
        TALENT ORBIT
      </span>
    </div>

    <div
      data-e2e="exam:join-card"
      className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8"
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{copy.join.title}</h1>
        <p className="mt-1 hidden text-sm text-slate-400 md:block">
          {copy.join.subtitle}
        </p>
        <p className="mt-1 text-sm text-slate-400 md:hidden">
          {copy.join.anonymous}
        </p>
      </div>

      <div
        data-e2e="exam:join-link-recognized"
        className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:hidden"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <Link2 className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">
            {copy.join.linkRecognizedTitle}
          </span>
          <span className="block text-xs text-slate-400">
            {copy.join.linkRecognizedName}
          </span>
        </span>
      </div>

      <form data-e2e="exam:join-form" className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="exam-password"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            <span className="hidden md:inline">{copy.join.passwordLabel}</span>
            <span className="md:hidden">{copy.join.passwordLabelMobile}</span>
          </label>
          <div className="relative">
            <input
              id="exam-password"
              type="password"
              defaultValue="orbit2025"
              data-e2e="exam:join-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-4 pr-16 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label={copy.join.show}
              data-e2e="exam:join-toggle-password"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User
            className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {copy.join.noAccountTitle}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {copy.join.noAccountBody}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {copy.join.privateTitle}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {copy.join.privateBody}
            </p>
          </div>
        </div>

        <a
          href="/exams-question/"
          data-e2e="exam:join-submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.join.join}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </form>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 md:hidden">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.join.noAccountFooterMobile}
      </p>
    </div>
  </main>
);
