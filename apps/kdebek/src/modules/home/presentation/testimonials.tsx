import { ArrowRight, MessageSquare, Quote, Star } from 'lucide-react';

import { images } from './images';
import { GOOGLE_REVIEWS_URL } from './links';

const testimonials = [
  {
    name: 'Michał K.',
    subtitle: 'Ból pleców',
    initials: 'MK',
    text: 'Profesjonalne podejście i świetne efekty. Dzięki terapii pozbyłem się bólu pleców, który dokuczał mi od lat. Polecam!',
  },
  {
    name: 'Katarzyna R.',
    subtitle: 'Rehabilitacja po urazie',
    initials: 'KR',
    text: 'Po urazie kolana wróciłam do pełnej sprawności szybciej, niż się spodziewałam. Świetna atmosfera i fachowa opieka.',
  },
  {
    name: 'Tomasz S.',
    subtitle: 'Ból szyi i karku',
    initials: 'TS',
    text: 'Indywidualne podejście i skuteczne metody. Czuję się zaopiekowany na każdym etapie terapii.',
  },
];

const Stars = () => (
  <div className="flex gap-0.5 text-rating" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 shrink-0 fill-current" />
    ))}
  </div>
);

export const Testimonials = () => (
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

      <div className="flex items-start justify-end gap-3 rounded-2xl">
        <div className="text-right">
          <p className="flex items-center justify-end gap-1.5 text-2xl font-bold text-secondary">
            <Star
              className="h-5 w-5 shrink-0 fill-current text-rating"
              aria-hidden="true"
            />
            5.0
          </p>
          <p className="text-sm text-ink-light">Średnia ocen w Google</p>
          <div className="mt-2 flex justify-end">
            <Stars />
          </div>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-ink-light underline"
          >
            Na podstawie 240 opinii
          </a>
        </div>
      </div>
    </div>

    <div className="mt-10 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {testimonials.map(({ name, subtitle, text, initials }) => (
            <article
              key={name}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
            >
              <div
                className="flex items-start justify-between"
                aria-hidden="true"
              >
                <Stars />
                <Quote className="h-6 w-6 shrink-0 text-line" />
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-light">
                {text}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-secondary">{name}</p>
                  <p className="text-xs text-ink-light">{subtitle}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="relative aspect-[4/3] min-h-0 overflow-hidden rounded-3xl lg:aspect-auto lg:h-full">
          <img
            src={images.testimonials.therapy}
            alt="Gabinet masażu i fizjoterapii"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <a
        href={GOOGLE_REVIEWS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm font-medium text-primary"
      >
        <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
        Zobacz więcej opinii na Google
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
    </div>
  </section>
);
