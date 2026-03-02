export function LoginForm() {
  return (
    <section id="login" className="auth-panel flex flex-col gap-4">
      <h2 className="sr-only">Log in</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          className="variant-input w-full px-3 py-2.5 text-sm"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          className="variant-input w-full px-3 py-2.5 text-sm"
          autoComplete="current-password"
        />
      </div>
      <button
        type="button"
        className="variant-button-primary w-full py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
      >
        Log in
      </button>
    </section>
  );
}
