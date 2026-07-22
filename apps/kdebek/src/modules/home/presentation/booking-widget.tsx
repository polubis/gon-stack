import { Lock } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
// import { Calendar, ChevronDown, Clock, User } from 'lucide-react';

import { copy } from './copy';
import { BOOKING_URL } from './links';

export const BookingWidget = ({ className = '' }: { className?: string }) => (
  <div
    className={cn(
      'w-full rounded-2xl bg-white p-6 shadow-md ring-1 ring-line sm:p-7',
      className,
    )}
  >
    <h3 className="font-display text-2xl font-bold text-secondary">
      {copy.bookingWidget.heading}
    </h3>
    <p className="mt-1 text-sm text-ink-light">
      {copy.bookingWidget.subheading}
    </p>

    <div className="mt-6 space-y-3">
      {/* <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
        <User className="h-4.5 w-4.5 shrink-0 text-slate-400" />
        <span className="flex-1">Usługa</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </label>

      <div className="flex flex-col gap-3 min-[375px]:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
          <span className="flex-1">Data</span>
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        </label>
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="flex-1">Godzina</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </label>
      </div> */}

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-bold tracking-wide text-white"
      >
        {copy.bookingWidget.cta}
      </a>

      <p className="flex items-start justify-center gap-1.5 text-xs text-ink-light">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {copy.bookingWidget.trust}
      </p>
    </div>
  </div>
);
