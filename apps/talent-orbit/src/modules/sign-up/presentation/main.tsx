import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { copy } from './copy';

export const Main = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get('password') ?? '');
    const confirmPassword = String(data.get('confirmPassword') ?? '');
    const agreedToTerms = data.get('agreeToTerms') === 'on';

    if (password !== confirmPassword) {
      event.preventDefault();
      setFormError(copy.passwordMismatchError);
      return;
    }

    if (!agreedToTerms) {
      event.preventDefault();
      setFormError(copy.termsRequiredError);
    }
  };

  return (
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

        <form
          data-e2e="sign-up:form"
          method="post"
          action="/api/auth/register"
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-6"
        >
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
                autoComplete="name"
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
                name="email"
                type="email"
                placeholder={copy.emailPlaceholder}
                autoComplete="email"
                required
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={copy.passwordPlaceholder}
                autoComplete="new-password"
                minLength={8}
                required
                data-e2e="sign-up:password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-4 pr-16 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                data-e2e="sign-up:toggle-password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                {showPassword ? copy.hidePassword : copy.showPassword}
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
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder={copy.confirmPasswordPlaceholder}
              autoComplete="new-password"
              minLength={8}
              required
              data-e2e="sign-up:confirm-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-4 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="agreeToTerms"
              data-e2e="sign-up:agree-to-terms"
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-orange-500"
            />
            {copy.agreeToTerms}
          </label>

          {formError ? (
            <p
              data-e2e="sign-up:form-error"
              role="alert"
              className="flex items-center gap-1.5 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            data-e2e="sign-up:submit"
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {copy.submit}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-800" />
            <span className="text-sm text-slate-400">{copy.divider}</span>
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <form method="post" action="/api/auth/login">
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              data-e2e="sign-up:sso"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {copy.sso}
            </button>
          </form>
        </div>

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
};
