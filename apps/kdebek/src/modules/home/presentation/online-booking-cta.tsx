import {
  Bell,
  Calendar,
  CalendarPlus,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

import { copy } from './copy';
import { BOOKING_URL } from './links';

const featureIcons: Record<string, LucideIcon> = {
  '24-7': Calendar,
  fast: Clock,
  safe: ShieldCheck,
  reminders: Bell,
};

const bookingSteps = copy.onlineBookingCta.bookingSteps.map((step) => ({
  ...step,
  active: step.id === copy.onlineBookingCta.activeStepId,
}));

const MiniCalendar = () => (
  <>
    <div className="flex items-center justify-between text-ink-light">
      <span>‹</span>
      <span>{copy.onlineBookingCta.miniCalendarMonth}</span>
      <span>›</span>
    </div>
    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-ink-light">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={cn('rounded py-0.5', i === 5 && 'bg-primary text-white')}
        >
          {i + 3}
        </span>
      ))}
    </div>
  </>
);

const PhoneBookingScreen = () => (
  <div className="w-full rounded-xl bg-white p-3 text-3xs shadow-inner">
    <div className="flex items-center justify-between text-primary">
      <span className="font-semibold">
        {copy.onlineBookingCta.chooseDateLabel}
      </span>
    </div>
    <div className="mt-2">
      <MiniCalendar />
    </div>
    <p className="mt-2 font-medium text-secondary">
      {copy.onlineBookingCta.availableHoursLabel}
    </p>
    <div className="mt-1 grid grid-cols-3 gap-1">
      {copy.onlineBookingCta.timeSlots.map((time) => (
        <span
          key={time}
          className={cn(
            'rounded border py-1 text-center',
            time === copy.onlineBookingCta.selectedTimeSlot
              ? 'border-primary bg-primary text-white'
              : 'border-line text-ink-light',
          )}
        >
          {time}
        </span>
      ))}
    </div>
  </div>
);

const DesktopBookingScreen = () => (
  <div className="w-full rounded-xl bg-white p-3 text-3xs shadow-inner">
    <ol className="flex items-center gap-1.5 whitespace-nowrap">
      {bookingSteps.map(({ id, label, active }, i) => (
        <li key={id} className="flex items-center gap-1.5">
          <span
            className={cn(
              'flex h-3 w-3 items-center justify-center rounded-full font-semibold',
              active ? 'bg-primary text-white' : 'bg-surface text-ink-light',
            )}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <span
            className={cn(
              active ? 'font-semibold text-secondary' : 'text-ink-light',
            )}
          >
            {label}
          </span>
          {i < bookingSteps.length - 1 && (
            <span className="mx-0.5 h-px w-2 bg-line" />
          )}
        </li>
      ))}
    </ol>
    <p className="mt-2.5 font-semibold text-secondary">
      {copy.onlineBookingCta.chooseDateLabel}
    </p>
    <div className="mt-2 grid grid-cols-2 gap-3">
      <div>
        <MiniCalendar />
      </div>
      <div>
        <p className="font-medium text-secondary">
          {copy.onlineBookingCta.availableHoursLabel}
        </p>
        <p className="text-ink-light">
          {copy.onlineBookingCta.selectedDateLabel}
        </p>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {copy.onlineBookingCta.timeSlotsExtended.map((time) => (
            <span
              key={time}
              className={cn(
                'rounded border py-1 text-center',
                time === copy.onlineBookingCta.selectedTimeSlot
                  ? 'border-primary bg-primary text-white'
                  : 'border-line text-ink-light',
              )}
            >
              {time}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const OnlineBookingCta = () => (
  <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
    <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:rounded-2xl sm:bg-gradient-to-br sm:from-surface sm:to-primary/5 sm:p-6 sm:ring-1 sm:ring-line md:grid-cols-2 md:items-center md:gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(12rem,auto)] lg:gap-8 lg:rounded-3xl lg:p-12">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-primary">
          {copy.onlineBookingCta.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-secondary sm:text-3xl">
          {copy.onlineBookingCta.headingLine1}
          <br />
          <span className="text-primary">
            {copy.onlineBookingCta.headingLine2}
          </span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-light">
          {copy.onlineBookingCta.subheading}
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 list-none p-0 sm:mt-8 sm:gap-x-6 sm:gap-y-6">
          {copy.onlineBookingCta.features.map(({ id, title, description }) => {
            const Icon = featureIcons[id];

            return (
              <li key={id}>
                <span aria-hidden="true">
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                </span>
                <p className="mt-2 text-sm font-semibold text-secondary">
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-light">
                  {description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className="@container relative py-2 sm:py-4 lg:py-6"
      >
        <div className="relative mx-auto h-[calc(15rem*min(1,100cqw/25rem))]">
          <div className="absolute left-1/2 top-0 flex origin-top -translate-x-1/2 scale-[min(1,calc(100cqw/25rem))] items-start justify-center">
            <div className="hidden w-80 rotate-2 rounded-lg bg-secondary p-2 pb-4 shadow-md md:block">
              <DesktopBookingScreen />
            </div>
            <div className="w-40 shrink-0 -rotate-3 rounded-[1.4rem] bg-secondary p-1.5 pt-3 shadow-md md:-ml-20 md:mt-6">
              <span className="mx-auto mb-1 block h-1 w-6 rounded-full bg-ink-light" />
              <PhoneBookingScreen />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 text-center md:col-span-2 lg:col-span-1 lg:items-center lg:text-center">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10"
          aria-hidden="true"
        >
          <CalendarPlus className="h-7 w-7 shrink-0 text-primary" />
        </span>
        <p className="font-display text-xl font-bold leading-snug text-secondary">
          {copy.onlineBookingCta.finalHeadingLine1}
          <br />
          {copy.onlineBookingCta.finalHeadingLine2}
        </p>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-white sm:w-auto sm:whitespace-nowrap"
        >
          {copy.onlineBookingCta.finalCta}
        </a>
        <p className="text-xs text-ink-light">
          {copy.onlineBookingCta.finalMicrocopy}
        </p>
      </div>
    </div>
  </section>
);
