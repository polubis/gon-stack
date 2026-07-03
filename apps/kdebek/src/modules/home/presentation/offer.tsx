import {
  ArrowRight,
  Bone,
  Calendar,
  Check,
  HandHelping,
  PersonStanding,
  ShieldCheck,
  Target,
  User,
  WavesHorizontal,
} from 'lucide-react';

const treatments = [
  {
    icon: HandHelping,
    title: 'Terapia manualna',
    description:
      'Techniki manualne mające na celu przywrócenie prawidłowej ruchomości stawów i tkanek miękkich.',
    items: [
      'Mobilizacja stawów',
      'Rozluźnianie tkanek miękkich',
      'Redukcja bólu i napięcia',
    ],
  },
  {
    icon: PersonStanding,
    title: 'Rehabilitacja pourazowa',
    description:
      'Kompleksowa rehabilitacja po urazach sportowych, przeciążeniach i wypadkach.',
    items: [
      'Ocena funkcjonalna',
      'Indywidualny plan terapii',
      'Powrót do pełnej sprawności',
    ],
  },
  {
    icon: Bone,
    title: 'Fizjoterapia kręgosłupa',
    description:
      'Skuteczne leczenie bólów kręgosłupa szyjnego, piersiowego i lędźwiowego.',
    items: [
      'Terapia manualna',
      'Trening stabilizacji',
      'Edukacja i profilaktyka',
    ],
  },
  {
    icon: WavesHorizontal,
    title: 'Terapia falą uderzeniową',
    description:
      'Nowoczesna metoda leczenia przewlekłych dolegliwości bólowych i stanów przeciążeniowych.',
    items: [
      'Łokieć tenisisty/golfisty',
      'Zapalenie ścięgna Achillesa',
      'Ostroga piętowa, bóle stóp',
    ],
  },
  {
    icon: Target,
    title: 'Trening medyczny',
    description:
      'Ćwiczenia dobrane do potrzeb pacjenta w celu poprawy siły, stabilizacji i sprawności.',
    items: [
      'Trening funkcjonalny',
      'Korekcja postawy',
      'Zapobieganie kontuzjom',
    ],
  },
];

const Offer = () => (
  <section className="mx-auto max-w-7xl px-6 py-20">
    <div className="overflow-hidden rounded-[1.75rem] bg-surface px-6 py-14 ring-1 ring-line sm:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-primary">
          OFERTA
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-secondary sm:text-4xl">
          Zakres wykonywanych zabiegów
        </h2>
        <p className="mt-3 text-sm text-ink-light">
          Dobieram terapię indywidualnie, aby skutecznie rozwiązać problem i
          zapobiegać nawrotom dolegliwości.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-line">
        {treatments.map(({ icon: Icon, title, description, items }, i) => (
          <div key={title} className={i > 0 ? 'lg:pl-6' : ''}>
            <Icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-semibold leading-snug text-secondary">
              {title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-light">
              {description}
            </p>
            <ul className="mt-4 space-y-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs text-ink-light"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="mt-4 flex items-center gap-1 text-xs font-medium text-primary"
            >
              Dowiedz się więcej
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-6 flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-line lg:flex-row lg:justify-between">
      <div className="flex items-center gap-4 text-center lg:text-left">
        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
          <Calendar className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-secondary">
            Gotowy na pierwszy krok do sprawności?
          </p>
          <p className="mt-0.5 text-sm text-ink-light">
            Zarezerwuj wizytę online i zacznij terapię dopasowaną do Ciebie.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark"
      >
        <Calendar className="h-4.5 w-4.5" />
        ZAREJESTRUJ WIZYTĘ ONLINE
      </button>

      <div className="flex flex-wrap justify-center gap-6 text-xs text-ink-light">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Bezpieczeństwo
          <br />
          Twojego zdrowia
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-primary" />
          Indywidualne
          <br />
          podejście
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-primary" />
          Skuteczne
          <br />
          metody terapii
        </span>
      </div>
    </div>
  </section>
);

export { Offer };
