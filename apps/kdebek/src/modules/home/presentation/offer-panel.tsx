import { ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

import { BOOKING_URL } from './links';
import { OfferWidget } from './offer-widget';

export const OfferPanel = ({
  className = 'p-4 sm:p-6 lg:p-8',
}: {
  className?: string;
}) => (
  <div
    className={cn(
      'grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10',
      className,
    )}
  >
    <div className="max-w-lg">
      <p className="text-xs font-bold tracking-[0.2em] text-primary">OFERTA</p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-secondary sm:text-3xl">
        Kompleksowa fizjoterapia dopasowana do Twoich potrzeb
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-light">
        Wybierz ofertę dopasowaną do Ciebie i poznaj szczegóły usług.
      </p>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold tracking-wide text-white sm:w-auto"
      >
        <Calendar className="h-4 w-4 shrink-0" />
        ZAREJESTRUJ WIZYTĘ
      </a>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        Zobacz pełen cennik
        <ArrowRight className="h-4 w-4 shrink-0" />
      </a>
    </div>

    <OfferWidget id="cennik" />
  </div>
);
