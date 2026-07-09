import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
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

import { GreenOnLogo } from './green-on-logo';
import { LogoMark } from './logo-mark';
import {
  BOOKING_URL,
  GOOGLE_REVIEWS_URL,
  GREENON_URL,
  MAILTO_URL,
} from './links';

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

type ContactBlock = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

const contactBlocks: ContactBlock[] = [
  {
    icon: CalendarPlus,
    title: 'Zarezerwuj wizytę',
    children: (
      <>
        <p className="text-sm text-ink-light">Szybko i wygodnie online</p>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Umów wizytę
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
      </>
    ),
  },
  {
    icon: Phone,
    title: 'Zadzwoń',
    children: (
      <>
        <p className="text-sm text-ink-light">+48 123 456 789</p>
        <p className="text-sm text-ink-light">Pon–Pt: 8:00 – 20:00</p>
      </>
    ),
  },
  {
    icon: Mail,
    title: 'Napisz do nas',
    children: (
      <>
        <p className="text-sm text-ink-light">kontakt@kacperdebek.pl</p>
        <a
          href={MAILTO_URL}
          className="mt-2 block text-sm font-medium leading-snug text-primary"
        >
          Odpowiemy najszybciej
          <br />
          jak to możliwe
        </a>
      </>
    ),
  },
  {
    icon: MapPin,
    title: 'Lokalizacja',
    children: (
      <>
        <p className="text-sm text-ink-light">ul. Zdrowia 10/2</p>
        <p className="text-sm text-ink-light">30-123 Kraków</p>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Zobacz na mapie
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
      </>
    ),
  },
];

const ContactCard = ({ icon: Icon, title, children }: ContactBlock) => (
  <div className="min-w-0">
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <Icon className="h-5 w-5 shrink-0" />
    </span>
    <h3 className="mt-3 font-semibold text-secondary">{title}</h3>
    <div className="mt-1 space-y-1">{children}</div>
  </div>
);

export const Footer = () => (
  <footer
    id="kontakt"
    className="scroll-mt-28 bg-footer px-4 py-6 sm:px-6 sm:py-8"
  >
    <div className="mx-auto max-w-7xl rounded-3xl bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,1fr))] xl:gap-x-8 xl:gap-y-0">
        <div className="min-w-0 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <a href="/" className="flex items-center gap-2">
            <LogoMark className="h-7 w-9 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl italic text-secondary">
                Kacper Dębek
              </span>
              <span className="mt-0.5 text-2xs font-semibold tracking-[0.2em] text-ink-light">
                BIURO MASAŻ
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-light">
            Profesjonalna fizjoterapia i masaż dopasowane do Twoich potrzeb.
            Pomagam odzyskać sprawność, zmniejszyć ból i poprawić jakość życia.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-light"
              >
                <Icon className="h-4 w-4 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {contactBlocks.map((block) => (
          <ContactCard key={block.title} {...block} />
        ))}
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_17.5rem] xl:items-start xl:gap-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {linkColumns.map(({ title, links }) => (
            <div key={title} className="min-w-0">
              <p className="font-semibold text-secondary">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="flex items-start gap-1.5 text-sm leading-snug text-ink-light"
                    >
                      <ChevronRight
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center ring-1 ring-line xl:mx-0 xl:max-w-none xl:self-start">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <CalendarPlus className="h-6 w-6 shrink-0" />
          </span>
          <p className="font-display text-lg font-bold text-secondary">
            Umów wizytę online
          </p>
          <p className="text-sm leading-relaxed text-ink-light">
            Zarezerwuj dogodny termin bez wychodzenia z domu.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block w-full rounded-xl bg-primary-dark px-4 py-3 text-center text-xs font-bold text-white"
          >
            ZAREZERWUJ WIZYTĘ
          </a>
        </div>
      </div>

      <div className="my-10 h-px bg-line" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-ink-light lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p>
            © {new Date().getFullYear()} Kacper Dębek – Biuro Masaż. Wszelkie
            prawa zastrzeżone.
          </p>
          <p className="flex items-start gap-1.5">
            <Heart
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Tworzone z pasją do zdrowia i człowieka.
          </p>
        </div>

        <div className="flex justify-end">
          <a
            href={GREENON_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by GreenOn Software"
            className="rounded text-secondary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <GreenOnLogo height={72} className="shrink-0" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
