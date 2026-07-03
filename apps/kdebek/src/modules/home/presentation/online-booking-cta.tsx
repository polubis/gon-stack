import { Bell, Calendar, CalendarPlus, Clock, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: '24/7',
    description: 'Rezerwuj o każdej porze dnia i nocy',
  },
  {
    icon: Clock,
    title: 'Bez czekania',
    description: 'Wybierz termin, który Ci pasuje',
  },
  {
    icon: ShieldCheck,
    title: 'Bezpiecznie',
    description: 'Twoje dane są u nas w pełni chronione',
  },
  {
    icon: Bell,
    title: 'Przypomnienia',
    description: 'Wyślemy Ci przypomnienie o wizycie SMS-em',
  },
];

const bookingSteps = [
  { label: 'Usługa', active: false },
  { label: 'Termin', active: true },
  { label: 'Dane', active: false },
  { label: 'Potwierdzenie', active: false },
];

const MiniCalendar = () => (
  <>
    <div className="flex items-center justify-between text-ink-light">
      <span>‹</span>
      <span>Czerwiec 2024</span>
      <span>›</span>
    </div>
    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-ink-light">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={`rounded py-0.5 ${i === 5 ? 'bg-primary text-white' : ''}`}
        >
          {i + 3}
        </span>
      ))}
    </div>
  </>
);

const PhoneBookingScreen = () => (
  <div className="w-full rounded-xl bg-white p-3 text-[8px] shadow-inner">
    <div className="flex items-center justify-between text-primary">
      <span className="font-semibold">Wybierz termin wizyty</span>
    </div>
    <div className="mt-2">
      <MiniCalendar />
    </div>
    <p className="mt-2 font-medium text-secondary">Dostępne godziny</p>
    <div className="mt-1 grid grid-cols-3 gap-1">
      {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((time) => (
        <span
          key={time}
          className={`rounded border py-1 text-center ${
            time === '10:00'
              ? 'border-primary bg-primary text-white'
              : 'border-line text-ink-light'
          }`}
        >
          {time}
        </span>
      ))}
    </div>
  </div>
);

const DesktopBookingScreen = () => (
  <div className="w-full rounded-xl bg-white p-3 text-[8px] shadow-inner">
    <div className="flex items-center gap-1.5">
      {bookingSteps.map(({ label, active }, i) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className={`flex h-3 w-3 items-center justify-center rounded-full font-semibold ${
              active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i + 1}
          </span>
          <span
            className={
              active ? 'font-semibold text-secondary' : 'text-slate-400'
            }
          >
            {label}
          </span>
          {i < bookingSteps.length - 1 && (
            <span className="mx-0.5 h-px w-2 bg-slate-200" />
          )}
        </span>
      ))}
    </div>
    <p className="mt-2.5 font-semibold text-secondary">Wybierz termin wizyty</p>
    <div className="mt-2 grid grid-cols-2 gap-3">
      <div>
        <MiniCalendar />
      </div>
      <div>
        <p className="font-medium text-secondary">Dostępne godziny</p>
        <p className="text-ink-light">Środa, 12 czerwca</p>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {[
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
          ].map((time) => (
            <span
              key={time}
              className={`rounded border py-1 text-center ${
                time === '10:00'
                  ? 'border-primary bg-primary text-white'
                  : 'border-line text-ink-light'
              }`}
            >
              {time}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const OnlineBookingCta = () => (
  <section className="mx-auto max-w-7xl px-6 pb-20">
    <div className="grid grid-cols-1 gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-primary/5 p-8 ring-1 ring-line lg:grid-cols-[1fr_1.1fr_auto] lg:gap-8 lg:p-12">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-primary">
          ZAREJESTRUJ SIĘ JUŻ DZIŚ
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-secondary">
          Łatwa rejestracja online
          <br />
          <span className="text-primary">w kilka sekund</span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-light">
          Wybierz dogodny termin i zarezerwuj wizytę bez wychodzenia z domu. To
          proste, szybkie i bezpieczne.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-2 text-sm font-semibold text-secondary">
                {title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-light">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center py-6">
        <div className="hidden w-56 rotate-[2deg] rounded-lg bg-secondary p-2 pb-4 shadow-md md:block">
          <DesktopBookingScreen />
        </div>
        <div className="w-32 shrink-0 rotate-[-3deg] rounded-[1.4rem] bg-secondary p-1.5 pt-3 shadow-md md:-ml-9">
          <span className="mx-auto mb-1 block h-1 w-6 rounded-full bg-slate-600" />
          <PhoneBookingScreen />
        </div>
      </div>

      <div className="flex flex-col items-start justify-center gap-4 lg:items-center lg:text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CalendarPlus className="h-7 w-7 text-primary" />
        </span>
        <p className="font-display text-xl font-bold leading-snug text-secondary">
          Zarezerwuj wizytę
          <br />
          już teraz!
        </p>
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark sm:whitespace-nowrap"
        >
          ZAREJESTRUJ WIZYTĘ ONLINE
        </button>
        <p className="text-xs text-ink-light">To zajmie tylko chwilę!</p>
      </div>
    </div>
  </section>
);

export { OnlineBookingCta };
