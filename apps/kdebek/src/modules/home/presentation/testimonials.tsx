import { ArrowRight, MessageSquare, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Michał K.',
    subtitle: 'Ból pleców',
    text: 'Profesjonalne podejście i świetne efekty. Dzięki terapii pozbyłem się bólu pleców, który dokuczał mi od lat. Polecam!',
    avatar:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&auto=format&fit=crop',
  },
  {
    name: 'Katarzyna R.',
    subtitle: 'Rehabilitacja po urazie',
    text: 'Po urazie kolana wróciłam do pełnej sprawności szybciej, niż się spodziewałam. Świetna atmosfera i fachowa opieka.',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop',
  },
  {
    name: 'Tomasz S.',
    subtitle: 'Ból szyi i karku',
    text: 'Indywidualne podejście i skuteczne metody. Czuję się zaopiekowany na każdym etapie terapii.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
  },
];

const Stars = () => (
  <div className="flex gap-0.5 text-amber-400">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-current" />
    ))}
  </div>
);

const Testimonials = () => (
  <section className="mx-auto max-w-7xl px-6 py-20">
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="text-xs font-bold tracking-[0.2em] text-primary">
          OPINIE PACJENTÓW
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-secondary sm:text-4xl">
          Zaufanie, które procentuje
        </h2>
        <p className="mt-3 max-w-lg text-ink-light">
          Zobacz, co mówią osoby, które skorzystały z naszej pomocy. Ich
          doświadczenie może być Twoją motywacją.
        </p>
      </div>

      <div className="flex items-start justify-start gap-3 rounded-2xl lg:justify-end">
        <div className="text-right">
          <p className="flex items-center justify-end gap-1.5 text-2xl font-bold text-secondary">
            <Star className="h-5 w-5 fill-current text-amber-400" />
            5.0
          </p>
          <p className="text-sm text-ink-light">Średnia ocen w Google</p>
          <div className="mt-2 flex justify-end">
            <Stars />
          </div>
          <a
            href="#"
            className="mt-1 inline-block text-sm text-ink-light underline"
          >
            Na podstawie 240 opinii
          </a>
        </div>
      </div>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-2">
        {testimonials.map(({ name, subtitle, text, avatar }) => (
          <div
            key={name}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
          >
            <div className="flex items-start justify-between">
              <Stars />
              <Quote className="h-6 w-6 text-line" />
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-light">
              {text}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <img
                src={avatar}
                alt={name}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-secondary">{name}</p>
                <p className="text-xs text-ink-light">{subtitle}</p>
              </div>
            </div>
          </div>
        ))}

        <a
          href="#"
          className="col-span-full mt-1 flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          <MessageSquare className="h-4 w-4" />
          Zobacz więcej opinii na Google
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 lg:aspect-auto">
        <img
          src="https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=1000&auto=format&fit=crop"
          alt="Fizjoterapeuta podczas terapii manualnej"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </section>
);

export { Testimonials };
