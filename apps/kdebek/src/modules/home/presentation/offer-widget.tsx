import { useState } from 'react';
import {
  ArrowRight,
  Bone,
  Building2,
  ChevronDown,
  HandHelping,
  PersonStanding,
  Target,
  User,
  WavesHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';

import { BOOKING_URL } from './links';

type OfferTab = 'private' | 'company';

type OfferService = {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  details: string[];
};

const privateServices: OfferService[] = [
  {
    icon: HandHelping,
    title: 'Terapia manualna',
    description:
      'Techniki manualne mające na celu przywrócenie prawidłowej ruchomości stawów i tkanek miękkich.',
    price: 'od 120 zł',
    details: [
      'Indywidualna terapia dopasowana do potrzeb',
      'Mobilizacja stawów i tkanek miękkich',
      'Redukcja bólu i napięcia mięśniowego',
    ],
  },
  {
    icon: PersonStanding,
    title: 'Rehabilitacja pourazowa',
    description:
      'Kompleksowa rehabilitacja po urazach sportowych, przeciążeniach i wypadkach.',
    price: 'od 130 zł',
    details: [
      'Ocena funkcjonalna i plan powrotu do aktywności',
      'Ćwiczenia terapeutyczne i trening funkcjonalny',
      'Wsparcie w powrocie do pełnej sprawności',
    ],
  },
  {
    icon: Bone,
    title: 'Fizjoterapia kręgosłupa',
    description:
      'Skuteczne leczenie bólów kręgosłupa szyjnego, piersiowego i lędźwiowego.',
    price: 'od 120 zł',
    details: [
      'Terapia manualna i trening stabilizacji',
      'Edukacja i profilaktyka nawrotów',
      'Indywidualny plan ćwiczeń domowych',
    ],
  },
  {
    icon: WavesHorizontal,
    title: 'Terapia falą uderzeniową',
    description:
      'Nowoczesna metoda leczenia przewlekłych dolegliwości bólowych i stanów przeciążeniowych.',
    price: 'od 150 zł',
    details: [
      'Łokieć tenisisty i golfisty',
      'Zapalenie ścięgna Achillesa',
      'Ostroga piętowa i bóle stóp',
    ],
  },
  {
    icon: Target,
    title: 'Trening medyczny',
    description:
      'Ćwiczenia dobrane do potrzeb pacjenta w celu poprawy siły, stabilizacji i sprawności.',
    price: 'od 100 zł',
    details: [
      'Trening funkcjonalny i korekcja postawy',
      'Praca nad stabilizacją i mobilnością',
      'Zapobieganie kontuzjom i nawrotom bólu',
    ],
  },
];

const companyServices: OfferService[] = [
  {
    icon: Building2,
    title: 'Opieka fizjoterapeutyczna pracowników',
    description:
      'Regularne wizyty w biurze lub gabinecie dla zespołów pracujących siedząco.',
    price: 'wycena indywidualna',
    details: [
      'Profilaktyka bólów kręgosłupa i przeciążeń',
      'Krótkie interwencje terapeutyczne w trakcie dnia pracy',
      'Edukacja ergonomiczna dla pracowników',
    ],
  },
  {
    icon: PersonStanding,
    title: 'Współpraca ze sportem',
    description:
      'Opieka nad zawodnikami klubów sportowych i amatorskich drużyn.',
    price: 'wycena indywidualna',
    details: [
      'Diagnostyka i rehabilitacja kontuzji',
      'Przygotowanie do sezonu i okresów startowych',
      'Indywidualne plany treningowe i profilaktyka',
    ],
  },
  {
    icon: HandHelping,
    title: 'Pakiet wizyt firmowych',
    description:
      'Abonament na wizyty dla pracowników z preferencyjną ceną i elastycznym harmonogramem.',
    price: 'od 100 zł / wizyta',
    details: [
      'Stała dostępność terminów dla zespołu',
      'Raportowanie i konsultacje dla HR',
      'Możliwość wizyt stacjonarnych i online',
    ],
  },
];

const tabs: { id: OfferTab; label: string; icon: LucideIcon }[] = [
  { id: 'private', label: 'Dla osób prywatnych', icon: User },
  { id: 'company', label: 'Dla firm', icon: Building2 },
];

const ServiceRow = ({
  service,
  isOpen,
  onToggle,
}: {
  service: OfferService;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const Icon = service.icon;

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={
          isOpen ? `Zwiń ${service.title}` : `Rozwiń ${service.title}`
        }
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
      >
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 shrink-0" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <span>
              <span className="block font-semibold text-secondary">
                {service.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-light">
                {service.description}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-secondary sm:text-right">
              {service.price}
            </span>
          </span>
        </span>

        <ChevronDown
          className={cn(
            'mt-1 h-5 w-5 shrink-0 text-ink-light transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="border-t border-line bg-surface/60 px-4 pb-4 pt-3 sm:px-5">
          <ul className="space-y-2 pl-13 sm:pl-18">
            {service.details.map((detail) => (
              <li
                key={detail}
                className="flex items-start gap-2 text-sm text-ink-light"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const OfferWidget = ({ id }: { id?: string }) => {
  const [activeTab, setActiveTab] = useState<OfferTab>('private');
  const [openService, setOpenService] = useState<string | null>(
    privateServices[0]?.title ?? null,
  );

  const services = activeTab === 'private' ? privateServices : companyServices;

  const handleTabChange = (tab: OfferTab) => {
    setActiveTab(tab);
    const nextServices = tab === 'private' ? privateServices : companyServices;
    setOpenService(nextServices[0]?.title ?? null);
  };

  return (
    <div
      id={id}
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-line',
        id && 'scroll-mt-28',
      )}
    >
      <div className="border-b border-line p-3 sm:p-4">
        <div
          role="tablist"
          aria-label="Rodzaj oferty"
          className="flex flex-col gap-2 sm:flex-row"
        >
          {tabs.map(({ id, label, icon: TabIcon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold tracking-wide sm:text-2xs',
                  isActive
                    ? 'bg-primary text-white'
                    : 'border border-line bg-white text-primary',
                )}
              >
                <TabIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="uppercase">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel">
        {services.map((service) => (
          <ServiceRow
            key={service.title}
            service={service}
            isOpen={openService === service.title}
            onToggle={() =>
              setOpenService((current) =>
                current === service.title ? null : service.title,
              )
            }
          />
        ))}

        <div className="border-t border-line px-4 py-4 sm:px-5">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            Zobacz wszystkie usługi
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};
