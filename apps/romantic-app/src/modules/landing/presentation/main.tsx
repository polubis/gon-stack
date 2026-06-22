import { cn } from '@repo/react-kit/cn';
import { Card } from '../../../libs/ui/card';

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

type Props = {
  userEmail?: string | null;
};

export function Main({ userEmail = null }: Props) {
  return (
    <div className="min-h-screen font-sans text-text-primary bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_4px),linear-gradient(180deg,#0a0718_0%,#120c24_46%,#1a1133_100%)]">
      <nav className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--color-primary-500)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-0)_88%,transparent)] shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary-500)_30%,transparent)] backdrop-blur-md">
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
                className={cn(
                  'inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition-all duration-150',
                  idx === 0
                    ? 'bg-[linear-gradient(120deg,var(--color-primary-500),var(--color-secondary-500))] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-secondary-400)_60%,transparent)]'
                    : 'text-text-tertiary hover:bg-[color-mix(in_srgb,var(--color-primary-500)_24%,transparent)] hover:text-white hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-500)_55%,transparent)]',
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {userEmail ? (
              <>
                <span
                  className="max-w-[180px] truncate rounded-lg border border-[color-mix(in_srgb,#ffffff_16%,transparent)] bg-[color-mix(in_srgb,#ffffff_5%,transparent)] px-3 py-1.5 text-xs font-semibold text-text-tertiary"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <form method="post" action="/api/auth/logout">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em] transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--color-primary-500)_24%,transparent)] hover:text-white hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-500)_55%,transparent)]"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-text-tertiary uppercase tracking-[0.12em] transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--color-primary-500)_24%,transparent)] hover:text-white hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-500)_55%,transparent)]"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[linear-gradient(120deg,var(--color-primary-500),#ff4fe3)] px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-400)_50%,transparent)] transition-all duration-150 hover:saturate-[1.2]"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="border-b border-surface-200 bg-[radial-gradient(circle_at_10%_50%,color-mix(in_srgb,var(--color-secondary-400)_35%,transparent)_0%,transparent_28%),radial-gradient(circle_at_90%_30%,color-mix(in_srgb,var(--color-primary-400)_35%,transparent)_0%,transparent_30%)]">
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
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[linear-gradient(120deg,var(--color-primary-500),#ff4fe3)] px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-400)_50%,transparent)] transition-all duration-150 hover:saturate-[1.2]"
                >
                  Start free
                </a>
                <a
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,#ffffff_16%,transparent)] bg-[color-mix(in_srgb,#ffffff_5%,transparent)] px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-text-primary transition-all duration-150"
                >
                  I already have an account
                </a>
              </div>
            </div>

            <Card className="p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
                Quick preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Your next game night, organized
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-secondary-300)_40%,transparent)] bg-[color-mix(in_srgb,#ffffff_4%,transparent)] text-text-primary p-3 transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)]">
                  <p className="text-sm font-semibold">Create private room</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Invite with a 6-character code
                  </p>
                </div>
                <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-secondary-300)_40%,transparent)] bg-[color-mix(in_srgb,#ffffff_4%,transparent)] text-text-primary p-3 transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)]">
                  <p className="text-sm font-semibold">
                    Choose category difficulty
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Easy, Medium, Hard progression
                  </p>
                </div>
                <div className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-secondary-300)_40%,transparent)] bg-[color-mix(in_srgb,#ffffff_4%,transparent)] text-text-primary p-3 transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)]">
                  <p className="text-sm font-semibold">
                    Score + reveal answers
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Fun competition, no pressure
                  </p>
                </div>
              </div>
            </Card>
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
            <Card role="article" className="p-5">
              <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-500)_30%,transparent)] px-2.5 py-1 text-[11px] uppercase tracking-[0.11em] text-white">
                Step 1
              </span>
              <h3 className="mt-3 text-lg font-semibold">Create profiles</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Set your name, age, and romantic vibe so the app can personalize
                your sessions.
              </p>
            </Card>
            <Card role="article" className="p-5">
              <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-500)_30%,transparent)] px-2.5 py-1 text-[11px] uppercase tracking-[0.11em] text-white">
                Step 2
              </span>
              <h3 className="mt-3 text-lg font-semibold">Join one room</h3>
              <p className="mt-2 text-sm text-text-secondary">
                One partner creates a room and shares the code. Both join in
                seconds.
              </p>
            </Card>
            <Card role="article" className="p-5">
              <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-500)_30%,transparent)] px-2.5 py-1 text-[11px] uppercase tracking-[0.11em] text-white">
                Step 3
              </span>
              <h3 className="mt-3 text-lg font-semibold">Play and reveal</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Answer simultaneously, reveal together, and learn what brings
                you closer.
              </p>
            </Card>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto w-full max-w-5xl px-4 py-4 md:py-6"
        >
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Core features</h2>
              <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-secondary-300)_70%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary-500)_24%,transparent)] px-2.5 py-1 text-[11px] uppercase tracking-[0.11em] text-white">
                MVP
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {FEATURE_LIST.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-secondary-300)_40%,transparent)] bg-[color-mix(in_srgb,#ffffff_4%,transparent)] text-text-primary p-4 transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-primary-300)_70%,transparent)]"
                >
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </Card>
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
              <Card key={item.id} role="article" className="p-5">
                <p className="text-sm text-text-secondary">
                  &quot;{item.quote}&quot;
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  {item.name}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-12">
          <Card className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
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
                className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[linear-gradient(120deg,var(--color-primary-500),#ff4fe3)] px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-400)_50%,transparent)] transition-all duration-150 hover:saturate-[1.2]"
              >
                Get started
              </a>
              <a
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,#ffffff_16%,transparent)] bg-[color-mix(in_srgb,#ffffff_5%,transparent)] px-5 py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-text-primary transition-all duration-150"
              >
                Log in
              </a>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
