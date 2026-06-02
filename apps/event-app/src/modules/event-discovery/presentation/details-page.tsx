import { useState } from 'react';
import { Button } from '@/libs/ui/button';
import { Text } from '@/libs/ui/text';
import { Poster } from './poster';
import { EventCard } from './event-card';
import { IconBack, IconHeart, IconShare, IconCheck } from './icons';
import {
  categoryLabel,
  fmtDate,
  fmtDayNum,
  fmtMonthShort,
  fmtDayName,
} from './mock-data';
import type { Event } from './mock-data';

type DetailsPageProps = {
  event: Event;
  allEvents: Event[];
  onBack: () => void;
  onOpenEvent: (event: Event) => void;
  onToggleSave: (id: string) => void;
  savedSet: Set<string>;
};

export const DetailsPage = ({
  event,
  allEvents,
  onBack,
  onOpenEvent,
  onToggleSave,
  savedSet,
}: DetailsPageProps) => {
  const [going, setGoing] = useState(false);
  const saved = savedSet.has(event.id);
  const similar = allEvents
    .filter((e) => e.id !== event.id && e.category === event.category)
    .slice(0, 3);

  return (
    <section className="px-8 pt-8 pb-16 max-w-7xl mx-auto">
      <button
        className="bg-transparent border-0 text-ink p-0 inline-flex items-center gap-2 text-sm mb-6 hover:text-coral transition-colors"
        onClick={onBack}
      >
        <IconBack size={14} /> <span>Powrót do wyników</span>
      </button>

      {/* Hero block */}
      <div className="grid gap-12 items-stretch bg-surface rounded-lg p-8 mb-8 grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[18px] overflow-hidden aspect-3/4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
          <Poster event={event} size="lg" />
        </div>
        <div className="flex flex-col gap-5 py-3">
          <Text.MonoLabel>
            {categoryLabel(event.category).toUpperCase()} ·{' '}
            {event.city.toUpperCase()}
          </Text.MonoLabel>
          <Text.PageHeading className="m-0">{event.name}</Text.PageHeading>

          {/* When / where */}
          <div className="grid grid-cols-2 gap-6 border-t border-b border-hairline py-5">
            <div className="flex flex-col gap-1.5">
              <Text.MonoLabel>DATA</Text.MonoLabel>
              <Text.DateDisplay as="div">
                {fmtDayNum(event.date)}{' '}
                <span className="font-mono text-base tracking-[0.16em] text-coral">
                  {fmtMonthShort(event.date)}
                </span>
                {event.endDate && (
                  <>
                    {' '}
                    — {fmtDayNum(event.endDate)}{' '}
                    <span className="font-mono text-base tracking-[0.16em] text-coral">
                      {fmtMonthShort(event.endDate)}
                    </span>
                  </>
                )}
              </Text.DateDisplay>
              <div className="text-sm text-body-muted">
                {fmtDayName(event.date)}, godz. {event.time}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Text.MonoLabel>MIEJSCE</Text.MonoLabel>
              <Text.SubsectionHeading as="div">
                {event.venue}
              </Text.SubsectionHeading>
              <div className="text-sm text-body-muted">{event.city}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 flex-wrap">
            <Button
              variant="primary"
              className={going ? 'bg-deep-green text-white' : undefined}
              onClick={() => setGoing((g) => !g)}
            >
              {going ? (
                <>
                  <IconCheck size={14} /> Idziesz
                </>
              ) : (
                <>Idę na to wydarzenie</>
              )}
            </Button>
            <Button
              variant="secondary"
              className={saved ? 'text-coral border-coral' : undefined}
              onClick={() => onToggleSave(event.id)}
            >
              <IconHeart fill={saved ? 'currentColor' : 'none'} size={14} />
              {saved ? 'Zapisane' : 'Zapisz'}
            </Button>
            <Button variant="secondary">
              <IconShare size={14} /> Udostępnij
            </Button>
          </div>

          {going && (
            <div className="flex gap-3 items-center bg-pale-green rounded-xl px-4 py-3 text-deep-green text-sm">
              <Text.MonoLabel className="text-deep-green">
                POTWIERDZENIE
              </Text.MonoLabel>
              <div>Świetnie. Powiadomimy cię na 24h przed startem.</div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-12 mb-12 grid-cols-[1.6fr_0.9fr]">
        <div>
          <section className="mb-10">
            <Text.MonoLabel>O WYDARZENIU</Text.MonoLabel>
            <p className="text-[19px] leading-relaxed text-ink mt-3">
              {event.description}
            </p>
          </section>

          <section className="mb-10">
            <Text.MonoLabel>LOKALIZACJA</Text.MonoLabel>
            <Text.SubsectionHeading className="mt-2 mb-4">
              {event.venue}, {event.city}
            </Text.SubsectionHeading>
            {/* Stylized Poland map */}
            <PolandMap pin={event.coords} label={event.city} />
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-hairline">
              <div className="flex flex-col gap-1 text-sm">
                <Text.MonoLabel>ADRES</Text.MonoLabel>
                <div>{event.venue}</div>
                <div className="text-muted">{event.city}, Polska</div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <Text.MonoLabel>WSPÓŁRZĘDNE</Text.MonoLabel>
                <div className="font-mono text-[13px]">
                  {(50 + event.coords.y * 5).toFixed(4)}° N ·{' '}
                  {(15 + event.coords.x * 8).toFixed(4)}° E
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <Text.MonoLabel>DOJAZD</Text.MonoLabel>
                <div>Tramwaj, autobus, parking dla rowerów</div>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <div className="bg-card-bg border border-card-border-c rounded-md p-5 mb-4">
            <Text.MonoLabel>SZCZEGÓŁY</Text.MonoLabel>
            <ul className="list-none p-0 mt-3 m-0 flex flex-col gap-0">
              {[
                ['Kategoria', categoryLabel(event.category)],
                ['Miasto', event.city],
                ['Miejsce', event.venue],
                [
                  'Data',
                  fmtDate(event.date) +
                    (event.endDate ? ` – ${fmtDate(event.endDate)}` : ''),
                ],
                ['Godzina', event.time],
                ['Język', 'polski'],
              ].map(([label, val]) => (
                <li
                  key={label}
                  className="flex justify-between gap-4 py-2.5 border-b border-hairline last:border-0 text-sm"
                >
                  <span className="text-muted">{label}</span>
                  <span className="text-right">{val}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-soft-stone border border-card-border rounded-md p-5">
            <Text.MonoLabel className="text-coral">UWAGA</Text.MonoLabel>
            <p className="text-sm mt-2 mb-0 text-body-muted leading-relaxed">
              Afisz nie sprzedaje biletów. Po sprzedaż przejdź na stronę
              organizatora — link otrzymasz po kliknięciu &quot;Idę&quot;.
            </p>
          </div>
        </aside>
      </div>

      {/* Similar events */}
      {similar.length > 0 && (
        <section className="mt-6">
          <div className="flex justify-between items-end gap-8 mb-7">
            <div>
              <Text.MonoLabel>PODOBNE WYDARZENIA</Text.MonoLabel>
              <Text.SectionHeading className="mt-2">
                Jeśli podoba ci się to, zobacz też.
              </Text.SectionHeading>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
            {similar.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onOpen={onOpenEvent}
                onToggleSave={onToggleSave}
                saved={savedSet.has(e.id)}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

type PolandMapProps = {
  pin: { x: number; y: number };
  label: string;
};

const CITY_DOTS = [
  { x: 0.66, y: 0.42, n: 'Warszawa' },
  { x: 0.55, y: 0.74, n: 'Kraków' },
  { x: 0.3, y: 0.55, n: 'Wrocław' },
  { x: 0.42, y: 0.32, n: 'Poznań' },
  { x: 0.55, y: 0.1, n: 'Gdańsk' },
  { x: 0.55, y: 0.48, n: 'Łódź' },
  { x: 0.5, y: 0.78, n: 'Katowice' },
  { x: 0.78, y: 0.62, n: 'Lublin' },
  { x: 0.18, y: 0.2, n: 'Szczecin' },
  { x: 0.47, y: 0.22, n: 'Bydgoszcz' },
  { x: 0.85, y: 0.3, n: 'Białystok' },
  { x: 0.85, y: 0.78, n: 'Rzeszów' },
];

const PolandMap = ({ pin, label }: PolandMapProps) => {
  const W = 800,
    H = 600;
  return (
    <div className="relative bg-surface border border-card-border-c rounded-[18px] overflow-hidden mt-4 aspect-4/3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full block">
        <defs>
          <pattern
            id="mapgrid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M32 0H0V32"
              fill="none"
              stroke="var(--color-map-grid)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#mapgrid)" />
        <path
          d="M120 180 L200 110 L320 90 L460 80 L580 100 L680 140 L720 220 L700 320 L680 420 L600 500 L480 540 L360 530 L240 500 L160 430 L110 340 Z"
          fill="var(--color-map-land)"
          stroke="var(--color-map-coast)"
          strokeWidth="1.5"
        />
        {CITY_DOTS.map((c) => (
          <g key={c.n}>
            <circle
              cx={c.x * W}
              cy={c.y * H}
              r="3"
              fill="var(--color-map-city)"
            />
            <text
              x={c.x * W + 8}
              y={c.y * H + 4}
              fontFamily="monospace"
              fontSize="10"
              fill="var(--color-map-city)"
            >
              {c.n}
            </text>
          </g>
        ))}
        <g transform={`translate(${pin.x * W}, ${pin.y * H})`}>
          <circle r="32" fill="var(--color-coral)" opacity="0.18" />
          <circle r="18" fill="var(--color-coral)" opacity="0.32" />
          <circle
            r="8"
            fill="var(--color-coral)"
            stroke="var(--color-canvas)"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="-12"
            x2="0"
            y2="-32"
            stroke="var(--color-coral)"
            strokeWidth="1.5"
          />
          <text
            x="6"
            y="-36"
            fontFamily="monospace"
            fontSize="12"
            fontWeight="600"
            fill="var(--color-coral)"
          >
            {label.toUpperCase()}
          </text>
        </g>
      </svg>
      <div className="absolute left-4 bottom-4 right-4 flex justify-between items-center pointer-events-none">
        <Text.MonoLabel>MAPA POLSKI · WIDOK STYLIZOWANY</Text.MonoLabel>
      </div>
    </div>
  );
};
