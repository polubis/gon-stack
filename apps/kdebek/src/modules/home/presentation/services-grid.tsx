import {
  Bone,
  HandHelping,
  PersonStanding,
  Target,
  WavesHorizontal,
} from 'lucide-react';

const services = [
  {
    icon: Bone,
    title: 'Terapia bólu',
    description: 'Skuteczna ulga w bólu pleców, karku i stawów.',
  },
  {
    icon: PersonStanding,
    title: 'Rehabilitacja',
    description: 'Powrót do sprawności po urazach i operacjach.',
  },
  {
    icon: Target,
    title: 'Fizjoterapia sportowa',
    description: 'Wsparcie w kontuzjach i poprawie wyników.',
  },
  {
    icon: WavesHorizontal,
    title: 'Terapia manualna',
    description: 'Mobilizacja, manipulacje i praca tkanek miękkich.',
  },
  {
    icon: HandHelping,
    title: 'Profilaktyka',
    description: 'Indywidualne zalecenia, które zapobiegają bólowi.',
  },
];

export const ServicesGrid = () => (
  <section>
    <h2 className="font-display text-2xl font-bold text-secondary sm:text-3xl">
      W czym mogę Ci pomóc?
    </h2>

    <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 list-none p-0 sm:grid-cols-3 lg:grid-cols-5">
      {services.map(({ icon: Icon, title, description }) => (
        <li key={title}>
          <div className="flex flex-col gap-3">
            <Icon
              className="h-9 w-9 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-semibold text-secondary">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-light">
                {description}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
