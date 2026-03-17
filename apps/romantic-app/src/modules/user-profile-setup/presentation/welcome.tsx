import { useContext } from './context';

export const Welcome = () => {
  const ctx = useContext();

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="variant-pill">PROFILE SETUP</div>
      </header>
      <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
        Let&apos;s set up your relationship profile
      </h1>
      <p className="text-text-secondary">
        Takes about 3-5 minutes. Your answers stay private in your room.
      </p>
      <div className="variant-option p-4 text-sm text-text-secondary leading-relaxed">
        We&apos;ll start with a few basics, then some quick questions about how
        you are in relationships. Ready?
      </div>
      <button
        type="button"
        className="variant-button-primary w-full md:w-auto md:self-end py-2.5 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
        onClick={() => ctx.trigger('[TRIGGER]_START')}
      >
        Let&apos;s go
      </button>
    </div>
  );
};
