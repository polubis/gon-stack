import { ArrowRight, CheckCircle2, Circle, TrendingDown } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { Button } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { Ring } from '@/shared/ui/ring';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES, HIGHLIGHTS } from '../configuration/constraints';

const PREVIEW_STATS = [
  ['Średnio dziennie', '147,30 zł'],
  ['Transakcje', '14'],
  ['Do limitu', '1379,65 zł'],
] as const;

const PREVIEW_TASKS = [
  { title: 'Przegląd budżetu', at: '09:00', done: true },
  { title: 'Opłacić czynsz', at: '13:00', done: false },
] as const;

/** Sample of the app screens (made-up numbers): shows the product, says nothing new. */
const Preview = () => (
  <div
    aria-hidden="true"
    className="mx-auto w-full min-w-0 max-w-md select-none lg:max-w-lg"
  >
    <div className="hero-card flex animate-item-in flex-col gap-5 rounded-4xl p-6 shadow-popover motion-reduce:animate-none md:p-8 lg:-rotate-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-on-hero-soft">Wydatki w tym miesiącu</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-hero-track px-2.5 py-1 text-xs font-semibold">
          <TrendingDown className="size-3.5 text-accent" />
          12%
        </span>
      </div>
      <p className="whitespace-nowrap text-4xl font-semibold tracking-tight tabular-nums min-[22.5rem]:text-5xl md:text-6xl">
        1620,35 zł
      </p>
      <div className="flex items-center gap-5">
        <Ring
          surface="hero"
          pct={54}
          label="Przykładowe wykorzystanie limitu"
          className="size-24 md:size-28"
        />
        <dl className="min-w-0 flex-1 divide-y divide-hero-line">
          {PREVIEW_STATS.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <dt className="text-xs text-on-hero-soft">{label}</dt>
              <dd className="text-sm font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
    <div className="-mt-5 flex items-start gap-3 px-3 md:px-6">
      <div
        style={{ animationDelay: '120ms' }}
        className="min-w-0 flex-1 animate-item-in rounded-3xl border border-line bg-card p-4 shadow-popover motion-reduce:animate-none lg:rotate-2"
      >
        <p className="text-xs font-semibold">Zadania na dziś</p>
        <ul className="mt-2 flex flex-col gap-2">
          {PREVIEW_TASKS.map(({ title, at, done }) => (
            <li key={title} className="flex items-center gap-2 text-xs">
              {done ? (
                <CheckCircle2 className="size-4.5 shrink-0 fill-accent text-on-accent" />
              ) : (
                <Circle className="size-4.5 shrink-0 text-ink-soft" />
              )}
              <span
                className={
                  done
                    ? 'min-w-0 flex-1 truncate text-ink-soft line-through'
                    : 'min-w-0 flex-1 truncate font-medium'
                }
              >
                {title}
              </span>
              <span className="rounded-full bg-hover px-2 py-0.5 tabular-nums max-[22.5rem]:hidden">
                {at}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        style={{ animationDelay: '220ms' }}
        className="mt-6 w-28 shrink-0 animate-item-in min-[22.5rem]:w-32 rounded-3xl bg-accent p-4 text-on-accent shadow-popover motion-reduce:animate-none md:w-40 lg:-rotate-3"
      >
        <p className="text-xs font-medium">Limit: Spożywcze</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          78%
        </p>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-on-accent/15">
          <span className="block h-full w-[78%] rounded-full bg-on-accent" />
        </span>
      </div>
    </div>
  </div>
);

const HomeView = () => (
  <div
    data-e2e="home:main"
    className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 py-10 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-16 xl:px-16"
  >
    <div className="flex min-w-0 animate-view-enter flex-col items-start motion-reduce:animate-none">
      <h1 className="text-7xl font-semibold leading-none tracking-tighter md:text-8xl xl:text-9xl">
        Parka
      </h1>
      <p className="mt-5 max-w-md text-2xl leading-tight tracking-tight md:text-3xl lg:mt-6 lg:max-w-xl lg:text-4xl">
        <span className="font-semibold">Twoje wydatki pod kontrolą.</span>{' '}
        <span className="font-light text-ink-soft">
          Prosto, przejrzyście, bez stresu.
        </span>
      </p>
      <ul className="mt-8 flex flex-wrap gap-2">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-4 text-sm font-medium shadow-card"
          >
            <span className="cta grid size-7 place-items-center rounded-full">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <Button
          data-e2e="home:primary"
          href={APP_ROUTER.signUp()}
          className="px-8 py-4 text-base sm:w-auto"
        >
          Załóż konto
          <ArrowRight className="size-5" aria-hidden="true" />
        </Button>
        <p className="text-center text-sm text-ink-soft sm:text-left">
          Masz już konto?{' '}
          <a
            href={APP_ROUTER.signIn()}
            className="font-semibold text-ink underline underline-offset-4"
          >
            Zaloguj się
          </a>
        </p>
      </div>
    </div>
    <Preview />
  </div>
);

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd ekranu powitalnego"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <HomeView />
  </ErrorBoundary>
);
