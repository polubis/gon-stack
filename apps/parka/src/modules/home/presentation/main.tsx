import { useState } from 'react';
import { Leaf, ScanLine, Pencil, ChartColumn } from 'lucide-react';
import { Button } from '@/modules/shared/ui';

const STEPS = [
  {
    icon: Leaf,
    title: 'Parka',
    body: 'Twoje wydatki pod kontrolą. Prosto, przejrzyście, bez stresu.',
    cta: 'Zacznijmy',
  },
  {
    icon: ScanLine,
    title: 'Skanuj paragony — szybko i wygodnie',
    body: 'Zrób zdjęcie paragonu, a my odczytamy dane i przypiszemy kategorie.',
    cta: 'Dalej',
  },
  {
    icon: Pencil,
    title: 'Edytuj i kategoryzuj wydatki',
    body: 'Popraw dowolną pozycję i przypisz właściwą kategorię w kilka sekund.',
    cta: 'Dalej',
  },
  {
    icon: ChartColumn,
    title: 'Masz pełną kontrolę',
    body: 'Sprawdzaj podsumowania, limity i cele oszczędnościowe w jednym miejscu.',
    cta: 'Zaczynajmy',
  },
] as const;

const enterApp = () => {
  // Personal finance features need a real account; onboarding hands off to
  // registration where the backend session (and demo data) is created.
  window.location.href = '/sign-up/';
};

export const Main = () => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      data-e2e="home:main"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-12"
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-brand-soft text-brand">
          <Icon className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {current.title}
        </h1>
        <p className="mt-3 max-w-xs text-ink-soft">{current.body}</p>

        <ol
          className="mt-8 flex gap-2"
          aria-label={`Krok ${step + 1} z ${STEPS.length}`}
        >
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? 'step' : undefined}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-brand' : 'w-1.5 bg-black/15'
              }`}
            />
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <Button
          data-e2e="home:primary"
          onClick={() => (isLast ? enterApp() : setStep((s) => s + 1))}
        >
          {current.cta}
        </Button>
        {isLast ? (
          <p className="text-center text-sm text-ink-soft">
            Masz już konto?{' '}
            <a
              href="/sign-in/"
              className="font-semibold text-brand-dark underline"
            >
              Zaloguj się
            </a>
          </p>
        ) : (
          <Button variant="ghost" data-e2e="home:skip" onClick={enterApp}>
            Pomiń
          </Button>
        )}
      </div>
    </div>
  );
};
