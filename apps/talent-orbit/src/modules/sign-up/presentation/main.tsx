import { Eye, Mail, ShieldCheck, User } from 'lucide-react';
import { copy } from './copy';

export const Main = () => (
  <main
    data-e2e="sign-up:main"
    className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12"
  >
    <div
      data-e2e="sign-up:card"
      className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 sm:p-10"
    >
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        {copy.title}
      </h1>
      <p className="mt-2 text-sm text-slate-400">{copy.subtitle}</p>

      <form data-e2e="sign-up:form" className="mt-8 flex flex-col gap-6">
        <div>
          <label
            htmlFor="full-name"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.fullNameLabel}
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="full-name"
              type="text"
              placeholder={copy.fullNamePlaceholder}
              data-e2e="sign-up:full-name"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.emailLabel}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              placeholder={copy.emailPlaceholder}
              data-e2e="sign-up:email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.passwordLabel}
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder={copy.passwordPlaceholder}
              data-e2e="sign-up:password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-4 pr-16 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="button"
              data-e2e="sign-up:toggle-password"
              className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {copy.showPassword}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {copy.confirmPasswordLabel}
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder={copy.confirmPasswordPlaceholder}
            data-e2e="sign-up:confirm-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-4 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            data-e2e="sign-up:agree-to-terms"
            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-orange-500"
          />
          {copy.agreeToTerms}
        </label>

        <button
          type="submit"
          data-e2e="sign-up:submit"
          className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
        >
          {copy.submit}
        </button>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-800" />
          <span className="text-sm text-slate-400">{copy.divider}</span>
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          data-e2e="sign-up:sso"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {copy.sso}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-400">
        {copy.haveAccount}{' '}
        <a
          href="/sign-in/"
          data-e2e="sign-up:sign-in"
          className="font-medium text-orange-400 hover:text-orange-300"
        >
          {copy.signIn}
        </a>
      </p>
    </div>
  </main>
);
