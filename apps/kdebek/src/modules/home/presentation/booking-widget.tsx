import { Calendar, ChevronDown, Clock, Lock, User } from 'lucide-react';

const steps = [
  { label: 'Usługa', active: true },
  { label: 'Termin', active: false },
  { label: 'Dane', active: false },
  { label: 'Potwierdzenie', active: false },
];

const BookingWidget = () => (
  <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-7">
    <h3 className="font-display text-2xl font-bold text-secondary">
      Zarejestruj wizytę
    </h3>
    <p className="mt-1 text-sm text-ink-light">
      Wybierz dogodny termin i zarezerwuj wizytę online w kilka sekund.
    </p>

    <div className="mt-5 flex items-center">
      {steps.map((step, i) => (
        <div
          key={step.label}
          className="flex flex-1 items-center last:flex-none"
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                step.active
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`whitespace-nowrap text-[11px] ${step.active ? 'text-secondary font-medium' : 'text-slate-400'}`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className="mx-1.5 mb-4 h-px flex-1 bg-slate-200" />
          )}
        </div>
      ))}
    </div>

    <div className="mt-6 space-y-3">
      <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
        <User className="h-4.5 w-4.5 shrink-0 text-slate-400" />
        <span className="flex-1">Wybierz usługę</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
          <span className="flex-1">Wybierz datę</span>
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        </label>
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-light">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="flex-1">Wybierz godzinę</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </label>
      </div>

      <button
        type="button"
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold tracking-wide text-white hover:bg-primary-dark"
      >
        DALEJ
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-light">
        <Lock className="h-3.5 w-3.5" />
        Twoje dane są bezpieczne i chronione.
      </p>
    </div>
  </div>
);

export { BookingWidget };
