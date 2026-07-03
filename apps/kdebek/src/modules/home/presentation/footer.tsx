import {
  ArrowRight,
  CalendarPlus,
  Camera,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Share2,
} from 'lucide-react';

const linkColumns = [
  {
    title: 'Oferta',
    links: [
      'Dla osób prywatnych',
      'Dla firm',
      'Terapia manualna',
      'Rehabilitacja pourazowa',
      'Fizjoterapia ortopedyczna',
      'Fizjoterapia uroginekologiczna',
      'Trening medyczny',
      'Zobacz wszystkie usługi',
    ],
  },
  {
    title: 'Informacje',
    links: [
      'Cennik',
      'Jak wygląda wizyta?',
      'Czas trwania terapii',
      'Przygotowanie do wizyty',
      'FAQ – najczęstsze pytania',
      'Regulamin',
      'Polityka prywatności',
    ],
  },
  {
    title: 'O mnie',
    links: [
      'Moja historia',
      'Wykształcenie i certyfikaty',
      'Doświadczenie',
      'Moje podejście',
      'Opinie pacjentów',
    ],
  },
  {
    title: 'Wiedza',
    links: ['Blog', 'Porady i ćwiczenia', 'Baza wiedzy', 'Aktualności'],
  },
  {
    title: 'Dla firm',
    links: [
      'Oferta dla firm',
      'Pakiety abonamentowe',
      'Warsztaty i szkolenia',
      'Kontakt dla firm',
    ],
  },
];

const socialLinks = [
  { icon: Share2, label: 'Facebook' },
  { icon: Camera, label: 'Instagram' },
  { icon: MapPin, label: 'Lokalizacja' },
];

const Footer = () => (
  <footer className="bg-[#eef1f5] px-4 py-4">
    <div className="mx-auto max-w-7xl rounded-3xl bg-white px-6 py-10 shadow-sm sm:px-10">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:divide-x lg:divide-line">
        <div className="sm:col-span-2 lg:col-span-1 lg:pr-6">
          <a href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 40 32" className="h-7 w-9 shrink-0">
              <path
                d="M15 4L4 16l11 12"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 6a10 10 0 010 20"
                fill="none"
                stroke="#2E9BF5"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl italic text-slate-800">
                Kacper Dębek
              </span>
              <span className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                BIURO MASAŻ
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-light">
            Profesjonalna fizjoterapia i masaż dopasowane do Twoich potrzeb.
            Pomagam odzyskać sprawność, zmniejszyć ból i poprawić jakość życia.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-secondary">Zarezerwuj wizytę</p>
          <p className="mt-1 text-sm text-ink-light">
            Szybko i wygodnie online
          </p>
          <a
            href="#"
            className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
          >
            Umów wizytę
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="lg:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-secondary">Zadzwoń</p>
          <p className="mt-1 text-sm text-ink-light">+48 123 456 789</p>
          <p className="mt-1 text-sm text-ink-light">Pon–Pt: 8:00 – 20:00</p>
        </div>

        <div className="lg:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-secondary">Napisz do nas</p>
          <p className="mt-1 text-sm text-ink-light">kontakt@kacperdebek.pl</p>
          <a
            href="#"
            className="mt-2 block text-sm font-medium leading-snug text-primary"
          >
            Odpowiemy najszybciej
            <br />
            jak to możliwe
          </a>
        </div>

        <div className="lg:pl-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-secondary">Lokalizacja</p>
          <p className="mt-1 text-sm text-ink-light">ul. Zdrowia 10/2</p>
          <p className="text-sm text-ink-light">30-123 Kraków</p>
          <a
            href="#"
            className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
          >
            Zobacz na mapie
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
        {linkColumns.map(({ title, links }) => (
          <div key={title}>
            <p className="font-semibold text-secondary">{title}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="flex items-center gap-1.5 text-sm text-ink-light hover:text-primary"
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col items-center gap-3 self-start rounded-2xl bg-surface p-5 text-center ring-1 ring-line">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <CalendarPlus className="h-6 w-6" />
          </span>
          <p className="whitespace-nowrap font-display text-lg font-bold text-secondary">
            Umów wizytę online
          </p>
          <p className="text-sm leading-relaxed text-ink-light">
            Zarezerwuj dogodny termin bez wychodzenia z domu.
          </p>
          <button
            type="button"
            className="mt-1 w-full whitespace-nowrap rounded-xl bg-primary-dark py-3 text-xs font-bold text-white hover:bg-secondary"
          >
            ZAREZERWUJ WIZYTĘ
          </button>
        </div>
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="flex flex-col items-center gap-4 text-center text-sm text-ink-light sm:flex-row sm:justify-between sm:text-left">
        <p>
          © {new Date().getFullYear()} Kacper Dębek – Biuro Masaż. Wszelkie
          prawa zastrzeżone.
        </p>
        <p className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-primary" />
          Tworzone z pasją do zdrowia i człowieka.
        </p>
        <p>
          Realizacja:{' '}
          <a href="#" className="font-medium text-primary">
            Studio Heron
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export { Footer };
