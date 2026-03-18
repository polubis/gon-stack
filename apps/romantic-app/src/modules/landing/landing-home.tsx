const NAV_ITEMS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
];

const FEATURE_LIST = [
  {
    title: 'Playful compatibility games',
    text: 'Explore your connection with categories from Communication to Love Languages in a low-pressure format.',
  },
  {
    title: 'Simultaneous private answers',
    text: 'Both partners answer at the same time, then reveal together. Honest moments without overthinking.',
  },
  {
    title: 'Create or join room in seconds',
    text: 'Start a private room instantly and invite your partner with a 6-character code.',
  },
];

const SOCIAL_PROOF = [
  {
    id: 'A7K9Q1',
    name: 'Nora & Chris',
    quote: 'We finally talk about important things without it feeling heavy.',
  },
  {
    id: 'D2M4L8',
    name: 'Lena & Mark',
    quote:
      'The game format made date night fun again. We loved the challenge mode.',
  },
  {
    id: 'Q9P1T6',
    name: 'Mia & Jon',
    quote:
      'Simple to use, cozy vibe, and surprisingly meaningful conversations.',
  },
];

export function LandingHome() {
  return (
    <div
      className="variant-shell min-h-screen text-text-primary"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <nav className="sticky top-0 z-40 variant-nav">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-lg"
              aria-hidden="true"
            >
              💞
            </span>
            <span className="text-lg leading-tight">Amoria</span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item, idx) => (
              <a
                key={item.href}
                href={item.href}
                className={[
                  'inline-flex items-center justify-center px-2.5 py-1.5 text-center text-xs font-semibold transition-colors',
                  idx === 0 ? 'variant-nav-active' : 'variant-nav-item',
                ].join(' ')}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="variant-nav-item inline-flex items-center justify-center px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Log in
            </a>
            <a
              href="/register"
              className="variant-button-primary inline-flex items-center justify-center px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Sign up
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="variant-hero border-b border-surface-200">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">
                Relationship game app
              </p>
              <h1 className="text-4xl font-semibold text-balance md:text-5xl">
                Date better. Connect deeper. Play together.
              </h1>
              <p className="text-sm text-text-secondary md:text-base">
                Amoria helps couples discover compatibility through fun, guided
                game sessions with meaningful questions.
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <a
                  href="/register"
                  className="variant-button-primary inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  Start free
                </a>
                <a
                  href="/login"
                  className="variant-button-ghost inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  I already have an account
                </a>
              </div>
            </div>

            <div className="variant-card p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
                Quick preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Your next game night, organized
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <div className="variant-option p-3">
                  <p className="text-sm font-semibold">Create private room</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Invite with a 6-character code
                  </p>
                </div>
                <div className="variant-option p-3">
                  <p className="text-sm font-semibold">
                    Choose category difficulty
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Easy, Medium, Hard progression
                  </p>
                </div>
                <div className="variant-option p-3">
                  <p className="text-sm font-semibold">
                    Score + reveal answers
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Fun competition, no pressure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-5xl px-4 py-10 md:py-12"
        >
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              From match to meaningful conversation
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="variant-card p-5">
              <span className="variant-pill">Step 1</span>
              <h3 className="mt-3 text-lg font-semibold">Create profiles</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Set your name, age, and romantic vibe so the app can personalize
                your sessions.
              </p>
            </article>
            <article className="variant-card p-5">
              <span className="variant-pill">Step 2</span>
              <h3 className="mt-3 text-lg font-semibold">Join one room</h3>
              <p className="mt-2 text-sm text-text-secondary">
                One partner creates a room and shares the code. Both join in
                seconds.
              </p>
            </article>
            <article className="variant-card p-5">
              <span className="variant-pill">Step 3</span>
              <h3 className="mt-3 text-lg font-semibold">Play and reveal</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Answer simultaneously, reveal together, and learn what brings
                you closer.
              </p>
            </article>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-5xl px-4 py-4 md:py-6"
        >
          <div className="variant-card p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Core features</h2>
              <span className="variant-pill variant-pill-secondary">MVP</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {FEATURE_LIST.map((feature) => (
                <article key={feature.title} className="variant-option p-4">
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="mx-auto w-full max-w-5xl px-4 py-10 md:py-12"
        >
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-text-tertiary">
              Testimonials
            </p>
            <h2 className="mt-2 text-3xl font-semibold">What couples say</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SOCIAL_PROOF.map((item) => (
              <article key={item.id} className="variant-card p-5">
                <p className="text-sm text-text-secondary">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  {item.name}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-12">
          <div className="variant-card flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
                Ready to start?
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Create your first room today
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Free to start. Invite your partner in one tap.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <a
                href="/register"
                className="variant-button-primary inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em]"
              >
                Get started
              </a>
              <a
                href="/login"
                className="variant-button-ghost inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em]"
              >
                Log in
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
