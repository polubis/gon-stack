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
  { icon: Users, value: '1000+', label: 'zadowolonych pacjentów' },
  { icon: FileText, value: '7000+', label: 'przeprowadzonych wizyt' },
  { icon: Star, value: '5.0/5', label: 'średnia ocen w Google' },
  { icon: Award, value: '7+', label: 'lat doświadczenia w praktyce' },
  { icon: BookOpen, value: '20+', label: 'kursów i szkoleń specjalistycznych' },
];

const About = () => (
  <section className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary">
            O MNIE
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-secondary sm:text-4xl">
            Nazywam się
            <br />
            Kamil Nowak
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-light">
            Jestem dyplomowanym fizjoterapeutą z pasją do pomagania ludziom
            wracać do sprawności i lepszego życia.
          </p>
          <span className="mt-5 block h-0.5 w-10 bg-primary" />

          <div className="mt-6 divide-y divide-line">
            {credentials.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 py-4 first:pt-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-secondary">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-light">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3">
            <Quote className="h-6 w-6 shrink-0 text-primary" />
            <p className="font-display text-base italic leading-snug text-secondary">
              Największą satysfakcją jest dla mnie moment, kiedy pacjent wraca
              do aktywności, które kocha.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="row-span-2 overflow-hidden rounded-3xl bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=800&auto=format&fit=crop"
              alt="Kamil Nowak, fizjoterapeuta"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop"
              alt="Terapia manualna ramienia"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=600&auto=format&fit=crop"
              alt="Masaż kolana"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="col-span-2 overflow-hidden rounded-2xl bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop"
              alt="Trening funkcjonalny z taśmą oporową"
              className="h-40 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>

    <div className="mx-auto mt-16 max-w-7xl px-6">
      <div className="grid grid-cols-2 gap-8 rounded-3xl bg-surface px-8 py-10 ring-1 ring-line sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        <div>
          <Users className="h-6 w-6 text-ink-light" />
          <p className="mt-2 text-sm font-semibold text-secondary">
            W liczbach
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-light">
            To, co najważniejsze – skuteczność i zaufanie moich pacjentów.
          </p>
        </div>
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label}>
            <Icon className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-secondary">
              {value}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-light">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export { About };
