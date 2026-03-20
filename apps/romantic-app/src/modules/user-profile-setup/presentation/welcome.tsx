import { useContext } from './context';

export const Welcome = () => {
  const ctx = useContext();
  const isLoading = ctx.$isLoading.use();
  const isIdle = ctx.$isIdle.use();
  const error = ctx.$error.use();
  const totalSteps = ctx.$totalSteps.use();
  const hasError = Boolean(error);
  const canStart = !isLoading && !isIdle && !hasError && totalSteps > 0;

  if (hasError) {
    return (
      <div className="flex flex-col gap-5" role="alert" aria-live="assertive">
        <header className="flex items-center justify-between gap-3">
          <div className="variant-pill">SETUP UNAVAILABLE</div>
          <span className="c2 text-error">
            Error
          </span>
        </header>
        <h4 className="t4">We couldn&apos;t load your profile setup</h4>
        <p className="b1">
          There was a problem loading the configuration for this room.
        </p>
        <div
          className="variant-option p-4 b2 text-error"
          style={{
            borderColor: 'var(--color-error)',
            boxShadow:
              '0 0 0 1px color-mix(in srgb, var(--color-error) 40%, transparent), 0 0 14px color-mix(in srgb, var(--color-error) 55%, transparent)',
          }}
        >
          {error}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="variant-button-secondary w-full md:w-auto py-2.5 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
            onClick={() => ctx.trigger('[TRIGGER]_INIT')}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="variant-pill">PROFILE SETUP</div>
      </header>
      <h4 className="t4">Let&apos;s set up your relationship profile</h4>
      <p className="b1">
        Takes about 3-5 minutes. Your answers stay private in your room.
      </p>
      <div className="variant-option p-4 b2">
        We&apos;ll start with a few basics, then some quick questions about how
        you are in relationships. Ready?
      </div>
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <button
          type="button"
          disabled={!canStart}
          className="variant-button-primary w-full md:w-auto py-2.5 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
          onClick={() => ctx.trigger('[TRIGGER]_START')}
        >
          Let&apos;s go
        </button>
      </div>
    </div>
  );
};

