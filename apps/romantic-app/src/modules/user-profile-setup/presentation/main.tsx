import { Provider } from './context';

const Content = () => {
  return (
    <section
      id="user-profile-setup"
      className="w-full max-w-2xl variant-card p-6 md:p-8 flex flex-col gap-6"
    >
      {/* <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="variant-pill">Profile setup</div>
          {step > 0 && (
            <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
              Step {Math.min(step, TOTAL_STEPS)} of {TOTAL_STEPS}
              {progressLabel ? ` - ${progressLabel}` : ''}
            </p>
          )}
        </div>
        {step > 0 && (
          <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
              style={{
                width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>
        )}
      </header> */}

      {/* <footer className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="variant-button-ghost py-2.5 px-4 text-sm font-semibold"
          onClick={() => setStep(1)}
        >
          Edit answers
        </button>
        <button
          type="button"
          className="variant-button-primary py-2.5 px-4 text-sm font-semibold uppercase tracking-[0.14em]"
          onClick={() => setSaved(true)}
        >
          Save profile &amp; start playing
        </button>
      </footer> */}
    </section>
  );
};

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
