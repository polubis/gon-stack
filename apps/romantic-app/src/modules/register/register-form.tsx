export function RegisterForm() {
  return (
    <section id="register" className="auth-panel flex flex-col gap-4">
      <h2 className="sr-only">Create account</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="register-email" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          className="variant-input w-full px-3 py-2.5 text-sm"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="register-password" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          placeholder="••••••••"
          className="variant-input w-full px-3 py-2.5 text-sm"
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="register-confirm" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Confirm password
        </label>
        <input
          id="register-confirm"
          type="password"
          placeholder="••••••••"
          className="variant-input w-full px-3 py-2.5 text-sm"
          autoComplete="new-password"
        />
      </div>
      <button
        type="button"
        className="variant-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
      >
        Create account
      </button>
    </section>
  );
}
