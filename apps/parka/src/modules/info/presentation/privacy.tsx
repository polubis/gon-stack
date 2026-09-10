import { ShieldCheck, Lock, MapPin, Trash2, Download } from 'lucide-react';
import { AppShell, Card, ScreenHeader, Button } from '@/modules/shared/ui';

const POINTS = [
  { icon: MapPin, text: 'Dane przechowywane w Unii Europejskiej.' },
  { icon: Lock, text: 'Szyfrowane w spoczynku i podczas przesyłania.' },
  {
    icon: ShieldCheck,
    text: 'Pełna kontrola nad danymi — zgodność z RODO / GDPR.',
  },
  { icon: Trash2, text: 'Możesz usunąć swoje dane w każdej chwili.' },
];

export const PrivacyMain = () => (
  <AppShell e2e="privacy:main" nav="more">
    <ScreenHeader title="RODO / Prywatność" backHref="/settings/" />
    <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
      <Card as="section" className="space-y-3">
        <h2 className="text-sm font-semibold">Twoje dane</h2>
        <ul className="space-y-3" data-e2e="privacy:points">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" className="space-y-2">
        <h2 className="text-sm font-semibold">Polityka prywatności</h2>
        <p className="text-sm text-ink-soft">
          Opisuje, jakie dane przetwarzamy, w jakim celu i jak długo.
          Przetwarzanie odbywa się wyłącznie po wyrażeniu zgody na pliki cookie.
        </p>
        <a
          href="/privacy-policy/"
          className="text-sm font-semibold text-brand-dark underline"
        >
          Otwórz politykę prywatności
        </a>
      </Card>

      <div className="space-y-2">
        <Button href="/data-export/" data-e2e="privacy:manage-data">
          <Download className="h-4 w-4" aria-hidden="true" /> Zarządzaj danymi
        </Button>
      </div>
    </main>
  </AppShell>
);
