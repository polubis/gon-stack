import { ScanLine, Tags, TrendingUp, ShieldCheck } from 'lucide-react';
import { AppShell, Card, ScreenHeader } from '@/modules/shared/ui';

const STEPS = [
  {
    icon: ScanLine,
    title: 'Analiza treści paragonów',
    body: 'Model odczytuje nazwę sklepu, datę zakupu oraz listę pozycji z Twojego zdjęcia paragonu.',
  },
  {
    icon: Tags,
    title: 'Propozycje kategorii',
    body: 'Każdej pozycji przypisywana jest sugerowana kategoria. Zawsze możesz ją poprawić przed zapisaniem.',
  },
  {
    icon: TrendingUp,
    title: 'Wykrywanie anomalii',
    body: 'Parka porównuje bieżące wydatki z historią i oznacza nietypowe kwoty oraz nagłe zmiany w kategoriach.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparentny AI',
    body: 'Bez manipulacyjnych praktyk. Zgodnie z AI Act — decyzje podejmujesz Ty, AI tylko podpowiada.',
  },
];

export const AiInfoMain = () => (
  <AppShell e2e="ai-info:main" nav="more">
    <ScreenHeader title="AI — jak to działa" backHref="/settings/" />
    <main className="flex flex-1 flex-col gap-3 px-4 pb-6 pt-2">
      <p className="text-sm text-ink-soft">
        AI analizuje paragony i pomaga w kategoryzacji oraz wykrywaniu
        nieprawidłowości i nietypowych wydatków.
      </p>
      <ul className="space-y-2" data-e2e="ai-info:steps">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <Card as="li" key={title} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-ink-soft">{body}</p>
            </div>
          </Card>
        ))}
      </ul>
    </main>
  </AppShell>
);
