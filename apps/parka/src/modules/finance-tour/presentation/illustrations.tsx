import type { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Camera,
  Download,
  FileText,
  Pencil,
  Repeat,
  TrendingDown,
  Upload,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { ProgressBar } from '@/shared/ui/controls';
import { CategoryIcon } from '@/shared/ui/icon';

/*
 * Miniatures of the real finance screens, built from the same UI pieces
 * and tokens (Card, ProgressBar, CategoryIcon), so the tour never promises
 * a feature the app does not have. Static sample numbers, one month.
 */

const Frame = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'relative flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface px-3 text-left md:h-64',
      className,
    )}
  >
    {children}
  </div>
);

const Stat = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col items-center gap-0.5 px-1">
    <dt className="text-micro text-ink-soft">{label}</dt>
    <dd className="flex w-full flex-col items-center gap-1 text-xs font-semibold tabular-nums">
      {children}
    </dd>
  </div>
);

/** Dashboard `TotalHero`: month total, change, daily average, limit left. */
export const SummaryIllustration = () => (
  <Frame>
    <Card className="w-full max-w-72 py-4 text-center shadow-popover">
      <p className="text-caption text-ink-soft">Wydatki w tym miesiącu</p>
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        528,38 zł
      </p>
      <p className="flex items-center justify-center gap-1 text-xs font-medium text-ink-soft">
        <TrendingDown className="h-3.5 w-3.5 text-brand-dark" />
        -12%
      </p>
      <dl className="mt-3 grid grid-cols-3 divide-x divide-line border-t border-line pt-3">
        <Stat label="Średnio dziennie">33,02 zł</Stat>
        <Stat label="Transakcje">5</Stat>
        <Stat label="Do limitu">
          1471,62 zł
          <span className="block w-full max-w-14">
            <ProgressBar pct={26} label="Wykorzystano 26% limitu" />
          </span>
        </Stat>
      </dl>
    </Card>
  </Frame>
);

const ReceiptLine = ({ name, price }: { name: string; price: string }) => (
  <p className="flex justify-between gap-2">
    <span>{name}</span>
    <span>{price}</span>
  </p>
);

const ReadField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <p className="text-micro text-ink-soft">{label}</p>
    <div className="mt-0.5 flex items-center gap-1 rounded-lg border border-line-strong bg-card px-2 py-1 text-xs font-medium whitespace-nowrap">
      {children}
    </div>
  </div>
);

/** New expense: upload or photo, the receipt is read into the form. */
export const ScanIllustration = () => (
  <Frame className="flex-col gap-3">
    <div className="flex w-full max-w-72 items-center gap-2">
      <div className="relative w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-card px-2 py-3 font-mono text-micro leading-relaxed shadow-card">
        <p className="text-center font-bold">BIEDRONKA</p>
        <ReceiptLine name="Chleb" price="4,99" />
        <ReceiptLine name="Mleko" price="3,49" />
        <ReceiptLine name="Ser" price="12,90" />
        <ReceiptLine name="Kawa" price="21,12" />
        <p className="mt-1 flex justify-between border-t border-dashed border-line-strong pt-1 font-bold">
          <span>SUMA</span>
          <span>42,50</span>
        </p>
        <span className="absolute inset-x-0 top-2 h-0.5 animate-scan bg-brand shadow-popover motion-reduce:animate-none" />
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <ReadField label="Sklep">Biedronka</ReadField>
        <ReadField label="Kwota">42,50 zł</ReadField>
        <ReadField label="Kategoria">
          <CategoryIcon id="cart" className="h-3.5 w-3.5 text-brand" />
          Spożywcze
        </ReadField>
      </div>
    </div>
    <div className="flex gap-2 text-caption font-semibold">
      <span className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-card px-2 py-1">
        <Upload className="h-3 w-3" /> Wgraj z pliku
      </span>
      <span className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-card px-2 py-1">
        <Camera className="h-3 w-3" /> Zrób zdjęcie
      </span>
    </div>
  </Frame>
);

const SHARES = [
  {
    name: 'Spożywcze',
    pct: 46,
    stroke: 'stroke-brand',
    dot: 'bg-brand',
  },
  {
    name: 'Transport',
    pct: 42,
    stroke: 'stroke-on-device-1',
    dot: 'bg-on-device-1',
  },
  {
    name: 'Rozrywka',
    pct: 12,
    stroke: 'stroke-on-device-3',
    dot: 'bg-on-device-3',
  },
] as const;

/** Where each slice starts on the donut, in percent of the circle. */
const STARTS = SHARES.map((_, i) =>
  SHARES.slice(0, i).reduce((sum, { pct }) => sum + pct, 0),
);

/** Dashboard "Kategorie": donut + legend, filter chips. */
export const CategoriesIllustration = () => (
  <Frame className="flex-col gap-3">
    <Card className="flex w-full max-w-72 items-center gap-4 shadow-popover">
      <svg viewBox="0 0 36 36" className="h-20 w-20 shrink-0 -rotate-90">
        {SHARES.map(({ name, pct, stroke }, i) => (
          <circle
            key={name}
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            strokeWidth="4"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset={-STARTS[i]!}
            className={stroke}
          />
        ))}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1 text-xs">
        {SHARES.map(({ name, pct, dot }) => (
          <li key={name} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} />
            <span className="flex-1 truncate text-ink-soft">{name}</span>
            <span className="font-semibold tabular-nums">{pct}%</span>
          </li>
        ))}
      </ul>
    </Card>
    <div className="flex gap-1.5 text-caption font-medium">
      <span className="rounded-full bg-brand px-2.5 py-1 text-on-brand">
        Wszystkie 5
      </span>
      {SHARES.slice(0, 2).map(({ name, dot }) => (
        <span
          key={name}
          className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-card px-2.5 py-1"
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
          {name}
        </span>
      ))}
    </div>
  </Frame>
);

/** Dashboard "Limity": monthly limit and a per-category one. */
export const LimitsIllustration = () => (
  <Frame>
    <Card className="w-full max-w-72 space-y-3 shadow-popover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-ink-soft">Limit na miesiąc</p>
          <p className="text-xl font-bold tabular-nums">2000,00 zł</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg border border-line-strong px-2 py-1 text-caption font-semibold text-brand-dark">
          <Pencil className="h-3 w-3" /> Zmień
        </span>
      </div>
      <div className="space-y-1">
        <ProgressBar pct={26} label="Wykorzystano 26% limitu" />
        <p className="text-micro text-ink-soft">528,38 zł · 26%</p>
      </div>
      <div className="space-y-1.5 rounded-xl border border-line p-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-brand">
            <CategoryIcon id="cart" className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 font-semibold">Spożywcze</span>
          <span className="tabular-nums text-ink-soft">244 / 400 zł</span>
        </div>
        <ProgressBar pct={61} label="Wykorzystano 61% limitu" />
      </div>
    </Card>
  </Frame>
);

/** Dashboard upcoming charge of a recurring rule + the expense type switch. */
export const RecurringIllustration = () => (
  <Frame className="flex-col gap-3">
    <div className="flex w-full max-w-72 gap-1 rounded-xl bg-brand-soft p-1 text-xs font-medium">
      <span className="flex-1 rounded-lg px-3 py-1 text-center text-ink-soft">
        Normalny
      </span>
      <span className="flex-1 rounded-lg bg-card px-3 py-1 text-center text-brand-dark shadow-sm">
        Cykliczny
      </span>
    </div>
    <div className="w-full max-w-72 rounded-xl border border-dashed border-line-strong bg-card p-3">
      <p className="text-micro font-medium text-ink-soft">
        Nadchodzące · nie wliczone do podsumowania
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-device-3 text-on-device-3">
          <CategoryIcon id="popcorn" className="h-4 w-4" />
          <span className="absolute -right-0.5 -bottom-0.5 grid h-4 w-4 place-items-center rounded-full border border-line-strong bg-card text-brand-dark">
            <Repeat className="h-2.5 w-2.5" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">Netflix</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-micro text-ink-soft">
            20.10.2026
            <span className="inline-flex items-center gap-1 rounded-full border border-line-strong px-1.5 font-medium">
              <CalendarClock className="h-2.5 w-2.5" /> Nadchodzący
            </span>
          </p>
        </div>
        <span className="text-xs font-semibold tabular-nums">49,00 zł</span>
      </div>
    </div>
  </Frame>
);

/** Reports: month in numbers + CSV / full report downloads. */
export const ReportsIllustration = () => (
  <Frame>
    <Card className="w-full max-w-72 space-y-3 shadow-popover">
      <div>
        <p className="text-caption text-ink-soft">Twój miesiąc w liczbach</p>
        <p className="text-xl font-bold tabular-nums">528,38 zł</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-brand-softer p-2">
          <p className="text-sm font-bold">3</p>
          <p className="text-micro text-ink-soft">Kategorie</p>
        </div>
        <div className="rounded-lg bg-brand-softer p-2">
          <p className="text-sm font-bold">1</p>
          <p className="text-micro text-ink-soft">Transakcje cykliczne</p>
        </div>
      </div>
      <div className="grid gap-1.5 text-caption font-semibold">
        <span className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand px-2 py-1.5 text-on-brand">
          <FileText className="h-3 w-3" /> Pobierz CSV
        </span>
        <span className="inline-flex items-center justify-center gap-1 rounded-lg border border-line-strong px-2 py-1.5 text-brand-dark">
          <Download className="h-3 w-3" /> Pobierz pełny raport
        </span>
      </div>
    </Card>
  </Frame>
);
