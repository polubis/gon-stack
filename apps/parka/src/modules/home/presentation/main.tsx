import { Leaf, ScanLine, Pencil, ChartColumn } from 'lucide-react';
import { Main as Walkthrough } from '@/shared/walkthrough';
import type { WalkthroughStep, WalkthroughStepId } from '@/shared/walkthrough';

const STEPS: WalkthroughStep[] = [
  {
    id: 1 as WalkthroughStepId,
    icon: Leaf,
    title: 'Parka',
    body: 'Twoje wydatki pod kontrolą. Prosto, przejrzyście, bez stresu.',
    cta: 'Zacznijmy',
  },
  {
    id: 2 as WalkthroughStepId,
    icon: ScanLine,
    title: 'Skanuj paragony — szybko i wygodnie',
    body: 'Zrób zdjęcie paragonu, a my odczytamy dane i przypiszemy kategorie.',
    cta: 'Dalej',
  },
  {
    id: 3 as WalkthroughStepId,
    icon: Pencil,
    title: 'Edytuj i kategoryzuj wydatki',
    body: 'Popraw dowolną pozycję i przypisz właściwą kategorię w kilka sekund.',
    cta: 'Dalej',
  },
  {
    id: 4 as WalkthroughStepId,
    icon: ChartColumn,
    title: 'Masz pełną kontrolę',
    body: 'Sprawdzaj podsumowania, limity i cele oszczędnościowe w jednym miejscu.',
    cta: 'Zaczynajmy',
  },
];

const PERSISTENCE_KEY = 'parka:onboarding-walkthrough';

const enterApp = () => {
  // Personal finance features need a real account; onboarding hands off to
  // registration where the backend session (and demo data) is created.
  window.location.href = '/sign-up/';
};

export const Main = () => {
  return (
    <div
      data-e2e="home:main"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-12"
    >
      <Walkthrough
        steps={STEPS}
        persistenceKey={PERSISTENCE_KEY}
        onFinish={enterApp}
        lastStepFooter={
          <p className="text-center text-sm text-ink-soft">
            Masz już konto?{' '}
            <a
              href="/sign-in/"
              className="font-semibold text-brand-dark underline"
            >
              Zaloguj się
            </a>
          </p>
        }
      />
    </div>
  );
};
