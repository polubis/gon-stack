import {
  Award,
  BookOpen,
  FileText,
  GraduationCap,
  Heart,
  Quote,
  Star,
  Target,
  Users,
} from 'lucide-react';

import { AboutGallery } from './about-gallery';
import { Counter } from './counter';

const credentials = [
  {
    icon: GraduationCap,
    title: 'Wykształcenie',
    description: 'Magister fizjoterapii – AWF Kraków',
  },
  {
    icon: FileText,
    title: 'Doświadczenie',
    description:
      'Ponad 7 lat pracy z pacjentami w gabinetach prywatnych, klinikach i klubach sportowych.',
  },
  {
    icon: Target,
    title: 'Specjalizacje',
    description:
      'Terapia manualna, terapia bólu, rehabilitacja ortopedyczna, trening funkcjonalny.',
  },
  {
    icon: Heart,
    title: 'Podejście',
    description:
      'Łączę wiedzę, doświadczenie i indywidualne podejście, aby osiągać trwałe efekty terapii.',
  },
];

const stats = [
  { icon: Users, value: 1000, suffix: '+', label: 'klientów' },
  { icon: FileText, value: 7000, suffix: '+', label: 'wizyt' },
  { icon: Star, value: 5, decimals: 1, suffix: '/5', label: 'Ocena Google' },
  { icon: Award, value: 7, suffix: '+', label: 'Lat praktyki' },
  { icon: BookOpen, value: 20, suffix: '+', label: 'Kursów' },
];

export const About = () => (
  <section id="o-mnie" className="scroll-mt-28 bg-white py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary">
            O MNIE
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-secondary sm:text-4xl">
            Nazywam się
            <br />
            Kacper Dębek
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-light">
            Jestem dyplomowanym fizjoterapeutą z pasją do pomagania ludziom
            wracać do sprawności i lepszego życia.
          </p>
          <span className="mt-5 block h-0.5 w-10 bg-primary" />

          <ul className="mt-6 divide-y divide-line list-none p-0">
            {credentials.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4 py-4 first:pt-0">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </span>
                <div>
                  <h3 className="font-semibold text-secondary">{title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-light">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <blockquote className="mt-6 flex items-start gap-3">
            <Quote
              className="h-6 w-6 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="font-display text-base italic leading-snug text-secondary">
              Największą satysfakcją jest dla mnie moment, kiedy pacjent wraca
              do aktywności, które kocha.
            </p>
          </blockquote>
        </div>

        <AboutGallery />
      </div>
    </div>

    <div className="mx-auto mt-16 max-w-7xl px-6">
      <dl className="grid grid-cols-2 gap-8 rounded-3xl bg-surface px-8 py-10 ring-1 ring-line sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <dt className="flex items-center gap-2">
            <Users
              className="h-6 w-6 shrink-0 text-ink-light"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-secondary">
              W liczbach
            </span>
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-ink-light">
            To, co najważniejsze – skuteczność i zaufanie moich pacjentów.
          </dd>
        </div>
        {stats.map(({ icon: Icon, value, decimals, suffix, label }) => (
          <div key={label}>
            <dt className="flex items-center gap-2">
              <Icon
                className="h-6 w-6 shrink-0 text-primary"
                aria-hidden="true"
              />
            </dt>
            <dd className="mt-2 font-display text-2xl font-bold text-secondary">
              <Counter value={value} decimals={decimals} suffix={suffix} />
            </dd>
            <dd className="mt-0.5 whitespace-nowrap text-xs leading-relaxed text-ink-light">
              {label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);
